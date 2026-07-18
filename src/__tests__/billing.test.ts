import { beforeEach, describe, expect, it, vi } from 'vitest';
import type Stripe from 'stripe';
import type { QueryResult, QueryResultRow } from 'pg';
import { createCheckout, processWebhookEvent, reconcileAfterCheckout, startTrial, type BillingDb, type BillingStripe } from '@/server/billing';

type Ent = { profile_id: string; stripe_customer_id: string | null; stripe_subscription_id: string | null; status: string; tier?: string;
  trial_starts_at?: Date | null; trial_ends_at?: Date | null; current_period_end?: Date | null; cancel_at_period_end?: boolean;
  last_event_id?: string | null; last_event_created: number | null };

function result<R extends QueryResultRow>(rows: R[], rowCount = rows.length): QueryResult<R> {
  return { rows, rowCount, command: '', oid: 0, fields: [] };
}

class FakeDb implements BillingDb {
  profiles = new Map<string, string>([['u1', 'one@example.com'], ['u2', 'one@example.com'], ['u3', 'three@example.com']]);
  entitlements = new Map<string, Ent>(); processed = new Set<string>(); writes = 0;
  transaction<T>(operation: (db: FakeDb) => Promise<T>) { return operation(this); }
  async query<R extends QueryResultRow>(sql: string, values: readonly unknown[] = []): Promise<QueryResult<R>> {
    const compact = sql.replace(/\s+/g, ' ').trim();
    if (compact.startsWith('SELECT pg_advisory')) return result([]) as QueryResult<R>;
    if (compact.includes('JOIN profiles p') && compact.includes('lower(p.email)')) {
      const email = values[0]; const found = [...this.entitlements.values()].find((e) => this.profiles.get(e.profile_id) === email && (e.trial_starts_at || e.trial_ends_at || e.status === 'trialing'));
      return result(found ? [found] : []) as unknown as QueryResult<R>;
    }
    if (compact.startsWith('SELECT * FROM entitlements WHERE profile_id')) return result(this.entitlements.has(String(values[0])) ? [this.entitlements.get(String(values[0]))!] : []) as unknown as QueryResult<R>;
    if (compact.includes('WHERE stripe_customer_id = $1') && compact.includes('trial_starts_at')) {
      const found = [...this.entitlements.values()].find((e) => e.stripe_customer_id === values[0] && (e.trial_starts_at || e.trial_ends_at || e.stripe_subscription_id));
      return result(found ? [found] : []) as unknown as QueryResult<R>;
    }
    if (compact.includes('WHERE stripe_subscription_id = $1 OR stripe_customer_id = $2')) {
      const found = [...this.entitlements.values()].find((e) => e.stripe_subscription_id === values[0] || e.stripe_customer_id === values[1]);
      return result(found ? [found] : []) as unknown as QueryResult<R>;
    }
    if (compact.startsWith('SELECT * FROM entitlements WHERE stripe_customer_id')) {
      const found = [...this.entitlements.values()].find((e) => e.stripe_customer_id === values[0]); return result(found ? [found] : []) as unknown as QueryResult<R>;
    }
    if (compact.startsWith('INSERT INTO processed_webhook_events')) {
      const id = String(values[0]); if (this.processed.has(id)) return result([], 0) as QueryResult<R>; this.processed.add(id); return result([{ event_id: id }] as unknown as R[]) as QueryResult<R>;
    }
    if (compact.startsWith('INSERT INTO entitlements')) {
      this.entitlements.set(String(values[0]), { profile_id: String(values[0]), tier: 'trial', trial_starts_at: new Date(), trial_ends_at: values[1] as Date,
        status: 'trialing', stripe_customer_id: String(values[2]), stripe_subscription_id: String(values[3]), last_event_created: null }); this.writes++; return result([]) as QueryResult<R>;
    }
    if (compact.startsWith('UPDATE entitlements SET stripe_subscription_id = $1')) {
      const ent = this.entitlements.get(String(values[7])); if (ent) Object.assign(ent, { stripe_subscription_id: values[0], status: values[1], trial_ends_at: values[2] ?? ent.trial_ends_at,
        current_period_end: values[3], cancel_at_period_end: values[4], last_event_id: values[5], last_event_created: values[6] }); this.writes++; return result([]) as QueryResult<R>;
    }
    if (compact.includes("SET stripe_subscription_id=$1, status='active'")) {
      const ent = this.entitlements.get(String(values[4])); if (ent) Object.assign(ent, { stripe_subscription_id: values[0], status: 'active', tier: 'paid', current_period_end: values[1], last_event_id: values[2], last_event_created: values[3] }); this.writes++; return result([]) as QueryResult<R>;
    }
    if (compact.startsWith('UPDATE entitlements SET status=$1')) {
      const ent = this.entitlements.get(String(values[4])); if (ent) Object.assign(ent, { status: values[0], current_period_end: values[1], cancel_at_period_end: values[2], trial_ends_at: values[3] ?? ent.trial_ends_at }); this.writes++; return result([]) as QueryResult<R>;
    }
    if (compact.includes("SET status='past_due'")) return result([]) as QueryResult<R>;
    throw new Error(`Unhandled fake SQL: ${compact}`);
  }
}

function subscription(overrides: Partial<Stripe.Subscription> = {}): Stripe.Subscription {
  return { id: 'sub_1', object: 'subscription', customer: 'cus_1', status: 'trialing', trial_end: 2_000,
    cancel_at_period_end: false, items: { data: [{ current_period_end: 3_000 }] } as Stripe.ApiList<Stripe.SubscriptionItem>, ...overrides } as Stripe.Subscription;
}

function event(id: string, created: number, type: Stripe.Event.Type, object: object): Stripe.Event {
  return { id, created, type, data: { object }, object: 'event', livemode: false, pending_webhooks: 0, request: null, api_version: null } as Stripe.Event;
}

describe('billing fixture replay', () => {
  let db: FakeDb; let currentEvent: Stripe.Event; let fakeStripe: BillingStripe;
  beforeEach(() => {
    db = new FakeDb(); currentEvent = event('evt_1', 100, 'customer.subscription.updated', subscription());
    fakeStripe = { customers: { create: vi.fn(async () => ({ id: 'cus_1' })) }, subscriptions: {
      create: vi.fn(async () => subscription()), retrieve: vi.fn(async () => subscription()), update: vi.fn(async () => subscription({ cancel_at_period_end: true }))
    }, checkout: { sessions: { create: vi.fn(async () => ({ url: 'https://checkout.test/session' })) } },
    webhooks: { constructEvent: vi.fn(() => currentEvent) } } as unknown as BillingStripe;
  });

  it('starts one no-card trial per email and rejects a second profile', async () => {
    const trial = await startTrial({ userId: 'u1', email: 'ONE@example.com', deps: { stripe: fakeStripe, db, priceId: 'price_test' } });
    expect(trial.subscriptionId).toBe('sub_1'); expect(db.entitlements.get('u1')?.status).toBe('trialing');
    expect(fakeStripe.subscriptions.create).toHaveBeenCalledWith(expect.objectContaining({ trial_period_days: 14, trial_settings: { end_behavior: { missing_payment_method: 'cancel' } } }));
    await expect(startTrial({ userId: 'u2', email: 'one@example.com', deps: { stripe: fakeStripe, db, priceId: 'price_test' } })).rejects.toThrow('Trial already used');
    await expect(startTrial({ userId: 'u1', email: 'one@example.com', deps: { stripe: fakeStripe, db, priceId: 'price_test' } })).rejects.toThrow('Trial already used');
  });

  it('rejects a customer that already has a subscription mapping', async () => {
    db.entitlements.set('u3', { profile_id: 'u3', stripe_customer_id: 'cus_used', stripe_subscription_id: 'sub_used', status: 'canceled', last_event_created: null });
    await expect(startTrial({ userId: 'u3', email: 'three@example.com', deps: { stripe: fakeStripe, db, priceId: 'price_test' } })).rejects.toThrow('Trial already used');
    expect(fakeStripe.subscriptions.create).not.toHaveBeenCalled();
  });

  it('verifies signatures before touching the database', async () => {
    fakeStripe.webhooks.constructEvent = vi.fn(() => { throw new Error('bad signature'); });
    await expect(processWebhookEvent('{}', 'bad', { stripe: fakeStripe, db, webhookSecret: 'whsec_fixture' })).rejects.toThrow('bad signature');
    expect(db.processed.size).toBe(0);
  });

  it('deduplicates retries and preserves the same entitlement', async () => {
    db.entitlements.set('u1', { profile_id: 'u1', stripe_customer_id: 'cus_1', stripe_subscription_id: 'sub_1', status: 'trialing', last_event_created: null });
    expect((await processWebhookEvent('{}', 'sig', { stripe: fakeStripe, db, webhookSecret: 'fixture' })).processed).toBe(true);
    const snapshot = structuredClone(db.entitlements.get('u1'));
    expect((await processWebhookEvent('{}', 'sig', { stripe: fakeStripe, db, webhookSecret: 'fixture' })).processed).toBe(false);
    expect(db.entitlements.get('u1')).toEqual(snapshot);
  });

  it('ignores an older subscription event after a newer event', async () => {
    db.entitlements.set('u1', { profile_id: 'u1', stripe_customer_id: 'cus_1', stripe_subscription_id: 'sub_1', status: 'active', last_event_created: 200 });
    currentEvent = event('evt_old', 100, 'customer.subscription.deleted', subscription({ status: 'canceled' }));
    await processWebhookEvent('{}', 'sig', { stripe: fakeStripe, db, webhookSecret: 'fixture' });
    expect(db.entitlements.get('u1')?.status).toBe('active');
  });

  it('safely ignores unknown customers and cancels known deleted subscriptions', async () => {
    await expect(processWebhookEvent('{}', 'sig', { stripe: fakeStripe, db, webhookSecret: 'fixture' })).resolves.toEqual({ processed: true });
    db.entitlements.set('u1', { profile_id: 'u1', stripe_customer_id: 'cus_1', stripe_subscription_id: 'sub_1', status: 'active', last_event_created: null });
    currentEvent = event('evt_delete', 101, 'customer.subscription.deleted', subscription({ status: 'canceled' }));
    await processWebhookEvent('{}', 'sig', { stripe: fakeStripe, db, webhookSecret: 'fixture' });
    expect(db.entitlements.get('u1')?.status).toBe('canceled');
  });

  it('activates checkout completion and reconciles before a webhook arrives', async () => {
    db.entitlements.set('u1', { profile_id: 'u1', stripe_customer_id: 'cus_1', stripe_subscription_id: 'sub_1', status: 'trialing', last_event_created: null });
    currentEvent = event('evt_checkout', 102, 'checkout.session.completed', { customer: 'cus_1', subscription: 'sub_1' });
    await processWebhookEvent('{}', 'sig', { stripe: fakeStripe, db, webhookSecret: 'fixture' });
    expect(db.entitlements.get('u1')).toMatchObject({ status: 'active', current_period_end: new Date(3_000_000) });
    fakeStripe.subscriptions.retrieve = vi.fn(async () => subscription({ status: 'active', items: { data: [{ current_period_end: 4_000 }] } as Stripe.ApiList<Stripe.SubscriptionItem> })) as unknown as typeof fakeStripe.subscriptions.retrieve;
    await reconcileAfterCheckout({ userId: 'u1', deps: { stripe: fakeStripe, db } });
    expect(db.entitlements.get('u1')).toMatchObject({ status: 'active', current_period_end: new Date(4_000_000) });
  });

  it('reads the configured price for checkout', async () => {
    db.entitlements.set('u1', { profile_id: 'u1', stripe_customer_id: 'cus_1', stripe_subscription_id: 'sub_1', status: 'trialing', last_event_created: null });
    expect(await createCheckout({ userId: 'u1', deps: { stripe: fakeStripe, db, priceId: 'price_fixture' } })).toBe('https://checkout.test/session');
    expect(fakeStripe.checkout.sessions.create).toHaveBeenCalledWith(expect.objectContaining({ line_items: [{ price: 'price_fixture', quantity: 1 }] }));
  });
});
