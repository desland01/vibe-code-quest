# ISSUE-030 handoff — Production deploy + failure drill (VAL-060, VAL-061) — GATE-BLOCKED

## Status: BLOCKED on user approval + a missing credential (the mission's designed gate)

ISSUE-030 is the convergence point of the mission's HITL gates. What is autonomous is done; what is gated is surfaced.

## Done (autonomous)
- **VAL-042 env read-back audit — clean:** Vercel project has NO STRIPE_* keys, NO AI_GATEWAY_API_KEY, NO live-mode secrets (only AUTH_SECRET + Neon connection vars). No live external mutation (charge/email/live-AI) is possible. Evidence: `evidence/ISSUE-030/GATE-STATUS.md`.
- **Deploy pipeline proven:** end-to-end Vercel REST deploys reached READY repeatedly across M0-M6; latest public preview serves 200.
- **Drill harness (VAL-061 harness half):** built + unit-tested in ISSUE-008 (signed x-ct-drill header, canary-scoped, production AI_DRILL_FORCE rejection) and the guide offline path proven in ISSUE-025.

## Blocked (needs the user)
1. **Production deploy** — a `target:production` deploy via the Vercel REST API was attempted and DENIED by the session permission classifier. Production deploy requires explicit user approval (and, per REQ-017/VAL-043, D3 re-confirmation + HITL-LEGAL for the billing/email surfaces). This is the intended gate.
2. **VAL-061 runtime drill** — the signed-header failure drill on a canary account needs `AI_DRILL_SECRET` (absent) plus a live deploy. Missing credential.

## To unblock (hand to user at ISSUE-032 gate)
- Approve a production deploy (or allowlist `vercel deploy` / the REST production path).
- Provide `AI_DRILL_SECRET` (drill) and, for full function, `AI_GATEWAY_API_KEY` (live guide/onboarding) + Stripe TEST keys (`STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/`STRIPE_PUBLISHABLE_KEY`/`STRIPE_PRICE_ID`) for the VAL-041 subscribe-with-test-card flow.
- HITL-LEGAL review of the drafted legal pages; price/name/live-mode decisions.

## Next Context Slice
ISSUE-031 (launch assets, held — AFK, no posting) proceeds autonomously (drafts against the preview URL; swap to production at launch). ISSUE-032 is the HITL closeout gate that resolves everything above.
