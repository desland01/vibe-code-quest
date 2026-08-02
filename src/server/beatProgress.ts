import 'server-only';

import { getRegion } from '@/lib/content';
import { getSequence, hasSequence } from '@/content/beats';
import {
  beatProgressStateSchema,
  validateBeatStateConsistency,
  type BeatProgressState,
  type LevelId,
  type SequenceRef,
} from '@/content/beats/schema';

// Server-side validation for beat-sequence progress writes (frozen DESIGN_CONTRACT §8).
// Uses the content manifest + beat registry; NOT imported by unit tests that must stay
// DB/network-free (those test the pure functions in content/beats/schema.ts).

export type BeatStateValidation =
  | { ok: true; state: BeatProgressState }
  | { ok: false; status: number; error: string };

export function validateBeatStateWrite(
  ref: SequenceRef,
  rawState: unknown
): BeatStateValidation {
  const { regionId, landmarkId } = ref;
  const region = getRegion(regionId);
  if (!region) return { ok: false, status: 400, error: 'Unknown region' };
  if (!region.landmarks.some((landmark) => landmark.id === landmarkId)) {
    return { ok: false, status: 400, error: 'Landmark does not belong to region' };
  }
  if (!hasSequence(ref)) {
    return { ok: false, status: 400, error: 'No beat sequence registered for landmark' };
  }
  const parsed = beatProgressStateSchema.safeParse(rawState);
  if (!parsed.success) return { ok: false, status: 400, error: 'Invalid beat progress state' };
  const state = parsed.data;

  // Bounds come from the EXACT selected sequence, so an L1 run's shorter beat
  // list can never be validated against L3's terminal index.
  const sequence = getSequence(ref)!;
  const terminalIndex = sequence.beats.length - 1;
  if (state.furthestBeatIndex > terminalIndex) {
    return { ok: false, status: 400, error: 'furthestBeatIndex out of bounds' };
  }
  if (state.completed && state.furthestBeatIndex !== terminalIndex) {
    return { ok: false, status: 400, error: 'completed requires terminal beat' };
  }
  const checkIndex = sequence.beats.findIndex((beat) => beat.type === 'check');
  if (state.checked && state.furthestBeatIndex < checkIndex) {
    return { ok: false, status: 400, error: 'checked requires reaching the check beat' };
  }
  const consistency = validateBeatStateConsistency(state);
  if (!consistency.ok) return { ok: false, status: 400, error: consistency.error };
  return { ok: true, state };
}

// Pure routing decision for PUT /api/progress (frozen DESIGN_CONTRACT §8, Amendment A1).
// The SERVER registry decides which write path applies — never client-supplied state.kind.
// Security boundary (exact):
//   registered beat landmark + valid beat state      -> atomic beat merge
//   registered beat landmark + missing/forged state  -> 400 (never legacy)
//   non-beat landmark claiming kind beat-sequence    -> 400
//   any other state on non-beat landmarks            -> unchanged legacy upsert
// Legacy behavior for non-beat landmarks (incl. unknown IDs) is the v1 contract and is
// deliberately NOT tightened in this slice.
export type ProgressWritePlan =
  | { path: 'beat'; state: BeatProgressState }
  | { path: 'legacy'; state: Record<string, unknown> }
  | { path: 'reject'; status: number; error: string };

export function resolveProgressWrite(
  ref: SequenceRef,
  state: Record<string, unknown>
): ProgressWritePlan {
  if (hasSequence(ref)) {
    const validation = validateBeatStateWrite(ref, state);
    if (!validation.ok) {
      return { path: 'reject', status: validation.status, error: validation.error };
    }
    return { path: 'beat', state: validation.state };
  }
  if ((state as { kind?: unknown }).kind === 'beat-sequence') {
    return { path: 'reject', status: 400, error: 'No beat sequence registered for landmark' };
  }
  return { path: 'legacy', state };
}

// Atomic upsert SQL for beat-sequence state. Single statement, no JS read-then-write.
// Always merges (GREATEST / OR / NULLIF-COALESCE) and always returns a row — no 409 path:
// the merge is total, so any accepted write either advances or is absorbed harmlessly.
// Rows whose stored state is NOT beat-shaped are replaced wholesale (predate beat progress).
// 'stampedAt' needs NULLIF(..., 'null'::jsonb) on BOTH sides: Postgres jsonb stores JSON null
// as a real (non-NULL) jsonb value, so a bare COALESCE(->'stampedAt', ...) would keep the
// stored JSON null forever and a later real timestamp could never land. NULLIF maps JSON null
// to SQL NULL so the first real stamp wins; the trailing 'null'::jsonb keeps the key present
// as JSON null for unstamped rows so the read-side zod schema always sees a stampedAt field.
// Four-part conflict identity (DATA_MODEL §3). The merge algebra is unchanged —
// GREATEST for the frontier, OR for terminal facts, first non-null stamp — but
// L1, L2 and L3 are now three INDEPENDENT join semilattices for one landmark.
// Interleaved writes across levels can no longer compare frontiers or copy a
// terminal fact from one level onto another.
export const BEAT_PROGRESS_UPSERT_SQL = `
INSERT INTO progress (profile_id, region, landmark, level, state)
VALUES ($1, $2, $3, $4, $5::jsonb)
ON CONFLICT (profile_id, region, landmark, level)
DO UPDATE SET
  state = CASE
    WHEN progress.state->>'kind' IS DISTINCT FROM 'beat-sequence'
      THEN EXCLUDED.state
    ELSE jsonb_build_object(
      'v', 1,
      'kind', 'beat-sequence',
      'furthestBeatIndex', GREATEST(
        COALESCE((progress.state->>'furthestBeatIndex')::int, 0),
        (EXCLUDED.state->>'furthestBeatIndex')::int
      ),
      'checked', COALESCE((progress.state->>'checked')::boolean, false)
                 OR COALESCE((EXCLUDED.state->>'checked')::boolean, false),
      'completed', COALESCE((progress.state->>'completed')::boolean, false)
                   OR COALESCE((EXCLUDED.state->>'completed')::boolean, false),
      'stampedAt', COALESCE(
        NULLIF(progress.state->'stampedAt', 'null'::jsonb),
        NULLIF(EXCLUDED.state->'stampedAt', 'null'::jsonb),
        'null'::jsonb
      )
    )
  END,
  updated_at = now()
RETURNING region, landmark, level, state, updated_at
`;

// ── Level gating (ISSUE-005, DATA_MODEL §4) ──────────────────────────────────

export const LEVEL_ORDER = ['l1', 'l2', 'l3'] as const satisfies readonly LevelId[];

/** Rows this profile already holds for one landmark, read inside the transaction. */
export type LevelProgressRow = { level: LevelId; state: unknown };

export const LANDMARK_PROGRESS_FOR_SHARE_SQL = `
SELECT level, state
FROM progress
WHERE profile_id = $1 AND region = $2 AND landmark = $3
FOR SHARE
`;

/**
 * Highest level this profile may write, from progress facts alone.
 *
 * L1 is always open; a completed L1 opens L2; a completed L2 opens L3.
 *
 * The grandfather rule matters more than it looks: 0011 backfills every existing
 * row to L3 without synthesizing L1 or L2, so requiring a completed L2 for L3
 * would lock every existing player out of the tier they were already playing.
 * An existing L3 row therefore opens L3 on its own. Lower levels stay selectable
 * and simply start empty — no retroactive XP is created.
 */
export function computeHighestUnlockedLevel(rows: readonly LevelProgressRow[]): LevelId {
  let hasL3Row = false;
  const completed = new Set<LevelId>();
  for (const row of rows) {
    if (row.level === 'l3') hasL3Row = true;
    const parsed = beatProgressStateSchema.safeParse(row.state);
    if (parsed.success && parsed.data.completed) completed.add(row.level);
  }
  if (hasL3Row || completed.has('l2')) return 'l3';
  if (completed.has('l1')) return 'l2';
  return 'l1';
}

export function isLevelUnlocked(requested: LevelId, highestUnlocked: LevelId): boolean {
  return LEVEL_ORDER.indexOf(requested) <= LEVEL_ORDER.indexOf(highestUnlocked);
}

export type LevelGateResult =
  | { ok: true; highestUnlockedLevel: LevelId }
  | { ok: false; status: 423; body: { error: string; requestedLevel: LevelId; highestUnlockedLevel: LevelId } };

/**
 * The hosted gate. Callers MUST pass rows read with `FOR SHARE` inside the same
 * transaction as the write — a prerequisite read outside the transaction can be
 * overtaken between the check and the upsert.
 */
export function gateLevelWrite(
  requested: LevelId,
  rows: readonly LevelProgressRow[],
): LevelGateResult {
  const highestUnlockedLevel = computeHighestUnlockedLevel(rows);
  if (!isLevelUnlocked(requested, highestUnlockedLevel)) {
    return {
      ok: false,
      status: 423,
      body: { error: 'Level locked', requestedLevel: requested, highestUnlockedLevel },
    };
  }
  return { ok: true, highestUnlockedLevel };
}

/**
 * Self-host / anonymous authority boundary (DATA_MODEL §4).
 *
 * With no database the server cannot read the browser's local progress, so it
 * does NOT claim to verify the held prerequisite. It still owns everything it
 * can actually see: that the sequence exists, its identity, its level, its
 * terminal bounds, its single check position, and its beat kinds. A forged local
 * store can unlock local self-host content; it can never create a hosted row, an
 * XP award, or a leaderboard result.
 *
 * The asymmetry is deliberate and is what keeps an anonymous L3 from becoming an
 * authenticated grandfather token: a browser key has no server-verifiable
 * creation proof, so after sign-in it stays local until hosted L2 is complete.
 * Database grandfathering applies only to L3 rows that already existed at
 * migration time.
 */
export function resolveSelfHostWrite(ref: SequenceRef, state: Record<string, unknown>): ProgressWritePlan {
  return resolveProgressWrite(ref, state);
}
