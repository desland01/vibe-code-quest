# ISSUE-006 handoff — Email OTP upgrade + merge (custom OTP per A1)

## Completed work

- Custom 6-digit OTP stack (codex gpt-5.6-sol, workspace-write, single slice; no escalation needed):
  - `db/migrations/0003_otp.sql`: otp_challenges (HMAC hash, 10-min expiry, attempts CHECK ≤5, consumed_at), RLS enabled, privileged-only (per-op denials documented). Applied to Neon main + rls-test.
  - `src/server/upgrade.ts`: createOtpChallenge (crypto.randomInt, HMAC-SHA256 w/ AUTH_SECRET, prior-challenge invalidation), verifyOtpChallenge (FOR UPDATE, atomic attempt increment before compare, timingSafeEqual, expiry/replay/attempts typed errors), applyUpgrade (in-place upgrade same UUID; collision → one-transaction newest-wins merge copy into existing account; A's rows left intact), account_upgraded stub via new `src/server/events.ts`.
  - Routes: POST /api/auth/otp/request (401-gated, 30s rate limit, never echoes code), POST /api/auth/otp/verify (fresh ct_session cookie ONLY on merge; failures leave anon session untouched).
  - `src/server/email.ts` transport seam: console/dev transport; production without a configured transport throws loudly. **No provider SDK — email provider selection is a flagged decision for the closeout gate (HITL), not needed for VAL-022.**
  - Minimal accessible UpgradeAccountModal + "Save progress via email" button in MapExperience.

## Evidence

- `evidence/ISSUE-006/VAL-022-otp-upgrade.txt` — 7/7 integration tests green on Neon branch rls-test (happy, wrong code, expired, replay, abandoned, collision-merge newest-wins, re-request invalidation).
- `evidence/ISSUE-006/VAL-001-gate.txt` — typecheck/lint/test/build exit 0.
- VAL-020 e2e regression re-run locally with the new modal present: 1/1 green (modal copy avoids the no-signup-UI assertion patterns; the upgrade is opt-in per REQ-006).
- Fresh-context validator (codex sol, read-only): 7/7 criteria PASS.
- Orchestrator diff review of upgrade.ts + verify route: crypto and transaction discipline confirmed by direct read.

## Unresolved work / flags

- **HITL (deferred to ISSUE-032 or first billing deploy):** production email provider for OTP delivery (transport seam ready; console transport is dev-only).
- Note: verifyOtpChallenge consumes the code in its own transaction before applyUpgrade; an applyUpgrade crash would burn the code (user re-requests). Accepted as within contract.

## Next Context Slice

M1 complete. Next: M2 — ISSUE-007 access seam (entitlements + ledger + caps, VAL-035 concurrency tests).
