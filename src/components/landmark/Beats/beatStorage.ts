import {
  beatProgressStateSchema,
  type BeatProgressState,
  type LevelId,
  type SequenceRef,
} from '@/content/beats/schema';
import type { PlayerState } from './beatReducer';
import { persistentFacts } from './beatReducer';

// Local progress keys (DATA_MODEL §5).
//
// v1 was `ct-beat-progress:{regionId}/{landmarkId}` — one key per landmark,
// written when the product had one tier. v2 adds the level to the KEY, never to
// the value: the persisted JSON stays the strict `v: 1` BeatProgressState, so a
// stored blob is byte-compatible in both directions and `level` cannot drift
// from the key that addresses it.

export function beatProgressStorageKeyV1(regionId: string, landmarkId: string): string {
  return `ct-beat-progress:${regionId}/${landmarkId}`;
}

export function beatProgressStorageKey(ref: SequenceRef): string {
  return `ct-beat-progress:v2:${ref.regionId}/${ref.landmarkId}/${ref.level}`;
}

export function toBeatProgressState(state: Pick<PlayerState, 'furthestBeatIndex' | 'checked' | 'completed' | 'stampedAt'>): BeatProgressState {
  return {
    v: 1,
    kind: 'beat-sequence',
    ...persistentFacts(state),
  };
}

export function parseBeatProgressState(raw: unknown): BeatProgressState | null {
  const parsed = beatProgressStateSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

function readKey(key: string): BeatProgressState | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return parseBeatProgressState(JSON.parse(raw) as unknown);
  } catch {
    // Malformed JSON, unavailable storage, private mode — fail soft. Play must
    // never block on storage, and unreadable bytes are never rewritten.
    return null;
  }
}

function writeKey(key: string, state: BeatProgressState): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
    return true;
  } catch {
    // Quota / private mode.
    return false;
  }
}

/**
 * One-time v1 → v2 L3 migration, attempted on an L3 read only.
 *
 * Everything here is chosen so a failure is never destructive:
 *  - the v1 key is READ, never deleted, and is retained permanently through the
 *    rollback window, so an old client can still resume from it;
 *  - invalid v1 bytes produce empty progress and NO write, so a corrupt value is
 *    preserved exactly as found rather than overwritten with a guess;
 *  - the v2 write is read back and deep-compared before migration counts as
 *    durable — a quota failure that silently drops the write must not be
 *    mistaken for success;
 *  - if the write or read-back fails, the valid v1 state is used in memory for
 *    this session, v2 is left absent, and the next mount retries.
 *
 * L1 and L2 never read v1: v1 only ever held tradeoffs-tier progress, so
 * treating it as L1 progress would hand the player a level they never played.
 */
export type MigrationOutcome =
  | { status: 'not-applicable' }
  | { status: 'v2-exists'; state: BeatProgressState }
  | { status: 'no-v1' }
  | { status: 'v1-invalid' }
  | { status: 'migrated'; state: BeatProgressState }
  | { status: 'write-failed'; state: BeatProgressState };

export function migrateV1ToV2(regionId: string, landmarkId: string, level: LevelId): MigrationOutcome {
  if (level !== 'l3') return { status: 'not-applicable' };

  const v2Key = beatProgressStorageKey({ regionId, landmarkId, level: 'l3' });
  const existing = readKey(v2Key);
  // A valid v2 key always wins; migration never runs twice.
  if (existing) return { status: 'v2-exists', state: existing };

  const v1 = readKey(beatProgressStorageKeyV1(regionId, landmarkId));
  if (!v1) {
    // Covers both "absent" and "present but unparseable/schema-invalid". In the
    // invalid case the original bytes stay exactly where they are.
    let hadRaw = false;
    try {
      hadRaw = window.localStorage.getItem(beatProgressStorageKeyV1(regionId, landmarkId)) !== null;
    } catch {
      hadRaw = false;
    }
    return hadRaw ? { status: 'v1-invalid' } : { status: 'no-v1' };
  }

  if (!writeKey(v2Key, v1)) return { status: 'write-failed', state: v1 };

  const readBack = readKey(v2Key);
  if (!readBack || JSON.stringify(readBack) !== JSON.stringify(v1)) {
    return { status: 'write-failed', state: v1 };
  }
  return { status: 'migrated', state: readBack };
}

export function readLocalBeatProgress(ref: SequenceRef): BeatProgressState | null {
  if (typeof window === 'undefined') return null;
  const direct = readKey(beatProgressStorageKey(ref));
  if (direct) return direct;
  if (ref.level !== 'l3') return null;

  const outcome = migrateV1ToV2(ref.regionId, ref.landmarkId, 'l3');
  return 'state' in outcome ? outcome.state : null;
}

export function writeLocalBeatProgress(ref: SequenceRef, state: BeatProgressState): void {
  if (typeof window === 'undefined') return;
  writeKey(beatProgressStorageKey(ref), state);
}

/**
 * Highest level unlocked from local progress alone (DATA_MODEL §4, self-host).
 *
 * Same order as the hosted gate, and the same grandfather rule: a valid v2 L3
 * key — including one just migrated from v1 — opens L3 without inventing L1 or
 * L2 progress. This decides only what the CLIENT may request; it never grants a
 * hosted row, an XP award, or a leaderboard result.
 */
export function localHighestUnlockedLevel(regionId: string, landmarkId: string): LevelId {
  if (typeof window === 'undefined') return 'l1';
  const l3 = readLocalBeatProgress({ regionId, landmarkId, level: 'l3' });
  if (l3) return 'l3';
  const l2 = readLocalBeatProgress({ regionId, landmarkId, level: 'l2' });
  if (l2?.completed) return 'l3';
  const l1 = readLocalBeatProgress({ regionId, landmarkId, level: 'l1' });
  if (l1?.completed) return 'l2';
  return 'l1';
}
