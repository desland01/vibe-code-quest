import 'server-only';

import type { Landmark } from '@/content/schema';
import * as accessModule from '@/server/access';
import * as aiModule from '@/server/ai';
import type { GatewayTransport } from '@/server/ai';

export const LESSON_MIN_TURNS = 3;
export const LESSON_MAX_TURNS = 5;
export type LessonMessage = { role: 'user' | 'assistant'; content: string };
export type LessonProfile = { persona?: string | null; interests?: string[] | null; intent?: string | null; depth_preference?: string | null; current_project?: string | null };
type AccessDeps = Pick<typeof accessModule, 'checkAccess' | 'reserveUsage' | 'reconcileUsage'>;
type AiDeps = Pick<typeof aiModule, 'generateWithGateway'>;
export type LessonDeps = { access?: AccessDeps; ai?: AiDeps; transport?: GatewayTransport };

export const lessonFallback = 'The guided lesson is unavailable right now. Read the overview for the canonical explanation, then try the lesson again later.';

function systemPrompt(landmark: Landmark, profile: LessonProfile): string {
  return `Teach a bounded 3-5 turn lesson about this canonical landmark. Never contradict it. The first assistant turn MUST be one short calibration question. Later turns should adapt to the profile and prior answers.\nLandmark: ${JSON.stringify({ title: landmark.title, hook: landmark.hook, definition: landmark.definition, when_to_use: landmark.when_to_use, vibe_coder_default: landmark.vibe_coder_default })}\nProfile: ${JSON.stringify(profile)}`;
}

export async function runLessonTurn(userId: string, landmark: Landmark, profile: LessonProfile, messages: LessonMessage[], priorAssistantTurns: number, deps: LessonDeps = {}): Promise<{ message: string; turn: number; done: boolean; fallback: boolean }> {
  if (priorAssistantTurns >= LESSON_MAX_TURNS) return { message: 'Lesson complete. Use the overview whenever you want the canonical refresher.', turn: LESSON_MAX_TURNS, done: true, fallback: false };
  const cleanMessages = messages.slice(-8).map((message) => ({ role: message.role, content: message.content.slice(0, 1_000) }));
  const access = deps.access ?? accessModule;
  const ai = deps.ai ?? aiModule;
  const identity = { userId };
  if (!(await access.checkAccess(identity, 'renderer')).allowed) return { message: lessonFallback, turn: priorAssistantTurns + 1, done: true, fallback: true };
  const reservation = await access.reserveUsage(identity, 'renderer');
  if (!reservation.ok) return { message: lessonFallback, turn: priorAssistantTurns + 1, done: true, fallback: true };
  try {
    const prompt = priorAssistantTurns === 0 ? 'Start now with only the calibration question.' : `Continue the lesson. This is assistant turn ${priorAssistantTurns + 1}. Conversation JSON: ${JSON.stringify(cleanMessages)}`;
    const result = await ai.generateWithGateway({ surface: 'renderer', system: systemPrompt(landmark, profile), prompt, maxOutputTokens: 180, transport: deps.transport });
    const tokens = result.kind === 'gateway_down' ? 0 : result.usage.inputTokens + result.usage.outputTokens;
    await access.reconcileUsage(reservation.reservationId, tokens);
    if (result.kind === 'gateway_down' || !result.text.trim()) return { message: lessonFallback, turn: priorAssistantTurns + 1, done: true, fallback: true };
    const turn = priorAssistantTurns + 1;
    return { message: result.text.trim(), turn, done: turn >= LESSON_MAX_TURNS, fallback: false };
  } catch {
    await access.reconcileUsage(reservation.reservationId, 0);
    return { message: lessonFallback, turn: priorAssistantTurns + 1, done: true, fallback: true };
  }
}
