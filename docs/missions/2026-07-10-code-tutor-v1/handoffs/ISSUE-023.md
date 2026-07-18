# ISSUE-023 handoff — Onboarding profile chat (VAL-032)

## Completed work

- Worker (codex gpt-5.6-sol) + 3 orchestrator-directed fixes: server-side deterministic state machine (`src/server/onboarding.ts`, hard cap 5, skip at every step, unlock-after-Q1, fixed-question bank + local parsers), `app/api/onboarding` route (401-gated, server-authoritative count, persists onboarding_state jsonb), migration 0005 (profile fields, RLS intact), `OnboardingChat.tsx` (dismissible non-blocking dialog panel), events stub. LLM used only for question phrasing + answer parse via the ai seam with injectable transport; parseAnswer retries once then local-parses; answers treated as untrusted data (prompt-injection can't change control flow); every model attempt goes through the access seam (reserve→call→reconcile), deny → fixed question.
- **Three defects found and fixed during orchestrator e2e/validation:**
  1. Gateway calls hung ~30s with no key → `generateWithGateway` now returns `gateway_down` immediately when no transport + no `AI_GATEWAY_API_KEY`, and bounds real calls in an 8s timeout. Onboarding start returns the fixed question in <1s.
  2. Onboarding panel was a second ARIA `complementary` landmark (broke map/a11y strict-mode tests) → changed to `role="dialog" aria-modal="false"`. Restored all 6 previously-green map/a11y tests.
  3. `OnboardingChat` raced the `SessionProvider` cookie bootstrap → 401 on start, input stuck disabled → start now gated on `useSession().status === 'authenticated'`.
  - Plus 2 added unit tests (validator-driven): skip-on-Q1 unlock, access-denied-advances.

## Evidence
- `evidence/ISSUE-023/VAL-032-e2e.txt` (17/17 e2e incl. onboarding) · `VAL-001-gate.txt` (green, 42 unit tests) · `onboarding-panel.png` · `validator-report.txt`.
- Fresh-context validator (codex sol): all 6 criteria PASS after test additions (criterion-2 "retry-once" concern resolved — contract scopes retry-once to parseAnswer only, which is implemented).

## Flag
- HITL-AI-KEY (mission-state open_questions): live gateway calls are stubbed to `gateway_down` without `AI_GATEWAY_API_KEY`; onboarding works via deterministic fixed questions. Real LLM phrasing/parse needs the key (or Vercel OIDC) — required before ISSUE-030 live drill / production.

## Next Context Slice
ISSUE-024 — adaptive renderer + deterministic quiz (VAL-033): overview from canonical fields (no LLM), lesson chat via seam, quiz graded deterministically + optional LLM explanation, format switcher, default from depth_preference.
