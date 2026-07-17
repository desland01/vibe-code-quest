---
name: code-tutor-agent-lessons
description: Preflight for code-tutor mission execution, Neon/Postgres auth work, mission packet maintenance, agent dispatch, and dirty-tree adoption in this repo.
user-invocable: true
argument-hint: "[task or issue]"
---

# code-tutor Agent Lessons

Use this before implementing or resuming the code-tutor v1 mission in this repo.

## First five minutes

1. Read `AGENTS.md`, `CLAUDE.md`, `WORK_LEDGER.md`, and `docs/missions/2026-07-10-code-tutor-v1/HANDOFF.md` before editing.
2. Check `git status --short`. If ISSUE-shaped uncommitted work exists, classify it before writing: owned, attributable parallel-session output, unrelated user work, or quarantine candidate.
3. Read `docs/missions/2026-07-10-code-tutor-v1/AMENDMENTS.md` and `mission-state.json` before trusting older PRD/issue wording.
4. Keep spend, live Stripe, launch posts, legal/pricing decisions, provider account changes, and customer/public communication approval-gated.
5. Run the mission's normal gate (`npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`) before claiming implementation done.

## Repeated class-level lessons

### 1. Mission amendments must rewrite execution truth, not just append a note

The 2026-07-16 Amendment A1 replaced Supabase with Neon after the original mission packet was already written. The handoff addendum and amendment became binding, but older packet sections still contained Supabase-era summaries.

- Treat amendments as source-of-truth patches. Before dispatching workers, reconcile `HANDOFF.md`, `ISSUES.md`, `PRD.md`, validation text, and worker prompts so the same issue does not ask for two backend providers.
- If a legacy requirement summary conflicts with a dated amendment, follow the amendment and record exactly which older wording is superseded.
- Do not rely on chat memory for substrate changes. The packet must carry the new backend/auth/test-stack decision so fresh sessions and read-only validators cannot resurrect the old plan.

### 2. Neon work is branch-first and secret-quiet

Neon replaced Supabase for data/auth. The repo-local Neon skills are the vendor reference, but code-tutor needs a stricter mission posture around branches, local env, and proof.

- Use Neon branches for test/integration slices; do not mutate a shared production database for ISSUE-level tests.
- Keep connection strings and provider credentials in ignored env files or injected process env. Never print, commit, paste, or summarize secret values; env var names are okay, values are not.
- If a credential value ever transits chat or logs, treat it as a leaked secret and route to a scrub/rotation plan after the mission-critical blocker is cleared.
- Provider provisioning or account-level changes remain owner-approved actions even when the technical CLI can do them.

### 3. Dirty ISSUE-shaped work must be adopted with provenance or quarantined

The 2026-07-16 handoff warned that ISSUE-004-shaped files existed that the orchestrator did not author. That is not automatically bad, but it is never safe to blanket-commit.

- First action on resume: inspect the dirty files against the exact issue contract and tests. If they satisfy the contract, adopt them with provenance recorded as unattributed parallel-session output.
- If they do not satisfy the contract, preserve them on a quarantine branch or stash with a clear note before starting a clean implementation.
- Never run `git add -A` in a dirty mission repo. Stage explicit paths per issue and keep unowned artifacts visible.

### 4. Worker dispatch must match sandbox needs

The mission handoff notes that the codex-worker dispatcher defaulted to a read-only sandbox, while implementation slices need workspace-write.

- Validators can run read-only; implementers need `codex exec --sandbox workspace-write` or the equivalent mission-approved write lane from the repo root.
- A validator failing to run commands because of read-only `EPERM` is an orchestration limitation, not proof the code is broken. The orchestrator must rerun the gate in a write-capable/local context for evidence.
- Keep issue execution serial when slices share schema, auth, data, or mission-state files. One issue, one gate, one handoff/ledger update, then the next issue.

### 5. Provider-managed auth claims must be capability-proven before architecture locks

ISSUE-005 proved that "Neon Auth is available" was not enough. Managed BetterAuth supported email OTP/magic links, but not stable per-visitor anonymous identities; `allowAnonymous` produced a shared anonymous role, which could not satisfy the mission's per-profile persistence and Row Level Security (RLS) requirements.

- First act on any auth/provider slice: verify the exact feature shape against current provider docs and a live smoke, then record the result in `AMENDMENTS.md` or the issue handoff.
- If provider auth cannot issue stable anonymous user identities, use the packet's fallback path rather than bending requirements: app-issued httpOnly session cookie, stable visitor UUID, and server-set database session claims for RLS.
- Do not make Postgres verify web-app JWTs unless the design explicitly needs it. In code-tutor, RLS binds through `set_config('app.user_id', ...)` inside server routes, so app-issued HS256 cookies are enough and JWKS would be unnecessary surface area.
- Routes live under the repo's actual root `app/` tree, not the prompt's assumed `src/app/`. Verify path conventions from files before dispatching workers.
- Browser/e2e proof needs an explicit app port or `PLAYWRIGHT_BASE_URL`; port 3000 can belong to another local app and make `reuseExistingServer` test the wrong product.

### 6. OTP upgrades are account-merge transactions, not just email forms

ISSUE-006 built custom OTP because the auth provider could not cover anonymous upgrade semantics. The durable lesson is the transaction boundary.

- Store only HMAC-hashed OTP codes with short expiry, max attempts, prior-challenge invalidation, and row locks around verification. Never echo codes in routes, logs, evidence, or reports.
- Verification failures must leave the anonymous session untouched. Only a successful merge should issue a fresh session cookie for the destination profile.
- Collision handling needs a declared merge rule. Current code-tutor policy is newest-wins inside one transaction; keep that policy explicit in tests and handoffs.
- Keep the email transport as a seam until the provider decision is approved. Dev/console transport is fine for validation; production without a configured transport should fail loudly rather than silently pretending mail was sent.
- Treat an apply-upgrade crash after OTP consumption as acceptable only if the user can re-request; document that tradeoff in the handoff.

### 7. LLM budget gates reserve before calls and reconcile after streaming

ISSUE-007 added access/budget controls around LLM tutor usage. The reusable pattern is that spend-control logic must sit in one server-side seam before any model call, not as UI-only counters or post-hoc accounting.

- Reserve the worst-case request cost before calling an LLM, inside an atomic transaction or lock-protected update. If the reservation fails, fail closed before any provider call or streamed response can start.
- Keep caps server-enforced and shared across all tutor surfaces: anonymous/global/IP-ish fallbacks, per-profile daily/monthly limits, and authenticated profile limits must all use the same ledger and reason codes.
- Reconcile after the call with actual usage when available, release unused reservation, expire/reset windows deterministically, and record provider failures separately from budget denials.
- Route gateway/model invocations only through the access seam. Tests should prove direct bypasses are impossible or at least lint-detected, and should cover concurrent reservations, exhausted caps, expired windows, and failure refunds.
- Do not wire real paid-provider calls from a learning/review run. Prove the budget contract with mocks or configured non-metered fixtures unless the user explicitly approves spend.

## Verification menu

- Docs/skills only: read back changed files and run `git diff --check`.
- Implementation: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`.
- Neon/database slice: include branch-scoped integration proof and explicit secret redaction review.
