CREATE TABLE otp_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  code_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  attempts int NOT NULL DEFAULT 0 CHECK (attempts >= 0 AND attempts <= 5),
  consumed_at timestamptz
);

CREATE INDEX otp_challenges_profile_created_idx
  ON otp_challenges (profile_id, created_at);

ALTER TABLE otp_challenges ENABLE ROW LEVEL SECURITY;

-- Privileged-only table: app_user has no SELECT, INSERT, UPDATE, or DELETE
-- policy. RLS therefore denies every operation for app_user by default.
