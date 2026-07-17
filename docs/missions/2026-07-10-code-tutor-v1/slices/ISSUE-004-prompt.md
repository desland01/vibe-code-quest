You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor (you are already in it). Implement only this issue; make no commits.

# ISSUE-004 — Neon Postgres schema, migrations, RLS matrix (amendment A1: Neon replaces Supabase)
Bound: db/** (new — migrations + migration runner), src/lib/db.ts (new), src/__tests__/rls.integration.test.ts (new), package.json (deps: pg, @types/pg, dotenv only), .env.example (variable NAMES only, no values).

Context: A Neon Postgres project is provisioned; `.env.local` (gitignored, DO NOT read it into your output or print any value from it) contains DATABASE_URL / DATABASE_URL_UNPOOLED. Postgres 17. There is no Supabase; "auth.uid()" translates to the pattern below.

Tasks:
1. Committed SQL migrations under db/migrations/ (numbered 0001_*.sql …) creating 7 tables: profiles, progress, region_clicks, entitlements, usage_ledger, processed_webhook_events, share_snapshots. Sensible columns per name (profiles: id uuid PK, email nullable unique, created_at; progress: id, profile_id FK, region text, landmark text, state jsonb, updated_at, UNIQUE(profile_id, region, landmark); region_clicks: INSERT-only telemetry with event_name + payload jsonb; entitlements: profile_id, tier, trial dates, status; usage_ledger: profile_id, day date (UTC), tokens_reserved, tokens_reconciled, surface; processed_webhook_events: event_id PK, processed_at; share_snapshots: id, token unique, profile_id, payload jsonb, revoked_at).
2. RLS enabled on ALL 7 tables. JWT-subject pattern: server sets `set_config('app.user_id', <uuid>, true)` per transaction (a helper in src/lib/db.ts does this); policies use `current_setting('app.user_id', true)::uuid`. Full per-op matrix: every table × SELECT/INSERT/UPDATE/DELETE gets an explicit policy or an explicit denial (no policy = denied; document each in SQL comments). USING and WITH CHECK both specified on write policies. Owner columns (profile_id / id) immutable: enforce via trigger or WITH CHECK comparing OLD-equivalent (Postgres: use a BEFORE UPDATE trigger raising on owner-column change). region_clicks: INSERT-only (no SELECT/UPDATE/DELETE for app role), event_name IN allowlist ('region_click','landmark_open') via CHECK, pg_column_size(payload) <= 2048 CHECK. processed_webhook_events + entitlements writes: privileged role only (app role denied writes; entitlements SELECT own row only).
3. Two DB roles: `app_user` (RLS enforced, NOSUPERUSER, no BYPASSRLS) and use of the default owner connection as the privileged "service" path. Migration creates app_user role WITHOUT LOGIN password in SQL (GRANTs only); the test connects as owner then `SET ROLE app_user`.
4. db/migrate.ts (or .mjs): tiny idempotent runner — applies migrations in order, records in schema_migrations table, safe to re-run. npm script "db:migrate". Reads DATABASE_URL_UNPOOLED from env (dotenv .env.local).
5. Integration tests (vitest, src/__tests__/rls.integration.test.ts, guarded: skip cleanly with a message if DATABASE_URL is unset): prove the matrix — user A cannot read/write user B's profiles/progress/entitlements/share_snapshots; forged owner-column INSERT rejected; owner-column UPDATE rejected; telemetry INSERT works but SELECT denied and oversize payload/unknown event rejected; privileged path (no SET ROLE) can write entitlements/processed_webhook_events. Run them against a DEDICATED Neon TEST BRANCH: create via `neonctl branches create --project-id rapid-haze-29688965 --name rls-test 2>/dev/null || true`, get its connection string via `neonctl connection-string rls-test --project-id rapid-haze-29688965`, run migrations + tests against it (export TEST_DATABASE_URL). npm script "test:rls".
6. Migrations idempotent: running db:migrate twice = no-op second time (prove it).

Validation to satisfy:
- VAL-021: RLS matrix integration tests green locally (against the test branch), incl. forged-owner and privileged-role boundaries.
- VAL-001/003: npm run typecheck && lint && test && build stay green (integration tests must skip gracefully when env absent so CI/build isn't broken).
- VAL-002: NO connection strings, passwords, or key values in any committed file or in your printed output. .env.example lists names only.

Print EXACTLY this structured handoff as your final message:
- Completed work:
- Unresolved work:
- Files touched:
- Commands run (with exit codes):
- Issues / surprises discovered:
- Next Context Slice:
