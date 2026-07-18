import 'server-only';

import type Stripe from 'stripe';
import type { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { pool } from '@/lib/db';

export type BillingQueryable = {
  query<R extends QueryResultRow = QueryResultRow>(text: string, values?: readonly unknown[]): Promise<QueryResult<R>>;
};
export type BillingDb = BillingQueryable & {
  transaction<T>(operation: (db: BillingQueryable) => Promise<T>): Promise<T>;
};
export type BillingStripe = Pick<Stripe, 'customers' | 'subscriptions' | 'checkout' | 'webhooks'>;
export type BillingDeps = { stripe: BillingStripe; db: BillingDb; priceId?: string; webhookSecret?: string; origin?: string };

type EntitlementRow = {
  profile_id: string; stripe_customer_id: string | null; stripe_subscription_id: string | null;
  status: string; last_event_created: string | number | null;
};

export function postgresBillingDb(database: Pool = pool): BillingDb {
  return {
    query: <R extends QueryResultRow = QueryResultRow>(text: string, values?: readonly unknown[]) => database.query<R>(text, values ? [...values] : []),
    async transaction<T>(operation: (db: BillingQueryable) => Promise<T>) {
      const client: PoolClient = await database.connect();
      try { await client.query('BEGIN'); const result = await operation(client); await client.query('COMMIT'); return result; }
      catch (error) { await client.query('ROLLBACK'); throw error; }
      finally { client.release(); }
    },
  };
}

function price(deps: BillingDeps): string {
  const value = deps.priceId ?? process.env.STRIPE_PRICE_ID;
  if (!value) throw new Error('Stripe price not configured');
  return value;
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  return typeof value === 'string' ? value : value?.id ?? null;
}

function periodEnd(subscription: Stripe.Subscription): number | null {
  const ends = subscription.items.data.map((item) => item.current_period_end).filter((value): value is number => typeof value === 'number');
  return ends.length ? Math.max(...ends) : null;
}

function entitlementStatus(status: Stripe.Subscription.Status): string {
  if (status === 'trialing') return 'trialing';
  if (status === 'active') return 'active';
  if (status === 'canceled') return 'canceled';
  return status;
}

export async function startTrial({ userId, email, deps }: { userId: string; email: string; deps: BillingDeps }) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new Error('Verified email required');
  return deps.db.transaction(async (db) => {
    await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [`billing-trial:${normalized}`]);
    const used = await db.query<EntitlementRow>(`SELECT e.* FROM entitlements e JOIN profiles p ON p.id = e.profile_id
      WHERE lower(p.email) = $1 AND (e.trial_starts_at IS NOT NULL OR e.trial_ends_at IS NOT NULL OR e.status = 'trialing') LIMIT 1`, [normalized]);
    if (used.rows[0]) throw new Error('Trial already used');
    const own = await db.query<EntitlementRow>('SELECT * FROM entitlements WHERE profile_id = $1 FOR UPDATE', [userId]);
    if (own.rows[0]?.stripe_customer_id && (own.rows[0].status === 'trialing' || own.rows[0].stripe_subscription_id)) throw new Error('Trial already used by customer');

    const customer = own.rows[0]?.stripe_customer_id
      ? { id: own.rows[0].stripe_customer_id }
      : await deps.stripe.customers.create({ email: normalized, metadata: { profile_id: userId } });
    const customerUsed = await db.query<EntitlementRow>(`SELECT * FROM entitlements WHERE stripe_customer_id = $1
      AND (trial_starts_at IS NOT NULL OR trial_ends_at IS NOT NULL OR stripe_subscription_id IS NOT NULL) LIMIT 1`, [customer.id]);
    if (customerUsed.rows[0]) throw new Error('Trial already used by customer');
    const subscription = await deps.stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price(deps) }],
      trial_period_days: 14,
      trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
      metadata: { profile_id: userId },
    });
    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1_000) : new Date(Date.now() + 14 * 86_400_000);
    await db.query(`INSERT INTO entitlements
      (profile_id, tier, trial_starts_at, trial_ends_at, status, stripe_customer_id, stripe_subscription_id, updated_at)
      VALUES ($1, 'trial', now(), $2, 'trialing', $3, $4, now())
      ON CONFLICT (profile_id) DO UPDATE SET tier = 'trial', trial_starts_at = now(), trial_ends_at = EXCLUDED.trial_ends_at,
        status = 'trialing', stripe_customer_id = EXCLUDED.stripe_customer_id, stripe_subscription_id = EXCLUDED.stripe_subscription_id, updated_at = now()`,
    [userId, trialEnd, customer.id, subscription.id]);
    console.debug('[event] trial_started', { userId });
    return { customerId: customer.id, subscriptionId: subscription.id, trialEnd };
  });
}

export async function createCheckout({ userId, deps }: { userId: string; deps: BillingDeps }) {
  const row = (await deps.db.query<EntitlementRow>('SELECT * FROM entitlements WHERE profile_id = $1', [userId])).rows[0];
  if (!row?.stripe_customer_id) throw new Error('Billing customer required');
  const origin = deps.origin ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const session = await deps.stripe.checkout.sessions.create({ mode: 'subscription', customer: row.stripe_customer_id,
    line_items: [{ price: price(deps), quantity: 1 }], metadata: { profile_id: userId }, subscription_data: { metadata: { profile_id: userId } },
    success_url: `${origin}/api/billing/checkout`, cancel_url: `${origin}/map?checkout=canceled` });
  if (!session.url) throw new Error('Stripe Checkout did not return a URL');
  return session.url;
}

async function subscriptionUpdate(db: BillingQueryable, subscription: Stripe.Subscription, event: Stripe.Event, forceStatus?: string) {
  const subscriptionId = subscription.id;
  const customerId = idOf(subscription.customer);
  const row = (await db.query<EntitlementRow>(`SELECT * FROM entitlements WHERE stripe_subscription_id = $1 OR stripe_customer_id = $2 LIMIT 1 FOR UPDATE`, [subscriptionId, customerId])).rows[0];
  if (!row || (row.last_event_created !== null && event.created < Number(row.last_event_created))) return;
  const end = periodEnd(subscription);
  await db.query(`UPDATE entitlements SET stripe_subscription_id = $1, status = $2, tier = CASE WHEN $2 IN ('active','trialing') THEN CASE WHEN $2='active' THEN 'paid' ELSE 'trial' END ELSE tier END,
    trial_ends_at = COALESCE($3, trial_ends_at), current_period_end = $4, cancel_at_period_end = $5,
    last_event_id = $6, last_event_created = $7, updated_at = now() WHERE profile_id = $8`,
  [subscriptionId, forceStatus ?? entitlementStatus(subscription.status), subscription.trial_end ? new Date(subscription.trial_end * 1_000) : null,
    end ? new Date(end * 1_000) : null, subscription.cancel_at_period_end, event.id, event.created, row.profile_id]);
}

export async function processWebhookEvent(rawBody: string | Buffer, signature: string, deps: BillingDeps): Promise<{ processed: boolean }> {
  const secret = deps.webhookSecret ?? process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('Stripe webhook not configured');
  const event = deps.stripe.webhooks.constructEvent(rawBody, signature, secret);
  return deps.db.transaction(async (db) => {
    const claimed = await db.query(`INSERT INTO processed_webhook_events (event_id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING event_id`, [event.id]);
    if (claimed.rowCount === 0) return { processed: false };
    const object = event.data.object;
    if (event.type.startsWith('customer.subscription.')) {
      await subscriptionUpdate(db, object as Stripe.Subscription, event, event.type === 'customer.subscription.deleted' ? 'canceled' : undefined);
    } else if (event.type === 'checkout.session.completed') {
      const session = object as Stripe.Checkout.Session;
      const subscriptionId = idOf(session.subscription);
      const customerId = idOf(session.customer);
      const row = (await db.query<EntitlementRow>('SELECT * FROM entitlements WHERE stripe_customer_id = $1 LIMIT 1 FOR UPDATE', [customerId])).rows[0];
      if (row && (!row.last_event_created || event.created >= Number(row.last_event_created))) {
        let end: Date | null = null;
        if (subscriptionId) { const subscription = await deps.stripe.subscriptions.retrieve(subscriptionId); const seconds = periodEnd(subscription); end = seconds ? new Date(seconds * 1_000) : null; }
        await db.query(`UPDATE entitlements SET stripe_subscription_id=$1, status='active', tier='paid', current_period_end=$2,
          last_event_id=$3, last_event_created=$4, updated_at=now() WHERE profile_id=$5`, [subscriptionId, end, event.id, event.created, row.profile_id]);
      }
    } else if (event.type === 'invoice.payment_failed') {
      const invoice = object as Stripe.Invoice;
      const subscriptionId = idOf(invoice.parent?.subscription_details?.subscription);
      await db.query(`UPDATE entitlements SET status='past_due', last_event_id=$1, last_event_created=$2, updated_at=now()
        WHERE stripe_subscription_id=$3 AND (last_event_created IS NULL OR last_event_created <= $2)`, [event.id, event.created, subscriptionId]);
    }
    return { processed: true };
  });
}

export async function reconcileAfterCheckout({ userId, deps }: { userId: string; deps: BillingDeps }) {
  const row = (await deps.db.query<EntitlementRow>('SELECT * FROM entitlements WHERE profile_id=$1', [userId])).rows[0];
  if (!row?.stripe_subscription_id) throw new Error('Billing subscription required');
  const subscription = await deps.stripe.subscriptions.retrieve(row.stripe_subscription_id);
  const end = periodEnd(subscription);
  await deps.db.query(`UPDATE entitlements SET status=$1, tier=CASE WHEN $1='active' THEN 'paid' WHEN $1='trialing' THEN 'trial' ELSE tier END,
    current_period_end=$2, cancel_at_period_end=$3, trial_ends_at=COALESCE($4, trial_ends_at), updated_at=now() WHERE profile_id=$5`,
  [entitlementStatus(subscription.status), end ? new Date(end * 1_000) : null, subscription.cancel_at_period_end,
    subscription.trial_end ? new Date(subscription.trial_end * 1_000) : null, userId]);
  return subscription;
}

export async function cancelSubscription({ userId, deps }: { userId: string; deps: BillingDeps }) {
  const row = (await deps.db.query<EntitlementRow>('SELECT * FROM entitlements WHERE profile_id=$1', [userId])).rows[0];
  if (!row?.stripe_subscription_id) throw new Error('Billing subscription required');
  const subscription = await deps.stripe.subscriptions.update(row.stripe_subscription_id, { cancel_at_period_end: true });
  await deps.db.query('UPDATE entitlements SET cancel_at_period_end=true, updated_at=now() WHERE profile_id=$1', [userId]);
  return subscription;
}
