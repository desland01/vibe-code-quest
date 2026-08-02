# AGENT ROSTER — Vibe Code Quest Arcade Rebuild

Mission: `2026-08-02-vibe-code-quest-arcade`
Routing doctrine: `~/.claude/rules-on-demand/subscription-backend-routing.md` + `~/.claude/rules-on-demand/worker-default.md`. Model versions are resolved from `/Users/thebeast/.claude/model-roster.json` at execution time — this file names roles, not versions to trust blindly.

**Safety floor:** no agent runs at `--effort max`. High is the ceiling, enforced mechanically by `codex-worker`.

---

## Backend capability table

Availability verified 2026-08-02 during Phase 0 of this mission. Evidence is what was actually run, not what was assumed.

| Backend | Pricing basis | Intended role | Available now? | Evidence checked | Fallback |
|---|---|---|---|---|---|
| Claude (session) | Subscription | Orchestrator only: grill, sharding, routing, judgment, diff review, integration. Writes as little prose as possible. | yes | This session | none — orchestrator is not delegable |
| Claude Fable | Subscription | **Architect slice only.** Creative bible, scope boundary, one-way design calls. Owner-directed for this mission. | yes | `Agent` dispatch succeeded after `[architect]` tag; `glm-worker-gate.sh` enforces the tag | Orchestrator absorbs the call and consults sol |
| Codex GPT-5.6-sol, effort high | Subscription (ChatGPT) | Adversarial review, engineering review, **all user-facing copywriting** (PRD narrative, 144 runs of game copy, handoff prose), orchestrator's right hand on hard calls | yes | `codex --version` → `codex-cli 0.144.1`; `~/.codex/auth.json` → `auth_mode: chatgpt` | GLM-5.2 for drafts, orchestrator reviews harder |
| GLM-5.2 (Z.ai Coding Plan) | Subscription | Standard worker: substantive validator-guarded implementation, bounded sub-agent decisions | yes | `ZAI_API_KEY` present; two slices dispatched and returned this session (repo map, UGC research) | GPT-5.6-sol, then orchestrator |
| GLM-4.7 (Z.ai Coding Plan) | Subscription | Mechanical worker: fixtures, ports against a matrix, formatting, link checks, high-volume low-judgment slices | yes | Same key path as GLM-5.2; `--mechanical` flag routes to it | GLM-5.2 |
| Gemini (`gemini` MCP) | Subscription/API | **All visual and multimodal work** — screenshots, rendered-stage review, sprite-sheet inspection. Never route vision to GLM. | yes | `claude mcp list` → `gemini: ... ✔ Connected` | Orchestrator inspects directly with Read on images |
| Research MCPs (Perplexity, Bright Data, Firecrawl, DataForSEO, Ahrefs, Semrush) | Metered / subscription | Live research only. Read-only research is exempt from the spend gate by standing owner rule. | yes | `~/.claude/worker-mcp.json` lists `perplexity`, `bright-data`, `firecrawl-mcp`, `dfs-mcp`, `ahrefs`, `semrush`; 10 live calls made and logged this session | **STOP and tell the owner** — never fall back to free WebSearch |
| Cursor Cloud Composer | Subscription | Worker fallback | not checked | Not needed; GLM tiers available | n/a |
| Hermes / OpenRouter | Metered API (last resort) | Cheap auxiliary only when nothing above fits | not checked | Not needed this mission | n/a |
| mission-control-harness | n/a | Deterministic packet gate | yes | `/Users/thebeast/mission-control-harness` present; invoked via `pnpm --dir ... mission:validate` | none — a failing gate blocks |

**No automatic routing is claimed beyond the rows marked `yes` with evidence.** If a backend is unavailable at execution time, `HANDOFF.md` carries the procedural fallback.

---

## Slice routing plan

The orchestrator decides the sharding. Workers implement inside a bounded slice with a named VAL guarding the result. Judgment — architecture, product tradeoffs, one-way doors — never leaves the orchestrator.

| Slice class | Route to | Effort | Why this tier |
|---|---|---|---|
| Creative bible: cast, board evolution, level naming, sound direction, voice guide, scope boundary | **Fable `[architect]`** | — | Owner-directed. One-way design calls that 144 runs are built against. |
| 144 runs of game copy in the deadpan voice | **GPT-5.6-sol high** | high | All user-facing prose is sol's by doctrine. Voice consistency across 144 runs is exactly what a weaker tier fails at. |
| Adversarial review of the spec/PRD | **GPT-5.6-sol high**, fresh context | high | Independent — did not author the packet. |
| Engineering review of the spec/PRD | **GPT-5.6-sol high**, fresh context, separate call | high | Must not share context with the adversarial pass. |
| Schema extension, manifest build, tier-aware sequence assembly | **GLM-5.2** | — | Substantive but fully validator-guarded: the build fails loudly on any mistake. |
| Web Audio synthesis engine | **GLM-5.2** | — | Bounded subsystem with a testable contract (no files, no deps, reacts to state). |
| Locked-stage shell, routing, overflow guard | **GLM-5.2** | — | Validator-guarded by the overflow test and the a11y suite. |
| Avatar sprite CSS + reaction state machine | **GLM-5.2** | — | Spec comes from the creative bible; the worker implements against it. |
| Test fixtures, per-island content ports against the tier matrix, link/format checks, glossary sync | **GLM-4.7 `--mechanical`** | — | High volume, low judgment, matrix-shaped. |
| Rendered-stage inspection, sprite legibility at size, screenshot review | **Gemini** | — | Vision. GLM tiers guess on images rather than refuse. |
| Scope cuts when the build runs long | **Fable `[architect]`** | — | Scope is a decision, not a discovery. |

**Escalation ladder:** first failure → retry same tier with the validator findings appended. Second failure on GLM-4.7 → GLM-5.2. Second failure on GLM-5.2 → GPT-5.6-sol high. Second failure on sol, or any genuine ambiguity, scope change, spend, or destructive decision → orchestrator re-scope or HITL.

**No Claude sub-agent tier appears in the implementation rows.** The only sanctioned Claude tier here is Fable on architect slices, and it is used because the owner directed it.

---

## Execution roles

| Role | Owns | Never does |
|---|---|---|
| Mission Orchestrator | Plan state, slice boundaries, routing, diff review, integration, drift prevention | Write worker output; skip a validator |
| Worker Agent | One Context Slice → one issue → a structured handoff | Cross into another slice; decide scope |
| Scrutiny Validator | Fresh context: spec compliance, `typecheck`/`lint`/`test`/`build`, guardrail check | Share the worker's context |
| User Testing Validator | Fresh context: live behaviour at the locked stage, keyboard-only path, reduced-motion path, screenshots at the supported desktop viewport | Accept a build log as visual proof |
| Handoff Validator | Blocks when a handoff would not let a fresh agent resume from disk | Wave through an underspecified handoff |

**Structured worker handoff** (required on every slice): completed / undone / files touched / commands run with exit codes / issues found / next slice.

**Parallelism rule:** serial by default. Parallelise only read-only research, static review, and independent validators. The eight per-island content slices are the one place genuine fan-out is safe, because they touch disjoint files — and even then they run behind a single approved voice guide so they cannot drift apart.
