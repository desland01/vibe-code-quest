ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS persona text,
  ADD COLUMN IF NOT EXISTS interests text[],
  ADD COLUMN IF NOT EXISTS intent text,
  ADD COLUMN IF NOT EXISTS depth_preference text,
  ADD COLUMN IF NOT EXISTS current_project text,
  ADD COLUMN IF NOT EXISTS onboarding_state jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
