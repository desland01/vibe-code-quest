import 'server-only';

import type { PoolClient } from 'pg';

import type { LevelId } from '@/content/beats/schema';

/**
 * The L3-only compatibility flag (DATA_MODEL §6 step 1, §7 item 2).
 *
 * The level-aware binary is designed to ship BEFORE `0011_arcade_level_expand.sql`
 * has necessarily been applied, and to keep working if the application is rolled
 * back while the column stays in place. Without this, every deployment ordering
 * except "migrate first, deploy second" returns 500 `column "level" does not
 * exist` on the progress API and the landmark page — which is exactly what
 * happened the first time this landed, on a database that had not been migrated.
 *
 * The flag is a capability probe rather than an env var on purpose: an env var
 * can disagree with the database, and the failure mode of that disagreement is a
 * production 500. The schema is the truth, so the schema is what we ask.
 */

type Queryable = Pick<PoolClient, 'query'>;

const LEVEL_COLUMN_SQL = `
SELECT 1
FROM information_schema.columns
WHERE table_name = 'progress' AND column_name = 'level'
LIMIT 1
`;

let cached: boolean | undefined;

/** Test seam — the probe caches per process, so tests must be able to reset it. */
export function resetLevelColumnCache(): void {
  cached = undefined;
}

export async function hasLevelColumn(client: Queryable): Promise<boolean> {
  if (cached !== undefined) return cached;
  const result = await client.query(LEVEL_COLUMN_SQL);
  cached = (result.rowCount ?? 0) > 0;
  return cached;
}

/**
 * Pre-migration statements. These are the exact shapes the previous binary used,
 * kept verbatim so the compatibility window is a real fallback and not a
 * reimplementation that can drift.
 */
export const BEAT_PROGRESS_UPSERT_SQL_PRE_LEVEL = `
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

export const XP_AWARD_INSERT_SQL_PRE_LEVEL = `
INSERT INTO xp_awards (profile_id, region, landmark, award_key, points)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (profile_id, region, landmark, award_key) DO NOTHING
RETURNING award_key, points
`;

export const LANDMARK_PROGRESS_FOR_SHARE_SQL_PRE_LEVEL = `
SELECT state
FROM progress
WHERE profile_id = $1 AND region = $2 AND landmark = $3
FOR SHARE
`;

/** Every row in a pre-migration database is, by definition, the L3 run. */
export const IMPLICIT_LEVEL: LevelId = 'l3';

/**
 * Whether a write can be represented at all before the migration lands.
 *
 * A pre-migration `progress` table has one row per landmark, so an L1 or L2
 * write has nowhere to go: storing it would silently overwrite the player's L3
 * row. Rejecting is the only non-destructive answer, and the UI has no way to
 * request L1 or L2 until ISSUE-015 ships routing anyway.
 */
export function canWriteLevel(level: LevelId, levelColumnPresent: boolean): boolean {
  return levelColumnPresent || level === IMPLICIT_LEVEL;
}
