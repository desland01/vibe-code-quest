-- L-004: opt-in leaderboard participation + SECURITY DEFINER board reads.
-- Scores always come from xp_awards (server-derived). Handles only — no email/PII.
-- Soft opt-out keeps the row so mutation cooldown cannot be bypassed via DELETE+rejoin.
-- Handle uniqueness is among active participants only (partial unique index).

CREATE TABLE leaderboard_entries (
  profile_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  handle text NOT NULL
    CHECK (char_length(handle) BETWEEN 3 AND 24)
    CHECK (handle ~ '^[A-Za-z0-9]([A-Za-z0-9 _-]*[A-Za-z0-9])?$')
    CHECK (handle !~ '  ')
    CHECK (handle !~ '@')
    CHECK (handle !~* 'https?://')
    CHECK (handle !~ '[[:cntrl:]]')
    -- Phone-like: digit/separator-only AND ≥7 digits (matches JS validateHandle).
    CHECK (
      NOT (
        handle ~ '^[0-9 _-]+$'
        AND char_length(regexp_replace(handle, '[^0-9]', '', 'g')) >= 7
      )
    ),
  opted_in boolean NOT NULL DEFAULT true,
  opted_in_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Case-insensitive uniqueness among ACTIVE participants only.
-- Soft-opted-out rows stay for cooldown history; their handles can be claimed by others.
CREATE UNIQUE INDEX leaderboard_entries_handle_lower_uidx
  ON leaderboard_entries (lower(handle))
  WHERE opted_in = true;

-- Least privilege: soft opt-out is UPDATE, not DELETE.
GRANT SELECT, INSERT, UPDATE ON leaderboard_entries TO app_user;

ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Own-row only. Cross-user board visibility goes through definer functions below.
CREATE POLICY leaderboard_entries_select ON leaderboard_entries FOR SELECT TO app_user
  USING (profile_id = current_setting('app.user_id', true)::uuid);
CREATE POLICY leaderboard_entries_insert ON leaderboard_entries FOR INSERT TO app_user
  WITH CHECK (profile_id = current_setting('app.user_id', true)::uuid);
CREATE POLICY leaderboard_entries_update ON leaderboard_entries FOR UPDATE TO app_user
  USING (profile_id = current_setting('app.user_id', true)::uuid)
  WITH CHECK (profile_id = current_setting('app.user_id', true)::uuid);

CREATE TRIGGER leaderboard_entries_owner_immutable BEFORE UPDATE ON leaderboard_entries
  FOR EACH ROW EXECUTE FUNCTION reject_owner_change();

-- Board read: top-N by display order plus caller's own row when opted in (even outside top-N).
-- Returns only rank/handle/points/is_self/is_top — never profile_id, email, or timestamps.
-- RANK() ties equal points; handle/profile only break display order inside a tie group.
-- is_top marks the display_ord <= limit slice so clients can separate own-beyond-N cleanly.
CREATE OR REPLACE FUNCTION public.leaderboard_board(
  p_period text,
  p_limit integer DEFAULT 25
)
RETURNS TABLE (
  rank integer,
  handle text,
  points integer,
  is_self boolean,
  is_top boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  WITH bounds AS (
    SELECT
      CASE
        WHEN lower(p_period) = 'weekly' THEN
          (date_trunc('week', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
        WHEN lower(p_period) IN ('all_time', 'all-time', 'alltime') THEN
          '-infinity'::timestamptz
        ELSE NULL
      END AS since,
      GREATEST(1, LEAST(COALESCE(p_limit, 25), 100)) AS lim,
      NULLIF(current_setting('app.user_id', true), '')::uuid AS caller_id
  ),
  scored AS (
    SELECT
      e.profile_id,
      e.handle,
      COALESCE(SUM(a.points), 0)::int AS points
    FROM public.leaderboard_entries e
    LEFT JOIN public.xp_awards a
      ON a.profile_id = e.profile_id
     AND a.awarded_at >= (SELECT since FROM bounds)
    CROSS JOIN bounds b
    WHERE b.since IS NOT NULL
      AND e.opted_in = true
    GROUP BY e.profile_id, e.handle
  ),
  ranked AS (
    SELECT
      s.profile_id,
      s.handle,
      s.points,
      RANK() OVER (
        ORDER BY s.points DESC
      )::int AS rank,
      ROW_NUMBER() OVER (
        ORDER BY s.points DESC, lower(s.handle) ASC, s.profile_id ASC
      )::int AS display_ord
    FROM scored s
  ),
  board AS (
    SELECT
      r.rank,
      r.handle,
      r.points,
      (r.profile_id = b.caller_id) AS is_self,
      (r.display_ord <= b.lim) AS is_top,
      r.display_ord
    FROM ranked r
    CROSS JOIN bounds b
    WHERE r.display_ord <= b.lim
       OR (b.caller_id IS NOT NULL AND r.profile_id = b.caller_id)
  )
  SELECT b.rank, b.handle, b.points, b.is_self, b.is_top
  FROM board b
  ORDER BY b.rank ASC, lower(b.handle) ASC, b.display_ord ASC;
$$;

REVOKE ALL ON FUNCTION public.leaderboard_board(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.leaderboard_board(text, integer) TO app_user;

COMMENT ON FUNCTION public.leaderboard_board(text, integer) IS
  'L-004 leaderboard: top-N + own rank when opted in. Scores from xp_awards only. No PII columns.';

-- Write-abuse limiter for join/rename PUTs.
-- Stores only an HMAC-derived key (never raw IP). No app_user table access.
-- DELETE/opt-out is NOT limited here — privacy leave stays immediate.
CREATE TABLE leaderboard_write_limits (
  key_hash text NOT NULL,
  window_start timestamptz NOT NULL,
  write_count bigint NOT NULL DEFAULT 0 CHECK (write_count >= 0),
  PRIMARY KEY (key_hash, window_start)
);

-- Speeds stale-window cleanup on the request path.
CREATE INDEX leaderboard_write_limits_window_start_idx
  ON leaderboard_write_limits (window_start);

ALTER TABLE leaderboard_write_limits ENABLE ROW LEVEL SECURITY;
-- Deliberately no app_user policies or grants: only the definer function below may touch this table.

CREATE OR REPLACE FUNCTION public.leaderboard_register_write(
  p_key_hash text,
  p_max integer DEFAULT 20
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_window timestamptz := date_trunc('hour', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC';
  -- Production ceiling is 20/hour. Never allow callers to raise it.
  v_max integer := GREATEST(1, LEAST(COALESCE(p_max, 20), 20));
  v_count bigint;
BEGIN
  -- Exactly one SHA-256 hex digest (HMAC-SHA256 output). Reject anything else.
  IF p_key_hash IS NULL OR p_key_hash !~ '^[0-9a-f]{64}$' THEN
    RETURN false;
  END IF;

  -- Drop stale windows so the table cannot grow without bound.
  DELETE FROM public.leaderboard_write_limits
  WHERE window_start < (v_window - interval '48 hours');

  INSERT INTO public.leaderboard_write_limits (key_hash, window_start, write_count)
  VALUES (p_key_hash, v_window, 1)
  ON CONFLICT (key_hash, window_start) DO UPDATE
    SET write_count = public.leaderboard_write_limits.write_count + 1
  RETURNING write_count INTO v_count;

  RETURN v_count <= v_max;
END;
$$;

REVOKE ALL ON FUNCTION public.leaderboard_register_write(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.leaderboard_register_write(text, integer) TO app_user;

COMMENT ON FUNCTION public.leaderboard_register_write(text, integer) IS
  'L-004 write-abuse limiter: HMAC key only, hourly window, atomic increment. True if under cap.';
