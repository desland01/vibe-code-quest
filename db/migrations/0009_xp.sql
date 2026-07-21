-- L-003: competence-indexed XP awards ledger (server-derived, idempotent, no decay).
-- Additive only. Own grants + RLS — 0002 policies do not cover tables created later.
-- XP is fully derivable from progress; this ledger is a durable index of competence facts.

CREATE TABLE xp_awards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  region text NOT NULL,
  landmark text NOT NULL,
  award_key text NOT NULL,
  points integer NOT NULL CHECK (points > 0),
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, region, landmark, award_key),
  CHECK (
    (award_key = 'scenario_solved' AND points = 15)
    OR (award_key = 'gotcha_solved' AND points = 15)
    OR (award_key = 'check_passed' AND points = 20)
    OR (award_key = 'landmark_stamped' AND points = 50)
  )
);

CREATE INDEX xp_awards_profile_total_idx ON xp_awards (profile_id);
CREATE INDEX xp_awards_profile_awarded_at_idx ON xp_awards (profile_id, awarded_at DESC);
-- Weekly board will filter awarded_at by UTC week and aggregate by profile.
CREATE INDEX xp_awards_weekly_rank_idx ON xp_awards (awarded_at DESC, profile_id) INCLUDE (points);

GRANT SELECT, INSERT ON xp_awards TO app_user;
-- No UPDATE/DELETE for app_user: awards are append-only competence facts.

ALTER TABLE xp_awards ENABLE ROW LEVEL SECURITY;

CREATE POLICY xp_awards_select ON xp_awards FOR SELECT TO app_user
  USING (profile_id = current_setting('app.user_id', true)::uuid);
CREATE POLICY xp_awards_insert ON xp_awards FOR INSERT TO app_user
  WITH CHECK (profile_id = current_setting('app.user_id', true)::uuid);

CREATE TRIGGER xp_awards_owner_immutable BEFORE UPDATE ON xp_awards
  FOR EACH ROW EXECUTE FUNCTION reject_owner_change();

-- Backfill from existing beat-shaped progress rows only.
-- Policy: historical progress counts toward ALL-TIME XP, but must not pollute the
-- current weekly leaderboard. Scenario/gotcha/check timestamps cannot be reconstructed
-- honestly, so clamp awarded_at to no later than the microsecond before the current
-- UTC week. Weekly XP starts at L-003 launch; all-time includes the backfill.
-- Casts are guarded: only beat-sequence rows with a digit furthestBeatIndex are considered.
INSERT INTO xp_awards (profile_id, region, landmark, award_key, points, awarded_at)
SELECT
  p.profile_id,
  p.region,
  p.landmark,
  v.award_key,
  v.points,
  LEAST(
    p.updated_at,
    ((date_trunc('week', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC') - interval '1 microsecond')
  )
FROM progress p
CROSS JOIN LATERAL (
  VALUES
    (
      'scenario_solved',
      15,
      CASE
        WHEN (p.state->>'furthestBeatIndex') ~ '^[0-9]+$'
          THEN (p.state->>'furthestBeatIndex')::int
        ELSE 0
      END > 3
    ),
    (
      'gotcha_solved',
      15,
      CASE
        WHEN (p.state->>'furthestBeatIndex') ~ '^[0-9]+$'
          THEN (p.state->>'furthestBeatIndex')::int
        ELSE 0
      END > 4
    ),
    (
      'check_passed',
      20,
      (p.state->>'checked') = 'true'
    ),
    (
      'landmark_stamped',
      50,
      (p.state->>'completed') = 'true'
    )
) AS v(award_key, points, unlocked)
WHERE p.state->>'kind' = 'beat-sequence'
  AND v.unlocked
ON CONFLICT (profile_id, region, landmark, award_key) DO NOTHING;
