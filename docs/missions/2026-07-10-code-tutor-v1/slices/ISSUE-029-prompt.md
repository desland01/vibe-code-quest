You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor. Make no commits. No npm install. Build fails on fonts in your sandbox — run typecheck/lint/test only; orchestrator runs build + e2e.

# ISSUE-029 — Analytics instrumentation audit (REQ-015; VAL-051)

Bound: src/server/events.ts + src/components/landmark/clientEvents.ts (unify into one typed analytics layer), a new src/lib/analytics.ts if helpful, all existing emit call-sites (onboarding, renderer/quiz, guide, billing, share, map region clicks) to use the unified layer, src/__tests__/analytics.test.ts (new), e2e/analytics.spec.ts (new). Do NOT change business logic — only the analytics plumbing + tests.

Context (zero chat context assumed):
- REQ-015 reconciled event list = EXACTLY these 13 (no more, no fewer):
  profile_built, profile_skipped, region_click, landmark_open, format_switched, quiz_completed, guide_chat_message, guide_unavailable_shown, account_upgraded, trial_started, subscribe_clicked, paywall_shown, share_card_created.
  (email_capture_submitted was DROPPED — must NOT exist.)
- VAL-051: all 13 events — construction unit-tested (correct names, expected props, NO PII in props) + dispatch browser-tested. Vercel Web Analytics is the sink. Remove any stray stub-era events.
- Current state: src/server/events.ts recordEvent(name, props) console.debug stub with an EventName union; src/components/landmark/clientEvents.ts recordClientEvent console.debug stub (subset). Emit call-sites scattered across onboarding/renderer/guide/billing/share. region_click / landmark_open may or may not be wired from the map — WIRE region_click on region selection and landmark_open on opening a landmark if not already.

Tasks:
1. Unify the analytics layer:
   - Server: src/server/events.ts exports recordEvent(name: AnalyticsEvent, props) — AnalyticsEvent is the union of EXACTLY the 13 names above. In production it dispatches to Vercel Web Analytics server-side (import { track } from '@vercel/analytics/server' IF that package is available; if not installed, keep the console.debug stub but structure it so the sink is a single swappable function — DO NOT add a dependency). Include a per-event props TYPE map so each event's expected props are typed (e.g. quiz_completed: { region, landmark, score, correct } — match what PRD/existing call-sites use).
   - Client: clientEvents.ts recordClientEvent dispatches the client-side subset via the same swappable sink (console.debug stub acceptable; @vercel/analytics `track` if present). Keep the client subset typed to the client-emittable events.
   - A single source-of-truth constant ANALYTICS_EVENTS = [the 13] and the union derived from it; a compile-time + runtime guard that no other name is emittable.
2. PII rule: props must NEVER include email, raw user text, tokens, or profile UUID as an identifier meant to identify a person. Progress/region/landmark ids and counts/scores/booleans are fine. Audit every call-site's props and strip anything PII-ish (e.g. guide_chat_message must record role/model/fallback_reason — NOT the message text; account_upgraded must not include the email).
3. Wire any missing map events: region_click (on region select), landmark_open (on landmark detail open). Reuse existing dispatch where present (renderer already emits landmark_open — dedupe so it fires once).
4. Remove stray/stub-era events: ensure NO event name outside the 13 is emitted anywhere (grep the codebase); remove email_capture_submitted if present anywhere.
5. src/__tests__/analytics.test.ts: assert ANALYTICS_EVENTS has exactly the 13 names; for each event, a construction test builds its props and asserts (a) the name is in the allowlist, (b) props contain the expected keys, (c) props contain NO PII keys (email/text/token/profileId/userId as a person identifier) — a deterministic PII-key denylist scan over the built props object; assert emitting an unknown name is a type error / rejected at runtime by the guard.
6. e2e/analytics.spec.ts: drive a couple of real flows (open a region → region_click; open a landmark → landmark_open; switch format → format_switched) and assert the events dispatch — since the sink is console.debug in dev, capture console messages and assert the expected event names appear with no PII in the logged props. Keep all existing e2e green.

Validation: VAL-051 (construction unit tests + dispatch browser test). VAL-001/003 gate. VAL-002 no secrets/PII.

Stop conditions: a call-site's real props can't be made PII-free without changing business logic, or a command fails twice → STOP and report.

Print EXACTLY this structured handoff: Completed work / Unresolved work / Files touched / Commands run (with exit codes) / Issues surprises discovered / Next Context Slice.
