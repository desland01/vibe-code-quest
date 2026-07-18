# ISSUE-032 — HITL closeout gate (the final STOP; nothing here is agent-executable)

All AFK-executable issues (000–031) are complete. This gate collects the human decisions + credentials required to go live. Nothing below can be done autonomously — each needs you.

## A. Decisions to make
1. **HITL-PRICE** — monthly price. Built with a `$9/mo` placeholder (`STRIPE_PRICE_ID` config). Confirm or change.
2. **HITL-NAME** — product name. Built with placeholder brand "code-tutor". Confirm or change (affects legal pages, launch copy, metadata).
3. **HITL-LEGAL** — review the three agent-drafted legal pages (`/legal/terms`, `/legal/privacy`, `/legal/refund`). Fill the `[COMPANY LEGAL NAME]`, `[JURISDICTION]`, `[CONTACT EMAIL]`, `[LAST UPDATED DATE]` placeholders; confirm content is legally sufficient. Billing/email production surfaces are blocked until this is done (VAL-043).
4. **HITL-LIVE** — Stripe live mode + launch posting. Held. Currently TEST-mode only, nothing posted.
5. **D3 re-confirmation** — approve the production deploy of billing/email surfaces.

## B. Credentials to provide (each was a STOP-for-missing-credential during the run; all features are built + validated against mock/fixture contracts without them)
- `AI_GATEWAY_API_KEY` — live onboarding/guide/quiz-explanation AI (or confirm Vercel AI Gateway OIDC). Without it the guide serves the deterministic offline fallback.
- `AI_DRILL_SECRET` — the VAL-061 signed-header failure drill on a canary account.
- Stripe **TEST** keys — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID` — for live Checkout + the VAL-041 subscribe-with-test-card flow. (Live-mode keys stay HITL-LIVE.)

## C. Actions gated on your approval
- **Production deploy** (ISSUE-030): a `target:production` Vercel deploy was attempted and denied by the session permission layer — needs your approval or an allowlist. The deploy pipeline is proven on preview; env audit shows no live keys (VAL-042 clean).
- **VAL-061 runtime drill**: run once `AI_DRILL_SECRET` is set + deployed.
- **Launch posting**: post the held assets in `docs/launch/` only after the POST-CHECKLIST passes.

## D. What is DONE and verified (mock/fixture/preview contracts)
- M0 scaffold+deploy pipeline; M1 Neon schema+RLS+anonymous JWT sessions+email-OTP upgrade; M2 access seam (ledger/caps)+AI gateway client+drill harness+taxonomy+content pipeline; M3 cozy-pixel map+sub-maps+a11y (axe clean)+perf budget (161KB initial); M4 all 48 landmarks authored+voice-frozen+source-verified; M5 onboarding+adaptive renderer+deterministic quiz+AI guide w/ escalation+offline fallback; M6 legal drafts+Stripe billing (fixture-validated)+share snapshots+OG+13-event analytics+launch assets held.
- Every issue: gate green (typecheck/lint/test/build), fresh-context validated, evidence on disk, committed on main.

## Closeout record (to be filled when the user decides)
- HITL-PRICE: _pending_
- HITL-NAME: _pending_
- HITL-LEGAL: _pending_
- HITL-LIVE: _pending_
- D3 re-confirm: _pending_
- Credentials provided: _pending_
- Production deploy: _pending_
- Nothing posted assertion at gate: CONFIRMED (0 publish paths; docs/launch held).
