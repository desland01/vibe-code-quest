# ISSUE-004 handoff — Neon Postgres schema, migrations, RLS matrix (amendment A1)

## Completed work

- **Provenance:** the implementation files (db/migrate.ts, db/migrations/0001_schema.sql, 0002_rls.sql, src/lib/db.ts, src/__tests__/rls.integration.test.ts, package.json deps, .env.example) were found uncommitted on resume — output of an unattributed parallel session (see HANDOFF.md dirty-tree warning, db0278e). Classified per clean-tree-before-work: contract-conformant on inspection, no secrets, deps limited to the allowed set (pg, @types/pg, dotenv). **Adopted with provenance recorded** after live validation below; skill-installer artifacts (skills-lock.json, .agents/.claude/.codex/.gemini skill links) split into a separate chore commit.
- Schema: 7 tables (profiles, progress, region_clicks, entitlements, usage_ledger, processed_webhook_events, share_snapshots) with contract columns, CHECKs (telemetry allowlist, pg_column_size(payload) <= 2048), UNIQUE constraints.
- RLS: enabled on all 7 tables; explicit per-op policy or documented denial for every table × SELECT/INSERT/UPDATE/DELETE; USING + WITH CHECK on writes; owner-column immutability via BEFORE UPDATE trigger (ERRCODE 42501); app_user role NOLOGIN NOSUPERUSER NOBYPASSRLS; privileged path = owner connection (no SET ROLE).
- src/lib/db.ts: withUserTransaction/queryAsUser — per-transaction `SET LOCAL ROLE app_user` + `set_config('app.user_id', …, true)`.
- db/migrate.ts: idempotent runner (schema_migrations, sha256 checksum, per-migration transaction, drift detection). `npm run db:migrate`.
- One orchestrator-directed fix (applied by codex gpt-5.6-sol worker): the entitlements self-UPDATE assertion expected error 42501, but Postgres default-deny *filters* (rowCount 0) instead of raising when no UPDATE policy exists. Assertion corrected to rowCount 0 + privileged-path read-back proving the row is unchanged.
- .gitignore: added `!.env.example` exception (the `.env*` rule was silently swallowing the names-only example file).

## Evidence

- `evidence/ISSUE-004/VAL-021-rls-matrix.txt` — 4/4 integration tests green against Neon test branch `rls-test` (br-round-dust-atu1vnt5, project rapid-haze-29688965). Migrations applied twice; second run no-op (idempotency proven in-session).
- `evidence/ISSUE-004/VAL-001-gate.txt` — typecheck/lint/test/build all exit 0 (integration suite skips cleanly without TEST_DATABASE_URL).
- Fresh-context validator (codex gpt-5.6-sol, read-only): PASS on all 5 criteria (first run refused file reads due to an over-strict "no commands" instruction — re-run with read-only shell reads allowed; report in `.frugal-fable/ISSUE-004/validator-report.txt`, scratch/gitignored).
- VAL-002: no connection strings or credential values in any committed file; .env.example lists names only (DATABASE_URL, DATABASE_URL_UNPOOLED, TEST_DATABASE_URL).

## Unresolved work

- None for this issue. Neon branch `rls-test` left in place for reuse (`npm run test:rls` with TEST_DATABASE_URL from `neonctl connection-string rls-test --project-id rapid-haze-29688965 --role-name neondb_owner` — note `--role-name neondb_owner` is now required because the migration created the second role `app_user`).

## Issues / surprises discovered

- neonctl `connection-string` becomes ambiguous once app_user exists — always pass `--role-name neondb_owner`.
- codex read-only validators must be told read-only shell commands ARE the file reader; "do not run commands" makes them refuse to read.
- npx is broken machine-wide; use local node_modules/.bin or bunx.

## Next Context Slice

ISSUE-005 (Neon auth per amendment A1: verify Neon Auth/Stack Auth supports anonymous users + email OTP at issue start; else app-issued JWTs + custom OTP).
