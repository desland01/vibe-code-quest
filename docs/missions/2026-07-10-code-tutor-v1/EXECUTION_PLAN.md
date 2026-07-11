# Execution Plan — code-tutor v1

## Hard precondition (fail-closed, adversarial F12)

**No execution issue runs while `mission-state.json` `status != "approved"`.** Approval is granted only by the user at the Final Approval Gate; `/mission-continue` must check this field first and stop if it is anything else. The D3 production-deploy grant for billing/email surfaces is re-confirmed at that same gate (adversarial F9).

## Roles

| Role | Who | Duty |
|---|---|---|
| Mission Orchestrator | Claude session (architect tier) | Owns mission-state, dispatches slices, prevents drift, reviews worker handoffs, signs off taxonomy/voice artifacts, makes taste calls. Never delegates architecture or truth-judgment. |
| Worker Agent | Codex `gpt-5.6-sol` via `~/.claude/bin/codex-worker` (default); `--light` (`gpt-5.6-terra`) for mechanical slices | One Context Slice → one issue → structured handoff. Text/code only. |
| Vision work | Gemini MCP | ISSUE-003 comps judging, VAL-014 side-by-sides, screenshot QA. Never GLM; never Codex for images. |
| Scrutiny Validator | Fresh-context agent (Claude Sonnet tier or codex-worker with no worker context) | Per-issue: VAL assertions, tests, typecheck, guardrails. Never shares the worker's context. |
| User Testing Validator | Fresh-context agent + gstack /browse | Live behavior on deployed previews (VAL-010/011/012/013/020/041/050/061). |
| Handoff Validator | Orchestrator checklist | Blocks milestone close if the structured handoff is insufficient. |

## Execution rules

1. **Serial by default.** One issue at a time along the ISSUES.md spine. Parallel allowed ONLY for read-only research, static review, and independent validators.
2. **Worker handoff format (required):** completed / not-done / files touched / commands + exit codes / issues found / next-slice note. Written to `docs/missions/2026-07-10-code-tutor-v1/handoffs/ISSUE-<n>.md`.
3. **Validators are fresh-context.** They receive: issue text, VAL ids + contract excerpts, verification commands. Never the worker transcript.
4. **Every milestone ends with validation** (all VALs claimed by its issues green) + a WORK_LEDGER entry + mission-state update (`context_slices[]` append: issue id, commit SHA, evidence paths).
5. **Escalation ladder** (subscription-backend-routing.md): terra fails validator once → retry with findings appended; twice → sol; sol twice → Claude Sonnet → Opus; stuck/ambiguous/destructive → orchestrator re-scope or HITL STOP. Record first-pass validator rate per backend in WORK_LEDGER.
6. **State-write rules:** write mission-state before each issue starts (current_issue field in `context_slices` tail); atomic tmp+rename; state never advances until evidence paths exist on disk (eng F18).
7. **Resume rule:** fresh session reads HANDOFF.md → mission-state → last handoff file → continues at the first issue whose VALs lack evidence. Reconcile state against `git log` before trusting it.
8. **Guardrails per INTERVIEW §7** + PRD: test-mode Stripe only; no launch posts; no spend >$5; secrets never printed; billing/email prod deploys gated on VAL-043 + gate re-confirmation.

## Milestone map

| Milestone | Issues | Exit validation |
|---|---|---|
| M0 Foundation | 000-003 | VAL-001..003, 014(artifact), preview live |
| M1 Data+auth | 004-006 | VAL-020..022 |
| M2 Seams | 007-010 | VAL-030, 031(build), 034(transport), 035, 036 |
| M3 Map | 011-014 | VAL-010..014 |
| M4 Content | 015-022 | VAL-030(no drafts), 037, 038 × 8 regions |
| M5 Experience | 023-025 | VAL-031..034 complete |
| M6 Monetize+launch-prep | 026-032 | VAL-040..043, 050..052, 060, 061 |

Long-pole warning: M4 dominates wall-clock (8 authored regions with accuracy review). Do not parallelize authoring across regions — voice consistency depends on the serial exemplar chain (adversarial F5).

## LLM cost discipline during execution

Workers run on the ChatGPT-plan subscription (no marginal token cost); Claude tokens spent only on orchestration, reviews, and escalations. In-product API calls during testing use test fixtures/mocks wherever possible; live Gateway calls in validation stay under a $5 total mission testing budget (config caps at $0.50/user/day + $10/day global exist from ISSUE-007 onward; set global to $1/day in non-prod).
