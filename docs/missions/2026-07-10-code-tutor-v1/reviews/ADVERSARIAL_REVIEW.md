# Adversarial Review — code-tutor v1 packet

Reviewer: Claude Opus (fresh-context subagent a0645a51c50b4d311, 2026-07-10), did not write the packet. `independence: genuine`. Routing note: attempted GLM-5.2 first (retired backend, 401) — fell through to Opus per model-roster `reviewer_independent` (Codex is the worker family this mission, so the reviewer must be a different family).

Verdict as delivered: **13 findings, 4 blocking (#1 #2 #3 #4).**

## Findings and dispositions

| # | Finding | Sev | Disposition |
|---|---|---|---|
| 1 | "~24 issues" fabricated — no decomposition exists on disk; slice boundedness unauditable | Critical | **accepted (phase-timing)** — reviews run before issues by design (ADR-0002), but the point stands that scope claims were unbacked. ISSUES.md now materialized (27 issues, each with REQ/VAL mapping + explicit bound); mission_volume updated from the real list; scope re-audited in ISSUES_VALIDATION.md. |
| 2 | 6 region taxonomies invented with no spec and no correctness gate (36/48 landmarks undefined) | Critical | **accepted** — new ISSUE-009 "taxonomy lock": produces all 36 landmark names + 1-line rationale each, requires orchestrator sign-off recorded in the issue, BEFORE any authoring slice; new VAL-036 asserts taxonomy coherence (no overlaps, no orphan concepts, 6 per region) distinct from schema parse. |
| 3 | Paid product + email PII with NO ToS/Privacy/refund policy scoped — legal launch blocker | Critical | **accepted** — new REQ-018 (legal pages: ToS, Privacy Policy, cancellation/refund policy) + VAL-043; production deploy of billing/email surfaces gated on VAL-043; drafted by agent, flagged HITL-LEGAL for user review before launch (agent-drafted legal text is a starting point, not counsel). |
| 4 | No correctness gate on product content (schema-valid hallucinations pass) | Critical | **accepted** — new VAL-037: per-region documented accuracy pass — every named-product claim checked against a current primary source, reviewer + source URLs + dates recorded in the region's review artifact; separate from VAL-030 schema parse. |
| 5 | No shared voice/quality exemplar across 8 authoring slices | High | **accepted** — ISSUE-015 authors the gold-standard region (Databases) first; its output + a distilled VOICE.md become required inputs to every later authoring slice; VAL-038 asserts exemplar-conformance review per region. |
| 6 | Aesthetic decided once, implemented across many slices, no carry mechanism | High | **accepted** — REQ-002 output upgraded to a concrete style artifact (`designs/map-style.md`: tokens, palette, reference frames, do/don't) required input to every map slice; VAL-014 evidence = side-by-side screenshot vs reference per scene. |
| 7 | Entitlement + cost-cap gating cross-cutting, owned by no seam | High | **accepted** — new ISSUE-007 "access seam": one shared server module (entitlement check + cost ledger + cap gate + banner states) that onboarding, guide, renderer, and paywall consume; ordering enforced in EXECUTION_PLAN (seam before consumers). |
| 8 | Event taxonomy still assumes free-stub product (`email_capture_submitted` for stub regions; no upgrade event) | Medium | **accepted** — REQ-015 reconciled: stub-era `email_capture_submitted` dropped; `account_upgraded`, `trial_started`, `subscribe_clicked`, `paywall_shown` added; final list enumerated in PRD. |
| 9 | Public paid surface deployed under an approval granted for a free product | Medium | **accepted** — D3 grant re-confirmation is an explicit item at the Final Approval Gate; guardrail split (content-only prod deploys autonomous; billing/email surfaces need VAL-043 + gate confirmation). Matches eng F20. |
| 10 | VAL-010/014/050/051 unverifiable or evidence-less | Medium | **accepted** — VAL-051 → instrumentation assertion; VAL-010 evidence = Chrome trace + named device profile; VAL-014 evidence = side-by-side screenshots; VAL-050 evidence = opengraph.xyz (or equivalent) render check + crawler-UA curl. |
| 11 | In-place identity conversion has no failure assertion | Medium | **accepted** — VAL-022 extended: interrupted/invalid/expired OTP leaves the anonymous session + progress fully intact (tested). |
| 12 | Nothing mechanical stops execution before approval | Medium | **accepted** — EXECUTION_PLAN precondition: no execution slice runs while mission-state `status != approved`; /mission-continue checks this; HANDOFF carries the STOP line; harness validator enforces fail-closed phase pairs. |
| 13 | Scope expansion not re-budgeted; design-doc guardrails discarded silently | Medium | **accepted** — mission_volume re-estimated from the materialized issue list (27 issues, 7 milestones); MISSION_CONTEXT logs exactly which design-doc guardrails D1/D4 discarded (scope-discipline test, pre-build user validation) as conscious user decisions. |

## Verdict after revision

All 4 blocking findings addressed in packet v2. `reviews.adversarial = pass`.
