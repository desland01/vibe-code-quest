You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor. Make no commits. No npm install. Build fails on fonts in your sandbox — run build:manifest + typecheck/lint/test only.

# ISSUE-022 — PM Tools region authored (REQ-008; VAL-030, VAL-037, VAL-038) — FINAL M4 region

Bound: src/content/pm-tools/*.ts (6 modules), docs/content/reviews/pm-tools.md (new), public/content-manifest.v1.json (regenerate).

READ FIRST: docs/content/VOICE.md (FROZEN) and src/content/databases/sql.ts (gold exemplar). Taxonomy ids (LOCKED): issues-as-specs, prd-lite, vertical-slices, dependencies-and-work-graphs, decision-logs, backlog-vs-now.

Author all 6 to full schema quality, draft: false, per VOICE.md. Regional thesis: project management as machine-readable product memory — the work graph agents read, not just human planning. Frame for builders directing agents: an issue is the agent's work order (precise enough that "done" is verifiable), PRD-lite as shared context across issues, vertical slices so agents deliver testable outcomes not disconnected parts, dependency graphs so agents know what must exist first, decision logs so future agents don't reopen settled debates, backlog-vs-now discipline so generated scope doesn't silently become product scope. Concrete defaults naming real tools (Linear, GitHub Issues, ADRs).

Sources: official docs — linear.app/docs, docs.github.com (issues/projects), and stable references for ADRs (adr.github.io or github.com/joelparkerhenderson/architecture-decision-record) and agile/slice concepts (a stable primary reference). sources[] 2-4 per landmark, checked "2026-07-17". Every URL HTTP-verified by orchestrator — prefer stable roots.

docs/content/reviews/pm-tools.md: per-landmark claim → source → checked → checker; voice self-check; "## Orchestrator verification" PENDING placeholder.

Then: npm run build:manifest && npm run typecheck && npm run lint && npm run test (invariants green; no drafts in pm-tools). This completes all 48 landmarks — after this, running `npm run build:manifest -- --forbid-drafts` should exit 0.

Stop conditions: command fails twice → STOP.

Print EXACTLY this structured handoff: Completed work / Unresolved work / Files touched / Commands run (with exit codes) / Issues surprises discovered / Next Context Slice.
