import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  beatProgressStorageKey,
  beatProgressStorageKeyV1,
  localHighestUnlockedLevel,
  migrateV1ToV2,
  readLocalBeatProgress,
  writeLocalBeatProgress,
} from '@/components/landmark/Beats/beatStorage';
import type { BeatProgressState } from '@/content/beats/schema';

// ISSUE-007 / VAL-057. The whole point of this suite is that a migration failure
// is never destructive: the v1 key survives every path below.

const REGION = 'git';
const LANDMARK = 'commits-as-checkpoints';
const V1_KEY = beatProgressStorageKeyV1(REGION, LANDMARK);
const L3_KEY = beatProgressStorageKey({ regionId: REGION, landmarkId: LANDMARK, level: 'l3' });

function makeStorage(seed: Record<string, string> = {}) {
  const map = new Map(Object.entries(seed));
  return {
    map,
    getItem: vi.fn((key: string) => map.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      map.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      map.delete(key);
    }),
    clear: vi.fn(() => map.clear()),
    key: vi.fn(),
    length: 0,
  };
}

function install(storage: ReturnType<typeof makeStorage>) {
  vi.stubGlobal('window', { localStorage: storage } as unknown as Window & typeof globalThis);
  return storage;
}

function state(overrides: Partial<BeatProgressState> = {}): BeatProgressState {
  return {
    v: 1,
    kind: 'beat-sequence',
    furthestBeatIndex: 0,
    checked: false,
    completed: false,
    stampedAt: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('v2 key scheme', () => {
  it('puts the level in the KEY and never inside the persisted value', () => {
    expect(L3_KEY).toBe('ct-beat-progress:v2:git/commits-as-checkpoints/l3');
    expect(beatProgressStorageKey({ regionId: REGION, landmarkId: LANDMARK, level: 'l1' })).toBe(
      'ct-beat-progress:v2:git/commits-as-checkpoints/l1',
    );
    expect(V1_KEY).toBe('ct-beat-progress:git/commits-as-checkpoints');

    const storage = install(makeStorage());
    writeLocalBeatProgress({ regionId: REGION, landmarkId: LANDMARK, level: 'l2' }, state({ furthestBeatIndex: 2 }));
    const written = storage.map.get('ct-beat-progress:v2:git/commits-as-checkpoints/l2')!;
    expect(JSON.parse(written)).toEqual(state({ furthestBeatIndex: 2 }));
    expect(written).not.toContain('"level"');
    expect(JSON.parse(written).v).toBe(1);
  });
});

describe('v1 to v2 L3 migration (VAL-057)', () => {
  it('migrates every partial frontier 0 through 7 and retains the v1 key', () => {
    for (let furthestBeatIndex = 0; furthestBeatIndex <= 7; furthestBeatIndex += 1) {
      const v1 = state({ furthestBeatIndex });
      const storage = install(makeStorage({ [V1_KEY]: JSON.stringify(v1) }));

      const outcome = migrateV1ToV2(REGION, LANDMARK, 'l3');
      expect(outcome.status).toBe('migrated');
      expect(JSON.parse(storage.map.get(L3_KEY)!)).toEqual(v1);
      // Never deleted — an old client must still be able to resume.
      expect(storage.map.get(V1_KEY)).toBe(JSON.stringify(v1));
      expect(storage.removeItem).not.toHaveBeenCalled();
    }
  });

  it('migrates a checked state and a completed state', () => {
    for (const v1 of [
      state({ furthestBeatIndex: 6, checked: true }),
      state({
        furthestBeatIndex: 7,
        checked: true,
        completed: true,
        stampedAt: '2026-08-02T00:00:00.000Z',
      }),
    ]) {
      const storage = install(makeStorage({ [V1_KEY]: JSON.stringify(v1) }));
      expect(migrateV1ToV2(REGION, LANDMARK, 'l3')).toMatchObject({ status: 'migrated', state: v1 });
      expect(JSON.parse(storage.map.get(L3_KEY)!)).toEqual(v1);
      expect(storage.map.get(V1_KEY)).toBe(JSON.stringify(v1));
    }
  });

  it('leaves malformed JSON exactly as found and writes nothing', () => {
    const storage = install(makeStorage({ [V1_KEY]: '{not json' }));
    expect(migrateV1ToV2(REGION, LANDMARK, 'l3').status).toBe('v1-invalid');
    expect(storage.map.get(V1_KEY)).toBe('{not json');
    expect(storage.map.has(L3_KEY)).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('leaves schema-invalid JSON exactly as found and writes nothing', () => {
    const bogus = JSON.stringify({ v: 1, kind: 'beat-sequence', furthestBeatIndex: -1 });
    const storage = install(makeStorage({ [V1_KEY]: bogus }));
    expect(migrateV1ToV2(REGION, LANDMARK, 'l3').status).toBe('v1-invalid');
    expect(storage.map.get(V1_KEY)).toBe(bogus);
    expect(storage.map.has(L3_KEY)).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('reports no-v1 when there is nothing to migrate', () => {
    install(makeStorage());
    expect(migrateV1ToV2(REGION, LANDMARK, 'l3').status).toBe('no-v1');
  });

  it('survives a storage read failure without throwing', () => {
    const storage = makeStorage();
    storage.getItem = vi.fn(() => {
      throw new Error('SecurityError: storage disabled');
    });
    install(storage);
    expect(() => migrateV1ToV2(REGION, LANDMARK, 'l3')).not.toThrow();
    expect(migrateV1ToV2(REGION, LANDMARK, 'l3').status).toBe('no-v1');
    expect(readLocalBeatProgress({ regionId: REGION, landmarkId: LANDMARK, level: 'l3' })).toBeNull();
  });

  it('uses valid v1 state in memory when the quota write fails, and retains v1', () => {
    const v1 = state({ furthestBeatIndex: 4 });
    const storage = makeStorage({ [V1_KEY]: JSON.stringify(v1) });
    storage.setItem = vi.fn(() => {
      throw new Error('QuotaExceededError');
    });
    install(storage);

    expect(migrateV1ToV2(REGION, LANDMARK, 'l3')).toEqual({ status: 'write-failed', state: v1 });
    expect(storage.map.has(L3_KEY)).toBe(false);
    expect(storage.map.get(V1_KEY)).toBe(JSON.stringify(v1));
    // The player still resumes from v1 this session...
    expect(readLocalBeatProgress({ regionId: REGION, landmarkId: LANDMARK, level: 'l3' })).toEqual(v1);
    // ...and the next mount retries rather than giving up.
    expect(migrateV1ToV2(REGION, LANDMARK, 'l3').status).toBe('write-failed');
  });

  it('treats a silently-dropped write as failure via the read-back check', () => {
    const v1 = state({ furthestBeatIndex: 5 });
    const storage = makeStorage({ [V1_KEY]: JSON.stringify(v1) });
    // Storage that accepts setItem but does not persist it — the exact failure a
    // bare write with no read-back would report as success.
    storage.setItem = vi.fn(() => {});
    install(storage);

    expect(migrateV1ToV2(REGION, LANDMARK, 'l3')).toEqual({ status: 'write-failed', state: v1 });
    expect(storage.map.get(V1_KEY)).toBe(JSON.stringify(v1));
  });

  it('treats a corrupted read-back as failure', () => {
    const v1 = state({ furthestBeatIndex: 5 });
    const storage = makeStorage({ [V1_KEY]: JSON.stringify(v1) });
    storage.setItem = vi.fn((key: string) => {
      storage.map.set(key, JSON.stringify(state({ furthestBeatIndex: 1 })));
    });
    install(storage);

    expect(migrateV1ToV2(REGION, LANDMARK, 'l3')).toEqual({ status: 'write-failed', state: v1 });
  });

  it('is idempotent — a valid v2 key wins and migration does not run again', () => {
    const v1 = state({ furthestBeatIndex: 2 });
    const v2 = state({ furthestBeatIndex: 6, checked: true });
    const storage = install(
      makeStorage({ [V1_KEY]: JSON.stringify(v1), [L3_KEY]: JSON.stringify(v2) }),
    );

    expect(migrateV1ToV2(REGION, LANDMARK, 'l3')).toEqual({ status: 'v2-exists', state: v2 });
    // v2 must not be clobbered back down to the stale v1 value.
    expect(JSON.parse(storage.map.get(L3_KEY)!)).toEqual(v2);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('repeats cleanly: migrating twice produces the same result and one write', () => {
    const v1 = state({ furthestBeatIndex: 3 });
    const storage = install(makeStorage({ [V1_KEY]: JSON.stringify(v1) }));

    expect(migrateV1ToV2(REGION, LANDMARK, 'l3').status).toBe('migrated');
    const writesAfterFirst = storage.setItem.mock.calls.length;
    expect(migrateV1ToV2(REGION, LANDMARK, 'l3').status).toBe('v2-exists');
    expect(storage.setItem.mock.calls.length).toBe(writesAfterFirst);
  });

  it('supports rollback to a v1-only client', () => {
    const v1 = state({ furthestBeatIndex: 7, checked: true, completed: true, stampedAt: '2026-08-02T00:00:00.000Z' });
    const storage = install(makeStorage({ [V1_KEY]: JSON.stringify(v1) }));
    migrateV1ToV2(REGION, LANDMARK, 'l3');

    // An old client reads only the v1 key. It is still there and still correct,
    // and L1/L2 v2 progress simply lies dormant until the new client returns.
    expect(JSON.parse(storage.map.get(V1_KEY)!)).toEqual(v1);
  });

  it('never migrates v1 into L1 or L2', () => {
    const v1 = state({ furthestBeatIndex: 7, checked: true, completed: true, stampedAt: '2026-08-02T00:00:00.000Z' });
    const storage = install(makeStorage({ [V1_KEY]: JSON.stringify(v1) }));

    expect(migrateV1ToV2(REGION, LANDMARK, 'l1').status).toBe('not-applicable');
    expect(migrateV1ToV2(REGION, LANDMARK, 'l2').status).toBe('not-applicable');
    // v1 only ever held tradeoffs-tier progress; treating it as L1 would hand the
    // player a level they never played.
    expect(readLocalBeatProgress({ regionId: REGION, landmarkId: LANDMARK, level: 'l1' })).toBeNull();
    expect(readLocalBeatProgress({ regionId: REGION, landmarkId: LANDMARK, level: 'l2' })).toBeNull();
    expect(storage.map.has(beatProgressStorageKey({ regionId: REGION, landmarkId: LANDMARK, level: 'l1' }))).toBe(false);
  });
});

describe('local unlock (VAL-058 self-host gating)', () => {
  it('starts at L1 with no local progress', () => {
    install(makeStorage());
    expect(localHighestUnlockedLevel(REGION, LANDMARK)).toBe('l1');
  });

  it('opens one tier at a time as levels are completed', () => {
    const l1Key = beatProgressStorageKey({ regionId: REGION, landmarkId: LANDMARK, level: 'l1' });
    const l2Key = beatProgressStorageKey({ regionId: REGION, landmarkId: LANDMARK, level: 'l2' });
    const complete = state({ furthestBeatIndex: 7, checked: true, completed: true, stampedAt: '2026-08-02T00:00:00.000Z' });

    install(makeStorage({ [l1Key]: JSON.stringify(state({ furthestBeatIndex: 3 })) }));
    expect(localHighestUnlockedLevel(REGION, LANDMARK)).toBe('l1');

    install(makeStorage({ [l1Key]: JSON.stringify(complete) }));
    expect(localHighestUnlockedLevel(REGION, LANDMARK)).toBe('l2');

    install(makeStorage({ [l1Key]: JSON.stringify(complete), [l2Key]: JSON.stringify(complete) }));
    expect(localHighestUnlockedLevel(REGION, LANDMARK)).toBe('l3');
  });

  it('grandfathers a migrated v1 player straight to L3', () => {
    install(makeStorage({ [V1_KEY]: JSON.stringify(state({ furthestBeatIndex: 5 })) }));
    // Same rule as the hosted gate: an existing L3 key opens L3 without
    // inventing L1 or L2 progress.
    expect(localHighestUnlockedLevel(REGION, LANDMARK)).toBe('l3');
  });
});
