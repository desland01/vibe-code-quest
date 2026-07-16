# Packet amendments

## A1 — 2026-07-16: Neon replaces Supabase (user directive)

During ISSUE-004 dispatch the user directed: "use neon, not supabase." Scope of change:

- **Database:** Neon Postgres (free tier) replaces Supabase Postgres. Migrations via committed SQL (drizzle-kit or plain SQL runner). Local/CI test stack = Neon branch (no Docker requirement — replaces `supabase start`).
- **RLS (REQ-005):** unchanged in substance — same 7 tables, same per-op USING+WITH CHECK matrix, owner immutability, telemetry allowlist. Policies bind to the JWT subject claim via Postgres session JWT (`auth.user_id()` equivalent: Neon RLS/pg_session_jwt or `current_setting('request.jwt.claims')` pattern set by server routes). "Service-role" boundary = a privileged connection string confined to server routes; app queries run under an RLS-enforced role.
- **Auth (REQ-005/006, ISSUE-005/006):** Supabase Auth's anonymous JWT + email OTP is replaced by: Neon Auth (Stack Auth) IF it supports anonymous users + email OTP (verify at ISSUE-005 start); otherwise app-issued JWTs (jose, httpOnly cookie, our JWKS) + custom 6-digit email OTP. VAL-020/021/022 unchanged.
- **Terminology:** every packet reference to "Supabase" in REQ-005/006, ISSUE-004..006, VAL-020..022, HANDOFF reads "Neon (per amendment A1)". supabase/** bound paths become db/** and src/lib/db*.
- Existing Supabase artifacts: none created (the pivot happened before any Supabase resource was provisioned). SUPABASE_DB_PASSWORD_CODE_TUTOR placeholder in ~/.zshenv is orphaned — reused as NEON DB password only if needed, else inert.
