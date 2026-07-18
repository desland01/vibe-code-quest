ALTER TABLE entitlements ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE entitlements ADD COLUMN IF NOT EXISTS stripe_subscription_id text;
ALTER TABLE entitlements ADD COLUMN IF NOT EXISTS current_period_end timestamptz;
ALTER TABLE entitlements ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false;
ALTER TABLE entitlements ADD COLUMN IF NOT EXISTS last_event_id text;
ALTER TABLE entitlements ADD COLUMN IF NOT EXISTS last_event_created bigint;

CREATE UNIQUE INDEX IF NOT EXISTS entitlements_stripe_customer_unique
  ON entitlements (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS entitlements_stripe_subscription_unique
  ON entitlements (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
