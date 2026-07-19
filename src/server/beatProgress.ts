import 'server-only';

import { getRegion } from '@/lib/content';
import { hasBeatSequence, getBeatSequence } from '@/content/beats';
import {
  beatProgressStateSchema,
  validateBeatStateConsistency,
  type BeatProgressState,
} from '@/content/beats/schema';

// Server-side validation for beat-sequence progress writes (frozen DESIGN_CONTRACT §8).
// Uses the content manifest + beat registry; NOT imported by unit tests that must stay
// DB/network-free (those test the pure functions in content/beats/schema.ts).

export type BeatStateValidation =
  | { ok: true; state: BeatProgressState }
  | { ok: false; status: number; error: string };

export function validateBeatStateWrite(
  regionId: string,
  landmarkId: string,
  rawState: unknown
): BeatStateValidation {
  const region = getRegion(regionId);
  if (!region) return { ok: false, status: 400, error: 'Unknown region' };
  if (!region.landmarks.some((landmark) => landmark.id === landmarkId)) {
    return { ok: false, status: 400, error: 'Landmark does not belong to region' };
  }
  if (!hasBeatSequence(regionId, landmarkId)) {
    return { ok: false, status: 400, error: 'No beat sequence registered for landmark' };
  }
  const parsed = beatProgressStateSchema.safeParse(rawState);
  if (!parsed.success) return { ok: false, status: 400, error: 'Invalid beat progress state' };
  const state = parsed.data;

  const sequence = getBeatSequence(regionId, landmarkId)!;
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
  regionId: string,
  landmarkId: string,
  state: Record<string, unknown>
): ProgressWritePlan {
  if (hasBeatSequence(regionId, landmarkId)) {
    const validation = validateBeatStateWrite(regionId, landmarkId, state);
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
export const BEAT_PROGRESS_UPSERT_SQL = `
INSERT INTO progress (profile_id, region, landmark, state)
VALUES ($1, $2, $3, $4::jsonb)
ON CONFLICT (profile_id, region, landmark)
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
RETURNING region, landmark, state, updated_at
`;
