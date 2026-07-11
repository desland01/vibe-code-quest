# Validation Contract — code-tutor v1 — v2

Revised 2026-07-10 per ENG_REVIEW (Codex) + ADVERSARIAL_REVIEW (Opus). Every issue names the VAL IDs it must satisfy; DONE requires evidence (command + exit code, test name, screenshot path, or artifact path). Baseline suite on every slice: `npm run typecheck && npm run lint && npm run test && npm run build`.

## Mechanical gates

- **VAL-001 Build green.** All four baseline commands exit 0. Evidence: command output.
- **VAL-002 No secret leakage.** No secrets in git history, source, client bundles, chat. Env vars via Vercel REST API only, verified by read-back. Evidence: grep gate output + read-back diff.
- **VAL-003 Clean tree per slice.** Each issue ends committed on `main`, gate green, no orphans. Evidence: `git status` + commit SHA.

## Map + UI

- **VAL-010 Map renders 8 regions**, hover + click → side panel, pan/zoom ≥50fps on the named reference laptop. Evidence: Chrome performance trace file + browser QA notes.
- **VAL-011 A11y floor.** Keyboard-only Playwright e2e traverses and activates all 8 regions; reduced-motion emulation disables ambient animation; SR linearized list present; canvas/WebGL-failure renders DOM layer alone; 200%/400% zoom usable. Evidence: Playwright test names + axe report + manual SR script notes.
- **VAL-012 Sub-map + URL contract.** Deep link to `/map/<region>/<landmark>?format=quiz` cold-loads correctly; refresh, back/forward, invalid region/landmark ids handled; back-navigation returns to top map. Evidence: Playwright tests.
- **VAL-013 Responsive + budgets.** Deployed preview at 375×812 and 1440×900 (screenshots); initial route JS ≤300KB gz (bundle analysis artifact); p75 LCP/INP/CLS targets from Chrome trace. Evidence: screenshots + bundle report + trace.
- **VAL-014 Aesthetic gate.** `designs/map-style.md` exists with tokens/reference frames BEFORE map implementation; each implemented scene has a side-by-side screenshot vs reference. Renderer decision (Pixi vs SVG) recorded. Evidence: artifact paths + comparison screenshots.

## Data + auth

- **VAL-020 Anonymous session.** First visit issues anonymous JWT; profile + progress persist across reload; no signup UI. Evidence: Playwright test.
- **VAL-021 RLS matrix enforced by test.** Against local Supabase from committed migrations: cross-user SELECT/INSERT/UPDATE/DELETE denied per matrix for profiles/progress; forged-owner insert + upsert + owner-column mutation denied (WITH CHECK); region_clicks INSERT-only, SELECT denied to anon, event-name allowlist + payload size enforced; service-role paths only from server routes. Evidence: integration test names.
- **VAL-022 Email OTP upgrade.** Happy path: anon → progress → OTP verify → same UUID, data intact. Failure paths: wrong/expired/replayed OTP and abandoned flow leave anon session + data fully usable. Collision path: existing email → sign-in + merge (conflict-free copied, conflicts newest-wins). Evidence: integration tests.

## Content + AI

- **VAL-030 Schema + invariants at build.** All 48 landmarks parse against Zod schema; exactly 8 regions × 6 landmarks; unique stable ids; `sources[]` present on named-product claims; build fails otherwise. Evidence: build output.
- **VAL-031 Manifest fallback.** Build emits versioned JSON manifest; full build passes with network disabled; Gateway forced-failure (signed test header, canary account) renders canonical text + offline banner for every landmark. Evidence: build log + test.
- **VAL-032 Onboarding determinism.** Server-side counter: never >5 questions (unit test incl. malformed-output retry paths); skip works at every step; skip-after-Q1 unlocks map; structured-output parse failure falls back to fixed question; prompt-injection test (instructions in answers are treated as data). Evidence: unit + Playwright tests.
- **VAL-033 Adaptive formats.** One landmark renders as overview (~80w from canonical fields), lesson (3-5 turns), quiz (deterministically graded against canonical answer; explanation optional post-grade). Evidence: snapshot + e2e.
- **VAL-034 Model routing.** Gateway `provider/model` strings; 429 → Haiku; 5xx → manifest fallback; both via transport-level mocks; Opus escalation fires only on the computable rule list, ≤3/session, each decision recorded. Evidence: unit + transport-mock tests.
- **VAL-035 Ledger + caps.** Atomic reservation: parallel requests near the limit cannot overspend (concurrency test); executor+fallback+advisor share one ledger; reconciliation after actual usage; UTC midnight rollover test; cap=0 → banner + zero model calls; multi-anonymous-account aggregate throttling (same IP/device) proven; global hard cap enforced. Evidence: integration/concurrency test names.
- **VAL-036 Taxonomy coherence.** All 8 regions have exactly 6 signed-off landmarks; no conceptual overlap across regions; each landmark has a 1-line rationale; sign-off recorded in ISSUE-009 artifact. Evidence: `docs/content/TAXONOMY.md`.
- **VAL-037 Content accuracy per region.** Documented accuracy pass: every named-product claim checked against a current primary source (URL + date + checker recorded). Evidence: `docs/content/reviews/<region>.md`.
- **VAL-038 Voice conformance.** Each region's content reviewed against `docs/content/VOICE.md` + gold-standard exemplar; deviations fixed or justified. Evidence: same review artifact.

## Billing

- **VAL-040 Trial lifecycle (test mode).** No-card trial: verified email required to start; Stripe subscription created with 14-day trial and no payment method; one trial per email + per customer (second attempt rejected); entitlement transitions driven by webhooks with: signature verification, duplicate delivery, reversed order (precedence by event.created), handler retry idempotency, unknown customer, deleted subscription, Checkout-return-before-webhook (reconciliation fetch). Price read from config. Evidence: fixture-replay integration tests.
- **VAL-041 Paywall correctness.** Expired trial → paywall on AI guide; ALL canonical content readable (not just visited); subscribe (test card) restores guide; cancel honors period end. Evidence: Playwright flow.
- **VAL-042 No live charges.** No live-mode keys in any env (read-back audit); live switch documented as HITL-LIVE only. Evidence: env audit output.
- **VAL-043 Legal pages present.** ToS, Privacy Policy, cancellation/refund pages render and are linked from footer + checkout; production deploy of billing/email surfaces blocked until green; HITL-LEGAL flag recorded in HANDOFF. Evidence: routes + Playwright check.

## Share + analytics + launch

- **VAL-050 Share snapshot.** Explicit create → immutable snapshot, unguessable token, approved fields only; `/s/<token>` renders for an unauthenticated crawler UA; unknown/revoked token → 404; OG image validates in an OG debugger; empty-progress + long-value + unicode cases. Evidence: tests + debugger screenshot.
- **VAL-051 Event instrumentation.** All 13 PRD events: construction unit-tested (names, props, no PII) + dispatch browser-tested. Dashboard visibility = manual operational note only. Evidence: test names.
- **VAL-052 Launch assets held.** Gif + screenshots + HN/Twitter drafts exist in `docs/launch/`; nothing posted (absence assertion, checked at gate). Evidence: file paths.

## Deployment

- **VAL-060 Production deploy.** Live on vercel.app subdomain; deployment watched to READY; env verified by read-back; billing/email surfaces only after VAL-043 + gate re-confirmation of D3. Evidence: deploy log + URL.
- **VAL-061 Failure drill on prod.** Rate-limit, offline, cost-cap banners each demonstrated on the deployed app via signed owner-only test header on a canary account; ordinary users unaffected (verified from a clean session); production build rejects persistent forced-failure config. Evidence: screenshots + clean-session check.
