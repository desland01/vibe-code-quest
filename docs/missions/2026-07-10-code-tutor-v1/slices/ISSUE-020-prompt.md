You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor. Make no commits. No npm install. Build fails on fonts in your sandbox — run build:manifest + typecheck/lint/test only.

# ISSUE-020 — Security region authored (REQ-008; VAL-030, VAL-037, VAL-038)

Bound: src/content/security/*.ts (6 modules), docs/content/reviews/security.md (new), public/content-manifest.v1.json (regenerate).

READ FIRST: docs/content/VOICE.md (FROZEN) and src/content/databases/sql.ts (gold exemplar). Taxonomy ids (LOCKED): secrets-and-environment, authentication-vs-authorization, trust-boundaries, input-validation-and-injection, dependency-supply-chain, least-privilege-blast-radius.

Author all 6 to full schema quality, draft: false, per VOICE.md. This is a HIGH-ACCURACY region — security advice must be correct and current; do not give dangerous half-advice. Frame for builders directing agents: where agent-generated code commonly introduces security holes (hardcoded secrets, missing server-side authz behind hidden UI, unvalidated input, prompt injection at the model boundary, careless dependency installs, over-broad tokens). Every gotcha should include the agent-specific failure mode. Defaults are the minimum safe practice (env vars + secret managers, authz checks server-side on every route, parameterized queries + schema validation, scoped tokens, lockfiles + audits).

Sources: authoritative security docs — owasp.org (OWASP Top 10 / cheat sheets), developer.mozilla.org security pages, cloud/framework docs where a claim names one (nextjs.org, vercel.com/docs, docs.github.com security). sources[] 2-4 per landmark, checked "2026-07-17". Every URL HTTP-verified by orchestrator — prefer stable roots.

docs/content/reviews/security.md: per-landmark claim → source → checked → checker; voice self-check; "## Orchestrator verification" PENDING placeholder.

Then: npm run build:manifest && npm run typecheck && npm run lint && npm run test (invariants green; no drafts in security).

Stop conditions: command fails twice → STOP.

Print EXACTLY this structured handoff: Completed work / Unresolved work / Files touched / Commands run (with exit codes) / Issues surprises discovered / Next Context Slice.
