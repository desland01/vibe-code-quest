# Issues — code-tutor v1

27 issues, 7 milestones, strictly serial within a milestone (research/validators may parallelize read-only). Every issue: one vertical slice, AFK (agent-executable) or HITL (needs the user), dependencies, REQ/VAL mapping, bound (what it may touch), acceptance. Baseline gate (VAL-001..003) applies to every AFK issue implicitly. No issue starts while mission-state `status != approved`.

Worker prompts must include: this issue's text, the referenced PRD REQ sections, the referenced VALs, and any named input artifacts. Nothing else is assumed.

---

## M0 — Foundation

### ISSUE-000 — Pre-flight clean tree (AFK)
Deps: none. REQ-001(pre-flight). VAL-003.
The tree has untracked `docs/missions/**` (this mission packet, authored by the orchestrator session 2026-07-10). Classify each dirty file's provenance per `~/.claude/rules-on-demand/clean-tree-before-work.md`; stage ONLY mission-packet paths (`docs/missions/2026-07-10-code-tutor-v1/**`); STOP if any file of unknown/foreign provenance appears; record per-file provenance in the commit message + a WORK_LEDGER.md entry. NEVER a blanket `git add -A`.
Accept: clean tree, packet committed, provenance recorded.

### ISSUE-001 — Scaffold normalization + repo truth (AFK)
Deps: 000. REQ-001. VAL-001..003, VAL-030(partial).
Bound: package.json, CLAUDE.md, AGENTS.md, CONTEXT.md (new), WORK_LEDGER.md, src/data/*, src/__tests__/*, app/layout.tsx metadata.
Rename package `vibe-tutor`→`code-tutor`; rewrite CLAUDE.md/AGENTS.md (delete Vite/local-first/no-auth text; keep engineering standards; add mission pointer; keep files synchronized); create CONTEXT.md glossary (region, landmark, canonical content, manifest, access seam, entitlement, trial, snapshot — terms only, no implementation); REPLACE the 2-deep test with invariants (8 regions; landmarks arrays exist; ids unique); drop `stub` from RegionStatus; add Zod schema module `src/content/schema.ts` mirroring the Landmark/Region types.
Accept: gate green; obsolete test gone; schema module parses existing sample data.

### ISSUE-002 — Vercel project + CI + preview deploys (AFK)
Deps: 001. REQ-001, REQ-017(partial). VAL-001, VAL-002, VAL-060(preview only).
Bound: vercel project config, next.config.ts, .gitignore, no app features.
Create Vercel project (name `code-tutor`), wire repo-less deploys or git remote per what exists (creating a GitHub remote is allowed, private); preview deploy on every push; verify env-var write path via REST API with read-back using a dummy var (then delete it); document deploy watch procedure.
Accept: preview URL live with scaffold; env read-back demonstrated.

### ISSUE-003 — Map aesthetic direction + style artifact (AFK, vision via Gemini)
Deps: 001. REQ-002. VAL-014(artifact half).
Bound: designs/** only — NO app code.
Generate 3-5 visual directions (hand-drawn-cartographic, cyberpunk-grid, cozy-pixel, abstract-gradient, +1 free) as rendered comps; judge with Gemini (vision backend) against: distinctive at thumbnail size, readable region labels, screenshot-worthy, buildable without an artist. Pick one; write `designs/map-style.md` (palette tokens, typography, region shape language, reference frames, do/don't) and record the renderer decision: Pixi.js only if the chosen direction is achievable in it; else stylized SVG + framer-motion (design-doc fallback).
Accept: style artifact + renderer decision committed. This gates ALL map issues.

## M1 — Data + auth

### ISSUE-004 — Supabase project, migrations, RLS matrix (AFK)
Deps: 001. REQ-005. VAL-020(partial), VAL-021.
Bound: supabase/** (migrations, config, seed), src/lib/supabase*, integration test files.
Create/confirm Supabase project (free tier); committed migrations for all 7 tables (PRD REQ-005 list) with the full per-op RLS matrix (USING + WITH CHECK), owner-column immutability, uniqueness constraints, telemetry allowlist + size limit; local `supabase start` test stack + seeded users; integration tests proving the matrix incl. forged-owner and service-role boundaries.
Accept: VAL-021 tests green locally; migrations idempotent.

### ISSUE-005 — Anonymous session plumbing (AFK)
Deps: 004. REQ-005. VAL-020.
Bound: auth provider/hooks, middleware, profile bootstrap route.
First visit → anonymous JWT, profile row created server-side (id = auth.uid()); progress read/write helpers; persistence across reload; zero signup UI.
Accept: Playwright VAL-020 green on preview.

### ISSUE-006 — Email OTP upgrade + merge (AFK)
Deps: 005. REQ-006. VAL-022.
Bound: upgrade UI (one modal), OTP routes, merge logic, tests.
Same-browser 6-digit OTP; in-place identity upgrade (stable UUID); collision → sign-in + merge (conflict-free copy, newest-wins); failure/interrupt/replay leave anon data intact; idempotent writes; `account_upgraded` event stub.
Accept: VAL-022 all paths green.

## M2 — Platform seams

### ISSUE-007 — Access seam: entitlements + ledger + caps (AFK)
Deps: 004. REQ-012, REQ-013(entitlement table only). VAL-035.
Bound: src/server/access.ts, usage_ledger + entitlements migrations (already in 004), config module, unit+concurrency tests.
One shared module: `checkAccess(identity, surface)` + `reserveUsage/reconcileUsage` (atomic DB reservation, worst-case tokens, expiry) + caps (per-identity, global, UTC day, versioned pricing table) + anonymous throttles (IP + device cookie, token ceilings) + banner-state enum. NO consumer may call the Gateway except through this seam.
Accept: VAL-035 concurrency + rollover + multi-anon tests green.

### ISSUE-008 — AI Gateway client + fallback chain + drill harness (AFK)
Deps: 007. REQ-011(transport), REQ-017(drill harness). VAL-034(transport half), VAL-061(harness half).
Bound: src/server/ai.ts, transport mocks, signed-test-header middleware, canary account seed.
Gateway client using `provider/model` strings (verify AI SDK v6 GA first — design-doc O3; record result); 429→Haiku, 5xx→manifest-fallback signal; transport-level mock tests; signed owner-only test header (HMAC, env secret) that forces failure modes ONLY for the canary account; production build rejects persistent forced-failure config.
Accept: transport tests green; drill harness proven locally.

### ISSUE-009 — Taxonomy lock for 6 regions (AFK draft + orchestrator sign-off)
Deps: 001. REQ-008. VAL-036.
Bound: docs/content/TAXONOMY.md only.
Produce all 36 landmark names (6 each: AI Types, PM Tools, Git, Security, Design, Languages) + 1-line rationale each, mirroring the design-doc quality of the Databases/Infra taxonomies (which are copied in verbatim). Check: no overlap across regions, vibe-coder-first framing. Orchestrator reviews and records sign-off in the artifact. HITL escape: if any region taxonomy feels genuinely contestable, flag it at the next gate instead of guessing.
Accept: TAXONOMY.md with 48 landmark slots signed off.

### ISSUE-010 — Content pipeline: schema → manifest → routes (AFK)
Deps: 001, 009. REQ-007. VAL-030, VAL-031(build half).
Bound: src/content/schema.ts, scripts/build-manifest.ts, content module layout, route data loading.
Build script emits versioned JSON manifest; build asserts 8×6, unique ids, serializability, sources[] on product claims; routes + runtime fallback consume the manifest; offline build passes; removed-landmark rule implemented.
Accept: VAL-030 green with placeholder content for non-authored landmarks (schema-valid placeholders marked `draft: true`; build fails if any `draft` remains at M4 exit).

## M3 — Map

### ISSUE-011 — DOM interaction layer + top map render (AFK)
Deps: 003, 010. REQ-003. VAL-010, VAL-011(partial), VAL-014(implementation half).
Bound: map components, reducer, styles; renderer per ISSUE-003 decision.
Semantic DOM controls (8 regions) driving one reducer; canvas/SVG presentation subscribed to state; hover, pan/zoom; reduced-motion; WebGL-failure fallback; side-by-side screenshot vs style reference.
Accept: VAL-010 trace + VAL-014 comparison committed.

### ISSUE-012 — Sub-map scenes + URL contract (AFK)
Deps: 011. REQ-004. VAL-012.
Bound: routes /map/**, reducer, sub-scene components.
URL as source of truth; zoom transition; 6 landmarks per region from manifest; deep-link/refresh/back-forward/invalid-id handling.
Accept: VAL-012 Playwright green.

### ISSUE-013 — A11y completion pass (AFK)
Deps: 012. REQ-003. VAL-011.
Bound: map + panel components, tests.
Focus order/restoration/visible focus, aria-live zoom announcements, escape/back, touch targets, SR linearized list, 200/400% zoom, keyboard-only e2e, axe run, manual SR script notes.
Accept: VAL-011 fully green.

### ISSUE-014 — Performance budget pass (AFK)
Deps: 012. REQ-003 (PRD budgets section). VAL-013.
Bound: bundle config, lazy-loading boundaries, asset optimization.
Lazy-load Pixi/Stripe/AI; bundle analysis ≤300KB gz initial; LCP/INP/CLS traces on reference profiles; screenshots at both viewports on preview.
Accept: VAL-013 artifacts committed.

## M4 — Content (each slice: 1 region = 6 landmarks; inputs: TAXONOMY.md + schema + VOICE.md + gold exemplar)

### ISSUE-015 — Databases region (gold standard) + VOICE.md (AFK)
Deps: 010. REQ-008. VAL-030, VAL-037, VAL-038(defines the bar).
Author all 6 Databases landmarks to full schema with sources[]; distill `docs/content/VOICE.md` (tone, person, sentence length, example style, gotcha framing) from the design doc's SQL sample + this region; accuracy review artifact `docs/content/reviews/databases.md`.
Accept: region live on preview; VOICE.md frozen.

### ISSUE-016..022 — Remaining 7 regions (AFK, serial, one issue each)
Deps: 015 (each also deps its predecessor for cumulative build health). REQ-008. VAL-030, VAL-037, VAL-038 per region.
Order: 016 Infra/Hosting, 017 AI Types, 018 Git, 019 Languages, 020 Security, 021 Design Systems, 022 PM Tools.
Each: 6 landmarks per TAXONOMY.md, VOICE.md-conformant, sources[] on product claims, per-region accuracy review artifact, deterministic quiz answers.
Accept per issue: region live; review artifact committed; no `draft: true` remaining in that region.

## M5 — Experience

### ISSUE-023 — Onboarding profile chat (AFK)
Deps: 007, 008, 005. REQ-009. VAL-032.
Server-side state machine (count, skip, unlock-after-Q1); LLM generates question text + parses answers via structured output with retry-once → fixed-question fallback; profile persisted; token limits; injection/malformed tests; `profile_built`/`profile_skipped` events.
Accept: VAL-032 green.

### ISSUE-024 — Adaptive renderer + deterministic quiz (AFK)
Deps: 010, 007, 015. REQ-010. VAL-033.
Overview from canonical fields (no LLM); lesson chat via seam; quiz graded deterministically, optional LLM explanation; format switcher; default from depth_preference; `landmark_open`/`format_switched`/`quiz_completed` events.
Accept: VAL-033 green.

### ISSUE-025 — AI guide chat (AFK)
Deps: 008, 024. REQ-011. VAL-034, VAL-031(runtime half).
Side-panel chat anchored to (landmark, profile); escalation rules (computable, recorded, ≤3/session); Haiku fallback; manifest fallback + offline banner; `guide_chat_message`/`guide_unavailable_shown` events.
Accept: VAL-034 + VAL-031 green.

## M6 — Monetization, share, launch prep

### ISSUE-026 — Legal pages (AFK draft, HITL-LEGAL review before launch)
Deps: 001. REQ-018. VAL-043.
ToS, Privacy Policy, cancellation/refund pages (agent-drafted for a $-priced subscription with 14-day no-card trial, email storage, AI-generated content disclaimer); footer + checkout links; HITL-LEGAL flag in HANDOFF.
Accept: VAL-043 render checks green (content review stays HITL).

### ISSUE-027 — Stripe trial + webhooks + paywall (AFK, test mode ONLY)
Deps: 007, 006, 026. REQ-013. VAL-040, VAL-041, VAL-042.
No-card trial lifecycle per PRD state machine; server-created Checkout from verified JWT; metadata + mapping table; idempotent ordered webhook handlers + reconciliation; paywall UI (canonical content never blocked); config price ($9 placeholder); `trial_started`/`subscribe_clicked`/`paywall_shown` events; fixture replay tests.
Accept: VAL-040..042 green. NEVER touch live keys.

### ISSUE-028 — Share snapshot + OG (AFK)
Deps: 012, 005. REQ-014. VAL-050.
Explicit create → immutable snapshot + unguessable token; `/s/<token>` page + OG image route (server-safe rendering); revoke; cache headers; crawler/unknown-token/unicode/empty tests; `share_card_created` event.
Accept: VAL-050 green incl. OG debugger evidence.

### ISSUE-029 — Analytics instrumentation audit (AFK)
Deps: 023, 024, 025, 027, 028. REQ-015. VAL-051.
All 13 events: construction unit tests (names/props/no-PII) + dispatch browser tests; remove any stray stub-era events.
Accept: VAL-051 green.

### ISSUE-030 — Production deploy + failure drill (AFK for content surfaces; billing/email surfaces require gate re-confirmation of D3 — see EXECUTION_PLAN)
Deps: all of M3-M6 prior. REQ-017. VAL-060, VAL-061, VAL-043(gate).
Production deploy watched to READY; env read-back audit (no live Stripe keys — VAL-042); drill via signed header + canary; clean-session verification.
Accept: VAL-060/061 evidence committed.

### ISSUE-031 — Launch assets, held (AFK)
Deps: 030. REQ-016. VAL-052.
Demo gif, screenshots, Show HN draft, tweet thread → docs/launch/. POST NOTHING.
Accept: files exist; absence-of-posting asserted at final gate.

### ISSUE-032 — HITL closeout gate (HITL)
Deps: 030, 031. REQ-013, REQ-016, REQ-017. VAL-042, VAL-052 (re-checked at gate).
Present to user: HITL-PRICE (recommend $9/mo), HITL-NAME, HITL-LEGAL review, HITL-LIVE (live keys + launch posts), D3 re-confirmation record. Nothing in this issue is agent-executable.
Accept: user decisions recorded in mission-state + WORK_LEDGER.

---

## Dependency order (serial spine)

000 → 001 → {002, 003, 004, 009} → 005 → 006; 004 → 007 → 008; {001,009} → 010 → {011 → 12 → 13, 14} ; 010 → 015 → 016..022 (serial); {005,007,008} → 023; {007,010,015} → 024; {008,024} → 025; 001 → 026; {006,007,026} → 027; {005,012} → 028; {023..028} → 029; → 030 → 031 → 032.

Estimated volume: 27 issues, 7 milestones. Honest note (adversarial F13): M4 is the long pole — 8 content slices with accuracy review each; expect it to dominate wall-clock.
