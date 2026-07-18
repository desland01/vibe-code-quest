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

### 8. AI gateway fallback and drill paths must be typed, bounded, and canary-scoped

ISSUE-008 added the AI SDK v6 Gateway transport seam before any live tutor surface consumed it. The durable lesson is to keep provider calls behind one typed server seam and make failure drills impossible to abuse in production.

- Verify the current SDK/provider shape before locking implementation details. In this mission `ai@^6` was pinned after a GA check; a later major version bump is a separate mechanical follow-up, not an in-slice improvisation.
- Keep model/provider strings configurable but routed through one server module. Consumers should not import provider SDKs directly or bypass the access/budget seam.
- Fallbacks must be explicit and finite: one 429 fallback attempt to the cheaper model, no retry storm on 5xx/network outage, and typed `gateway_down` style results for UI handling.
- Drill hooks need signed, expiring, canary-scoped headers and production forced-config rejection. Malformed drill input should be ignored or fail closed without exposing internals.
- Tests for the gateway seam should use injected transports and mocks. Do not require live credentials, network, or paid provider calls for normal slice verification.

### 9. Content maps are manifest-backed products, not loose data files

ISSUE-010 through ISSUE-015 converted the map into a taxonomy-locked manifest and proved the Databases region as the gold standard. Future content workers should preserve the contract instead of hand-editing runtime JSON.

- Generate content through the schema-to-manifest pipeline. Keep IDs locked to `TAXONOMY.md`, assert exactly eight regions and six landmarks per region, and commit the deterministic `public/content-manifest.v1.json` read by runtime loaders.
- Draft gates are phase-aware. Before M4 exit, `--forbid-drafts` should fail loudly with the remaining draft list; after all regions are authored, wire the forbid-drafts gate into the normal build.
- Split client and server concerns. The browser can read committed JSON plus TypeScript types; Zod validation belongs in build/server paths so client bundles do not pay for validator code.
- Each authored region needs primary-source URL verification, a per-claim/source review artifact, voice review against frozen `docs/content/VOICE.md`, and a preview screenshot. A manifest build alone is not content accuracy proof.
- Serial region execution matters. Use the Databases region as the exemplar, then close one region with review, gate, preview, screenshot, and commit before dispatching the next.

### 10. Map UX proof is DOM-canonical, accessible, lazy-enhanced, and measured after deploy

ISSUE-011 through ISSUE-014 built the top map, sub-map routes, accessibility pass, and performance budget without making Pixi the source of truth.

- The semantic DOM layer is canonical. Canvas/Pixi is presentation-only and must dispatch the same reducer actions, stay `aria-hidden`, and preserve keyboard, pointer, reduced-motion, and `?nocanvas=1` fallback behavior.
- URL state is source truth for deep links. Generate static params from the manifest, `notFound()` invalid region/landmark ids, validate optional formats, and prove cold-load plus refresh/back-forward behavior in e2e tests.
- Accessibility fixes need machine and manual evidence: skip link, focus trap/restoration, live-region announcements, 44px targets, 200/400% zoom proxies, reduced-motion scans, axe on representative routes, and a screen-reader walkthrough script.
- Performance budgets should measure initial route JS separately from lazy enhancements. Defer Pixi/canvas until window load plus idle time, keep the DOM map interactive immediately, and record deployed vitals/screenshots at desktop and phone viewports.
- Vision/style judges are advisory when they conflict with locked style tokens. Record the disposition and defer subjective token amendments to an explicit style gate rather than letting a judge rewrite the product language mid-slice.

### 11. Server-owned multi-turn counts beat client-supplied histories

ISSUE-023/024 online onboarding and adaptive lesson chat proved that client message arrays are untrusted model context, not progress authority.

- Persist step/turn counts on the server (profile jsonb or equivalent) and derive caps, calibration completion, and unlocks from that record.
- Treat client-supplied histories as prompts only. Add a forged-history test that proves calibration and turn caps cannot be skipped by replaying or elongating the client array.
- Prefer deterministic cores for skip/unlock/parse fallbacks, with LLM phrasing/parse behind the shared AI and access seams.

### 12. Gateway calls fail fast without keys and stay time-bounded

M5 slices hung ~30s when no `AI_GATEWAY_API_KEY` or transport was present until `generateWithGateway` returned `gateway_down` immediately and real calls gained an explicit timeout.

- Missing transport + missing key must return a typed outage immediately so UX can show fixed questions or offline manifesto without waiting on network stacks.
- Bound live calls with a short hard timeout; on timeout or 5xx, fall through the approved offline/fallback path.
- Live executor/advisor answers stay HITL-key gated; offline fallback + banner is the proof target when keys are absent.

### 13. Secondary product panels cannot steal ARIA landmarks

ISSUE-023's onboarding panel as a second `complementary` landmark broke map a11y strict-mode tests. Switching to `role="dialog" aria-modal="false"` restored green map/a11y coverage while keeping the panel non-blocking.

- Map chrome owns the main complementary surface. Overlays and coaching panels should use dialog/region roles that do not collide with upper-page landmarks.
- When e2e queries `getByRole('alert')` or similar shared roles, scope to the component `testid` so Next.js route announcers do not steal matches.

### 14. Session-cookie bootstrap races need authenticated gates

Onboarding/quiz/lesson POSTs 401 when the anonymous session cookie is still bootstrapping. Gate start actions on `useSession().status === 'authenticated'` (or equivalent ready signal) rather than firing on first paint.

- Quiz/lesson interactions that post under the cookie must wait for the session bootstrap the same way onboarding does.
- Unit and e2e coverage should include cold/bootstrap ordering, not only steady-state happy paths.

### 15. Content regions close only after live source rewrite and forbid-drafts build wiring

ISSUE-016–022 authored all 48 landmarks. Authoring is not done when the manifest builds.

- HTTP-verify every primary source URL after authoring; replace dead links with live replacements and re-scan to zero non-200 before the region is marked complete.
- Keep per-region review artifacts (sources, voice, accuracy). Preview screenshot proof is required alongside the gate.
- At M4 exit, wire `build:manifest -- --forbid-drafts` into the default `build` script so no future draft can ship by accident.

### 16. Advisor/executor AI tiers share one gateway seam with stop-on-gap

ISSUE-025 needed an Opus advisor path the gateway client originally could not express. The correct worker behavior was stop-and-report; the authorized seam change added `tier: 'executor'|'advisor'` defaults while preserving 429→Haiku and drill/production guards.

- Extend the existing typed gateway seam rather than forking a second provider client for special modes.
- Cap escalations per session, persist each decision, and keep offline manifesto fallback when the gateway is down.
- Workers that discover a seam capacity gap should stop and report instead of inventing a parallel transport.

### 17. Shared Neon integration suites must run serially

Running rls + access + upgrade + guide integration suites in one Vitest process against a shared Neon branch produced TRUNCATE cross-talk and spurious failures even though each suite passed alone.

- Default `npm run test` keeps integration suites `TEST_DATABASE_URL`-guarded/offline.
- When intentionally running DB suites, use `--no-file-parallelism` or one suite at a time against the branch.
- Do not treat parallel-suite flakes as product defects until serial re-run fails.

### 18. Canvas teardown must be single-shot and partial-init safe

ISSUE-026 e2e exposed a real Pixi v8 crash: navigating away before idle-deferred canvas mount finished threw `this._cancelResize is not a function` and hit the Next error boundary.

- Own teardown through one guarded `safeDestroy()` that destroys at most once and swallows partial-init errors.
- Prove footer/site navigation during deferred mount shows the destination without client errors.
- Keep DOM map interactive immediately; canvas remains presentation-only.

### 19. Legal and billing artifacts stay draft-honest and HITL-gated

ISSUE-026 legal pages and the Stripe trial path established the launch-adjacent pattern for reputation-sensitive copy and payments.

- Legal drafts render with prominent legal-review banners and clearly bracketed placeholders for entity/jurisdiction/contact/date. Do not remove banners or fill invented legal facts.
- Site-wide legal footer links ship with the drafts; HITL-LEGAL remains a launch blocker even after pages exist and e2e is green.
- Billing/webhooks prefer fixture-replay and unconfigured graceful paths. Live test-card flows stay behind HITL Stripe test keys; never invent live charges from learning review.
- Mission prompts and evidence must not embed placeholder personal emails or raw validator transcripts. Keep verdicts in handoffs; redact PII from slice prompts before commit.
- Migrations that invent helpers must match established app RLS helpers (`current_setting('app.user_id', true)::uuid`, existing owner guards), not parallel invented function names.

## Verification menu

- Docs/skills only: read back changed files and run `git diff --check`.
- Implementation: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`.
- Neon/database slice: include branch-scoped integration proof and explicit secret redaction review.
