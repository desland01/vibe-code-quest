import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { queryAsUser, withUserTransaction } from '@/lib/db';
import { recordEvent } from '@/server/events';
import { advanceState, applyAnswer, generateQuestionText, getNextStep, initialOnboardingState, parseAnswer, skip, type OnboardingField, type OnboardingState } from '@/server/onboarding';

export const dynamic = 'force-dynamic';
const bodySchema = z.object({ action: z.enum(['start', 'answer', 'skip', 'finish']), text: z.string().max(1_000).optional() });

async function userId() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  return token ? (await verifySessionToken(token))?.userId ?? null : null;
}

function normalizeState(raw: OnboardingState | null | undefined): OnboardingState {
  return raw && Number.isInteger(raw.count) && raw.count >= 0 ? { ...initialOnboardingState(), ...raw, count: Math.min(5, raw.count), profile: raw.profile ?? {} } : initialOnboardingState();
}

async function loadState(id: string): Promise<OnboardingState> {
  const row = (await queryAsUser<{ onboarding_state: OnboardingState }>(id, 'SELECT onboarding_state FROM profiles WHERE id = $1', [id])).rows[0];
  return normalizeState(row?.onboarding_state);
}

export async function POST(request: Request) {
  const id = await userId();
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: z.infer<typeof bodySchema>;
  try { body = bodySchema.parse(await request.json()); } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  // Unlocked read: pick the field to parse against, keeping the model call outside the row lock.
  const preStep = getNextStep(await loadState(id));
  let answer: { field: OnboardingField; value: unknown } | null = null;
  if (body.action === 'answer') {
    if (preStep.done || !body.text?.trim()) return NextResponse.json({ error: 'Answer text required' }, { status: 400 });
    answer = { field: preStep.field, value: await parseAnswer(id, preStep.field, body.text) };
  }

  // Atomic transition: re-read under a row lock so concurrent submissions serialize instead of overwriting each other.
  const result = await withUserTransaction(id, async (client) => {
    const row = (await client.query<{ onboarding_state: OnboardingState }>('SELECT onboarding_state FROM profiles WHERE id = $1 FOR UPDATE', [id])).rows[0];
    let state = normalizeState(row?.onboarding_state);
    const current = getNextStep(state);
    const wasDone = current.done;
    if (answer) {
      if (current.done || current.field !== answer.field) return { stale: true as const };
      await applyAnswer(id, answer.field, answer.value, client);
      state = advanceState(state, answer.field, answer.value);
    } else if (body.action === 'skip') {
      state = skip(state);
    } else if (body.action === 'finish') {
      state = { ...state, finished: true };
    }
    const done = getNextStep(state).done;
    await client.query(`UPDATE profiles SET onboarding_state = $1::jsonb, onboarding_completed_at = CASE WHEN $2 THEN now() ELSE onboarding_completed_at END WHERE id = $3`, [JSON.stringify(state), done, id]);
    return { stale: false as const, state, wasDone, skippedField: current.done ? null : current.field };
  });

  if (result.stale) return NextResponse.json({ error: 'Onboarding already advanced' }, { status: 409 });
  const { state, wasDone } = result;
  if (body.action === 'skip') recordEvent('profile_skipped', { field: result.skippedField });
  const next = getNextStep(state);
  const done = next.done;
  if (done && !wasDone) recordEvent('profile_built', { count: state.count });
  const questionText = done ? null : await generateQuestionText(id, next.field, state.profile);
  return NextResponse.json({ step: done ? null : next.field, questionText, count: state.count, mapUnlocked: state.mapUnlocked, done, profile: state.profile });
}
