ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS lesson_progress jsonb DEFAULT '{}'::jsonb;
