You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor. Make no commits. No npm install. Build fails on fonts in your sandbox — run build:manifest + typecheck/lint/test only.

# ISSUE-018 — Git region authored (REQ-008; VAL-030, VAL-037, VAL-038)

Bound: src/content/git/*.ts (6 modules), docs/content/reviews/git.md (new), public/content-manifest.v1.json (regenerate).

READ FIRST: docs/content/VOICE.md (FROZEN) and src/content/databases/sql.ts (gold exemplar). Taxonomy ids (LOCKED): commits-as-checkpoints, branches-as-isolation, pull-requests-and-review, merge-conflicts, working-tree-hygiene, revert-and-recovery.

Author all 6 to full schema quality, draft: false, per VOICE.md. Audience: builders directing AI agents. Frame Git specifically for the AI-assisted workflow: commits as agent checkpoints you can inspect/revert, branches to isolate agent work, PRs where you review what the agent produced, working-tree hygiene so one agent task doesn't clobber another (this is a real lesson from this very mission), reverting agent changes safely. Concrete defaults.

Sources: official Git docs (git-scm.com/docs, git-scm.com/book) and platform docs where a claim names a platform (docs.github.com). sources[] 2-4 per landmark, checked "2026-07-17". Every URL HTTP-verified by orchestrator — prefer stable doc roots.

docs/content/reviews/git.md: per-landmark claim → source → checked → checker; voice self-check; "## Orchestrator verification" PENDING placeholder.

Then: npm run build:manifest && npm run typecheck && npm run lint && npm run test (invariants green; no drafts in git).

Stop conditions: command fails twice → STOP.

Print EXACTLY this structured handoff: Completed work / Unresolved work / Files touched / Commands run (with exit codes) / Issues surprises discovered / Next Context Slice.
