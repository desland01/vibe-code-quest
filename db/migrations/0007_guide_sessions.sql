CREATE TABLE guide_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  region text NOT NULL,
  landmark text NOT NULL,
  escalations integer NOT NULL DEFAULT 0 CHECK (escalations >= 0 AND escalations <= 3),
  decisions jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(decisions) = 'array'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, region, landmark)
);

ALTER TABLE guide_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_sessions FORCE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON guide_sessions TO app_user;

-- SELECT: an app user may read only guide sessions belonging to its profile.
CREATE POLICY guide_sessions_select ON guide_sessions FOR SELECT TO app_user
  USING (profile_id = current_setting('app.user_id', true)::uuid);
-- INSERT: an app user may create only guide sessions belonging to its profile.
CREATE POLICY guide_sessions_insert ON guide_sessions FOR INSERT TO app_user
  WITH CHECK (profile_id = current_setting('app.user_id', true)::uuid);
-- UPDATE: an app user may update only its own rows and may not transfer ownership.
CREATE POLICY guide_sessions_update ON guide_sessions FOR UPDATE TO app_user
  USING (profile_id = current_setting('app.user_id', true)::uuid) WITH CHECK (profile_id = current_setting('app.user_id', true)::uuid);

CREATE TRIGGER guide_sessions_owner_immutable BEFORE UPDATE ON guide_sessions
  FOR EACH ROW EXECUTE FUNCTION reject_owner_change();
