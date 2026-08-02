import { describe, expect, it } from 'vitest';

import {
  beatProgressStateSchema,
  beatSequenceSchema,
  initialBeatProgressState,
  mergeBeatProgress,
  validateBeatStateConsistency,
  type BeatProgressState,
} from '@/content/beats/schema';
import * as beatsModule from '@/content/beats';
import {
  allowedWrongFeedbacks,
  availableLevels,
  deriveLevelSequence,
  FACTORY_FRAMING,
  factoryFramingValues,
  getBeatSequence,
  getSequence,
  hasBeatSequence,
  hasSequence,
  isHandAuthoredBeatSequence,
  landmarkLevelSources,
  legacyLevelContent,
  levelCorpus,
  sequenceProvenanceViolations,
  listBeatSequenceKeys,
  validateBeatSequences,
} from '@/content/beats';
import { L3_SHAPE } from '@/content/beats/schema';
import { canonicalLandmarkSchema, landmarkLevelsSchema } from '@/content/schema';
import { fixtureLevels, tieredLandmark, untieredLandmark } from '@/content/__fixtures__/tiered-landmark';
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

// Every landmark still carries only legacy top-level fields, so each registers
// exactly its L3 run during the L3-only compatibility window.
const ALL_CANONICAL_KEYS = Object.entries(landmarkRegistry)
  .flatMap(([regionId, landmarks]) => landmarks.map((landmark) => `${regionId}/${landmark.id}/l3`))
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
    (key) => key !== 'git/commits-as-checkpoints/l3' && key !== 'security/trust-boundaries/l3',
  );

  it('derives 46 sequences with fixed 8-type grammar and unique ids', () => {
    expect(derivedKeys).toHaveLength(46);
    for (const key of derivedKeys) {
      const [regionId, landmarkId] = key.split('/') as [string, string, string];
      const landmark = landmarkRegistry[regionId]!.find((entry) => entry.id === landmarkId)!;
      const content = legacyLevelContent(landmark);
      const sequence = deriveLevelSequence(regionId, landmark, 'l3', content);
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
      const [regionId, landmarkId] = key.split('/') as [string, string, string];
      const landmark = landmarkRegistry[regionId]!.find((entry) => entry.id === landmarkId)!;
      const content = legacyLevelContent(landmark);
      const sequence = deriveLevelSequence(regionId, landmark, 'l3', content);
      const [hook, predict, reveal, scenario, gotcha, def, check, recap] = sequence.beats;

      expect(hook).toMatchObject({ type: 'hook', prompt: content.hook });
      expect(predict?.type).toBe('predict');
      if (predict && 'options' in predict) {
        const correct = predict.options.find((option) => option.id === predict.correctOptionId);
        expect(correct?.label).toBe(content.tradeoffs.pros[0]);
        // Quiz is reserved for check — predict must not reuse quiz answer as its correct option.
        expect(correct?.label).not.toBe(content.assessment.answer);
      }
      expect(reveal).toMatchObject({ type: 'reveal', prompt: landmark.title });
      if (reveal && reveal.type === 'reveal') {
        for (const card of reveal.cards) {
          expect(content.definition.includes(card) || card === content.definition).toBe(true);
        }
      }
      expect(scenario).toMatchObject({
        type: 'scenario',
        prompt: `${FACTORY_FRAMING.scenarioPromptPrefix} ${content.example}`,
      });
      if (scenario && 'options' in scenario) {
        const correct = scenario.options.find((option) => option.id === scenario.correctOptionId);
        expect(correct?.label).toBe(content.vibe_coder_default);
      }
      expect(gotcha?.type).toBe('gotcha');
      if (gotcha && 'options' in gotcha) {
        const correct = gotcha.options.find((option) => option.id === gotcha.correctOptionId);
        expect(correct?.label).toBe(content.gotchas[0]);
      }
      expect(def).toMatchObject({ type: 'default', prompt: content.vibe_coder_default });
      expect(check?.type).toBe('check');
      // §6.4: the "Prove it:" colon crutch is gone; the check asks plainly.
      expect(check?.prompt).toBe(content.assessment.question);
      expect(check?.hint).not.toBe(content.assessment.explanation);
      // §6.4 item 5: the trailing coach-ism suffix is deleted.
      expect(recap?.prompt).toBe(content.hook);
      expect(recap?.type).toBe('recap');
      if (recap && recap.type === 'recap') {
        for (const bullet of recap.bullets) {
          expect(levelCorpus(landmark.title, content)).toContain(bullet);
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
      expect(preCheckText).not.toContain(content.assessment.question);
      expect(preCheckText).not.toContain(content.assessment.answer);
      expect(preCheckText).not.toContain(content.assessment.explanation);
    }
  });

  it('keeps every claim-bearing string inside the landmark corpus or framing allowlist', () => {
    const correctLeads = new Set<string>([
      FACTORY_FRAMING.predictCorrectLead,
      FACTORY_FRAMING.scenarioCorrectLead,
      FACTORY_FRAMING.gotchaCorrectLead,
    ]);
    for (const key of derivedKeys) {
      const [regionId, landmarkId] = key.split('/') as [string, string, string];
      const landmark = landmarkRegistry[regionId]!.find((entry) => entry.id === landmarkId)!;
      const content = legacyLevelContent(landmark);
      const corpus = new Set(levelCorpus(landmark.title, content));
      const sequence = deriveLevelSequence(regionId, landmark, 'l3', content);
      const wrongAllowed = new Set(allowedWrongFeedbacks(content));

      // Exact composite forms only — no startsWith/endsWith loopholes.
      const allowedExact = new Set<string>([
        ...corpus,
        ...framing,
        ...wrongAllowed,
        `${FACTORY_FRAMING.scenarioPromptPrefix} ${content.example}`,
        `${FACTORY_FRAMING.checkPromptPrefix}${content.assessment.question}`,
        `${content.hook}${FACTORY_FRAMING.recapPromptSuffix}`,
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
      const [regionId, landmarkId] = key.split('/') as [string, string, string];
      const landmark = landmarkRegistry[regionId]!.find((entry) => entry.id === landmarkId)!;
      const a = deriveLevelSequence(regionId, landmark, 'l3', legacyLevelContent(landmark));
      const b = deriveLevelSequence(regionId, landmark, 'l3', legacyLevelContent(landmark));
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

describe('arcade level identity (VAL-003, VAL-011, VAL-012, VAL-056)', () => {
  it('no longer exports the level-blind deriveBeatSequence factory (VAL-011)', () => {
    expect('deriveBeatSequence' in beatsModule).toBe(false);
    expect(Object.keys(beatsModule)).not.toContain('deriveBeatSequence');
  });

  it('keys every sequence by the three-part identity and rejects a two-part lookup', () => {
    for (const key of listBeatSequenceKeys()) {
      expect(key.split('/')).toHaveLength(3);
      expect(['l1', 'l2', 'l3']).toContain(key.split('/')[2]);
    }
    expect(hasSequence({ regionId: 'git', landmarkId: 'merge-conflicts', level: 'l3' })).toBe(true);
    // L1/L2 are not registered until their island content is authored (M4–M6).
    expect(hasSequence({ regionId: 'git', landmarkId: 'merge-conflicts', level: 'l1' })).toBe(false);
    expect(getSequence({ regionId: 'git', landmarkId: 'merge-conflicts', level: 'l3' })?.level).toBe('l3');
  });

  it('exposes exactly three sequences for a fully tiered landmark (VAL-003)', () => {
    const levels = ['l1', 'l2', 'l3'] as const;
    const sequences = levels.map((level) =>
      deriveLevelSequence('fixtures', tieredLandmark, level, tieredLandmark.levels![level]),
    );
    expect(sequences).toHaveLength(3);
    expect(sequences.map((sequence) => sequence.level)).toEqual(['l1', 'l2', 'l3']);
    // Non-circular: the count comes from the landmark's own declared levels, via
    // the SAME resolver the registry uses to build its keys — not from the
    // literal list above.
    expect([...landmarkLevelSources(tieredLandmark).keys()]).toEqual(['l1', 'l2', 'l3']);
    expect(landmarkLevelSources(tieredLandmark).size).toBe(3);
    // A legacy landmark resolves to exactly one level through that same resolver.
    const legacy = landmarkRegistry.git!.find((entry) => entry.id === 'merge-conflicts')!;
    expect([...landmarkLevelSources(legacy).keys()]).toEqual(['l3']);
    expect(new Set(sequences.map((sequence) => sequence.assessment.question)).size).toBe(3);
    // Legacy landmarks expose only their L3 run during the compatibility window.
    expect(availableLevels('git', 'merge-conflicts')).toEqual(['l3']);
  });

  it('requires the tier fields on a canonical landmark (VAL-001)', () => {
    expect(() => canonicalLandmarkSchema.parse(untieredLandmark)).toThrow();
    expect(() => landmarkLevelsSchema.parse({ l1: fixtureLevels.l1, l2: fixtureLevels.l2 })).toThrow();
    expect(() =>
      canonicalLandmarkSchema.parse({
        id: tieredLandmark.id,
        title: tieredLandmark.title,
        draft: tieredLandmark.draft,
        levels: tieredLandmark.levels,
        sources: tieredLandmark.sources,
      }),
    ).not.toThrow();
  });

  it('pins the L3 eight-beat id and type tuple (VAL-056)', () => {
    for (const key of listBeatSequenceKeys()) {
      const [regionId, landmarkId, level] = key.split('/') as [string, string, 'l1' | 'l2' | 'l3'];
      if (level !== 'l3') continue;
      const sequence = getSequence({ regionId, landmarkId, level })!;
      expect(sequence.beats.map((beat) => [beat.id, beat.type])).toEqual(
        L3_SHAPE.map(([id, type]) => [id, type]),
      );
      expect(sequence.beats.findIndex((beat) => beat.type === 'check')).toBe(6);
    }
  });

  it('rejects an L3 sequence whose beat ids drift from the pin (VAL-056)', () => {
    const sequence = getSequence({ regionId: 'git', landmarkId: 'merge-conflicts', level: 'l3' })!;
    const drifted = {
      ...sequence,
      beats: sequence.beats.map((beat) =>
        beat.id === 'scenario-default' ? { ...beat, id: 'scenario-drifted' } : beat,
      ),
    };
    expect(() => beatSequenceSchema.parse(drifted)).toThrow(/pinned eight beat/);
    // An L1 run with the same drift is fine — only L3 is pinned.
    expect(() => beatSequenceSchema.parse({ ...drifted, level: 'l1' })).not.toThrow();
  });

  it('REJECTS a foreign fact injected into a derived sequence (VAL-012)', () => {
    // The schema alone cannot catch this — it has no canonical content to compare
    // against — so this asserts the enforcement boundary, not just membership.
    const key = { regionId: 'git', landmarkId: 'merge-conflicts', level: 'l3' } as const;
    const clean = getSequence(key)!;
    const landmark = landmarkRegistry.git!.find((entry) => entry.id === 'merge-conflicts')!;
    const content = legacyLevelContent(landmark);

    expect(sequenceProvenanceViolations(clean, landmark.title, content)).toEqual([]);
    // A structurally perfect sequence carrying invented copy still parses...
    const foreignPrompt = {
      ...clean,
      beats: clean.beats.map((beat) =>
        beat.id === 'hook' ? { ...beat, prompt: 'FOREIGN FACT ABSENT FROM CANONICAL CONTENT' } : beat,
      ),
    };
    expect(() => beatSequenceSchema.parse(foreignPrompt)).not.toThrow();
    // ...and must be rejected by provenance enforcement.
    expect(sequenceProvenanceViolations(foreignPrompt, landmark.title, content)).toHaveLength(1);
    expect(() => validateBeatSequences([foreignPrompt])).toThrow(/provenance violations/);

    // Same for an invented option label, an invented feedback string, an
    // invented reveal card, and an invented recap bullet.
    const cases = [
      {
        name: 'option label',
        beats: clean.beats.map((beat) =>
          'options' in beat && beat.id === 'gotcha-trap'
            ? { ...beat, options: beat.options.map((o, i) => (i === 0 ? { ...o, label: 'invented risk' } : o)) }
            : beat,
        ),
      },
      {
        name: 'option feedback',
        beats: clean.beats.map((beat) =>
          'options' in beat && beat.id === 'gotcha-trap'
            ? { ...beat, options: beat.options.map((o, i) => (i === 0 ? { ...o, feedback: 'invented feedback' } : o)) }
            : beat,
        ),
      },
      {
        name: 'reveal card',
        beats: clean.beats.map((beat) =>
          beat.type === 'reveal' ? { ...beat, cards: ['invented card'] } : beat,
        ),
      },
      {
        name: 'recap bullet',
        beats: clean.beats.map((beat) =>
          beat.type === 'recap' ? { ...beat, bullets: [...beat.bullets.slice(0, -1), 'invented bullet'] } : beat,
        ),
      },
    ];
    for (const { name, beats } of cases) {
      const tampered = { ...clean, beats };
      expect(
        sequenceProvenanceViolations(tampered, landmark.title, content).length,
        `${name} leak was not caught`,
      ).toBeGreaterThan(0);
      expect(() => validateBeatSequences([tampered]), `${name} leak reached the build`).toThrow(
        /provenance violations/,
      );
    }
  });

  it('rejects a fact that is canonical for another LEVEL of the same landmark (VAL-012)', () => {
    // The tier scoping is the whole point: an L2 fact inside an L1 run teaches
    // something the player has not reached yet, so it is a leak, not a shortcut.
    const l1 = deriveLevelSequence('fixtures', tieredLandmark, 'l1', fixtureLevels.l1);
    expect(sequenceProvenanceViolations(l1, tieredLandmark.title, fixtureLevels.l1)).toEqual([]);

    const leaked = {
      ...l1,
      beats: l1.beats.map((beat) =>
        beat.id === 'hook' ? { ...beat, prompt: fixtureLevels.l2.hook } : beat,
      ),
    };
    // Same landmark, real authored copy, wrong tier — still rejected.
    expect(sequenceProvenanceViolations(leaked, tieredLandmark.title, fixtureLevels.l1)).toHaveLength(1);
    // And it WOULD pass if the corpus were the whole landmark rather than one level.
    expect(sequenceProvenanceViolations(leaked, tieredLandmark.title, fixtureLevels.l2)).not.toEqual([]);
  });

  it('scopes provenance to the level being played, not the whole landmark (VAL-012)', () => {
    const l1Corpus = new Set(levelCorpus(tieredLandmark.title, fixtureLevels.l1));
    // An L2-only fact must not validate against the L1 corpus.
    expect(l1Corpus.has(fixtureLevels.l2.vibe_coder_default)).toBe(false);
    expect(l1Corpus.has(fixtureLevels.l3.gotchas[0]!)).toBe(false);
    expect(l1Corpus.has(fixtureLevels.l1.vibe_coder_default)).toBe(true);

    const l1Sequence = deriveLevelSequence('fixtures', tieredLandmark, 'l1', fixtureLevels.l1);
    for (const beat of l1Sequence.beats) {
      if (!('options' in beat)) continue;
      for (const option of beat.options) {
        expect(l1Corpus.has(option.label), `l1 option leak: ${option.label}`).toBe(true);
      }
    }
  });

  it('carries exactly one assessment per sequence and never the whole landmark quiz set', () => {
    const l2 = deriveLevelSequence('fixtures', tieredLandmark, 'l2', fixtureLevels.l2);
    expect(l2.assessment).toEqual(fixtureLevels.l2.assessment);
    expect(l2.beats.filter((beat) => beat.type === 'check')).toHaveLength(1);
    expect(() => beatSequenceSchema.parse({ ...l2, assessment: undefined })).toThrow();
  });
});

describe('public manifest projection (DATA_MODEL §8)', () => {
  it('preserves canonical facts through the L3 legacy projection (VAL-008)', () => {
    for (const [regionId, landmarks] of Object.entries(landmarkRegistry)) {
      for (const landmark of landmarks) {
        const content = legacyLevelContent(landmark);
        expect(content.hook).toBe(landmark.hook);
        expect(content.definition).toBe(landmark.definition);
        expect(content.example).toBe(landmark.example);
        expect(content.vibe_coder_default).toBe(landmark.vibe_coder_default);
        expect(content.when_to_use).toEqual(landmark.when_to_use);
        expect(content.gotchas).toEqual(landmark.gotchas);
        expect(content.tradeoffs).toEqual(landmark.tradeoffs);
        expect(content.assessment.answer).toBe(landmark.quiz.answer);
        expect(content.assessment.explanation).toBe(landmark.quiz.explanation);
        expect(getSequence({ regionId, landmarkId: landmark.id, level: 'l3' })).toBeDefined();
      }
    }
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
