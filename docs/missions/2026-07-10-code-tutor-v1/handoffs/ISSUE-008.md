# ISSUE-008 handoff — AI Gateway client + fallback chain + drill harness

## Completed work

- **Design-doc O3 verified first (orchestrator):** AI SDK v6 is GA (6.0.230 on npm); v7 (7.0.31) is latest. Pinned `ai@^6` — packet REQ-011 semantics are v6; a v7 bump is a mechanical follow-up outside this mission.
- Worker slice (codex gpt-5.6-sol): `src/server/ai.ts` — gateway client via ai@6 `generateText` with plain `provider/model` strings (executor claude-sonnet-4-5, fallback claude-haiku-4-5, advisor claude-opus-4-6; env-overridable), typed results, 429 → exactly one Haiku fallback attempt, 5xx/network → `gateway_down` (no fallback, no retry storm), injected transport for tests, imported by nothing (access-seam rule holds until consumers land).
- `src/server/aiDrill.ts` — `x-ct-drill` signed header (HMAC-SHA256 base64url payload.sig, timing-safe compare, exp ≤15 min both directions, canary-user scoping, malformed → silently ignored); production + AI_DRILL_FORCE → import-time throw (VAL-061 production rejection).
- 14 transport-mock tests, no network/credentials required.

## Evidence

- `evidence/ISSUE-008/VAL-034-061-gate.txt` — gate green (30 passed / 19 env-guarded skips) + GA-check note.
- Fresh-context validator (codex sol, read-only): 5/5 PASS (first attempt aborted by an upstream "model at capacity" error; clean re-run).

## Issues / surprises discovered

- Codex gpt-5.6-sol returned "Selected model is at capacity" mid-run once; a 90s-later retry succeeded. If it recurs persistently, escalate per the roster ladder (terra→sol→Sonnet→Opus).
- No AI_GATEWAY_API_KEY exists yet anywhere — not needed for this slice (mocks only); live gateway calls first occur in M5 surfaces. On Vercel the gateway can use project OIDC; local live testing will need a key at ISSUE-023/025 — flagged for then.

## Unresolved work

- None for this issue.

## Next Context Slice

ISSUE-009 — taxonomy lock for 6 regions (AFK draft + orchestrator sign-off; HITL escape hatch if any region is genuinely contestable).
