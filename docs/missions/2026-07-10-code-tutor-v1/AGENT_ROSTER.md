# Agent Roster — code-tutor v1

> **AMENDMENT 2026-07-10 (operator order):** GLM-5.2 / GLM-4.7 retired from this roster; worker slices route to **Codex gpt-5.6-sol** (codex CLI, ChatGPT-plan subscription auth — never the metered OpenAI API); Gemini unchanged for all visual/multimodal work. Canonical: /Users/thebeast/.claude/model-roster.json.

Doctrine sources read 2026-07-10: `/Users/thebeast/.claude/model-roster.json` (last_verified 2026-07-10) + `/Users/thebeast/.claude/rules-on-demand/subscription-backend-routing.md`. Standing policy: orchestrator on session Claude; workers default to Codex gpt-5.6-sol (subscription); Claude tiers are escalation, not default; vision → Gemini always.

## Backend capability table

| Backend | Pricing basis | Intended role | Available now? | Evidence checked | Fallback |
|---|---|---|---|---|---|
| Claude (session, Fable 5) | Subscription (Max) | Orchestrator: interview, spec, sharding, adversarial synthesis, taste sign-offs, final judgment | yes | Session live by definition | n/a (orchestrator never delegated) |
| Codex (gpt-5.6-sol) | Subscription (ChatGPT plan) — codex CLI, ChatGPT-plan subscription auth, NEVER the metered OpenAI API | Default worker AND independent reviewer: `codex exec -m gpt-5.6-sol` with `OPENAI_API_KEY` unset (the `-m` flag is REQUIRED because `--ignore-user-config` skips `~/.codex/config.toml` where the model is set); also delivered the eng review | yes | `_gstack_codex_auth_probe` OK 2026-07-10; live `codex exec` v0.144.1 completed the ENG_REVIEW (session 019f4e07-108d) | Cursor Composer, then Claude Sonnet |
| Claude Opus 4.8 | Subscription | Independent reviewer (cross-family vs Codex workers); escalation engineer for one hard bounded problem | yes | Delivered ADVERSARIAL_REVIEW via Agent tool 2026-07-10 (agent a0645a51c50b4d311) | Claude Sonnet review + flag reduced independence |
| Claude Sonnet 5 | Subscription | Escalation executor when a Codex slice fails validator twice; slices needing in-session MCP | yes | Session-family availability | Opus |
| Claude Haiku 4.5 | Subscription | Mechanical auxiliary (fixtures, summaries) at low effort | yes | Session-family availability | gpt-5.6-sol |
| Gemini (`gemini` MCP) | Subscription/API | ALL visual/multimodal: ISSUE-003 comps judging, VAL-014 side-by-sides, screenshot QA | yes (tools registered) | MCP server connected this session (mcp__gemini__* registered); **do one test call before ISSUE-003** per required-tools rule | HITL: user judges comps manually |
| GLM-5.2 / GLM-4.7 (Z.ai) — RETIRED 2026-07-10; workers now Codex gpt-5.6-sol | Subscription | — none — | **no** | Live test 2026-07-10: `glm-worker` → HTTP 401 "token expired or incorrect" | n/a (retired from roster same day) |
| Cursor Cloud Composer | Subscription | Worker fallback if Codex unavailable | unknown | Not checked (not needed while Codex is green) | Claude Sonnet |
| Hermes / OpenRouter | Metered API (last resort) | Not used | not checked | Deliberately excluded per routing doctrine | — |
| mission-control-harness | n/a | Deterministic packet gate | yes | `/Users/thebeast/mission-control-harness/package.json` present; `mission:validate` run against this packet (see HANDOFF) | STOP if validator unavailable |

No automatic routing is claimed for any backend without a `yes` + evidence above. Gemini carries a verify-before-first-use note; if its test call fails at execution start, STOP the vision slice and fix/escalate per the required-tools rule (never substitute GLM — vision-tested broken, see routing doctrine).

## Claude tier + effort per role (Layer B)

| Role | Tier + effort | Which branch fired |
|---|---|---|
| Orchestrator (this session + /mission-continue driver) | Fable 5, high | Long-horizon multi-milestone mission = the one place Fable earns its premium (usage boundary) |
| Worker slices | NOT Claude — Codex gpt-5.6-sol | Branch (1): every slice is validator-guarded (VAL contract) → route down and off-vendor |
| Scrutiny validators | Sonnet 5, medium (or fresh codex-worker) | Mechanical assertion-checking against a written contract; low redo-risk |
| Independent reviewer | Opus 4.8, high | Judgment-heavy review; must be non-Codex family for independence |
| Vision judging | Gemini (no Claude tier) | Doctrine: vision → Gemini always |
| Escalation rungs | gpt-5.6-sol→Sonnet(medium)→Opus(high)→Fable only if a slice needs architectural taste after Opus fails | Usage-boundary rule: Fable last, never first, for workers |

## Honesty notes

- GLM retirement was confirmed empirically mid-mission (401), matching the roster's same-day change; the adversarial review consequently ran on Opus. The glm-worker-gate hook still advertises GLM as default — machine skew reported to the user; hook is out of date relative to model-roster.json.
- Codex-as-worker + Codex-as-eng-reviewer overlap: the eng review of THIS PACKET ran before any Codex worker wrote code, so it graded the plan, not its own output. During execution, per-slice scrutiny validation uses Claude-family or fresh contexts; Opus owns independent review.
