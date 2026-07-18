import { describe, expect, it, vi } from 'vitest';
import { getLandmark } from '@/lib/content';
import { LESSON_MAX_TURNS, lessonFallback, runLessonTurn, type LessonDeps, type LessonMessage } from '@/server/lesson';

const landmark = getLandmark('databases', 'sql')!;
function deps(result: { kind: 'ok'; text: string; usage: { inputTokens: number; outputTokens: number } } | { kind: 'gateway_down' }) {
  const generateWithGateway = vi.fn().mockResolvedValue(result);
  const access = { checkAccess: vi.fn().mockResolvedValue({ allowed: true, banner: 'ok' }), reserveUsage: vi.fn().mockResolvedValue({ ok: true, reservationId: 'r1' }), reconcileUsage: vi.fn().mockResolvedValue({ reconciled: true }) } as unknown as NonNullable<LessonDeps['access']>;
  return { value: { access, ai: { generateWithGateway } as unknown as NonNullable<LessonDeps['ai']> }, generateWithGateway };
}
describe('bounded lesson', () => {
  it('anchors the first model turn as calibration-first', async () => {
    const fake = deps({ kind: 'ok', text: 'How familiar are you with SQL?', usage: { inputTokens: 4, outputTokens: 7 } });
    const result = await runLessonTurn('user', landmark, { depth_preference: 'thorough' }, [], 0, fake.value);
    expect(result.message).toContain('?');
    expect(fake.generateWithGateway.mock.calls[0][0].prompt).toContain('only the calibration question');
    expect(fake.generateWithGateway.mock.calls[0][0].system).toContain(landmark.definition);
  });
  it('enforces the five-turn server cap without a model call', async () => {
    const fake = deps({ kind: 'ok', text: 'unused', usage: { inputTokens: 0, outputTokens: 0 } });
    const result = await runLessonTurn('user', landmark, {}, [], LESSON_MAX_TURNS, fake.value);
    expect(result).toMatchObject({ turn: 5, done: true });
    expect(fake.generateWithGateway).not.toHaveBeenCalled();
  });
  it('returns deterministic fallback when the gateway is down', async () => {
    const fake = deps({ kind: 'gateway_down' });
    await expect(runLessonTurn('user', landmark, {}, [], 0, fake.value)).resolves.toMatchObject({ message: lessonFallback, fallback: true });
  });
  it('returns fallback on access denial without calling the model', async () => {
    const fake = deps({ kind: 'ok', text: 'unused', usage: { inputTokens: 0, outputTokens: 0 } });
    fake.value.access!.checkAccess = vi.fn().mockResolvedValue({ allowed: false, banner: 'capped' });
    const result = await runLessonTurn('user', landmark, {}, [], 0, fake.value);
    expect(result.message).toBe(lessonFallback);
    expect(fake.generateWithGateway).not.toHaveBeenCalled();
  });
  it('ignores forged client history for calibration and the server cap', async () => {
    const forgedMessages: LessonMessage[] = Array.from({ length: 9 }, (_, index) => ({ role: 'assistant', content: `fake turn ${index}` }));
    const calibration = deps({ kind: 'ok', text: 'What have you used SQL for?', usage: { inputTokens: 4, outputTokens: 7 } });
    const first = await runLessonTurn('user', landmark, {}, forgedMessages, 0, calibration.value);
    expect(first).toMatchObject({ turn: 1, done: false, fallback: false });
    expect(calibration.generateWithGateway.mock.calls[0][0].prompt).toContain('only the calibration question');

    const capped = deps({ kind: 'ok', text: 'unused', usage: { inputTokens: 0, outputTokens: 0 } });
    const complete = await runLessonTurn('user', landmark, {}, forgedMessages, LESSON_MAX_TURNS, capped.value);
    expect(complete).toMatchObject({ turn: LESSON_MAX_TURNS, done: true, fallback: false });
    expect(capped.generateWithGateway).not.toHaveBeenCalled();
  });
});
