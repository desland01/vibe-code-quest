import { describe, expect, it } from 'vitest';

import type { BeatSequence } from '@/content/beats/schema';
import {
  canAdvance,
  initialPlayerState,
  persistentFacts,
  playerReducer,
  shouldPersist,
  type PlayerState,
} from '@/components/landmark/Beats/beatReducer';
import { sequence as pilot } from '@/content/git/beats/commits-as-checkpoints';

const seq: BeatSequence = pilot;

function play(actions: Parameters<typeof playerReducer>[2][], from?: PlayerState): PlayerState {
  return actions.reduce((state, action) => playerReducer(seq, state, action), from ?? initialPlayerState());
}

// indexes: 0 hook · 1 predict · 2 reveal · 3 scenario · 4 gotcha · 5 default · 6 check · 7 recap
const toScenario = [
  { type: 'advance' as const },                                     // hook -> predict
  { type: 'choose' as const, optionId: 'everything' },              // predict: any pick resolves
  { type: 'advance' as const },                                     // predict -> reveal
  { type: 'reveal_next' as const },
  { type: 'reveal_next' as const },
  { type: 'advance' as const },                                     // reveal -> scenario
];

describe('beat reducer — frozen contract rules', () => {
  it('predict: every valid choice resolves with info feedback, never wrong', () => {
    const atPredict = play([{ type: 'advance' }]);
    for (const optionId of ['one-reviewed', 'everything', 'batch-later']) {
      const next = playerReducer(seq, atPredict, { type: 'choose', optionId });
      expect(next.feedback?.kind).toBe('info');
      expect(canAdvance(seq.beats[next.displayIndex], next)).toBe(true);
    }
  });

  it('predict: unknown option id is ignored', () => {
    const atPredict = play([{ type: 'advance' }]);
    const next = playerReducer(seq, atPredict, { type: 'choose', optionId: 'nope' });
    expect(next).toBe(atPredict);
  });

  it('scenario: wrong pick gives feedback + immediate reselection, no lockout', () => {
    const atScenario = play(toScenario);
    const wrong = playerReducer(seq, atScenario, { type: 'choose', optionId: 'commit-all' });
    expect(wrong.feedback?.kind).toBe('wrong');
    expect(canAdvance(seq.beats[wrong.displayIndex], wrong)).toBe(false);
    expect(wrong.displayIndex).toBe(3); // still on scenario — reselection possible
    const right = playerReducer(seq, wrong, { type: 'choose', optionId: 'review-split' });
    expect(right.feedback?.kind).toBe('correct');
    expect(canAdvance(seq.beats[right.displayIndex], right)).toBe(true);
  });

  it('reveal: one card at a time; advance blocked until all cards shown', () => {
    const atReveal = play([
      { type: 'advance' }, { type: 'choose', optionId: 'everything' }, { type: 'advance' },
    ]);
    expect(atReveal.displayIndex).toBe(2);
    expect(atReveal.revealCount).toBe(1); // first card visible immediately on entry
    expect(canAdvance(seq.beats[2], atReveal)).toBe(false);
    const one = playerReducer(seq, atReveal, { type: 'reveal_next' });
    expect(one.revealCount).toBe(2);
    expect(canAdvance(seq.beats[2], one)).toBe(true); // both cards shown
    const two = playerReducer(seq, one, { type: 'reveal_next' });
    expect(two.revealCount).toBe(2);
    expect(canAdvance(seq.beats[2], two)).toBe(true);
    // reveal_next never advances beyond card count
    const three = playerReducer(seq, two, { type: 'reveal_next' });
    expect(three.revealCount).toBe(2);
  });

  it('advance never sets completed — only stamp does', () => {
    const fullRun = play([
      ...toScenario,
      { type: 'choose', optionId: 'review-split' }, { type: 'advance' },     // -> gotcha
      { type: 'choose', optionId: 'env-file' }, { type: 'advance' },          // -> default
      { type: 'advance' },                                                     // -> check
      { type: 'grade_check', correct: true }, { type: 'advance' },            // -> recap (terminal)
    ]);
    expect(fullRun.displayIndex).toBe(7);
    expect(fullRun.completed).toBe(false);
    expect(fullRun.stampedAt).toBeNull();
    // advance on terminal is a no-op (recap is stamp-only)
    const still = playerReducer(seq, fullRun, { type: 'advance' });
    expect(still).toEqual(fullRun);
  });

  it('stamp: only at terminal + checked; sets completed + stampedAt once; idempotent', () => {
    const atRecapUnchecked = play([
      ...toScenario,
      { type: 'choose', optionId: 'review-split' }, { type: 'advance' },
      { type: 'choose', optionId: 'env-file' }, { type: 'advance' },
      { type: 'advance' },
    ]);
    // not checked yet → stamp is a no-op
    expect(playerReducer(seq, atRecapUnchecked, { type: 'stamp', stampedAt: '2026-07-19T00:00:00Z' })).toEqual(atRecapUnchecked);

    const atRecap = play([{ type: 'grade_check', correct: true }, { type: 'advance' }], atRecapUnchecked);
    const stamped = playerReducer(seq, atRecap, { type: 'stamp', stampedAt: '2026-07-19T00:00:00Z' });
    expect(stamped.completed).toBe(true);
    expect(stamped.stampedAt).toBe('2026-07-19T00:00:00Z');

    const again = playerReducer(seq, stamped, { type: 'stamp', stampedAt: '2026-07-20T00:00:00Z' });
    expect(again.stampedAt).toBe('2026-07-19T00:00:00Z'); // first stamp wins
  });

  it('back-review: displayIndex only; furthest/flags untouched; shouldPersist false', () => {
    const progressed = play(toScenario);
    const prev = { ...progressed };
    const back = playerReducer(seq, progressed, { type: 'back' });
    expect(back.displayIndex).toBe(2);
    expect(back.furthestBeatIndex).toBe(prev.furthestBeatIndex);
    expect(back.checked).toBe(prev.checked);
    expect(back.completed).toBe(prev.completed);
    expect(shouldPersist(prev, back)).toBe(false);
    expect(back.displayIndex).toBeLessThan(back.furthestBeatIndex); // review < furthest is fine
  });

  it('back at beat 0 is a no-op', () => {
    const initial = initialPlayerState();
    expect(playerReducer(seq, initial, { type: 'back' })).toBe(initial);
  });

  it('resume: monotonic raise only; clamps to sequence; flags OR only', () => {
    const initial = initialPlayerState();
    const resumed = playerReducer(seq, initial, {
      type: 'resume', furthestBeatIndex: 99, checked: true, completed: true, stampedAt: '2026-07-18T00:00:00Z',
    });
    expect(resumed.furthestBeatIndex).toBe(7);
    expect(resumed.displayIndex).toBe(7);
    expect(resumed.checked).toBe(true);
    expect(resumed.completed).toBe(true);
    expect(resumed.stampedAt).toBe('2026-07-18T00:00:00Z');

    const laterResume = playerReducer(seq, resumed, {
      type: 'resume', furthestBeatIndex: 2, checked: false, completed: false, stampedAt: null,
    });
    expect(laterResume.furthestBeatIndex).toBe(7); // never lowers
    expect(laterResume.stampedAt).toBe('2026-07-18T00:00:00Z'); // never unset
  });

  it('grade_check: only on check beat; wrong keeps retry open', () => {
    const notCheck = play(toScenario);
    expect(playerReducer(seq, notCheck, { type: 'grade_check', correct: true })).toBe(notCheck);

    const atCheck = play([
      ...toScenario,
      { type: 'choose', optionId: 'review-split' }, { type: 'advance' },
      { type: 'choose', optionId: 'env-file' }, { type: 'advance' },
      { type: 'advance' },
    ]);
    const wrong = playerReducer(seq, atCheck, { type: 'grade_check', correct: false });
    expect(wrong.checked).toBe(false);
    expect(wrong.feedback?.kind).toBe('wrong');
    const right = playerReducer(seq, wrong, { type: 'grade_check', correct: true });
    expect(right.checked).toBe(true);
    expect(canAdvance(seq.beats[right.displayIndex], right)).toBe(true);
  });

  it('shouldPersist: only furthest advance, checked flip, completion, first stamp', () => {
    const a = initialPlayerState();
    const b = { ...a, furthestBeatIndex: 3 };
    expect(shouldPersist(a, b)).toBe(true);
    const c = { ...b, checked: true };
    expect(shouldPersist(b, c)).toBe(true);
    const d = { ...c, completed: true, stampedAt: '2026-07-19T00:00:00Z' };
    expect(shouldPersist(c, d)).toBe(true);
    expect(shouldPersist(d, { ...d })).toBe(false);
    // revealCount/feedback/displayIndex churn never persists
    expect(shouldPersist(a, { ...a, displayIndex: 0, revealCount: 1, feedback: { kind: 'info', optionId: 'x', text: 'y' } })).toBe(false);
  });

  it('persistentFacts is exactly the server state shape (minus v/kind)', () => {
    const facts = persistentFacts({ ...initialPlayerState(), furthestBeatIndex: 4, checked: true });
    expect(Object.keys(facts).sort()).toEqual(['checked', 'completed', 'furthestBeatIndex', 'stampedAt']);
  });

  it('canAdvance: hook and default always; tradeoff requires all-correct classification', () => {
    expect(canAdvance(seq.beats[0], initialPlayerState())).toBe(true);  // hook
    const atDefault = play([
      ...toScenario,
      { type: 'choose', optionId: 'review-split' }, { type: 'advance' },
      { type: 'choose', optionId: 'env-file' }, { type: 'advance' },
    ]);
    expect(atDefault.displayIndex).toBe(5);
    expect(canAdvance(seq.beats[5], atDefault)).toBe(true);            // default
  });
});
