CREATE TABLE usage_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  surface text NOT NULL CHECK (surface IN ('onboarding', 'guide', 'renderer')),
  tokens bigint NOT NULL CHECK (tokens >= 0),
  anonymous_ip_key text,
  anonymous_device_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  reconciled boolean NOT NULL DEFAULT false
);

CREATE INDEX usage_reservations_active_profile_day_idx
  ON usage_reservations (profile_id, day) WHERE reconciled = false;
CREATE INDEX usage_reservations_expiry_idx
  ON usage_reservations (expires_at) WHERE reconciled = false;

CREATE TABLE anon_usage (
  key text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('ip', 'device')),
  day date NOT NULL,
  tokens bigint NOT NULL DEFAULT 0 CHECK (tokens >= 0),
  UNIQUE (key, kind, day)
);

CREATE TABLE global_usage (
  day date PRIMARY KEY,
  tokens bigint NOT NULL DEFAULT 0 CHECK (tokens >= 0)
);

ALTER TABLE usage_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE anon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_usage ENABLE ROW LEVEL SECURITY;

-- Deliberately no app_user policies or grants: all operations are denied by
-- default. These accounting tables are writable only through the privileged
-- server-side access arbiter.
