import { describe, expect, it } from 'vitest';

import {
  beatProgressStateSchema,
  beatSequenceSchema,
  initialBeatProgressState,
  mergeBeatProgress,
  validateBeatStateConsistency,
  type BeatProgressState,
} from '@/content/beats/schema';
import {
  allowedWrongFeedbacks,
  deriveBeatSequence,
  FACTORY_FRAMING,
  factoryFramingValues,
  getBeatSequence,
  hasBeatSequence,
  isHandAuthoredBeatSequence,
  landmarkCorpus,
  listBeatSequenceKeys,
  validateBeatSequences,
} from '@/content/beats';
import { sequence as pilot } from '@/content/git/beats/commits-as-checkpoints';
import { sequence as transferSource } from '@/content/security/beats/trust-boundaries';
import { landmarkRegistry } from '@/content/index';

function state(overrides: Partial<BeatProgressState> = {}): BeatProgressState {
  return { ...initialBeatProgressState(), ...overrides };
}

const FACTORY_TYPE_ORDER = [
  'hook',
  'predict',
  'reveal',
  'scenario',
  'gotcha',
  'default',
  'check',
  'recap',
] as const;

const ALL_CANONICAL_KEYS = Object.entries(landmarkRegistry)
  .flatMap(([regionId, landmarks]) => landmarks.map((landmark) => `${regionId}/${landmark.id}`))
  .sort();

describe('beat sequence schema', () => {
  it('parses the pilot sequence (8 beats, ids unique, check present, recap terminal)', () => {
    const parsed = beatSequenceSchema.parse(pilot);
    expect(parsed.beats).toHaveLength(8);
    expect(parsed.beats.at(-1)?.type).toBe('recap');
    expect(parsed.beats.some((beat) => beat.type === 'check')).toBe(true);
  });

  it('rejects duplicate beat ids', () => {
    const bad = { ...pilot, beats: pilot.beats.map((beat) => ({ ...beat, id: 'same' })) };
    expect(() => beatSequenceSchema.parse(bad)).toThrow(/unique/);
  });

  it('rejects correctOptionId that matches no option', () => {
    const bad = {
      ...pilot,
      beats: pilot.beats.map((beat) =>
        'options' in beat ? { ...beat, correctOptionId: 'nope' } : beat
      ),
    };
    expect(() => beatSequenceSchema.parse(bad)).toThrow(/correctOptionId/);
  });

  it('rejects duplicate choice option ids', () => {
    const bad = {
      ...pilot,
      beats: pilot.beats.map((beat) =>
        beat.type === 'predict'
          ? { ...beat, options: [beat.options[0], { ...beat.options[1], id: beat.options[0].id }] }
          : beat
      ),
    };
    expect(() => beatSequenceSchema.parse(bad)).toThrow(/option ids must be unique/);
  });

  it('rejects a sequence without a check beat or with a non-recap terminal beat', () => {
    const noCheck = { ...pilot, beats: pilot.beats.filter((beat) => beat.type !== 'check') };
    expect(() => beatSequenceSchema.parse(noCheck)).toThrow(/check/);
    const badTail = { ...pilot, beats: [...pilot.beats.slice(0, -1), pilot.beats[0]] };
    expect(() => beatSequenceSchema.parse(badTail)).toThrow(/recap/);
  });

  it('rejects sequences outside the 5-8 beat budget and >4 options', () => {
    expect(() => beatSequenceSchema.parse({ ...pilot, beats: pilot.beats.slice(0, 4) })).toThrow();
    const tooMany = {
      ...pilot,
      beats: pilot.beats.map((beat) =>
        'options' in beat
          ? {
              ...beat,
              options: [
                ...beat.options,
                { id: 'x4', label: 'fourth', feedback: 'f' },
                { id: 'x5', label: 'fifth', feedback: 'f' },
              ],
            }
          : beat
      ),
    };
    expect(() => beatSequenceSchema.parse(tooMany)).toThrow();
  });
});

describe('beat registry (L-002 full factory)', () => {
  it('registers exactly 48 sequences covering every canonical landmark', () => {
    const report = validateBeatSequences();
    expect(report.count).toBe(48);
    expect(report.keys).toEqual(ALL_CANONICAL_KEYS);
    expect(listBeatSequenceKeys()).toEqual(ALL_CANONICAL_KEYS);

    expect(isHandAuthoredBeatSequence('git', 'commits-as-checkpoints')).toBe(true);
    expect(isHandAuthoredBeatSequence('security', 'trust-boundaries')).toBe(true);
    expect(isHandAuthoredBeatSequence('git', 'branches-as-isolation')).toBe(false);

    expect(hasBeatSequence('git', 'commits-as-checkpoints')).toBe(true);
    expect(hasBeatSequence('security', 'trust-boundaries')).toBe(true);
    expect(hasBeatSequence('git', 'branches-as-isolation')).toBe(true);
    expect(hasBeatSequence('databases', 'sql')).toBe(true);

    const pilotSeq = getBeatSequence('git', 'commits-as-checkpoints');
    expect(pilotSeq?.beats).toHaveLength(8);
    expect(pilotSeq?.beats.at(-1)?.type).toBe('recap');

    const transfer = getBeatSequence('security', 'trust-boundaries');
    expect(transfer?.beats).toHaveLength(8);
    expect(() => beatSequenceSchema.parse(transfer)).not.toThrow();
  });

  it('keeps hand-authored pilot and transfer sequences schema-identical to their source files', () => {
    // Compare schema-normalized forms — zod nonEmpty trims strings on parse.
    expect(getBeatSequence('git', 'commits-as-checkpoints')).toEqual(beatSequenceSchema.parse(pilot));
    expect(getBeatSequence('security', 'trust-boundaries')).toEqual(
      beatSequenceSchema.parse(transferSource),
    );
  });

  it('rejects a registered sequence that references a missing canonical landmark', () => {
    const invalid = { ...pilot, regionId: 'missing-region' };
    expect(() => validateBeatSequences([invalid])).toThrow(/missing-region\/commits-as-checkpoints/);
  });
});

describe('L-002 factory derive — structure, mapping, provenance, determinism', () => {
  const framing = factoryFramingValues();
  const derivedKeys = ALL_CANONICAL_KEYS.filter(
    (key) => key !== 'git/commits-as-checkpoints' && key !== 'security/trust-boundaries',
  );

  it('derives 46 sequences with fixed 8-type grammar and unique ids', () => {
    expect(derivedKeys).toHaveLength(46);
    for (const key of derivedKeys) {
      const [regionId, landmarkId] = key.split('/') as [string, string];
      const landmark = landmarkRegistry[regionId]!.find((entry) => entry.id === landmarkId)!;
      const sequence = deriveBeatSequence(regionId, landmark);
      expect(sequence.beats).toHaveLength(8);
      expect(sequence.beats.map((beat) => beat.type)).toEqual([...FACTORY_TYPE_ORDER]);
      const ids = sequence.beats.map((beat) => beat.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const beat of sequence.beats) {
        if ('options' in beat) {
          expect(beat.options.length).toBeGreaterThanOrEqual(2);
          expect(beat.options.length).toBeLessThanOrEqual(4);
          const optionIds = beat.options.map((option) => option.id);
          expect(new Set(optionIds).size).toBe(optionIds.length);
          expect(beat.options.some((option) => option.id === beat.correctOptionId)).toBe(true);
        }
      }
    }
  });

  it('maps derived beats to exact canonical fields of the same landmark', () => {
    for (const key of derivedKeys) {
      const [regionId, landmarkId] = key.split('/') as [string, string];
      const landmark = landmarkRegistry[regionId]!.find((entry) => entry.id === landmarkId)!;
      const sequence = deriveBeatSequence(regionId, landmark);
      const [hook, predict, reveal, scenario, gotcha, def, check, recap] = sequence.beats;

      expect(hook).toMatchObject({ type: 'hook', prompt: landmark.hook });
      expect(predict?.type).toBe('predict');
      if (predict && 'options' in predict) {
        const correct = predict.options.find((option) => option.id === predict.correctOptionId);
        expect(correct?.label).toBe(landmark.tradeoffs.pros[0]);
        // Quiz is reserved for check — predict must not reuse quiz answer as its correct option.
        expect(correct?.label).not.toBe(landmark.quiz.answer);
      }
      expect(reveal).toMatchObject({ type: 'reveal', prompt: landmark.title });
      if (reveal && reveal.type === 'reveal') {
        for (const card of reveal.cards) {
          expect(landmark.definition.includes(card) || card === landmark.definition).toBe(true);
        }
      }
      expect(scenario).toMatchObject({
        type: 'scenario',
        prompt: `${FACTORY_FRAMING.scenarioPromptPrefix} ${landmark.example}`,
      });
      if (scenario && 'options' in scenario) {
        const correct = scenario.options.find((option) => option.id === scenario.correctOptionId);
        expect(correct?.label).toBe(landmark.vibe_coder_default);
      }
      expect(gotcha?.type).toBe('gotcha');
      if (gotcha && 'options' in gotcha) {
        const correct = gotcha.options.find((option) => option.id === gotcha.correctOptionId);
        expect(correct?.label).toBe(landmark.gotchas[0]);
      }
      expect(def).toMatchObject({ type: 'default', prompt: landmark.vibe_coder_default });
      expect(check?.type).toBe('check');
      expect(check?.prompt).toBe(`Prove it: ${landmark.quiz.question}`);
      expect(check?.hint).not.toBe(landmark.quiz.explanation);
      expect(recap?.type).toBe('recap');
      if (recap && recap.type === 'recap') {
        for (const bullet of recap.bullets) {
          expect(landmarkCorpus(landmark)).toContain(bullet);
        }
      }

      // Anti-spoiler: quiz content stays out of beats 0–5 (check owns the quiz).
      const preCheck = sequence.beats.slice(0, 6);
      const preCheckText: string[] = [];
      for (const beat of preCheck) {
        preCheckText.push(beat.prompt);
        if (beat.hint) preCheckText.push(beat.hint);
        if ('cards' in beat) preCheckText.push(...beat.cards);
        if ('options' in beat) {
          for (const option of beat.options) {
            preCheckText.push(option.label);
            preCheckText.push(option.feedback);
          }
        }
      }
      expect(preCheckText).not.toContain(landmark.quiz.question);
      expect(preCheckText).not.toContain(landmark.quiz.answer);
      expect(preCheckText).not.toContain(landmark.quiz.explanation);
    }
  });

  it('keeps every claim-bearing string inside the landmark corpus or framing allowlist', () => {
    const correctLeads = new Set<string>([
      FACTORY_FRAMING.predictCorrectLead,
      FACTORY_FRAMING.scenarioCorrectLead,
      FACTORY_FRAMING.gotchaCorrectLead,
    ]);
    for (const key of derivedKeys) {
      const [regionId, landmarkId] = key.split('/') as [string, string];
      const landmark = landmarkRegistry[regionId]!.find((entry) => entry.id === landmarkId)!;
      const corpus = new Set(landmarkCorpus(landmark));
      const sequence = deriveBeatSequence(regionId, landmark);
      const wrongAllowed = new Set(allowedWrongFeedbacks(landmark));

      // Exact composite forms only — no startsWith/endsWith loopholes.
      const allowedExact = new Set<string>([
        ...corpus,
        ...framing,
        ...wrongAllowed,
        `${FACTORY_FRAMING.scenarioPromptPrefix} ${landmark.example}`,
        `${FACTORY_FRAMING.checkPromptPrefix}${landmark.quiz.question}`,
        `${landmark.hook}${FACTORY_FRAMING.recapPromptSuffix}`,
      ]);

      for (const beat of sequence.beats) {
        expect(allowedExact.has(beat.prompt), `${key} prompt leak: ${beat.prompt}`).toBe(true);
        if (beat.hint) {
          expect(allowedExact.has(beat.hint), `${key} hint leak: ${beat.hint}`).toBe(true);
        }
        if ('cards' in beat) {
          for (const card of beat.cards) {
            expect(corpus.has(card), `${key} card leak: ${card}`).toBe(true);
          }
        }
        if ('bullets' in beat) {
          for (const bullet of beat.bullets) {
            expect(corpus.has(bullet), `${key} bullet leak: ${bullet}`).toBe(true);
          }
        }
        if ('options' in beat) {
          const wrongFeedbacks = new Set<string>();
          for (const option of beat.options) {
            expect(corpus.has(option.label), `${key} option label leak: ${option.label}`).toBe(true);
            const isCorrect = option.id === beat.correctOptionId;
            if (isCorrect) {
              expect(
                correctLeads.has(option.feedback),
                `${key} correct feedback leak: ${option.feedback}`,
              ).toBe(true);
            } else {
              expect(
                wrongAllowed.has(option.feedback),
                `${key} wrong feedback leak: ${option.feedback}`,
              ).toBe(true);
              // Source-aware guarantee: wrong feedback always includes the exact option label.
              expect(option.feedback.includes(option.label)).toBe(true);
              wrongFeedbacks.add(option.feedback);
            }
          }
          // Distinct wrong labels get distinct feedback strings.
          const wrongOptions = beat.options.filter((option) => option.id !== beat.correctOptionId);
          expect(wrongFeedbacks.size).toBe(wrongOptions.length);
        }
      }
    }
  });

  it('is deterministic and rotates correct-option slots across the factory set', () => {
    const slots = new Set<number>();
    for (const key of derivedKeys) {
      const [regionId, landmarkId] = key.split('/') as [string, string];
      const landmark = landmarkRegistry[regionId]!.find((entry) => entry.id === landmarkId)!;
      const a = deriveBeatSequence(regionId, landmark);
      const b = deriveBeatSequence(regionId, landmark);
      expect(a).toEqual(b);
      for (const beat of a.beats) {
        if ('options' in beat) {
          const index = beat.options.findIndex((option) => option.id === beat.correctOptionId);
          expect(index).toBeGreaterThanOrEqual(0);
          slots.add(index);
        }
      }
    }
    // Across 46 landmarks × 3 choice beats, slots must not collapse to always-0.
    expect(slots.size).toBeGreaterThan(1);
    expect(slots.has(0)).toBe(true);
  });
});

describe('mergeBeatProgress (total monotonic merge)', () => {
  it('uses max furthestBeatIndex and ORs flags', () => {
    const stored = state({ furthestBeatIndex: 5, checked: true });
    const incoming = state({ furthestBeatIndex: 2 });
    expect(mergeBeatProgress(stored, incoming)).toMatchObject({ furthestBeatIndex: 5, checked: true });

    const equalA = state({ furthestBeatIndex: 4, checked: false, completed: false });
    const equalB = state({ furthestBeatIndex: 4, checked: true });
    expect(mergeBeatProgress(equalA, equalB)).toMatchObject({ furthestBeatIndex: 4, checked: true });
  });

  it('absorbs strictly stale writes (terminal never regresses)', () => {
    const terminal = state({ furthestBeatIndex: 7, checked: true, completed: true, stampedAt: '2026-07-19T00:00:00Z' });
    const stale = state({ furthestBeatIndex: 1 });
    expect(mergeBeatProgress(terminal, stale)).toEqual(terminal);
  });

  it('lets the first real stampedAt win over stored null and never unsets it', () => {
    const stored = state({ furthestBeatIndex: 7, checked: true, completed: true, stampedAt: null });
    const incoming = state({ furthestBeatIndex: 7, checked: true, completed: true, stampedAt: '2026-07-19T01:00:00Z' });
    expect(mergeBeatProgress(stored, incoming).stampedAt).toBe('2026-07-19T01:00:00Z');

    const stamped = state({ furthestBeatIndex: 7, checked: true, completed: true, stampedAt: '2026-07-19T01:00:00Z' });
    const later = state({ furthestBeatIndex: 7, checked: true, completed: true, stampedAt: '2026-07-20T01:00:00Z' });
    expect(mergeBeatProgress(stamped, later).stampedAt).toBe('2026-07-19T01:00:00Z');
  });

  it('accepts null stored (insert path)', () => {
    const incoming = state({ furthestBeatIndex: 3 });
    expect(mergeBeatProgress(null, incoming)).toEqual(incoming);
  });

  it('has no field for the currently displayed beat — back-review writes nothing', () => {
    const keys = Object.keys(beatProgressStateSchema.shape);
    expect(keys.sort()).toEqual(['checked', 'completed', 'furthestBeatIndex', 'kind', 'stampedAt', 'v']);
  });
});

describe('validateBeatStateConsistency', () => {
  it('enforces completed ⇒ checked and completed ⇒ stampedAt', () => {
    expect(validateBeatStateConsistency(state({ completed: true, checked: false, stampedAt: '2026-07-19T00:00:00Z' })).ok).toBe(false);
    expect(validateBeatStateConsistency(state({ completed: true, checked: true, stampedAt: null })).ok).toBe(false);
    expect(validateBeatStateConsistency(state({ completed: false, stampedAt: '2026-07-19T00:00:00Z' })).ok).toBe(false);
    expect(validateBeatStateConsistency(state({ completed: true, checked: true, stampedAt: '2026-07-19T00:00:00Z' })).ok).toBe(true);
    expect(validateBeatStateConsistency(state())).toEqual({ ok: true });
  });
});
