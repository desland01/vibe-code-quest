# ISSUE-026 handoff — Legal pages (VAL-043) — AGENT DRAFT, HITL-LEGAL pending

## Completed work

- Worker (codex gpt-5.6-sol): three agent-drafted legal pages — `/legal/terms`, `/legal/privacy`, `/legal/refund` — rendered via a shared LegalPage layout from structured copy in `src/content/legal/*.ts`. Each carries a prominent "⚠ Draft — pending legal review; placeholders in [BRACKETS] must be completed before launch" banner and a "not reviewed by a lawyer / not final legal advice" notice. Content is honest and specific to this app's real data flows (Neon, Vercel, Stripe test mode, AI Gateway/model providers; anonymous session cookie + email OTP upgrade; 14-day no-card trial → $9/mo placeholder; AI-generated-content disclaimer). Entity/jurisdiction/contact left as clearly-marked `[BRACKETS]`. SiteFooter with the three links wired into the root layout (site-wide). e2e/legal.spec.ts.
- **Real bug found + fixed during e2e (not test-only):** client-navigating away from the map before the ISSUE-014 idle-deferred Pixi canvas finished mounting threw `this._cancelResize is not a function` (Pixi v8 double-destroy / destroy-on-partial-init), crashing client nav → Next error boundary ("This page couldn't load"). Fixed MapCanvas teardown with a single guarded, try/caught `safeDestroy()` (destroy at most once, swallow partial-init errors). Verified: footer nav during mount now shows the Terms H1 with zero page errors.

## Evidence
- `evidence/ISSUE-026/VAL-043-e2e.txt` (23/23 e2e) · `VAL-001-gate.txt` (green) · `legal-terms.png` (draft banner + bracketed placeholders).

## HITL-LEGAL (recorded)
- The three pages are DRAFTS. Content sufficiency + filling `[COMPANY LEGAL NAME]`, `[JURISDICTION]`, `[CONTACT EMAIL]`, `[LAST UPDATED DATE]` is a user/lawyer task at the ISSUE-032 closeout gate. Per REQ-018/VAL-043, billing/email surfaces must not deploy to production until these pages exist (they now do) AND the HITL-LEGAL review is done. Flag stands in mission-state open_questions (HITL-LEGAL).
- Note: a dev-mode cold-compile flake can make a legal route's first hit exceed the 5s Playwright timeout under parallel load; production build serves them statically. Not a defect.

## Next Context Slice
ISSUE-027 — Stripe trial + webhooks + paywall (TEST MODE ONLY, VAL-040/041/042). Deps: 007 (access), 006 (OTP), 026 (legal). Needs Stripe TEST keys — check credential availability at start (STOP if missing per mission rules); webhook replay tests are fixture-based.
