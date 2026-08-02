import { describe, expect, it } from 'vitest';

import { getBeatSequence } from '@/content/beats';
import {
  initialBeatProgressState,
  type BeatProgressState,
} from '@/content/beats/schema';
import {
  XP_AWARD_POINTS,
  XP_AWARD_INSERT_SQL,
  XP_PER_LANDMARK,
  XP_PER_LEVEL,
  deriveXpAwards,
  deriveXpAwardsForLevel,
} from '@/server/xp';

function state(overrides: Partial<BeatProgressState> = {}): BeatProgressState {
  return { ...initialBeatProgressState(), ...overrides };
}

const PILOT = getBeatSequence('git', 'commits-as-checkpoints')!;
const scenarioIndex = PILOT.beats.findIndex((beat) => beat.type === 'scenario');
const gotchaIndex = PILOT.beats.findIndex((beat) => beat.type === 'gotcha');
const checkIndex = PILOT.beats.findIndex((beat) => beat.type === 'check');
const terminalIndex = PILOT.beats.length - 1;

describe('L-003 competence XP formula', () => {
  it('locks award points and full-landmark total', () => {
    expect(XP_AWARD_POINTS).toEqual({
      scenario_solved: 15,
      gotcha_solved: 15,
      check_passed: 20,
      landmark_stamped: 50,
    });
    expect(XP_PER_LEVEL).toBe(100);
    expect(XP_PER_LANDMARK).toBe(300);
    expect(scenarioIndex).toBeGreaterThanOrEqual(0);
    expect(gotchaIndex).toBeGreaterThan(scenarioIndex);
    expect(checkIndex).toBeGreaterThan(gotchaIndex);
  });

  it('awards nothing before the scenario frontier is crossed', () => {
    // On or before the scenario beat itself — not yet solved/advanced past it.
    expect(deriveXpAwards(state({ furthestBeatIndex: scenarioIndex }), PILOT)).toEqual([]);
    expect(deriveXpAwards(state({ furthestBeatIndex: 0 }), PILOT)).toEqual([]);
    // Predict any-pick is not competence — never awards.
    expect(deriveXpAwards(state({ furthestBeatIndex: 1 }), PILOT)).toEqual([]);
  });

  it('awards scenario_solved only after furthest crosses the scenario beat', () => {
    const awards = deriveXpAwards(state({ furthestBeatIndex: scenarioIndex + 1 }), PILOT);
    expect(awards).toEqual([{ awardKey: 'scenario_solved', points: 15 }]);
  });

  it('awards gotcha_solved after furthest crosses the gotcha beat', () => {
    const awards = deriveXpAwards(state({ furthestBeatIndex: gotchaIndex + 1 }), PILOT);
    expect(awards).toEqual([
      { awardKey: 'scenario_solved', points: 15 },
      { awardKey: 'gotcha_solved', points: 15 },
    ]);
  });

  it('awards check_passed from checked flag (not index)', () => {
    const awards = deriveXpAwards(
      state({ furthestBeatIndex: checkIndex, checked: true }),
      PILOT,
    );
    expect(awards.map((a) => a.awardKey)).toEqual([
      'scenario_solved',
      'gotcha_solved',
      'check_passed',
    ]);
    expect(awards.find((a) => a.awardKey === 'check_passed')?.points).toBe(20);
  });

  it('awards landmark_stamped only when completed is true', () => {
    const awards = deriveXpAwards(
      state({
        furthestBeatIndex: terminalIndex,
        checked: true,
        completed: true,
        stampedAt: '2026-07-21T12:00:00.000Z',
      }),
      PILOT,
    );
    expect(awards).toEqual([
      { awardKey: 'scenario_solved', points: 15 },
      { awardKey: 'gotcha_solved', points: 15 },
      { awardKey: 'check_passed', points: 20 },
      { awardKey: 'landmark_stamped', points: 50 },
    ]);
    expect(awards.reduce((sum, a) => sum + a.points, 0)).toBe(XP_PER_LEVEL);
  });

  it('is deterministic for repeated/stale identical states', () => {
    const stamped = state({
      furthestBeatIndex: terminalIndex,
      checked: true,
      completed: true,
      stampedAt: '2026-07-21T12:00:00.000Z',
    });
    expect(deriveXpAwards(stamped, PILOT)).toEqual(deriveXpAwards(stamped, PILOT));
  });

  it('returns no awards for non-beat state or missing sequence', () => {
    expect(deriveXpAwardsForLevel({ regionId: 'git', landmarkId: 'commits-as-checkpoints', level: 'l3' }, { complete: true })).toEqual([]);
    expect(deriveXpAwardsForLevel({ regionId: 'nope', landmarkId: 'nope', level: 'l3' }, state({ furthestBeatIndex: 7, checked: true, completed: true, stampedAt: '2026-07-21T12:00:00.000Z' }))).toEqual([]);
    expect(deriveXpAwards(state({ furthestBeatIndex: 7, checked: true, completed: true, stampedAt: '2026-07-21T12:00:00.000Z' }), undefined)).toEqual([]);
  });

  it('looks up awards by beat type, not hard-coded indexes alone', () => {
    // Sanity: factory-derived landmarks also award on type crossing.
    const factory = getBeatSequence('databases', 'sql')!;
    const factoryScenario = factory.beats.findIndex((b) => b.type === 'scenario');
    const factoryGotcha = factory.beats.findIndex((b) => b.type === 'gotcha');
    expect(factoryScenario).toBeGreaterThanOrEqual(0);
    expect(factoryGotcha).toBeGreaterThan(factoryScenario);

    const awards = deriveXpAwards(
      state({ furthestBeatIndex: factoryGotcha + 1, checked: true }),
      factory,
    );
    expect(awards.map((a) => a.awardKey)).toEqual([
      'scenario_solved',
      'gotcha_solved',
      'check_passed',
    ]);
  });
});

describe('per-level XP identity (VAL-034, VAL-035)', () => {
  const stamped = state({
    furthestBeatIndex: 7,
    checked: true,
    completed: true,
    stampedAt: '2026-08-02T12:00:00.000Z',
  });

  it('derives the same four unqualified award keys for every level', () => {
    // Only L3 is registered during the compatibility window; L1/L2 derive from
    // the same code path and must not invent level-prefixed keys.
    const awards = deriveXpAwardsForLevel(
      { regionId: 'git', landmarkId: 'commits-as-checkpoints', level: 'l3' },
      stamped,
    );
    expect(awards.map((award) => award.awardKey).sort()).toEqual([
      'check_passed',
      'gotcha_solved',
      'landmark_stamped',
      'scenario_solved',
    ]);
    for (const award of awards) {
      expect(award.awardKey).not.toMatch(/^l[123]_/);
    }
  });

  it('caps at 100 per level and 300 per landmark (VAL-035)', () => {
    const perLevel = deriveXpAwardsForLevel(
      { regionId: 'git', landmarkId: 'commits-as-checkpoints', level: 'l3' },
      stamped,
    ).reduce((sum, award) => sum + award.points, 0);
    expect(perLevel).toBe(100);
    expect(perLevel).toBe(XP_PER_LEVEL);
    // Three fully stamped levels is the landmark ceiling — and it is reached by
    // the SAME four keys once per level, not by new keys or bigger point values.
    expect(perLevel * 3).toBe(XP_PER_LANDMARK);
    expect(XP_PER_LANDMARK).toBe(300);
  });

  it('uses the five-column conflict identity and returns level (DATA_MODEL §3)', () => {
    const normalized = XP_AWARD_INSERT_SQL.replace(/\s+/g, ' ').trim();
    expect(normalized).toContain(
      'INSERT INTO xp_awards (profile_id, region, landmark, level, award_key, points)',
    );
    expect(normalized).toContain(
      'ON CONFLICT (profile_id, region, landmark, level, award_key) DO NOTHING',
    );
    expect(normalized).toContain('RETURNING level, award_key, points');
    // Award derivation must not become level-prefixed anywhere in the SQL.
    expect(normalized).not.toMatch(/l[123]_(scenario|gotcha|check|landmark)/);
  });

  it('returns no awards for a level that has no registered sequence', () => {
    expect(
      deriveXpAwardsForLevel(
        { regionId: 'git', landmarkId: 'commits-as-checkpoints', level: 'l1' },
        stamped,
      ),
    ).toEqual([]);
  });
});
