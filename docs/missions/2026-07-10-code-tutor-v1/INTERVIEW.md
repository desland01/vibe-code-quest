# Interview — code-tutor v1

Method: grill-with-docs. Answers sourced from the approved office-hours design doc (2026-05-03) and the repo where possible; only 4 decisions required the user (D1-D4 below, asked 2026-07-10).

## 1. Outcome — what exists when the Mission is done

A deployed, production Next.js app at `code-tutor.vercel.app` (name TBD at Vercel project creation): an interactive 2D map of the dev landscape with **all 8 regions deep** (Languages, Databases, Infra/Hosting, AI Types, PM Tools, Git, Security, Design — 6 landmarks each, 48 landmarks total), an AI guide that adapts content (overview/lesson/quiz) to a user profile built by a ≤5-question onboarding chat, anonymous-JWT persistence with **opt-in email account upgrade**, **per-user AI cost caps**, **share/export artifact** (shareable personal map card), and **Stripe billing with a 14-day free trial** as the demand test. Launch assets (gif + screenshots + HN/Twitter drafts) produced but NOT posted — held for user approval.

## 2. Status quo

- Scaffold at `/Users/thebeast/code-tutor`: Next.js 16 + Pixi 8 + React 19 + Vitest; typed Region/Landmark schema in `src/data/regions.ts`; 5 source files; fresh git repo, no remote.
- Approved design doc (rev 3, 9/10) covers architecture, data model, content schema, onboarding, analytics, failure modes.
- O1 (map aesthetic validation) previously BLOCKED in design-shotgun; unresolved.
- Project CLAUDE.md/AGENTS.md are stale (describe a dead Vite app, forbid auth/DB/AI) — must be rewritten first; nothing in the current scaffold is load-bearing enough to protect beyond the regions.ts type shape.
- Must not break: nothing external exists yet (no users, no deploy, no remote). Zero legacy constraint.

## 3. Desperate specificity

Primary user: Desmond himself (vibe coder building with AI agents). Secondary: vibe-coder Twitter/HN audience at launch. Exact scenario: a vibe coder who just hit the "prototype works, now what database/hosting do I actually need?" wall opens the map, gets a 5-question onboarding, clicks a region, and gets an explanation shaped to their persona in under a minute. Unacceptable failures: (a) the map looks amateur (the map IS the launch asset), (b) AI guide hallucinating with no fallback (doc specifies static canonical fallback), (c) charging a card without a working product behind it, (d) leaked secrets/keys.

## 4. Mission Volume

Large. Design doc estimated 10-14 weeks human-solo for 2-deep-regions; this mission is bigger (8 deep regions + billing + accounts + cost caps + share). Executed by agents in milestone waves, volume ≈ 6 milestones, ~24 issues. Calendar ambition: as fast as validator-gated serial execution allows; no artificial deadline.

## 5. Context Slices

- One issue = one vertical slice (e.g., "Supabase anonymous auth + RLS live end-to-end"), each fully specified by ISSUES.md + PRD refs, no chat dependency.
- Content authoring sliced per region (6 landmarks per slice, schema-typed).
- Validators get: the issue text, VAL assertions, and verification commands only.

## 6. Validation contract (summary — full contract in VALIDATION_CONTRACT.md)

`npm run typecheck && npm run lint && npm run test && npm run build` green on every slice; RLS policies verified by test; AI failure modes (rate-limit → Haiku, 5xx → static, cost-cap → disabled banner) each exercised; Stripe trial flow tested in test mode; browser QA on the deployed preview at mobile + desktop viewports; a11y floor (keyboard nav, reduced-motion, SR linearization) verified.

## 7. Guardrails

- **Always allowed:** local edits, tests, preview deploys, Supabase schema on the project's own instance, production deploys of the app (per D3).
- **Ask-first:** Stripe LIVE mode keys/products (test mode is fine), any spend >$5, pricing decision (HITL-PRICE below), launch posts, DNS/domain changes.
- **Never:** launch posts without approval, printing secrets, `--no-verify`, force-push, HOM-named artifacts.

## 8. Fresh-session handoff

HANDOFF.md carries: goal, artifact index, REQ/VAL summary, issue order, roster, guardrails, exact next command. No chat dependency.

## User decisions (2026-07-10)

| ID | Question | Answer | Consequence |
|---|---|---|---|
| D1 | Paid tier now or demand-gated? | **Custom: "14-day free trial to test demand"** | Billing IS in scope: Stripe subscription with 14-day free trial. REVERSES design-doc premise 3 (free-first). Price point is an open HITL decision (HITL-PRICE); build with configurable price, recommend $9/mo at gate. |
| D2 | Domain purchase (~$12-20)? | **Use vercel.app subdomain** | Zero spend. O2 closed. Custom domain = post-launch decision. |
| D3 | Deploy/launch autonomy? | **Deploy yes, launch posts held** | Agents deploy to production; HN/Twitter posts drafted, never posted without explicit approval. |
| D4 | The Assignment (5-user validation)? | **Drop it entirely** | O4 closed. No pre-build user validation; all 8 regions deep moots region selection. Launch messaging ships untested (accepted risk, user's call). |

## Contradictions surfaced

1. Project CLAUDE.md forbids auth/DB/AI — superseded by this mission; rewrite is ISSUE-001 material.
2. D1 reverses the design doc's D8 decision (free-first, billing only after demand evidence). User has authority; recorded. The trial IS the demand test now.
3. Design doc title says "NOT a code tutor" while the repo is named `code-tutor`. Resolved: repo/app codename stays `code-tutor` (user-chosen); product positioning/branding remains "map for post-AI builders" (HITL-NAME decides public product name before launch).
