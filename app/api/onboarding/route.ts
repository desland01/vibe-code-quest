import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { queryAsUser } from '@/lib/db';
import { recordEvent } from '@/server/events';
import { advanceState, applyAnswer, generateQuestionText, getNextStep, initialOnboardingState, parseAnswer, skip, type OnboardingState } from '@/server/onboarding';

export const dynamic = 'force-dynamic';
const bodySchema = z.object({ action: z.enum(['start', 'answer', 'skip', 'finish']), text: z.string().max(1_000).optional() });

async function userId() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  return token ? (await verifySessionToken(token))?.userId ?? null : null;
}

async function loadState(id: string): Promise<OnboardingState> {
  const row = (await queryAsUser<{ onboarding_state: OnboardingState }>(id, 'SELECT onboarding_state FROM profiles WHERE id = $1', [id])).rows[0];
  const state = row?.onboarding_state;
  return state && Number.isInteger(state.count) && state.count >= 0 ? { ...initialOnboardingState(), ...state, count: Math.min(5, state.count), profile: state.profile ?? {} } : initialOnboardingState();
}

async function saveState(id: string, state: OnboardingState, completed = false) {
  await queryAsUser(id, `UPDATE profiles SET onboarding_state = $1::jsonb, onboarding_completed_at = CASE WHEN $2 THEN now() ELSE onboarding_completed_at END WHERE id = $3`, [JSON.stringify(state), completed, id]);
}

export async function POST(request: Request) {
  const id = await userId();
  if (!id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: z.infer<typeof bodySchema>;
  try { body = bodySchema.parse(await request.json()); } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  let state = await loadState(id);
  const wasDone = getNextStep(state).done;
  const current = getNextStep(state);
  if (body.action === 'answer') {
    if (current.done || !body.text?.trim()) return NextResponse.json({ error: 'Answer text required' }, { status: 400 });
    const value = await parseAnswer(id, current.field, body.text);
    await applyAnswer(id, current.field, value);
    state = advanceState(state, current.field, value);
  } else if (body.action === 'skip') {
    state = skip(state);
    recordEvent('profile_skipped', { field: current.done ? null : current.field });
  } else if (body.action === 'finish') {
    state = { ...state, finished: true };
  }

  const next = getNextStep(state);
  const done = next.done;
  await saveState(id, state, done);
  if (done && !wasDone) recordEvent('profile_built', { count: state.count });
  const questionText = done ? null : await generateQuestionText(id, next.field, state.profile);
  return NextResponse.json({ step: done ? null : next.field, questionText, count: state.count, mapUnlocked: state.mapUnlocked, done, profile: state.profile });
}
