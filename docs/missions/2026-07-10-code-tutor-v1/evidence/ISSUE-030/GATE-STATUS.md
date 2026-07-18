# ISSUE-030 — production deploy + drill: GATE STATUS (2026-07-19)

## VAL-060 deploy pipeline (proven on preview; PRODUCTION promotion GATED)
- Latest READY preview: https://code-tutor-k76hnh5ar-desmond-landrys-projects.vercel.app (public, serves 200).
- Deploy pipeline proven end-to-end across M0-M6 (Vercel REST deployments API, repeated READY states, screenshots at both viewports).
- PRODUCTION promotion (target:production) was ATTEMPTED via the Vercel REST API and DENIED by the session permission classifier — production deploy requires explicit user approval. This is the expected gate (REQ-017: billing/email production surfaces require D3 re-confirmation).

## VAL-042 env read-back audit (no live keys)
- Vercel project env keys: ['AUTH_SECRET', 'DATABASE_URL', 'DATABASE_URL_UNPOOLED', 'NEON_AUTH_BASE_URL', 'NEON_PROJECT_ID', 'PGDATABASE', 'PGHOST', 'PGHOST_UNPOOLED', 'PGPASSWORD', 'PGUSER', 'POSTGRES_DATABASE', 'POSTGRES_HOST', 'POSTGRES_PASSWORD', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL', 'POSTGRES_URL_NON_POOLING', 'POSTGRES_URL_NO_SSL', 'POSTGRES_USER', 'VITE_NEON_AUTH_URL']
- No STRIPE_* keys, no AI_GATEWAY_API_KEY, no live-mode secrets present. Billing/AI/email surfaces degrade gracefully (503 / offline fallback / console transport) — no live external mutation possible.

## VAL-061 failure drill: BLOCKED on credential
- Drill HARNESS built + unit-tested (ISSUE-008: signed x-ct-drill header, canary-scoped, production AI_DRILL_FORCE rejection; guide offline path proven in ISSUE-025).
- The RUNTIME signed-header drill on a canary account needs AI_DRILL_SECRET (absent) + a live deploy. Blocked on the credential + the production-deploy approval.

## Blocked on (HITL / credentials):
- Production deploy approval (permission-gated).
- AI_DRILL_SECRET (VAL-061 runtime drill).
- HITL-LEGAL review, price/name/live-mode = ISSUE-032 closeout gate.
