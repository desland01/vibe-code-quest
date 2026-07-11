# PRD — code-tutor v1 ("A Map for Post-AI Builders") — v2

Source spec: office-hours design doc 2026-05-03 (approved rev 3), amended by user decisions D1-D4 (INTERVIEW.md) and revised per reviews/ENG_REVIEW.md (Codex, 21 findings) + reviews/ADVERSARIAL_REVIEW.md (Opus, 13 findings) on 2026-07-10. v1 of this PRD is in git history; findings dispositions reference the review files.

## Problem Statement

Vibe coders ship prototypes with AI agents but are blind to the terrain underneath — which database, what hosting, what LLM costs, what a design system is. Existing resources teach the wrong layer (syntax) or move too slow. This product is NOT a code tutor (no syntax); it is a navigation course: an interactive map with an AI guide that personalizes the tour.

## Solution

A clickable, animated 2D map of 8 dev-landscape regions, each zooming into a 6-landmark sub-map (48 landmarks). A ≤5-question onboarding chat builds a user profile; the same canonical content renders as overview / chat-lesson / quiz per profile. Anonymous-first persistence (Supabase JWT + RLS) with opt-in email upgrade. AI guide via AI Gateway with fallback chain and metered cost ledger. **Access model (decided post-review, resolves eng F1/F2):**

| Tier | Identity | Gets |
|---|---|---|
| Anonymous | Supabase anonymous JWT | Full map + all canonical content (overview + deterministic quiz) + a small metered AI-guide allowance (default 10 guide messages/day) behind IP+device throttles |
| Trial (14 days) | **Verified email required** (no card) | Full AI guide (lessons, chat, adaptive rendering) under per-user cost cap |
| Subscriber | Verified email + Stripe subscription (card at subscribe, never at trial start) | Same as trial, ongoing |
| Expired trial | Verified email | Back to anonymous-tier access; all previously visited canonical content stays readable (no data hostage) |

The trial IS the demand test (user decision D1). Canonical content is never paywalled; the AI guide is the paid surface.

## Requirements

### Foundation
- **REQ-001 Repo baseline + scaffold normalization.** Rename package to `code-tutor`; rewrite stale `CLAUDE.md`/`AGENTS.md`; add `CONTEXT.md` glossary; replace the obsolete 2-deep-regions test with 8-regions × 6-landmarks invariants; drop `stub` status from the Region type; introduce runtime Zod schema. → VAL-001..003, VAL-030
- **REQ-002 Aesthetic validation (design-doc O1).** Produce 3-5 visual directions, pick one, record a concrete style artifact `designs/map-style.md` (palette tokens, reference frames, typography, do/don't) — required input to every map slice. Renderer decision (Pixi vs stylized SVG + framer-motion) recorded BEFORE map implementation. Visual judging routes to Gemini (vision backend). → VAL-014

### Map
- **REQ-003 Top map, DOM-canonical.** The interaction layer is semantic DOM (focusable/activatable region controls driving one reducer); Pixi/SVG canvas is presentation only, subscribed to the same state. 8 regions, pan/zoom, hover. A11y: focus order + visible focus + restoration, zoom announcements (aria-live), escape/back behavior, ≥44px touch targets, reduced-motion kills ambient animation, SR linearized region list, canvas/WebGL-failure fallback to the DOM layer alone. → VAL-010, VAL-011, VAL-013
- **REQ-004 Sub-maps + URL contract.** URL is the navigation source of truth: `/map`, `/map/<region>`, `/map/<region>/<landmark>?format=overview|lesson|quiz`. Reducer state is a projection; deep links, refresh, back/forward, invalid ids all defined. Per-region zoom scene with 6 landmarks. → VAL-012

### Data + auth
- **REQ-005 Supabase schema + full RLS matrix.** Tables `profiles`, `progress`, `region_clicks`, plus `entitlements`, `usage_ledger`, `processed_webhook_events`, `share_snapshots`. RLS defined per table × operation (SELECT/INSERT/UPDATE/DELETE) with `USING` **and** `WITH CHECK` bound to `auth.uid()`; owner columns immutable; `(profile_id, region, landmark)` unique on progress; telemetry INSERT-only with event-name allowlist + payload size limit; service-role access confined to server routes. Committed migrations; local `supabase start` stack for tests. → VAL-020, VAL-021
- **REQ-006 Email account upgrade.** Opt-in, same-browser **6-digit email OTP** (not magic link — guarantees the anonymous session is present at conversion). Success: identity upgraded in place, UUID stable, profile/progress untouched. Existing-email collision: prompt sign-in; anonymous progress merges (conflict-free rows copied; conflicts newest-wins). Failure/interrupt/replay: anonymous session + data fully intact. Idempotent writes, uniqueness constraints. Verified email is the identity for trials and per-user caps. → VAL-022

### Content + AI
- **REQ-007 One canonical content pipeline.** Zod schema (hook, definition, when_to_use, tradeoffs, example, gotchas, vibe_coder_default, quiz w/ canonical answer, `sources[]` {url, checked}) + TS content modules in `src/content/<region>/<landmark>.ts` → build script emits a **versioned JSON manifest** (`public/content-manifest.v<N>.json`) → routes, runtime, AND Gateway-down fallback all consume the manifest. Build asserts: exactly 8 regions × 6 landmarks, unique stable ids, serializable, fresh manifest; full build passes with network disabled. Removed-landmark rule: progress rows retained and rendered from the last manifest containing them. → VAL-030, VAL-031
- **REQ-008 48 landmarks authored, taxonomy-locked, accuracy-gated.** Taxonomy for the 6 non-doc regions is produced and signed off (ISSUE-009) BEFORE authoring. Databases authored first as the gold-standard region; its output + distilled `docs/content/VOICE.md` are required inputs to every later region slice. Every named-product claim carries a source URL + check date; per-region accuracy review documented. → VAL-030, VAL-036, VAL-037, VAL-038
- **REQ-009 Onboarding profile chat, deterministic core.** A server-side state machine owns question count (hard cap 5) and skip; the LLM only generates the next question text + parses answers via schema-validated structured output (retry-once, then fall back to a fixed question). Skip everywhere; map unlocked after Q1 even on skip. Input/output token limits + timeouts; prompt-injection and malformed-output tests. → VAL-032
- **REQ-010 Adaptive renderer.** overview (~80w, rendered from canonical fields, no LLM needed) / lesson (3-5 turn chat, LLM, calibration question first) / quiz (**deterministically graded** from canonical answers; LLM optionally explains after grading). Default format from depth_preference; manual switcher. → VAL-033
- **REQ-011 AI guide chat.** Anchored to (landmark, profile). Executor Sonnet via AI Gateway `provider/model` strings; advisor Opus escalation on explicit computable rules (user asks a cross-region path question OR executor returns its low-confidence marker), ≤3/session, decision recorded; rate-limit → Haiku; 5xx → manifest fallback + offline banner. → VAL-034
- **REQ-012 Cost ledger + caps (access seam).** ONE shared server module (`src/server/access.ts`) consumed by onboarding, guide, renderer, paywall: entitlement check + atomic usage reservation (worst-case tokens reserved in DB transaction before each attempt, reconciled after; executor/fallback/advisor share the ledger) + caps (per-identity daily, global daily, UTC boundary; pricing table versioned in config; reservation expiry) + banner states. Anonymous abuse controls: IP + device-cookie throttles, request token ceilings, global hard cap. Cap-hit → guide disabled banner, canonical content unaffected. → VAL-035

### Billing (user decision D1)
- **REQ-013 No-card 14-day trial + subscription.** Lifecycle: verified email → `trial_started` (server creates Stripe customer, subscription with `trial_period_days=14`, `payment_behavior` requiring no card) → trial ends → paywall (no charge possible — no card on file) → explicit subscribe → Checkout (card) → active. One trial per verified email AND per Stripe customer. Entitlement state machine in `entitlements` table: `{stripe_customer_id, stripe_subscription_id, status, trial_end, current_period_end, cancel_at_period_end, last_event_id, last_event_created}`; unique processed-event ids; idempotent transactional webhook handlers; out-of-order precedence by `event.created`; post-Checkout server-side reconciliation fetch; daily scheduled reconciliation; brief "pending" state rather than false denial. Checkout sessions created server-side from the verified JWT only; supabase user id in Stripe metadata + a unique server-owned mapping. Price config-driven (HITL-PRICE; test-mode placeholder $9/mo). Test mode only; live keys HITL. → VAL-040..042

### Share + analytics + legal + launch
- **REQ-014 Share artifact = immutable snapshot.** User explicitly creates a share card → server stores an immutable snapshot (only user-approved fields: region/landmark counts, no email/id) keyed by an unguessable token; `/s/<token>` renders page + OG image (server-safe fonts, no Pixi); revoke supported; defined cache headers. → VAL-050
- **REQ-015 Analytics (reconciled event list).** Vercel Web Analytics. Events: `profile_built`, `profile_skipped`, `region_click`, `landmark_open`, `format_switched`, `quiz_completed`, `guide_chat_message`, `guide_unavailable_shown`, `account_upgraded`, `trial_started`, `subscribe_clicked`, `paywall_shown`, `share_card_created`. (`email_capture_submitted` dropped — no stub regions exist.) Assertion = instrumentation tests, not dashboard visibility. → VAL-051
- **REQ-018 Legal pages.** ToS, Privacy Policy, cancellation/refund policy pages, linked from footer + checkout. Agent-drafted, flagged HITL-LEGAL for user review before launch; billing/email surfaces cannot deploy to production without these pages existing. → VAL-043
- **REQ-016 Launch assets, held.** Demo gif, screenshots, Show HN draft, tweet thread in `docs/launch/`; nothing posted (D3). → VAL-052
- **REQ-017 Production deploy.** vercel.app subdomain; env via Vercel REST API with read-back; deploy watched to READY. Content-only milestones: autonomous per D3. Billing/email surfaces: requires VAL-043 green + D3 re-confirmation at the approval gate. Failure drill via signed owner-only header + canary account (never env toggles affecting real users). → VAL-060, VAL-061

## Performance & cost budgets (eng F14)

- p75 LCP ≤ 2.5s, INP < 200ms, CLS < 0.1 (reference: mid-tier Android + M-series laptop, Chrome trace evidence).
- Initial route JS ≤ 300KB gzip; Pixi, Stripe.js, AI chat lazy-loaded behind interaction; map assets ≤ 2MB, textures ≤ 2048px.
- Map interaction ≥ 50fps during pan/zoom on the reference laptop (Chrome performance trace, named device).
- LLM: per-session guide budget 50K tokens; defaults per-user $0.50/day, global $10/day (config; HITL to raise).

## User Stories

1. First-time visitor: map + ≤5-question onboarding (skippable), personalized, no signup.
2. Stuck vibe coder: click Databases → sub-map → SQL → 80-word overview shaped to persona; switch to lesson or quiz.
3. Returning user: progress persists (anonymous JWT); optional email OTP upgrade keeps it across devices.
4. Day-15 trial user: paywall for AI guide; every canonical page still readable; subscribing (test mode) restores guide instantly.
5. Proud user: generates a share card; link unfurls a proper OG preview; can revoke it.
6. Owner: watches region-click distribution + trial/subscribe events; AI spend mathematically cannot exceed caps.

## Implementation Decisions

- Stack: Next.js 16 App Router, React 19, Tailwind + shadcn/ui, Pixi.js 8 or stylized SVG (per REQ-002 gate), AI SDK v6 (verify GA at execution start) via Vercel AI Gateway, Supabase (auth + Postgres + RLS, committed migrations), Stripe (no-card trial + subscription), Vercel hosting + Web Analytics.
- In-product model routing: Sonnet executor / Opus advisor / Haiku fallback per design doc.
- DOM-canonical interaction; canvas is presentation.
- URL is navigation source of truth.
- Content is schema-typed data compiled to a versioned manifest.
- Serial milestone execution, fresh-context validators, mission-state `status=approved` precondition.

## Testing Decisions

- Vitest: schema, onboarding state machine, escalation rules, entitlement transitions, ledger/caps math, event construction.
- Playwright (explicit dependency + gate): keyboard-only map traversal, onboarding flow, paywall flow, share page, deep links.
- Local Supabase from committed migrations + seeded users: RLS matrix (VAL-021), OTP upgrade incl. failure paths (VAL-022).
- Stripe: signature verification + fixture replay through the real handler; dup/reversed/retry/unknown-customer/checkout-race cases.
- Gateway mocked at HTTP transport: 429, 5xx, timeout, malformed stream, partial stream; forced-failure only via signed test header + canary account.
- Concurrency: parallel requests near cap limit; midnight rollover.
- Browser QA on deployed previews at 375×812 + 1440×900 with screenshots; bundle analysis + Chrome traces for budgets.

## Out of Scope

- Approach C (IDE extension) — v3 reserve.
- Custom domain purchase (D2).
- Posting launch content (D3) — drafts only.
- The Assignment / pre-build user validation (D4 — dropped by user).
- Live Stripe charges — test mode; going live is HITL-LIVE.
- Additional analytics tools; per-user cap self-serve UI.

## Open HITL Decisions

- **HITL-PRICE:** subscription price (recommend $9/mo; placeholder in test mode).
- **HITL-NAME:** public product name/branding (codename `code-tutor`; positioning "A Map for Post-AI Builders").
- **HITL-LEGAL:** review agent-drafted ToS/Privacy/refund pages before launch.
- **HITL-LIVE:** Stripe live mode + approve launch posts.

## Further Notes

- Design-doc guardrails consciously discarded by user decisions: the 2+6 scope-discipline test (D1/user directive) and pre-build user validation (D4). Compensating controls: taxonomy lock (VAL-036), accuracy gate (VAL-037), voice exemplar (VAL-038).
- Map aesthetic remains the largest product risk; it is the first non-foundation slice and hard-gates map implementation.
