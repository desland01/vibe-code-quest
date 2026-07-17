You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor (you are already in it). Implement only this issue; make no commits. Do not run npm install (orchestrator installs; the `ai` package v6 will be installed — write code against ai@^6).

# ISSUE-008 — AI Gateway client + fallback chain + drill harness (REQ-011 transport, REQ-017 drill; VAL-034 transport half, VAL-061 harness half)

Design-doc O3 verification (already done by orchestrator, record stands): AI SDK v6 is GA (6.0.230); v7 exists but the mission pins ai@^6 per packet semantics.

Bound: src/server/ai.ts (new — gateway client), src/server/aiDrill.ts (new — signed test-header logic), src/__tests__/ai.test.ts (new, transport-level mock tests), db seed for canary account inside a test helper (no migration needed), package.json (dep: ai@^6 only), .env.example (names only: AI_GATEWAY_API_KEY, AI_DRILL_SECRET).

Context (zero chat context assumed):
- REQ-011 transport: Gateway client using AI SDK v6 with plain "provider/model" strings through Vercel AI Gateway (no @ai-sdk/anthropic provider package). Executor model 'anthropic/claude-sonnet-4-5', fallback rate-limit model 'anthropic/claude-haiku-4-5', advisor escalation model 'anthropic/claude-opus-4-6' (config constants in one place; models configurable via env names AI_MODEL_EXECUTOR/AI_MODEL_FALLBACK/AI_MODEL_ADVISOR).
- Behavior contract: on 429/rate-limit from the executor → retry ONCE against the fallback (Haiku) model; on 5xx/network → return a typed { kind: 'gateway_down' } signal so callers render manifest fallback + offline banner (NO retry storm; single attempt + single fallback max). All responses typed: { kind: 'ok', text, usage: { inputTokens, outputTokens } } | { kind: 'rate_limited_fallback', text, usage } | { kind: 'gateway_down' }.
- THE ACCESS SEAM RULE: src/server/ai.ts must be imported ONLY by src/server/access-gated callers later; for now nothing imports it. Do NOT wire it into any route. It must accept an injected transport for tests.
- REQ-017 drill harness: signed owner-only test header `x-ct-drill`: value = HMAC-SHA256(drill payload, AI_DRILL_SECRET) over a JSON payload { mode: 'force_429' | 'force_5xx', canaryUserId, exp (unix seconds, <= 15 min ahead) } base64url-encoded as `<payloadB64>.<hmacB64>`. src/server/aiDrill.ts: buildDrillHeader(payload, secret) + parseDrillHeader(headerValue, secret, now) → typed result; ONLY applies when the parsed canaryUserId matches the requesting user id AND exp valid AND signature valid — otherwise ignored (never an error to the caller). generateWithGateway(params) accepts an optional drill directive and forces the corresponding failure path BEFORE any network call.
- Production safety: a module-load check — if NODE_ENV === 'production' and env AI_DRILL_FORCE (a persistent forced-failure config) is set, THROW at import time (production build/boot rejects persistent forced-failure config). AI_DRILL_FORCE is only honored in non-production.
- vitest; mocks at the transport level: inject a fake `generate` function (or fetch) that simulates 200 / 429 / 500 / network-error; NO real network in tests.

Tasks:
1. src/server/ai.ts: config constants + `generateWithGateway({ surface, prompt, system?, maxOutputTokens, drill?, transport? })` implementing the chain above using ai@^6 `generateText` with `model: 'provider/model'` string when no injected transport is provided. Map SDK errors: detect rate limit (status 429 / RateLimitError) vs 5xx/network. Usage numbers taken from the SDK result (fallback 0s if absent).
2. src/server/aiDrill.ts per contract (timing-safe HMAC compare; reject exp > 15 min ahead or past; malformed → ignored result, not throw). Production AI_DRILL_FORCE throw at import.
3. src/__tests__/ai.test.ts (transport mocks): ok path; 429 → fallback model used ONCE with fallback result kind; fallback also 429 → gateway_down (no infinite chain); 5xx → gateway_down without fallback attempt; network error → gateway_down; drill force_429 (valid signature + matching canary user) triggers fallback without any transport call for the executor attempt; drill with wrong user / bad signature / expired → ignored (normal path); AI_DRILL_FORCE in production import → throws (use vi.resetModules + vi.stubEnv in an isolated test); header build/parse round-trip.
4. .env.example: add AI_GATEWAY_API_KEY, AI_DRILL_SECRET, AI_MODEL_* names (names only).

Validation to satisfy:
- VAL-034 (transport half): mock tests prove 429→Haiku retry-once and 5xx→gateway_down signal.
- VAL-061 (harness half): drill header proven locally by unit tests incl. canary-only scoping + production rejection.
- VAL-001/003 gate green (tests must not require network or AI_GATEWAY_API_KEY).
- VAL-002: names only in .env.example; no secrets printed.

Stop conditions: if a command fails twice or ai@^6 APIs don't match expectations, STOP and report; do not improvise around the SDK.

Print EXACTLY this structured handoff as your final message:
- Completed work:
- Unresolved work:
- Files touched:
- Commands run (with exit codes):
- Issues / surprises discovered:
- Next Context Slice:
