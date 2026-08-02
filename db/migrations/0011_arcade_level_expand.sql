-- Arcade level expand (DATA_MODEL §2). Additive only.
--
-- Adds `level` to progress and xp_awards, backfills every existing row to 'l3',
-- adds the four-part / five-part unique identities, tightens RLS to the three
-- valid levels, and makes progress identity immutable.
--
-- The old three-part unique constraints are DELIBERATELY RETAINED here. That is
-- the compatibility window: an old writer omits `level`, receives the 'l3'
-- default, and still matches its old conflict target, so the pre-arcade binary
-- stays a valid rollback target until 0012 runs (DATA_MODEL §7 items 2 and 4).
--
-- TRANSACTION NOTE: db/migrate.ts wraps each migration file in BEGIN/COMMIT
-- itself. DATA_MODEL §2 prints these statements inside an explicit BEGIN/COMMIT
-- pair; repeating that here would nest, and the inner COMMIT would end the
-- runner's transaction early — breaking exactly the all-or-nothing rollback the
-- contract depends on (DATA_MODEL §7 item 1). The wrapper is therefore omitted,
-- matching every other migration in this directory. Atomicity is unchanged.

LOCK TABLE progress, xp_awards IN SHARE ROW EXCLUSIVE MODE;

ALTER TABLE progress ADD COLUMN level text;
UPDATE progress SET level = 'l3' WHERE level IS NULL;
ALTER TABLE progress ALTER COLUMN level SET DEFAULT 'l3';
ALTER TABLE progress ALTER COLUMN level SET NOT NULL;
ALTER TABLE progress
  ADD CONSTRAINT progress_level_check
  CHECK (level IN ('l1', 'l2', 'l3')) NOT VALID;
ALTER TABLE progress VALIDATE CONSTRAINT progress_level_check;
ALTER TABLE progress
  ADD CONSTRAINT progress_profile_region_landmark_level_key
  UNIQUE (profile_id, region, landmark, level);

ALTER TABLE xp_awards ADD COLUMN level text;
UPDATE xp_awards SET level = 'l3' WHERE level IS NULL;
ALTER TABLE xp_awards ALTER COLUMN level SET DEFAULT 'l3';
ALTER TABLE xp_awards ALTER COLUMN level SET NOT NULL;
ALTER TABLE xp_awards
  ADD CONSTRAINT xp_awards_level_check
  CHECK (level IN ('l1', 'l2', 'l3')) NOT VALID;
ALTER TABLE xp_awards VALIDATE CONSTRAINT xp_awards_level_check;
ALTER TABLE xp_awards
  ADD CONSTRAINT xp_awards_profile_region_landmark_level_award_key
  UNIQUE (profile_id, region, landmark, level, award_key);

-- Adding `level` to uniqueness is not enough on its own: without this trigger an
-- UPDATE could still move a row between identities. 0002's reject_owner_change()
-- protects only profile_id.
CREATE FUNCTION reject_progress_identity_change() RETURNS trigger
LANGUAGE plpgsql AS $body$
BEGIN
  IF ROW(NEW.profile_id, NEW.region, NEW.landmark, NEW.level)
     IS DISTINCT FROM ROW(OLD.profile_id, OLD.region, OLD.landmark, OLD.level) THEN
    RAISE EXCEPTION 'progress identity is immutable' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$body$;

CREATE TRIGGER progress_identity_immutable
  BEFORE UPDATE ON progress
  FOR EACH ROW EXECUTE FUNCTION reject_progress_identity_change();

DROP POLICY progress_select ON progress;
DROP POLICY progress_insert ON progress;
DROP POLICY progress_update ON progress;
DROP POLICY progress_delete ON progress;

CREATE POLICY progress_select ON progress FOR SELECT TO app_user
  USING (
    profile_id = current_setting('app.user_id', true)::uuid
    AND level IN ('l1', 'l2', 'l3')
  );
CREATE POLICY progress_insert ON progress FOR INSERT TO app_user
  WITH CHECK (
    profile_id = current_setting('app.user_id', true)::uuid
    AND level IN ('l1', 'l2', 'l3')
  );
CREATE POLICY progress_update ON progress FOR UPDATE TO app_user
  USING (
    profile_id = current_setting('app.user_id', true)::uuid
    AND level IN ('l1', 'l2', 'l3')
  )
  WITH CHECK (
    profile_id = current_setting('app.user_id', true)::uuid
    AND level IN ('l1', 'l2', 'l3')
  );
CREATE POLICY progress_delete ON progress FOR DELETE TO app_user
  USING (
    profile_id = current_setting('app.user_id', true)::uuid
    AND level IN ('l1', 'l2', 'l3')
  );

DROP POLICY xp_awards_select ON xp_awards;
DROP POLICY xp_awards_insert ON xp_awards;

CREATE POLICY xp_awards_select ON xp_awards FOR SELECT TO app_user
  USING (
    profile_id = current_setting('app.user_id', true)::uuid
    AND level IN ('l1', 'l2', 'l3')
  );
CREATE POLICY xp_awards_insert ON xp_awards FOR INSERT TO app_user
  WITH CHECK (
    profile_id = current_setting('app.user_id', true)::uuid
    AND level IN ('l1', 'l2', 'l3')
  );

-- This migration inserts ZERO xp_awards rows and deletes ZERO. `awarded_at` is
-- never touched, which is what keeps weekly totals and leaderboard ranks fixed
-- across the cutover (DATA_MODEL §6 assertions 4 through 7). A profile with an
-- incomplete historical award ledger stays incomplete — it is never topped up.
-- 0009's award-key/points CHECK is unchanged: no 'l1_'/'l2_'/'l3_' key is valid.
