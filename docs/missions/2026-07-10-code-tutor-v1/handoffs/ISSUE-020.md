# ISSUE-020 handoff — Security region (VAL-030/037/038)

## Completed work

- Worker (codex gpt-5.6-sol): 6 Security landmarks authored, `draft: false` (secrets-and-environment, authentication-vs-authorization, trust-boundaries, input-validation-and-injection, dependency-supply-chain, least-privilege-blast-radius), VOICE-conformant, agent-specific failure modes in gotchas; `docs/content/reviews/security.md`; manifest regenerated.
- Orchestrator verification (high-accuracy region): 16 sources HTTP-verified — 15/16 200, 1 dead OWASP link (Webhook_Security_Guidelines 404) replaced with live REST_Security_Cheat_Sheet. trust-boundaries read in full + defaults across all 6: correct/current, no dangerous half-advice — deny-by-default server-side authz, scoped short-lived tokens, parameterized queries + schema validation, secrets in managers, model output + retrieved text as untrusted (prompt injection), lockfiles + audits. Recorded in review artifact.
- Region live on preview (`/map/security`) — screenshot `evidence/ISSUE-020/preview-security.png`.

## Evidence
- `docs/content/reviews/security.md` · `evidence/ISSUE-020/VAL-001-gate.txt` · `evidence/ISSUE-020/preview-security.png`.

## Next Context Slice
ISSUE-021 — Design Systems region (ids: design-tokens, component-libraries, layout-and-spacing-rhythm, typography-and-hierarchy, accessibility-floor, consistency-vs-novelty). Last-but-one region.
