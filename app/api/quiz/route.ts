import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { getLandmark } from '@/lib/content';
import { recordEvent } from '@/server/events';

const schema = z.object({ regionId: z.string().min(1), landmarkId: z.string().min(1), choice: z.string(), correct: z.boolean().optional() });
export function gradeQuiz(regionId: string, landmarkId: string, choice: string) {
  const landmark = getLandmark(regionId, landmarkId);
  if (!landmark) return null;
  return { correct: choice === landmark.quiz.answer, answer: landmark.quiz.answer, explanation: landmark.quiz.explanation };
}
export async function POST(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: z.infer<typeof schema>;
  try { body = schema.parse(await request.json()); } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }
  const grade = gradeQuiz(body.regionId, body.landmarkId, body.choice);
  if (!grade) return NextResponse.json({ error: 'Landmark not found' }, { status: 404 });
  recordEvent('quiz_completed', { region: body.regionId, landmark: body.landmarkId, score: grade.correct ? 1 : 0, correct: grade.correct });
  return NextResponse.json(grade);
}
