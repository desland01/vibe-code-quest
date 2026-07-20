import { describe, expect, it } from 'vitest';

import {
  beatProgressStateSchema,
  beatSequenceSchema,
  initialBeatProgressState,
  mergeBeatProgress,
  validateBeatStateConsistency,
  type BeatProgressState,
} from '@/content/beats/schema';
import { getBeatSequence, hasBeatSequence, validateBeatSequences } from '@/content/beats';
import { sequence as pilot } from '@/content/git/beats/commits-as-checkpoints';

function state(overrides: Partial<BeatProgressState> = {}): BeatProgressState {
  return { ...initialBeatProgressState(), ...overrides };
}

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

describe('beat registry', () => {
  it('validates all registered sequences and resolves the pilot + transfer landmark', () => {
    const report = validateBeatSequences();
    // E-005: pilot + security/trust-boundaries transfer through the same grammar.
    expect(report.count).toBe(2);
    expect(report.keys).toEqual(expect.arrayContaining([
      'git/commits-as-checkpoints',
      'security/trust-boundaries',
    ]));
    expect(hasBeatSequence('git', 'commits-as-checkpoints')).toBe(true);
    expect(hasBeatSequence('security', 'trust-boundaries')).toBe(true);
    expect(hasBeatSequence('git', 'branches-as-isolation')).toBe(false);

    const pilotSeq = getBeatSequence('git', 'commits-as-checkpoints');
    expect(pilotSeq?.beats).toHaveLength(8);
    expect(pilotSeq?.beats.at(-1)?.type).toBe('recap');
    expect(pilotSeq?.beats.some((beat) => beat.type === 'check')).toBe(true);

    const transfer = getBeatSequence('security', 'trust-boundaries');
    expect(transfer?.beats).toHaveLength(8);
    expect(transfer?.beats.at(-1)?.type).toBe('recap');
    expect(transfer?.beats.some((beat) => beat.type === 'check')).toBe(true);
    // Same schema path — no landmark-specific branches required to parse.
    expect(() => beatSequenceSchema.parse(transfer)).not.toThrow();
  });

  it('rejects a registered sequence that references a missing canonical landmark', () => {
    const invalid = { ...pilot, regionId: 'missing-region' };
    expect(() => validateBeatSequences([invalid])).toThrow(/missing-region\/commits-as-checkpoints/);
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
