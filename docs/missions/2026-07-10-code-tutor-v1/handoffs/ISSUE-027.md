# ISSUE-027 handoff — Stripe trial + webhooks + paywall (VAL-040/041/042) — TEST MODE

## Completed work

- Worker (codex gpt-5.6-sol) + orchestrator paywall-spec fix: full billing stack built and **fixture-validated without any Stripe key**. Migration 0008 extends entitlements (stripe_customer_id, stripe_subscription_id, current_period_end, cancel_at_period_end, last_event_id, last_event_created + unique customer/subscription mapping indexes). `src/server/billing.ts`: startTrial (14-day no-card, one-per-email + one-per-customer), createCheckout (server-side, price from STRIPE_PRICE_ID, metadata.profile_id), processWebhookEvent (signature verify, idempotency via processed_webhook_events, ordering by event.created, transactional entitlement updates, unknown/deleted safe no-ops), reconcileAfterCheckout. `src/server/stripe.ts` injectable client factory (throws "Stripe not configured" when unset). Routes: checkout/cancel (401-gated, 503 when unconfigured), /api/stripe/webhook (raw-body, signature-verified). Paywall gates only the live guide; overview/quiz/lesson always readable; legal footer reachable.

## Fix during validation
- paywall e2e `getByRole('alert')` collided with Next.js route announcer → scoped to the guide-paywall testid (same class of fix as guide-chat). Feature verified working.

## Evidence
- `VAL-040-billing-fixtures.txt` — 8 fixture-replay cases (one-trial-per-email/customer, sig verify, dedup, out-of-order precedence, retry idempotency, unknown/deleted, checkout+reconcile, config price).
- `VAL-041-paywall-e2e.txt` — 24/24 e2e; `paywall.png` (canonical readable + guide gated + legal footer).
- `VAL-042-no-live-keys.txt` — 0 live-key patterns in source; no STRIPE keys in local or Vercel env; .env.example names only; getStripe() throws when unset.
- `VAL-001-gate.txt` — gate green (78 unit tests). Fresh-context validator (codex sol): 6/6 PASS.

## Flags / deferred
- **HITL-STRIPE-KEY** (mission-state): a Stripe TEST-mode key is required for (a) live Checkout session creation and (b) VAL-041's subscribe-with-test-card Playwright flow. The paywall + entitlement machine are ready for it. Not needed for the fixture-validated VAL-040/042 (done).
- **HITL-LIVE**: live-mode keys + real charges remain held for ISSUE-032.
- Worker added a read-only GET to /api/guide returning {allowed, verifiedEmail} for the paywall to check access status — reviewed, benign (read-only, session-gated).

## Next Context Slice
ISSUE-028 — share snapshot + OG image (VAL-050). Deps: 012 (sub-map), 005 (session).
