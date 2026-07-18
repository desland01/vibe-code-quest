# ISSUE-029 handoff — Analytics instrumentation audit (VAL-051)

## Completed work

- Worker (codex gpt-5.6-sol) + orchestrator spec fix: unified typed analytics layer `src/lib/analytics.ts` with a single source-of-truth `ANALYTICS_EVENTS` (exactly the 13 reconciled events) + per-event props types + runtime allowlist guard + a swappable sink (console.debug stub; `@vercel/analytics` not installed — no dep added, sink is one swap point). Server (`src/server/events.ts`) + client (`clientEvents.ts`) route through it. All emit call-sites (onboarding, renderer/quiz, guide, billing, share, map region_click/landmark_open) unified.
- **Real fixes the worker made:** 6 flows were logging profile UUIDs (PII) → stripped; landmark/format/quiz had duplicate client+server emits → deduped; guide/billing bypassed the typed layer → routed through it; region_click + landmark_open wired.
- Orchestrator fix: analytics e2e ambiguous "SQL" link → `exact: true`.

## Evidence
- `VAL-051-construction.txt` — 15 unit tests (exactly-13 taxonomy, per-event construction + expected props, PII-key denylist scan, unknown-name rejection).
- `VAL-051-e2e.txt` — 26/26 e2e incl. the dispatch test (region_click/landmark_open/format_switched captured from console, asserted no PII keys in props).
- `VAL-001-gate.txt` — gate green.

## Validator disposition (criterion 1)
- Fresh-context validator (codex sol) returned 5-of-5 substantive PASS but flagged criterion 1 as FAIL solely because `email_capture_submitted` still appears in DOCUMENTATION. **Orchestrator disposition: not a defect.** Repo-wide grep confirms `email_capture_submitted` exists ONLY in mission-planning docs, each as the explicit "dropped" note (PRD REQ-015 drop-note; this slice prompt's removal instruction; the adversarial-review disposition recording the drop). It appears in ZERO runtime/test files. The VAL-051 requirement ("13 events in code, no stray event emitted anywhere") is fully met — the doc references are the deliberate record that the event was dropped and must remain. ACCEPTED.

## Next Context Slice
ISSUE-030 — production deploy + failure drill (VAL-060, VAL-061, VAL-043 gate). NOTE: this is the milestone where the HITL flags bite — production billing/email surfaces need D3 re-confirmation + HITL-LEGAL + live-mode decisions; the signed-header drill (VAL-061) needs AI_DRILL_SECRET; live AI/Stripe need their keys. Content-only production deploy is autonomous per D3; billing/email production deploy is gated. Surface the gate.
