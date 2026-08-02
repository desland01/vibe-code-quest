import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  BEAT_PROGRESS_UPSERT_SQL,
  LANDMARK_PROGRESS_FOR_SHARE_SQL,
  computeHighestUnlockedLevel,
  gateLevelWrite,
  isLevelUnlocked,
  resolveProgressWrite,
  validateBeatStateWrite,
} from '@/server/beatProgress';
import {
  initialBeatProgressState,
  type BeatProgressState,
  type SequenceRef,
} from '@/content/beats/schema';

function state(overrides: Partial<BeatProgressState> = {}): BeatProgressState {
  return { ...initialBeatProgressState(), ...overrides };
}

describe('validateBeatStateWrite (server, registry-aware)', () => {
  it('accepts a valid in-bounds write on the pilot landmark', () => {
    const result = validateBeatStateWrite({ regionId: 'git', landmarkId: 'commits-as-checkpoints', level: 'l3' }, state({ furthestBeatIndex: 3 }));
    expect(result.ok).toBe(true);
  });

  it('accepts a valid in-bounds write on a factory-derived landmark', () => {
    const result = validateBeatStateWrite({ regionId: 'git', landmarkId: 'branches-as-isolation', level: 'l3' }, state({ furthestBeatIndex: 3 }));
    expect(result.ok).toBe(true);
  });

  it('accepts a valid terminal stamped state', () => {
    const result = validateBeatStateWrite({ regionId: 'git', landmarkId: 'commits-as-checkpoints', level: 'l3' }, state({
      furthestBeatIndex: 7, checked: true, completed: true, stampedAt: '2026-07-19T00:00:00Z',
    }));
    expect(result.ok).toBe(true);
  });

  it('rejects unknown region', () => {
    expect(validateBeatStateWrite({ regionId: 'nope', landmarkId: 'commits-as-checkpoints', level: 'l3' }, state())).toMatchObject({ ok: false, status: 400 });
  });

  it('rejects landmark not in region', () => {
    expect(validateBeatStateWrite({ regionId: 'git', landmarkId: 'sql', level: 'l3' }, state())).toMatchObject({ ok: false, status: 400 });
  });

  it('rejects out-of-bounds furthestBeatIndex', () => {
    expect(validateBeatStateWrite({ regionId: 'git', landmarkId: 'commits-as-checkpoints', level: 'l3' }, state({ furthestBeatIndex: 8 }))).toMatchObject({ ok: false, status: 400 });
  });

  it('rejects checked before reaching the check beat (index 6)', () => {
    expect(validateBeatStateWrite({ regionId: 'git', landmarkId: 'commits-as-checkpoints', level: 'l3' }, state({ furthestBeatIndex: 5, checked: true }))).toMatchObject({ ok: false, status: 400 });
  });

  it('rejects completed before the terminal beat', () => {
    expect(validateBeatStateWrite({ regionId: 'git', landmarkId: 'commits-as-checkpoints', level: 'l3' }, state({
      furthestBeatIndex: 6, checked: true, completed: true, stampedAt: '2026-07-19T00:00:00Z',
    }))).toMatchObject({ ok: false, status: 400 });
  });

  it('rejects completed without checked/stampedAt and stampedAt without completed', () => {
    expect(validateBeatStateWrite({ regionId: 'git', landmarkId: 'commits-as-checkpoints', level: 'l3' }, state({
      furthestBeatIndex: 7, checked: false, completed: true, stampedAt: '2026-07-19T00:00:00Z',
    }))).toMatchObject({ ok: false, status: 400 });
    expect(validateBeatStateWrite({ regionId: 'git', landmarkId: 'commits-as-checkpoints', level: 'l3' }, state({
      furthestBeatIndex: 7, checked: true, completed: false, stampedAt: '2026-07-19T00:00:00Z',
    }))).toMatchObject({ ok: false, status: 400 });
  });

  it('rejects malformed states (extra keys, wrong kinds)', () => {
    expect(validateBeatStateWrite({ regionId: 'git', landmarkId: 'commits-as-checkpoints', level: 'l3' }, { ...state(), beatIndex: 3 })).toMatchObject({ ok: false, status: 400 });
    expect(validateBeatStateWrite({ regionId: 'git', landmarkId: 'commits-as-checkpoints', level: 'l3' }, { hello: 'world' })).toMatchObject({ ok: false, status: 400 });
  });
});

describe('resolveProgressWrite (registry-keyed routing — security boundary)', () => {
  const pilot: [SequenceRef] = [{ regionId: 'git', landmarkId: 'commits-as-checkpoints', level: 'l3' }];
  const factory: [SequenceRef] = [{ regionId: 'git', landmarkId: 'branches-as-isolation', level: 'l3' }];

  it('routes valid beat state on a beat-enabled landmark to the beat path', () => {
    expect(resolveProgressWrite(...pilot, state({ furthestBeatIndex: 2 }))).toMatchObject({ path: 'beat' });
    expect(resolveProgressWrite(...factory, state({ furthestBeatIndex: 2 }))).toMatchObject({ path: 'beat' });
  });

  it('rejects a beat-enabled landmark write with omitted kind (never legacy)', () => {
    expect(resolveProgressWrite(...pilot, { completed: true })).toMatchObject({ path: 'reject', status: 400 });
    expect(resolveProgressWrite(...pilot, { hello: 'world' })).toMatchObject({ path: 'reject', status: 400 });
    // L-002: every canonical landmark is beat-enabled — ordinary legacy payloads on real
    // landmarks are rejected (never silently absorbed as legacy).
    expect(resolveProgressWrite(...factory, { notes: 'x', completed: false })).toMatchObject({
      path: 'reject',
      status: 400,
    });
    expect(resolveProgressWrite({ regionId: 'databases', landmarkId: 'sql', level: 'l3' }, { anything: 1 })).toMatchObject({
      path: 'reject',
      status: 400,
    });
  });

  it('rejects a forged completed:true payload on a beat-enabled landmark', () => {
    expect(resolveProgressWrite(...pilot, state({ furthestBeatIndex: 7, checked: true, completed: true, stampedAt: null }))).toMatchObject({ path: 'reject', status: 400 });
    expect(resolveProgressWrite(...pilot, { ...state(), completed: true })).toMatchObject({ path: 'reject', status: 400 });
  });

  it('leaves v1 legacy behavior untouched for unknown non-beat identifiers only', () => {
    // After L-002 the legacy path is unreachable for any real landmark (all 48 are registered).
    // It remains as a safety fallback for unknown identifiers only.
    expect(resolveProgressWrite({ regionId: 'nope', landmarkId: 'nope', level: 'l3' }, { x: 1 }).path).toBe('legacy');
    expect(resolveProgressWrite({ regionId: 'nope', landmarkId: 'nope', level: 'l3' }, state()).path).toBe('reject');
  });
});

describe('arcade level expand migration (ISSUE-004, VAL-060)', () => {
  const migrationsDir = resolve(process.cwd(), 'db/migrations');
  const expand = readFileSync(resolve(migrationsDir, '0011_arcade_level_expand.sql'), 'utf8');
  const cutover = readFileSync(resolve(migrationsDir, '0012_arcade_level_cutover.sql'), 'utf8');

  it('uses the four-part conflict identity in the upsert SQL', () => {
    const sql = BEAT_PROGRESS_UPSERT_SQL.replace(/\s+/g, ' ').trim();
    expect(sql).toContain('INSERT INTO progress (profile_id, region, landmark, level, state)');
    expect(sql).toContain('ON CONFLICT (profile_id, region, landmark, level)');
    expect(sql).toContain('RETURNING region, landmark, level, state, updated_at');
    // The merge algebra itself must be unchanged.
    expect(sql).toContain('GREATEST');
    expect(sql).toContain("'kind', 'beat-sequence'");
  });

  it('backfills every existing row to l3 and adds no rows', () => {
    expect(expand).toContain("UPDATE progress SET level = 'l3' WHERE level IS NULL");
    expect(expand).toContain("UPDATE xp_awards SET level = 'l3' WHERE level IS NULL");
    expect(expand).toContain("ALTER TABLE progress ALTER COLUMN level SET DEFAULT 'l3'");
    expect(expand).toContain('ALTER TABLE progress ALTER COLUMN level SET NOT NULL');
    // Identity-only: the migration must never mint or destroy award facts, and
    // must never touch awarded_at (weekly totals and ranks depend on it).
    expect(expand).not.toMatch(/INSERT\s+INTO\s+xp_awards/i);
    expect(expand).not.toMatch(/DELETE\s+FROM\s+xp_awards/i);
    expect(expand).not.toMatch(/SET\s+awarded_at/i);
    expect(expand).not.toMatch(/SET\s+points/i);
  });

  it('retains the old three-part unique constraints for the rollback window (VAL-060)', () => {
    expect(expand).toContain('progress_profile_region_landmark_level_key');
    expect(expand).toContain('xp_awards_profile_region_landmark_level_award_key');
    // 0011 must NOT drop the old identities — that is what keeps the old binary
    // a valid rollback target (DATA_MODEL §7 items 2 and 4).
    expect(expand).not.toContain('DROP CONSTRAINT');

    // 0012 is the only file that drops them.
    expect(cutover).toContain('DROP CONSTRAINT progress_profile_id_region_landmark_key');
    expect(cutover).toContain(
      'DROP CONSTRAINT xp_awards_profile_id_region_landmark_award_key_key',
    );
  });

  it('makes progress identity immutable across all four identity columns', () => {
    expect(expand).toContain('CREATE FUNCTION reject_progress_identity_change()');
    expect(expand).toContain(
      'ROW(NEW.profile_id, NEW.region, NEW.landmark, NEW.level)',
    );
    expect(expand).toContain('ROW(OLD.profile_id, OLD.region, OLD.landmark, OLD.level)');
    expect(expand).toContain("RAISE EXCEPTION 'progress identity is immutable'");
    expect(expand).toContain('CREATE TRIGGER progress_identity_immutable');
    expect(expand).toContain('BEFORE UPDATE ON progress');
  });

  it('scopes every RLS policy to the three valid levels', () => {
    for (const policy of [
      'progress_select',
      'progress_insert',
      'progress_update',
      'progress_delete',
      'xp_awards_select',
      'xp_awards_insert',
    ]) {
      expect(expand).toContain(`CREATE POLICY ${policy} `);
    }
    expect(expand.match(/level IN \('l1', 'l2', 'l3'\)/g)?.length).toBeGreaterThanOrEqual(8);
  });

  it('gates the cutover migration so an ordinary db:migrate cannot apply it', () => {
    // The marker is line 1 and db/migrate.ts refuses the file without the flag.
    expect(cutover.split('\n')[0]).toBe('-- GATED: ARCADE_CUTOVER');
    const runner = readFileSync(resolve(process.cwd(), 'db/migrate.ts'), 'utf8');
    expect(runner).toContain('GATED:');
    expect(runner).toContain('_APPROVED');
  });

  it('leaves migrations 0001 through 0010 untouched by this mission', () => {
    // A changed checksum on an applied migration is a hard failure in db/migrate.ts;
    // this asserts the arcade work only ever adds files.
    const files = readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();
    expect(files.slice(0, 10)).toEqual([
      '0001_schema.sql',
      '0002_rls.sql',
      '0003_otp.sql',
      '0004_access.sql',
      '0005_profile_onboarding.sql',
      '0006_lesson_progress.sql',
      '0007_guide_sessions.sql',
      '0008_billing.sql',
      '0009_xp.sql',
      '0010_leaderboard.sql',
    ]);
  });
});

describe('hosted level gating (ISSUE-005: VAL-009, VAL-046, VAL-054, VAL-059)', () => {
  const done = (level: 'l1' | 'l2' | 'l3') => ({
    level,
    state: {
      v: 1,
      kind: 'beat-sequence',
      furthestBeatIndex: 7,
      checked: true,
      completed: true,
      stampedAt: '2026-08-02T00:00:00.000Z',
    },
  });
  const partial = (level: 'l1' | 'l2' | 'l3', furthestBeatIndex = 3) => ({
    level,
    state: { v: 1, kind: 'beat-sequence', furthestBeatIndex, checked: false, completed: false, stampedAt: null },
  });

  it('opens L1 to a brand-new profile and nothing above it', () => {
    expect(computeHighestUnlockedLevel([], ['l1', 'l2', 'l3'])).toBe('l1');
    expect(isLevelUnlocked('l1', 'l1')).toBe(true);
    expect(isLevelUnlocked('l2', 'l1')).toBe(false);
    expect(isLevelUnlocked('l3', 'l1')).toBe(false);
  });

  it('rejects a write above the highest unlocked level with 423 (VAL-009)', () => {
    const locked = gateLevelWrite('l2', [], ['l1', 'l2', 'l3']);
    expect(locked.ok).toBe(false);
    if (!locked.ok) {
      expect(locked.status).toBe(423);
      expect(locked.body).toEqual({
        error: 'Level locked',
        requestedLevel: 'l2',
        highestUnlockedLevel: 'l1',
      });
    }
    // An L3 write from a profile that has only completed L1 is still locked.
    const l3FromL1 = gateLevelWrite('l3', [done('l1')], ['l1', 'l2', 'l3']);
    expect(l3FromL1.ok).toBe(false);
  });

  it('advances the unlock one tier at a time as levels are completed', () => {
    const all = ['l1', 'l2', 'l3'] as const;
    expect(computeHighestUnlockedLevel([partial('l1')], all)).toBe('l1');
    expect(computeHighestUnlockedLevel([done('l1')], all)).toBe('l2');
    expect(computeHighestUnlockedLevel([done('l1'), partial('l2')], all)).toBe('l2');
    expect(computeHighestUnlockedLevel([done('l1'), done('l2')], all)).toBe('l3');
    expect(gateLevelWrite('l2', [done('l1')], all).ok).toBe(true);
    expect(gateLevelWrite('l3', [done('l1'), done('l2')], all).ok).toBe(true);
  });

  it('grandfathers a legacy L3 row without synthesizing L1 or L2 (VAL-054)', () => {
    // 0011 backfills existing rows to L3 only. Requiring a completed L2 for L3
    // would lock every existing player out of the tier they were playing.
    const legacy = [partial('l3', 5)];
    expect(computeHighestUnlockedLevel(legacy)).toBe('l3');
    expect(gateLevelWrite('l3', legacy).ok).toBe(true);
    // Lower levels stay selectable and start empty — no retroactive unlock is
    // recorded and no L1/L2 row is invented.
    expect(gateLevelWrite('l1', legacy).ok).toBe(true);
    expect(gateLevelWrite('l2', legacy).ok).toBe(true);
    expect(legacy.some((row) => row.level !== 'l3')).toBe(false);
  });

  it('does not let an anonymous local L3 claim promote a hosted write (VAL-059)', () => {
    // The gate reads DATABASE rows only. A browser-held L3 contributes nothing,
    // so after sign-in a profile with no rows is still capped at L1.
    const all = ['l1', 'l2', 'l3'] as const;
    expect(computeHighestUnlockedLevel([], all)).toBe('l1');
    expect(gateLevelWrite('l3', [], all).ok).toBe(false);
    // Even a completed local L1 is worthless until it lands as a hosted row.
    expect(gateLevelWrite('l2', [], all).ok).toBe(false);
  });

  it('ignores a malformed stored state when computing unlock', () => {
    const all = ['l1', 'l2', 'l3'] as const;
    expect(computeHighestUnlockedLevel([{ level: 'l1', state: { completed: true } }], all)).toBe('l1');
    expect(computeHighestUnlockedLevel([{ level: 'l1', state: null }], all)).toBe('l1');
    expect(computeHighestUnlockedLevel([{ level: 'l1', state: 'nonsense' }], all)).toBe('l1');
  });

  it('opens the only registered level instead of locking it behind unauthored tiers', () => {
    // The bug this exists to prevent: with only L3 authored — which is the state
    // of every landmark during the compatibility window — gating L3 behind a
    // completed L1 locks a brand-new player out of the ONLY level that exists.
    expect(computeHighestUnlockedLevel([], ['l3'])).toBe('l3');
    expect(gateLevelWrite('l3', [], ['l3']).ok).toBe(true);
    // L1 and L2 stay locked while they do not exist.
    expect(gateLevelWrite('l1', [], ['l3']).ok).toBe(true); // below the unlock
    expect(computeHighestUnlockedLevel([], ['l1', 'l3'])).toBe('l1');
    expect(gateLevelWrite('l3', [], ['l1', 'l3']).ok).toBe(false);
    // Once the existing tier is done, the next REGISTERED tier opens.
    expect(computeHighestUnlockedLevel([done('l1')], ['l1', 'l3'])).toBe('l3');
  });

  it('reads prerequisites with FOR SHARE inside the transaction (VAL-046)', () => {
    const sql = LANDMARK_PROGRESS_FOR_SHARE_SQL.replace(/\s+/g, ' ').trim();
    expect(sql).toContain('SELECT level, state');
    expect(sql).toContain('WHERE profile_id = $1 AND region = $2 AND landmark = $3');
    expect(sql).toContain('FOR SHARE');
  });

  it('validates state against the SELECTED level, not a fixed sequence (VAL-046)', () => {
    // The server owns beat kind and bounds per level. A frontier past the chosen
    // sequence's terminal index is rejected.
    const l3 = { regionId: 'git', landmarkId: 'branches-as-isolation', level: 'l3' } as const;
    expect(validateBeatStateWrite(l3, state({ furthestBeatIndex: 8 }))).toMatchObject({
      ok: false,
      status: 400,
    });
    expect(validateBeatStateWrite(l3, state({ furthestBeatIndex: 7 })).ok).toBe(true);
    // A level with no registered sequence is rejected outright rather than
    // falling back to another level's bounds.
    expect(
      validateBeatStateWrite(
        { regionId: 'git', landmarkId: 'branches-as-isolation', level: 'l1' },
        state({ furthestBeatIndex: 1 }),
      ),
    ).toMatchObject({ ok: false, status: 400 });
  });
});
