You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor (you are already in it). Implement only this issue; make no commits. Do not run npm install (orchestrator handles installs).

# ISSUE-007 — Access seam: entitlements + ledger + caps (REQ-012, VAL-035)

Bound: src/server/access.ts (new — THE seam), src/server/accessConfig.ts (new config module), db/migrations/0004_access.sql (new, only if schema additions are needed beyond existing tables), src/__tests__/access.integration.test.ts (new), src/__tests__/access.test.ts (unit, new), .env.example (names only).

Context (zero chat context assumed):
- REQ-012: ONE shared server module consumed by onboarding, guide, renderer, paywall: `checkAccess(identity, surface)` + `reserveUsage`/`reconcileUsage` (atomic DB reservation of worst-case tokens in a transaction BEFORE each model attempt, reconciled to actual after; executor/fallback/advisor share the ledger) + caps (per-identity daily, global daily, UTC day boundary; versioned pricing table in config; reservation expiry) + anonymous throttles (IP + device-cookie based, request token ceilings, global hard cap) + banner-state enum. NO consumer may call the AI Gateway except through this seam (the seam is the only file that will later import the gateway client).
- VAL-035: parallel requests near the limit cannot overspend (concurrency test); shared ledger across surfaces; reconciliation; UTC midnight rollover; cap=0 → banner state + zero model calls; multi-anonymous aggregate throttling (same IP/device); global hard cap. Evidence: integration/concurrency test names.
- Existing schema (db/migrations/0001..0003): usage_ledger (profile_id, day date UTC default, tokens_reserved bigint, tokens_reconciled bigint, surface text, UNIQUE(profile_id, day, surface), updated_at) with RLS (app_user own rows all ops); entitlements (profile_id PK, tier default 'free', trial dates, status default 'inactive') — app_user SELECT own row only, writes privileged-only.
- src/lib/db.ts: `pool` (privileged owner path), `withUserTransaction`/`queryAsUser` (RLS app_user path). The access seam runs SERVER-SIDE on the privileged pool (it is the trusted arbiter; RLS protects direct user paths, the seam enforces caps).
- Identity shape: authenticated = profile UUID (ct_session JWT, resolved by callers); anonymous = profile UUID too (all visitors have profiles) — but anonymous throttling additionally keys on ip + deviceCookieId supplied by callers.
- Node 24 / TS / vitest. Integration test pattern: src/__tests__/rls.integration.test.ts (skip cleanly unless TEST_DATABASE_URL).

Design requirements:
1. src/server/accessConfig.ts: versioned pricing/caps table — export a frozen config object { version: 1, surfaces: { onboarding, guide, renderer } each with worstCaseTokens + perRequestTokenCeiling, perIdentityDailyTokens (per tier: anonymous/free/trial/active), globalDailyTokens, anonymousIpDailyTokens, anonymousDeviceDailyTokens, reservationTtlSeconds (e.g. 120) }. Values conservative but non-zero; override individual numbers via env names (ACCESS_* — names in .env.example) parsed once.
2. Schema additions in db/migrations/0004_access.sql:
   - usage_reservations table (id uuid PK, profile_id, day date, surface text, tokens bigint, created_at, expires_at, reconciled boolean default false) — RLS enabled, privileged-only (documented denials). Reservations count toward spend until reconciled or expired.
   - anon_usage table for IP/device aggregate throttling (key text, kind text CHECK in ('ip','device'), day date, tokens bigint, UNIQUE(key, kind, day)) — RLS enabled, privileged-only.
   - global_usage table (day date PK, tokens bigint) — RLS enabled, privileged-only.
3. src/server/access.ts exports (all take the privileged pool internally; NO gateway import yet):
   - type Surface = 'onboarding' | 'guide' | 'renderer'; type BannerState = 'ok' | 'trial' | 'capped' | 'guide_disabled' | 'offline';
   - checkAccess(identity: { userId; tier?; ip?; deviceCookieId? }, surface): Promise<{ allowed: boolean; banner: BannerState; reason?: string }> — resolves tier from entitlements (default anonymous/free), checks per-identity daily total (reserved-unreconciled + reconciled), anonymous IP/device aggregates, global cap, cap=0 short-circuit.
   - reserveUsage(identity, surface): atomically (single transaction, row locks or ON CONFLICT arithmetic) re-check caps and insert a reservation of worstCaseTokens + bump anon/global counters; returns { ok: true, reservationId } or { ok: false, banner, reason }. MUST be safe under parallel invocation: two concurrent reserves near the limit cannot both succeed past the cap (use SELECT ... FOR UPDATE on the aggregate rows or serializable-safe upsert arithmetic with a WHERE guard).
   - reconcileUsage(reservationId, actualTokens): marks reservation reconciled, adjusts usage_ledger row (upsert on (profile_id, day, surface): tokens_reserved -= reservation tokens is implicit via reservation table; record tokens_reconciled += actualTokens) and adjusts anon/global counters by (actual - worstCase) so over-reservation is returned. Idempotent: second call for same reservation is a no-op.
   - expireStaleReservations(): releases expired unreconciled reservations (returns count) — called opportunistically at the start of reserveUsage.
   - UTC day boundary: all day computations via a single dayUtc(now?) helper.
4. Unit tests (no DB): config parsing/env override, dayUtc boundary math (23:59:59Z vs 00:00:01Z), banner mapping, cap=0 short-circuit returns allowed=false without touching the DB (inject a throwing fake pool to prove zero DB/model calls).
5. Integration tests (TEST_DATABASE_URL-guarded) proving VAL-035, each test its own profiles rows:
   - concurrency: set a per-identity cap = 2×worstCase for surface guide; fire 5 parallel reserveUsage; exactly 2 succeed.
   - shared ledger: reservations on different surfaces count against the same per-identity daily total when configured (use per-identity total = sum across surfaces).
   - reconciliation: reserve worst-case 1000, reconcile 100 → subsequent checkAccess headroom reflects 100 spent + counters adjusted; double reconcile is a no-op.
   - rollover: insert usage for yesterday (UTC); today's checkAccess unaffected.
   - cap=0: config override → banner 'capped'/'guide_disabled', reserve refused.
   - multi-anon aggregate: three different profile UUIDs sharing one ip hit the ip cap; a fourth reserve refused even though per-identity headroom remains.
   - global hard cap: set tiny global cap; reserves across two identities stop at the cap.
   - expiry: reservation with expires_at in the past is released by expireStaleReservations and no longer counts.
6. Env override values used by tests must go through the config module (vi.stubEnv or config injection — prefer an optional config parameter on the functions, defaulting to the module config, so tests inject small caps without env juggling).

Validation to satisfy:
- VAL-035 (tests above green — orchestrator runs them against a Neon test branch).
- VAL-001/003 gate green; integration tests skip cleanly without TEST_DATABASE_URL.
- VAL-002: no secret values committed or printed; .env.example gains ACCESS_* names only.

Stop conditions: if existing schema/modules don't match this description, or a command fails twice, STOP and report instead of improvising.

Print EXACTLY this structured handoff as your final message:
- Completed work:
- Unresolved work:
- Files touched:
- Commands run (with exit codes):
- Issues / surprises discovered:
- Next Context Slice:
