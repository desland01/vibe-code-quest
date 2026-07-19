import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { getLandmark } from '@/lib/content';
import { queryAsUser } from '@/lib/db';
import { LESSON_MAX_TURNS, runLessonTurn } from '@/server/lesson';

const message = z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(1_000) });
const schema = z.object({ regionId: z.string().min(1), landmarkId: z.string().min(1), messages: z.array(message).max(LESSON_MAX_TURNS * 2).default([]) });
export async function POST(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: z.infer<typeof schema>;
  try { body = schema.parse(await request.json()); } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }
  const landmark = getLandmark(body.regionId, body.landmarkId);
  if (!landmark) return NextResponse.json({ error: 'Landmark not found' }, { status: 404 });
  const profile = (await queryAsUser(session.userId, 'SELECT persona, interests, intent, depth_preference, current_project, lesson_progress FROM profiles WHERE id = $1', [session.userId])).rows[0] ?? {};
  const lessonKey = `${body.regionId}/${body.landmarkId}`;
  const lessonProgress = profile.lesson_progress && typeof profile.lesson_progress === 'object' ? profile.lesson_progress as Record<string, unknown> : {};
  const persistedTurns = lessonProgress[lessonKey];
  const priorAssistantTurns = typeof persistedTurns === 'number' && Number.isInteger(persistedTurns) && persistedTurns >= 0 ? persistedTurns : 0;
  const result = await runLessonTurn(session.userId, landmark, profile, body.messages, priorAssistantTurns);
  if (!result.fallback && result.turn === priorAssistantTurns + 1) {
    await queryAsUser(session.userId, `UPDATE profiles
      SET lesson_progress = COALESCE(lesson_progress, '{}'::jsonb) || jsonb_build_object($1::text, $2::int)
      WHERE id = $3 AND COALESCE((lesson_progress->>$1)::int, 0) = $4`, [lessonKey, result.turn, session.userId, priorAssistantTurns]);
  }
  return NextResponse.json(result);
}
