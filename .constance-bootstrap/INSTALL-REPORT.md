# Constance install report — code-tutor (2026-07-19)

## What ran
- `constance install --yes`: hooks wired into .claude/settings.json (SessionStart, PreToolUse Read|Bash, action-gate Write|Edit, Stop decline-guard), fenced operating contract appended to CLAUDE.md, /constance-install command dropped. Self-check: all hook entry points answer OK. Hooks activate in NEW sessions.
- Enforcement tier (claude-code): MEASURED — Read hard-denied on raw stores, Bash best-effort, Write/Edit action-gated, Stop decline-guard; in-session compression contract is prose.

## Claim audit
- Sweep 1 (CLAUDE.md/AGENTS.md, glm-worker): 50 claims — 30 A / 1 B / 19 C. Ledger: .constance-bootstrap/claims-project.jsonl
- Sweep 2 (v2 HANDOFF + VALIDATION_CONTRACT + KICKOFF, glm-worker): 70 claims. Ledger: .constance-bootstrap/claims-v2mission.jsonl
- Filtered out before declaring: Constance's own fenced-contract claims (self-referential, already hook-enforced), point-in-time state snapshots (stale test counts, "not yet built" items — facts, not rules), session-scoped boundaries (parallel-session no-touch list), and internal-history "B" claims (fleet 429 post-mortems — historical record, not verifiable standards).

## Store result
- 38 project constants declared, tier user-decision, zero unresolved failures (5 compound rejects split per engine hints and re-accepted).
- Coverage: mission source-of-truth pointers, frozen-contract protection, v1 HITL/ISSUE-030/032 blocks, the four finalize gates (typecheck/lint/test/build), WORK_LEDGER discipline, progress-persistence invariants (monotonic merge, no 409, stamp-only completion), analytics dedup, registry/server-side rules, motion/reward/GuideChat product rules, no-new-deps/routes/deploy mission boundaries.
- Grounded authority bricks: 0 (no claim in these docs cites an external primary source as its authority).
- Declined claims: 0. Interviews: 0 needed — all residual C-claims are documented prose standards in CLAUDE.md (taste/judgment rules deliberately left un-mechanized) or decisions already recorded in the mission docs (Lane B authorization).

## Revert
`constance uninstall --yes` (removes hooks + fenced contract via .constance/install-manifest.json; add --purge-store to also delete the verified store).
