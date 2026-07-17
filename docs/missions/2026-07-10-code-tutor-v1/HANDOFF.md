# HANDOFF — code-tutor v1 (fresh-session entry point)

## Mission goal + approval state

Build code-tutor ("A Map for Post-AI Builders") at `/Users/thebeast/code-tutor` to completion: 8-region interactive map (48 landmarks, all deep), adaptive AI guide, anonymous-first auth with email OTP upgrade, cost ledger + caps, no-card 14-day Stripe trial (test mode), share snapshots, analytics, legal pages, production deploy on a vercel.app subdomain, launch assets drafted but HELD.

**Approval state: NOT approved.** `mission-state.json` must show `status: "approved"` (set only by the user at the Final Approval Gate) before any issue executes. If it doesn't, STOP and surface the gate.

## Artifact index (all under `docs/missions/2026-07-10-code-tutor-v1/`)

- `mission-state.json` — phase/status/slices; write-before-execute, atomic tmp+rename.
- `INTERVIEW.md` — D1-D4 user decisions (D1: 14-day no-card trial IS the demand test; D2: vercel.app subdomain, zero spend; D3: prod deploys yes / launch posts HELD; D4: Assignment dropped).
- `MISSION_CONTEXT.md` — sources, constraints, context-gate score, discarded design-doc guardrails.
- `PRD.md` (v2) — REQ-001..018, access-tier table, budgets, lifecycle state machine.
- `VALIDATION_CONTRACT.md` (v2) — VAL-001..061 with evidence formats.
- `ISSUES.md` — 27 issues, 7 milestones, dependency spine, worker-prompt rule.
- `EXECUTION_PLAN.md` — roles, serial rules, escalation ladder, resume rule, fail-closed precondition.
- `AGENT_ROSTER.md` — backend table with live evidence (GLM dead 401; Codex green; Gemini verify-first).
- `reviews/` — ENG_REVIEW (Codex, 21 findings), ADVERSARIAL_REVIEW (Opus, 13), ISSUES_VALIDATION (mechanical PASS). All dispositions logged; both reviews pass post-revision.
- Upstream design doc: `/Users/thebeast/.gstack/projects/code-tutor/thebeast-greenfield-design-20260503-023821.md`.

## Requirements summary

REQ-001 scaffold normalization · 002 aesthetic gate + style artifact · 003 DOM-canonical top map + a11y · 004 sub-maps + URL contract · 005 Supabase schema + full RLS matrix · 006 email OTP upgrade + merge · 007 schema→manifest content pipeline · 008 48 landmarks (taxonomy-locked, accuracy-gated, voice-conformant) · 009 deterministic onboarding · 010 adaptive renderer + deterministic quiz · 011 guide chat + fallback chain · 012 access seam (entitlement+ledger+caps) · 013 no-card trial + idempotent webhooks · 014 share snapshots · 015 analytics (13 events) · 016 launch assets held · 017 production deploy + drill · 018 legal pages.

## Validation contract summary

Baseline `npm run typecheck && lint && test && build` every slice. Key gates: RLS matrix by integration test (VAL-021), OTP failure paths (VAL-022), manifest offline build (VAL-031), ledger concurrency (VAL-035), taxonomy sign-off (VAL-036), per-region accuracy review (VAL-037), voice conformance (VAL-038), webhook replay suite (VAL-040), no live keys (VAL-042), legal pages before billing deploys (VAL-043), share tokens (VAL-050), signed-header drill on canary only (VAL-061).

## Issue order

Serial spine: 000 → 001 → {002,003,004,009} → 005 → 006; 004 → 007 → 008; {001,009} → 010 → 011 → 012 → {013,14}; 010 → 015 (gold region + VOICE.md) → 016..022 serial; then 023 → 024 → 025; 026; 027; 028; 029 → 030 → 031 → 032 (HITL closeout). Full text in ISSUES.md — workers get issue text + REQ + VAL + named artifacts, nothing else.

## Roster + execution rules

Codex `gpt-5.6-sol` default worker / `terra` light (via `~/.claude/bin/codex-worker`); Gemini for ALL vision (test-call before first use); Claude Sonnet/Opus escalation only; orchestrator stays on the session model. Serial execution; fresh-context validators; structured handoffs to `handoffs/ISSUE-<n>.md`; escalation ladder terra→sol→Sonnet→Opus; GLM is DEAD (401) — do not dispatch to it regardless of what the glm-worker-gate hook says.

## Exact next step

1. User reviews this packet and answers the Final Approval Gate (presented in-session 2026-07-10; if lost, re-derive from PRD "Open HITL Decisions" + reviews).
2. On approval: set `mission-state.json` `status: "approved"`, `phase: "handoff"` → then run **`/mission-continue /Users/thebeast/code-tutor/docs/missions/2026-07-10-code-tutor-v1`** in a fresh session.
3. First executed issue: ISSUE-000 (pre-flight clean tree — provenance rules inside).

## What NOT to do

- No execution while status ≠ approved. No live Stripe keys ever (HITL-LIVE). No launch posts (HITL). No spend >$5. No GLM dispatch. No blanket `git add -A` in ISSUE-000. No authoring before TAXONOMY.md sign-off (ISSUE-009) and VOICE.md freeze (ISSUE-015). No map implementation before `designs/map-style.md` exists (ISSUE-003).

## Known blockers / open questions

- HITL-PRICE ($9/mo recommended), HITL-NAME, HITL-LEGAL (review drafted legal pages), HITL-LIVE (live keys + posts) — all decided at gates, none block early milestones.
- Gemini MCP needs a verification call before ISSUE-003.
- AI SDK v6 GA status check is the first act of ISSUE-008 (design-doc O3).
- Supabase/Vercel/Stripe accounts assumed present (user has Vercel; Supabase free tier; Stripe test mode) — if any credential is missing at execution, STOP per required-tools rule.

STOP: Planning packet complete. Do not execute implementation until the user approves this Mission packet and starts a fresh execution session with HANDOFF.md.

---

## Session handoff addendum — 2026-07-16 (mid-ISSUE-004)

**Done:** M0 complete (ISSUE-000 9d3e4ee, 001 b30aceb, 002 3904d82, 003 1a5b03d). Site public at https://code-tutor-pwio9q8xd-desmond-landrys-projects.vercel.app (SSO protection disabled per user approval). Style artifact designs/map-style.md (cozy-pixel, Pixi.js) gates map work. Gemini vision live via GEMINI_API_KEY in ~/.zshenv (rotate post-mission — value transited chat).

**AMENDMENT A1 (binding):** Neon replaces Supabase everywhere — see AMENDMENTS.md. Neon project rapid-haze-29688965 (org org-soft-forest-80534150, Vercel-managed) provisioned via `vercel integration add neon`, connected to the Vercel project; connection env in .env.local (gitignored) incl. DATABASE_URL + NEON_AUTH_BASE_URL (Neon Auth available for ISSUE-005/006). DB verified live (Postgres 17). Test stacks use Neon branches, not Docker.

**In flight:** ISSUE-004 re-scoped to Neon (schema + per-op RLS matrix + integration tests on a Neon test branch); pre-slice state written; worker NOT yet dispatched.

**Worker dispatch note:** the codex-worker dispatcher runs codex in a read-only sandbox; implementation slices need codex exec with `--sandbox workspace-write` (model gpt-5.6-sol, ChatGPT-plan auth, --ignore-user-config) from the repo root. Validators run read-only; their command-run EPERMs are expected — the orchestrator reruns the gate itself for evidence.

**Standing HITLs unchanged:** taxonomy escape hatch (ISSUE-009), price/name/legal/live-mode (ISSUE-032), Stripe TEST MODE only, nothing posted, spend ≤$5, GLM dead — never dispatch.

## Kickoff (paste into a fresh session)

```text
Continue executing the approved code-tutor v1 mission AFK through all remaining phases. Read /Users/thebeast/code-tutor/docs/missions/2026-07-10-code-tutor-v1/HANDOFF.md first (this file — entry point incl. the 2026-07-16 addendum and Amendment A1: Neon replaces Supabase), then mission-state.json, AMENDMENTS.md, ISSUES.md, and handoffs/ (last completed: ISSUE-003).
First action: resume ISSUE-004 (Neon schema + per-op RLS matrix + integration tests on a Neon branch) — provisioning is already done (.env.local has DATABASE_URL; DB verified); dispatch the implementation slice to codex gpt-5.6-sol with a workspace-write sandbox, validate fresh-context, commit on main with the gate green (typecheck, lint, test, build).
Then proceed strictly serially per ISSUES.md through M1-M6, one issue per slice, evidence + handoffs/ISSUE-<n>.md + mission-state update + commit per issue, packet re-validation (pnpm --dir /Users/thebeast/mission-control-harness mission:validate --mission <mission dir>) after each.
Treat this message as go for all AFK issues. STOP only for: taxonomy dispute (ISSUE-009 escape hatch), any missing credential, spend >$5, legal-page review, and the ISSUE-032 closeout gate (price/name/legal/live-mode). Stripe TEST MODE only; never post launch assets; GLM is dead — never dispatch to it; Gemini is the only vision backend.
```
