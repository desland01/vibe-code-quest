ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_snapshots ENABLE ROW LEVEL SECURITY;

-- profiles matrix: SELECT/INSERT/UPDATE/DELETE own row.
CREATE POLICY profiles_select ON profiles FOR SELECT TO app_user
  USING (id = current_setting('app.user_id', true)::uuid);
CREATE POLICY profiles_insert ON profiles FOR INSERT TO app_user
  WITH CHECK (id = current_setting('app.user_id', true)::uuid);
CREATE POLICY profiles_update ON profiles FOR UPDATE TO app_user
  USING (id = current_setting('app.user_id', true)::uuid)
  WITH CHECK (id = current_setting('app.user_id', true)::uuid);
CREATE POLICY profiles_delete ON profiles FOR DELETE TO app_user
  USING (id = current_setting('app.user_id', true)::uuid);

-- progress matrix: SELECT/INSERT/UPDATE/DELETE own rows.
CREATE POLICY progress_select ON progress FOR SELECT TO app_user
  USING (profile_id = current_setting('app.user_id', true)::uuid);
CREATE POLICY progress_insert ON progress FOR INSERT TO app_user
  WITH CHECK (profile_id = current_setting('app.user_id', true)::uuid);
CREATE POLICY progress_update ON progress FOR UPDATE TO app_user
  USING (profile_id = current_setting('app.user_id', true)::uuid)
  WITH CHECK (profile_id = current_setting('app.user_id', true)::uuid);
CREATE POLICY progress_delete ON progress FOR DELETE TO app_user
  USING (profile_id = current_setting('app.user_id', true)::uuid);

-- region_clicks matrix: INSERT own telemetry; SELECT/UPDATE/DELETE explicitly denied by no policy.
CREATE POLICY region_clicks_insert ON region_clicks FOR INSERT TO app_user
  WITH CHECK (profile_id = current_setting('app.user_id', true)::uuid);

-- entitlements matrix: SELECT own row; INSERT/UPDATE/DELETE explicitly denied by no policy.
CREATE POLICY entitlements_select ON entitlements FOR SELECT TO app_user
  USING (profile_id = current_setting('app.user_id', true)::uuid);

-- usage_ledger matrix: SELECT/INSERT/UPDATE/DELETE own rows.
CREATE POLICY usage_ledger_select ON usage_ledger FOR SELECT TO app_user
  USING (profile_id = current_setting('app.user_id', true)::uuid);
CREATE POLICY usage_ledger_insert ON usage_ledger FOR INSERT TO app_user
  WITH CHECK (profile_id = current_setting('app.user_id', true)::uuid);
CREATE POLICY usage_ledger_update ON usage_ledger FOR UPDATE TO app_user
  USING (profile_id = current_setting('app.user_id', true)::uuid)
  WITH CHECK (profile_id = current_setting('app.user_id', true)::uuid);
CREATE POLICY usage_ledger_delete ON usage_ledger FOR DELETE TO app_user
  USING (profile_id = current_setting('app.user_id', true)::uuid);

-- processed_webhook_events matrix: SELECT/INSERT/UPDATE/DELETE explicitly denied by no policy.

-- share_snapshots matrix: SELECT/INSERT/UPDATE/DELETE own rows.
CREATE POLICY share_snapshots_select ON share_snapshots FOR SELECT TO app_user
  USING (profile_id = current_setting('app.user_id', true)::uuid);
CREATE POLICY share_snapshots_insert ON share_snapshots FOR INSERT TO app_user
  WITH CHECK (profile_id = current_setting('app.user_id', true)::uuid);
CREATE POLICY share_snapshots_update ON share_snapshots FOR UPDATE TO app_user
  USING (profile_id = current_setting('app.user_id', true)::uuid)
  WITH CHECK (profile_id = current_setting('app.user_id', true)::uuid);
CREATE POLICY share_snapshots_delete ON share_snapshots FOR DELETE TO app_user
  USING (profile_id = current_setting('app.user_id', true)::uuid);

CREATE FUNCTION reject_owner_change() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_TABLE_NAME = 'profiles' THEN
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'owner column is immutable' USING ERRCODE = '42501';
    END IF;
  ELSIF NEW.profile_id IS DISTINCT FROM OLD.profile_id THEN
    RAISE EXCEPTION 'owner column is immutable' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_owner_immutable BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION reject_owner_change();
CREATE TRIGGER progress_owner_immutable BEFORE UPDATE ON progress
  FOR EACH ROW EXECUTE FUNCTION reject_owner_change();
CREATE TRIGGER region_clicks_owner_immutable BEFORE UPDATE ON region_clicks
  FOR EACH ROW EXECUTE FUNCTION reject_owner_change();
CREATE TRIGGER entitlements_owner_immutable BEFORE UPDATE ON entitlements
  FOR EACH ROW EXECUTE FUNCTION reject_owner_change();
CREATE TRIGGER usage_ledger_owner_immutable BEFORE UPDATE ON usage_ledger
  FOR EACH ROW EXECUTE FUNCTION reject_owner_change();
CREATE TRIGGER share_snapshots_owner_immutable BEFORE UPDATE ON share_snapshots
  FOR EACH ROW EXECUTE FUNCTION reject_owner_change();

