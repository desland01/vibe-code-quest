CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
  END IF;
END
$$;

GRANT app_user TO CURRENT_USER;

CREATE TABLE profiles (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  region text NOT NULL,
  landmark text NOT NULL,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, region, landmark)
);

CREATE TABLE region_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_name text NOT NULL CHECK (event_name IN ('region_click', 'landmark_open')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (pg_column_size(payload) <= 2048),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE entitlements (
  profile_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  tier text NOT NULL DEFAULT 'free',
  trial_starts_at timestamptz,
  trial_ends_at timestamptz,
  status text NOT NULL DEFAULT 'inactive',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (trial_ends_at IS NULL OR trial_starts_at IS NULL OR trial_ends_at >= trial_starts_at)
);

CREATE TABLE usage_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  tokens_reserved bigint NOT NULL DEFAULT 0 CHECK (tokens_reserved >= 0),
  tokens_reconciled bigint NOT NULL DEFAULT 0 CHECK (tokens_reconciled >= 0),
  surface text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, day, surface)
);

CREATE TABLE processed_webhook_events (
  event_id text PRIMARY KEY,
  processed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE share_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles, progress, region_clicks, entitlements,
  usage_ledger, processed_webhook_events, share_snapshots TO app_user;
