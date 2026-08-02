import { afterEach, describe, expect, it } from 'vitest';

import {
  BANNED_PHRASES,
  BANNED_WORDS,
  MAX_RECAP_BULLETS,
  MAX_REVEAL_CARDS,
  READING_GRADE_CEILING,
  VERDICT_LEADS,
  WORD_BUDGETS,
  bannedPhraseViolations,
  countWords,
  readingGrade,
  readingLevelViolations,
  sequenceVoiceViolations,
  stripVerdictLead,
  wordBudgetViolations,
} from '@/content/beats/voice';
import { deriveLevelSequence, validateBeatSequences, FACTORY_FRAMING } from '@/content/beats';
import { landmarkRegistry } from '@/content/index';
import { fixtureLevels, tieredLandmark } from '@/content/__fixtures__/tiered-landmark';
import type { Beat } from '@/content/beats/schema';

// ISSUE-008. Everything here runs against FIXTURES, never production content —
// "enforcement before content" means these checks are proven before a single
// island is authored against them.

const hook = (prompt: string): Beat => ({ id: 'hook', type: 'hook', prompt, estimatedSeconds: 10 });

describe('word budgets (VAL-050)', () => {
  it('counts words the way the budget table means them', () => {
    expect(countWords('one two three')).toBe(3);
    expect(countWords('  padded   spacing  ')).toBe(2);
    expect(countWords('')).toBe(0);
  });

  it('passes a hook at the ceiling and fails one word over', () => {
    const at = Array.from({ length: WORD_BUDGETS.hook }, (_, i) => `w${i}`).join(' ');
    expect(wordBudgetViolations(hook(at))).toEqual([]);
    expect(wordBudgetViolations(hook(`${at} over`))).toHaveLength(1);
    expect(wordBudgetViolations(hook(`${at} over`))[0]).toMatch(/prompt is 15 words, budget 14/);
  });

  it('enforces per-beat-type prompt budgets', () => {
    const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ');
    const cases: Array<[Beat['type'], number]> = [
      ['gotcha', WORD_BUDGETS.gotchaPrompt],
      ['default', WORD_BUDGETS.defaultPrompt],
      ['check', WORD_BUDGETS.checkQuestion],
      ['scenario', WORD_BUDGETS.scenarioPrompt],
    ];
    for (const [type, budget] of cases) {
      const base = { id: `${type}-x`, prompt: words(budget), estimatedSeconds: 10 };
      const beat = (
        type === 'gotcha' || type === 'scenario'
          ? {
              ...base,
              type,
              options: [
                { id: 'a', label: 'ok', feedback: 'Yep.' },
                { id: 'b', label: 'no', feedback: 'Not that one.' },
              ],
              correctOptionId: 'a',
            }
          : { ...base, type }
      ) as Beat;
      expect(wordBudgetViolations(beat), `${type} at budget`).toEqual([]);
      expect(
        wordBudgetViolations({ ...beat, prompt: words(budget + 1) } as Beat),
        `${type} over budget`,
      ).not.toEqual([]);
    }
  });

  it('caps reveal cards and recap bullets by count and by length', () => {
    const reveal = {
      id: 'reveal-definition',
      type: 'reveal',
      prompt: 'Widget Bins',
      cards: Array.from({ length: MAX_REVEAL_CARDS + 1 }, () => 'short card'),
      estimatedSeconds: 10,
    } as Beat;
    expect(wordBudgetViolations(reveal).some((v) => v.includes('reveal cards, max 3'))).toBe(true);

    const longCard = {
      ...reveal,
      cards: [Array.from({ length: WORD_BUDGETS.revealCard + 1 }, (_, i) => `w${i}`).join(' ')],
    } as Beat;
    expect(wordBudgetViolations(longCard).some((v) => v.includes('reveal card is'))).toBe(true);

    const recap = {
      id: 'recap',
      type: 'recap',
      prompt: 'short hook',
      bullets: Array.from({ length: MAX_RECAP_BULLETS + 1 }, () => 'short bullet'),
      estimatedSeconds: 10,
    } as Beat;
    expect(wordBudgetViolations(recap).some((v) => v.includes('recap bullets, max 4'))).toBe(true);
  });

  it('budgets feedback AFTER the verdict lead, not including it', () => {
    expect(stripVerdictLead('Yep. It costs you time.')).toBe('It costs you time.');
    expect(stripVerdictLead('Not that one. That is the risk.')).toBe('That is the risk.');
    expect(stripVerdictLead('No lead here.')).toBe('No lead here.');

    const body = Array.from({ length: WORD_BUDGETS.feedbackAfterVerdict }, (_, i) => `w${i}`).join(' ');
    const beat = {
      id: 'gotcha-trap',
      type: 'gotcha',
      prompt: 'One of these bites you later. Find it.',
      options: [
        { id: 'a', label: 'ok', feedback: `Yep. ${body}` },
        { id: 'b', label: 'no', feedback: 'Not that one. short' },
      ],
      correctOptionId: 'a',
      estimatedSeconds: 10,
    } as Beat;
    // Twelve words of body plus a lead is fine — the lead is free.
    expect(wordBudgetViolations(beat).filter((v) => v.includes('feedback'))).toEqual([]);
    const over = {
      ...beat,
      options: [
        { id: 'a', label: 'ok', feedback: `Yep. ${body} extra` },
        { id: 'b', label: 'no', feedback: 'Not that one. short' },
      ],
    } as Beat;
    expect(wordBudgetViolations(over).some((v) => v.includes('after the verdict lead'))).toBe(true);
  });

  it('enforces the 9-word option label ceiling', () => {
    const beat = {
      id: 'scenario-default',
      type: 'scenario',
      prompt: 'short setup',
      options: [
        { id: 'a', label: Array.from({ length: 10 }, (_, i) => `w${i}`).join(' '), feedback: 'Yep.' },
        { id: 'b', label: 'fine', feedback: 'Not that one.' },
      ],
      correctOptionId: 'a',
      estimatedSeconds: 10,
    } as Beat;
    expect(wordBudgetViolations(beat).some((v) => v.includes('label is 10 words, budget 9'))).toBe(true);
  });
});

describe('banned phrases (VAL-051)', () => {
  it('catches every coursework tic from the DO NOT list', () => {
    for (const phrase of BANNED_PHRASES) {
      expect(bannedPhraseViolations(`Filler ${phrase} filler`, 'x'), phrase).not.toEqual([]);
    }
    for (const word of BANNED_WORDS) {
      expect(bannedPhraseViolations(`We ${word} things`, 'x'), word).not.toEqual([]);
    }
  });

  it('matches banned words as whole words, not substrings', () => {
    // "often" is banned; "soften" must not trip it.
    expect(bannedPhraseViolations('You soften the blow', 'x')).toEqual([]);
    expect(bannedPhraseViolations('You often soften the blow', 'x')).not.toEqual([]);
  });

  it('is case-insensitive', () => {
    expect(bannedPhraseViolations('THIS APPROACH works', 'x')).not.toEqual([]);
    expect(bannedPhraseViolations('Leverage it', 'x')).not.toEqual([]);
  });

  it('catches semicolon splices, em-dash chains and hype', () => {
    expect(bannedPhraseViolations('One thing; another thing', 'x')[0]).toMatch(/semicolon/);
    expect(bannedPhraseViolations('a — b — c', 'x').some((v) => v.includes('em-dash'))).toBe(true);
    // A single em dash is allowed.
    expect(bannedPhraseViolations('a — b', 'x')).toEqual([]);
    expect(bannedPhraseViolations('Great job!', 'x')[0]).toMatch(/exclamation/);
  });

  it('accepts clean deadpan copy', () => {
    expect(bannedPhraseViolations('A commit is a save point. Use it.', 'x')).toEqual([]);
    expect(bannedPhraseViolations("Here's the spot you're in. What do you do?", 'x')).toEqual([]);
  });
});

describe('reading level (VAL-052)', () => {
  it('scores plain short sentences under the grade ceiling', () => {
    const plain = 'A commit is a save point. You can go back to it. That is the whole idea here.';
    expect(readingGrade(plain)).toBeLessThanOrEqual(READING_GRADE_CEILING);
    expect(readingLevelViolations(plain, 'x')).toEqual([]);
  });

  it('flags dense multi-clause prose above the ceiling', () => {
    const dense =
      'Organizational infrastructure necessitates comprehensive architectural reconsideration whenever interdependent operational configurations demonstrate unanticipated incompatibilities.';
    expect(readingGrade(dense)).toBeGreaterThan(READING_GRADE_CEILING);
    expect(readingLevelViolations(dense, 'x')).not.toEqual([]);
  });

  it('does not score fragments too short for the formula to mean anything', () => {
    // A four-word option label is not "grade 14" prose.
    expect(readingLevelViolations('Reconsider infrastructure configuration immediately', 'x')).toEqual([]);
  });
});

describe('the re-voiced factory framing passes its own suite (§6.4)', () => {
  it('contains no banned phrase', () => {
    for (const [key, value] of Object.entries(FACTORY_FRAMING)) {
      if (!value) continue;
      expect(bannedPhraseViolations(value, key), `${key}: ${value}`).toEqual([]);
    }
  });

  it('uses only the three allowlisted verdict leads', () => {
    const leads = [
      FACTORY_FRAMING.predictCorrectLead,
      FACTORY_FRAMING.scenarioCorrectLead,
      FACTORY_FRAMING.gotchaCorrectLead,
    ];
    for (const lead of leads) expect(VERDICT_LEADS).toContain(lead);
    for (const key of [
      'predictWrongConPrefix',
      'predictWrongGotchaPrefix',
      'scenarioWrongGotchaPrefix',
      'scenarioWrongConPrefix',
      'scenarioWrongWhenPrefix',
      'gotchaWrongProPrefix',
      'gotchaWrongWhenPrefix',
    ] as const) {
      expect(FACTORY_FRAMING[key].startsWith('Not that one.'), key).toBe(true);
    }
  });

  it('drops the colon crutch and the trailing coach-ism', () => {
    expect(FACTORY_FRAMING.checkPromptPrefix).toBe('');
    expect(FACTORY_FRAMING.recapPromptSuffix).toBe('');
  });
});

describe('fixture corpus passes the enforcement suite', () => {
  it('has no voice violation in any of its three levels', () => {
    for (const level of ['l1', 'l2', 'l3'] as const) {
      const sequence = deriveLevelSequence('fixtures', tieredLandmark, level, fixtureLevels[level]);
      expect(sequenceVoiceViolations(sequence), `${level} violations`).toEqual([]);
    }
  });
});

describe('the manifest build gate (VAL-014b)', () => {
  const region = 'git';
  const target = landmarkRegistry[region]!.find((entry) => entry.id === 'merge-conflicts')!;
  const original = target.levels;

  afterEach(() => {
    (target as { levels?: unknown }).levels = original;
  });

  it('FAILS the build when arcade-authored content exceeds a word budget', () => {
    // Promote a registered landmark to arcade-authored so the gate applies to it,
    // then blow one budget. This proves the gate through the real build entry
    // point rather than only through the checker in isolation.
    const overBudgetHook = Array.from({ length: WORD_BUDGETS.hook + 5 }, (_, i) => `word${i}`).join(' ');
    const levels = {
      l1: { ...fixtureLevels.l1, hook: overBudgetHook },
      l2: fixtureLevels.l2,
      l3: fixtureLevels.l3,
    };
    (target as { levels?: unknown }).levels = levels;

    const sequence = deriveLevelSequence(region, target, 'l1', levels.l1);
    expect(() => validateBeatSequences([sequence])).toThrow(/voice violations/);
    expect(() => validateBeatSequences([sequence])).toThrow(/prompt is 19 words, budget 14/);
  });

  it('FAILS the build when arcade-authored content uses a banned phrase', () => {
    const levels = {
      l1: { ...fixtureLevels.l1, hook: 'You can simply name the thing.' },
      l2: fixtureLevels.l2,
      l3: fixtureLevels.l3,
    };
    (target as { levels?: unknown }).levels = levels;

    const sequence = deriveLevelSequence(region, target, 'l1', levels.l1);
    expect(() => validateBeatSequences([sequence])).toThrow(/banned word "simply"/);
  });

  it('does not fail the build for legacy content that has not been re-voiced yet', () => {
    // Legacy landmarks are REPORTED, not failed: their copy is exactly what the
    // mission exists to replace, landmark by landmark. Failing them now would
    // make the build red for the whole mission with nothing actionable.
    const report = validateBeatSequences();
    // 42 legacy landmarks register their L3 run alone; Git carries all three
    // tiers since ISSUE-015, so the registry is 42 + 18.
    expect(report.count).toBe(42 + 18);
    expect(report.pendingRevoice.length).toBeGreaterThan(0);
    // Whatever is still pending, none of it is Git — that island is re-voiced.
    expect(report.pendingRevoice.filter((line) => line.startsWith('git/'))).toEqual([]);
  });
});
