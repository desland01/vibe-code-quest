-- GATED: ARCADE_CUTOVER
--
-- Arcade level cutover (DATA_MODEL §2). DO NOT RUN WITHOUT EXPLICIT OWNER
-- APPROVAL FOR THIS EXACT CUTOVER.
--
-- The `-- GATED: ARCADE_CUTOVER` marker on line 1 is load-bearing: db/migrate.ts
-- refuses to apply this file unless ARCADE_CUTOVER_APPROVED=1 is set in the
-- environment for that run. Without the marker this file would be applied
-- automatically by the ordinary `npm run db:migrate`, which would silently cross
-- the mission's point of no return.
--
-- Dropping the old three-part unique constraints is what enables multiple level
-- rows per landmark. After this runs, the pre-arcade binary is NO LONGER a valid
-- rollback target: its conflict targets no longer exist. The first committed
-- non-L3 row is the point of no return for a lossless old-binary rollback
-- (DATA_MODEL §7 item 5) and requires the same explicit approval.
--
-- Rollback for this file alone: its transaction restores both old unique
-- constraints automatically on failure (DATA_MODEL §7 item 3).
--
-- TRANSACTION NOTE: db/migrate.ts wraps each migration file in BEGIN/COMMIT, so
-- the explicit BEGIN/COMMIT printed in DATA_MODEL §2 is omitted here for the
-- same reason as 0011. Atomicity is unchanged.

LOCK TABLE progress, xp_awards IN ACCESS EXCLUSIVE MODE;

ALTER TABLE progress
  DROP CONSTRAINT progress_profile_id_region_landmark_key;
ALTER TABLE xp_awards
  DROP CONSTRAINT xp_awards_profile_id_region_landmark_award_key_key;
