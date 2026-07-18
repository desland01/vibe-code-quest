# Security content review

Checked: 2026-07-17  
Checker: codex worker; orchestrator URL verification pending

## Secrets and environment

- Secrets require lifecycle controls, rotation, access restriction, and protection from logs → https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html → 2026-07-17 → codex worker
- Vercel environment variables are configured outside source and scoped by environment → https://vercel.com/docs/environment-variables → 2026-07-17 → codex worker
- GitHub secret scanning detects supported secrets in repository history → https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning → 2026-07-17 → codex worker

Voice conformance: PASS. The example directs an agent without exposing values. Gotchas cover hardcoding, public prefixes, logs, prompts, and rotation.

## Authentication vs authorization

- Authentication and session controls establish and maintain identity → https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html → 2026-07-17 → codex worker
- Authorization should deny by default and validate permissions on every request → https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html → 2026-07-17 → codex worker
- Broken access control includes missing record ownership enforcement → https://owasp.org/Top10/A01_2021-Broken_Access_Control/ → 2026-07-17 → codex worker

Voice conformance: PASS. The landmark separates identity from permission and names hidden-UI and missing-ownership agent failures.

## Trust boundaries

- Threat modeling identifies trust boundaries and security controls → https://owasp.org/www-project-threat-modeling/ → 2026-07-17 → codex worker
- Prompt injection can arrive through direct or external content and influence model behavior → https://genai.owasp.org/llmrisk/llm01-prompt-injection/ → 2026-07-17 → codex worker
- Webhook receivers need authenticity, replay, validation, and authorization controls → https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html → 2026-07-17 → codex worker

Voice conformance: PASS. The model boundary stays concrete: retrieved text remains data, while tool handlers validate and authorize actions.

## Input validation and injection

- Server-side allowlist validation should enforce expected syntax and semantics → https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html → 2026-07-17 → codex worker
- Parameterized queries separate SQL code from untrusted values → https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html → 2026-07-17 → codex worker
- XSS occurs when untrusted content is interpreted as executable browser code → https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS → 2026-07-17 → codex worker

Voice conformance: PASS. The default pairs schemas with safe APIs and rejects prompt instructions as an injection defense.

## Dependency and supply-chain risk

- Component verification covers inventory, provenance, and component analysis → https://owasp.org/www-project-software-component-verification-standard/ → 2026-07-17 → codex worker
- Dependabot alerts identify known vulnerable dependencies in a repository graph → https://docs.github.com/en/code-security/dependabot/dependabot-alerts/about-dependabot-alerts → 2026-07-17 → codex worker
- GitHub recommends restrictive workflow permissions and pinning third-party actions → https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions → 2026-07-17 → codex worker

Voice conformance: PASS. The example challenges unnecessary installs, while gotchas require exact package and workflow review.

## Least privilege and blast radius

- Least privilege, deny-by-default, and per-request permission checks constrain access → https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html → 2026-07-17 → codex worker
- GitHub documents narrowing the built-in workflow token permissions → https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication → 2026-07-17 → codex worker
- GitHub recommends minimizing workflow token permissions and protecting privileged environments → https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions → 2026-07-17 → codex worker

Voice conformance: PASS. The default scopes tokens by service and environment. Agent warnings cover wildcard credentials and destructive tools.

## Region-wide voice self-check

- Direct, second-person, practical language: PASS.
- Short hooks and plain definitions: PASS.
- Three or four concrete use cases per landmark: PASS.
- At least three pros and two cons per landmark: PASS.
- Real scenarios with actionable agent instructions: PASS.
- Every gotcha includes an agent-specific failure mode: PASS.
- Decisive minimum-safe defaults: PASS.
- No banned marketing, “simply/just,” trivia, or agent mysticism: PASS.

## Orchestrator verification

**COMPLETE — 2026-07-18, mission orchestrator (Claude Opus 4.8).** High-accuracy region — all source URLs HTTP-verified: 15/16 200 first pass; 1 dead OWASP link (Webhook_Security_Guidelines, 404) replaced with the live REST_Security_Cheat_Sheet (200) and manifest regenerated. Reviewed trust-boundaries in full + hooks/defaults across all 6: security advice correct and current, no dangerous half-advice — secrets in env/managers never in source/prompts/logs, server-side authz on every route (hidden UI ≠ protection), parameterized queries + schema validation, model output + retrieved text treated as untrusted crossing a trust boundary (prompt injection), scoped tokens + least privilege, lockfiles + audits. Agent-specific failure modes present in gotchas. VOICE-conformant. VAL-030: no drafts remain. APPROVED.
