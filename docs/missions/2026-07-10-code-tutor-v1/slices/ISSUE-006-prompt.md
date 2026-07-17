You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor (you are already in it). Implement only this issue; make no commits.

# ISSUE-006 — Email OTP upgrade + merge (custom 6-digit OTP; amendment A1 — no Supabase/Neon Auth)

Bound: db/migrations/0003_otp.sql (new), src/server/upgrade.ts (new), src/server/email.ts (new transport seam), app/api/auth/otp/request/route.ts + app/api/auth/otp/verify/route.ts (new), src/components/UpgradeAccountModal.tsx (one minimal modal, opened from a small "Save progress via email" button), src/__tests__/upgrade.integration.test.ts (new), unit tests, .env.example (names only).

Context (zero chat context assumed):
- REQ-006: opt-in, same-browser 6-digit email OTP. Success: identity upgraded IN PLACE — same UUID, profile/progress untouched, profiles.email set. Existing-email collision: prompt sign-in; verifying the OTP signs the browser into the existing account and MERGES anonymous progress (conflict-free rows copied; conflicts newest-wins by updated_at). Failure/interrupt/replay: anonymous session + data fully intact. Idempotent writes; uniqueness constraints. Verified email is the identity for trials/caps.
- Existing pieces: src/lib/auth/session.ts (jose HS256 JWTs, ct_session httpOnly cookie, SESSION_COOKIE_NAME, issueSessionToken, verifySessionToken, sessionCookieOptions); src/lib/db.ts (pool = privileged owner connection; withUserTransaction/queryAsUser = RLS-bound app_user path); db/migrations/0001_schema.sql + 0002_rls.sql (profiles has email text UNIQUE nullable; progress UNIQUE(profile_id, region, landmark) with state jsonb + updated_at; RLS: app_user can UPDATE own profiles row; entitlements/processed_webhook_events writes privileged-only).
- Migration runner: npm run db:migrate (db/migrate.ts, checksummed, transactional). Integration tests pattern: src/__tests__/rls.integration.test.ts — describe.skip unless TEST_DATABASE_URL set; tests connect via pg.Pool to a Neon test branch.
- NO email provider is configured. Build a transport seam; do NOT add any provider SDK.

Tasks:
1. Migration db/migrations/0003_otp.sql: table otp_challenges (id uuid PK default gen_random_uuid(), profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, email text NOT NULL, code_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL, attempts int NOT NULL DEFAULT 0 CHECK (attempts >= 0 AND attempts <= 5), consumed_at timestamptz). ENABLE ROW LEVEL SECURITY; NO policies for app_user (privileged-only table — document the full per-op denial in SQL comments). Index on (profile_id, created_at).
2. src/server/email.ts: `sendOtpEmail({ to, code }): Promise<void>` transport seam. Implementation: if process.env.OTP_EMAIL_TRANSPORT === 'console' OR NODE_ENV !== 'production', log a redacted line (never the code itself in production paths; in console transport it may print the code — it exists for local dev only) — otherwise throw new Error('No email transport configured') so production misconfiguration fails loudly. Keep it under ~40 lines; a provider lands later behind this seam.
3. src/server/upgrade.ts — core logic, all on the privileged pool, exported as small functions taking (client-or-pool, args) so integration tests drive them directly:
   - createOtpChallenge(profileId, email): normalize email (trim+lowercase, basic shape check), generate 6-digit code via crypto (never Math.random), store HMAC-SHA256(code, AUTH_SECRET) hex in code_hash, expires_at = now()+10min, invalidate (consume) any prior unconsumed challenge for this profile first. Returns { challengeId, code } (code is returned ONLY so the route can hand it to sendOtpEmail).
   - verifyOtpChallenge(profileId, code): fetch newest unconsumed unexpired challenge for profile; increment attempts FIRST (atomic UPDATE ... RETURNING); reject if attempts > 5, expired, consumed, or HMAC mismatch — typed error results, not throws. On success mark consumed_at (idempotent: a second verify of the same code = replay = rejected because consumed).
   - applyUpgrade(profileId, email): if no other profile has this email → UPDATE profiles SET email=$1 WHERE id=$2 (in-place upgrade; return { kind: 'upgraded', userId: profileId }). If another profile B already has it → merge: copy each of A's progress rows into B (INSERT ... ON CONFLICT (profile_id, region, landmark) DO UPDATE SET state/updated_at only when EXCLUDED.updated_at > progress.updated_at — newest-wins), leave A's rows in place; return { kind: 'merged', userId: B }. Entire merge in ONE transaction. Emit stub event: `recordEvent('account_upgraded', {...})` — create src/server/events.ts stub that no-ops (console.debug) with a typed event name union containing 'account_upgraded'.
4. Routes (thin; both require a valid ct_session cookie → 401 otherwise):
   - POST /api/auth/otp/request { email } → createOtpChallenge + sendOtpEmail; 200 { ok: true } (do NOT echo the code); 400 invalid email; rate-limit: reject (429) if a challenge for this profile was created < 30s ago.
   - POST /api/auth/otp/verify { code } → verifyOtpChallenge; on success applyUpgrade with the challenge's email; if result kind 'merged', set a fresh ct_session cookie for the merged-into userId; respond { kind, userId }. Failure paths → 400 with { error } and the anonymous session/cookie left untouched.
5. src/components/UpgradeAccountModal.tsx (client): minimal accessible modal — email input → request → code input → verify → success/error message; opened from a small button "Save progress via email" rendered in MapExperience (or layout footer); no styling beyond minimal inline/system defaults. This is the only UI.
6. src/__tests__/upgrade.integration.test.ts (guarded by TEST_DATABASE_URL like the RLS suite): prove VAL-022 —
   happy path (anon → progress → challenge → verify → same UUID, email set, progress intact);
   wrong code (attempts increments, session data intact); expired (manually set expires_at in DB); replay (second verify of consumed code rejected); abandoned flow (challenge left unconsumed — profile untouched);
   collision (profile B pre-seeded with email + own progress; A verifies → kind merged, B has A's conflict-free rows, conflicting (region,landmark) resolves newest-wins, A's rows still present, B's newer rows not clobbered);
   idempotent re-request (new challenge invalidates old one).
7. Unit tests (no DB): email normalization/validation, HMAC determinism, transport seam throws in production-without-config path (vi.stubEnv).

Validation to satisfy:
- VAL-022 all paths (integration tests above, run against a Neon test branch by the orchestrator).
- VAL-001/003 gate green; integration tests skip cleanly without TEST_DATABASE_URL.
- VAL-002: no secret values committed or printed. .env.example adds OTP_EMAIL_TRANSPORT (name only).

Stop conditions: if existing session/db modules don't match this description, or a command fails twice, STOP and report. Do not run npm install (orchestrator handles installs). Make no commits.

Print EXACTLY this structured handoff as your final message:
- Completed work:
- Unresolved work:
- Files touched:
- Commands run (with exit codes):
- Issues / surprises discovered:
- Next Context Slice:
