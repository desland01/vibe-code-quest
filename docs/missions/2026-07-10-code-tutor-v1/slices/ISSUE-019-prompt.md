You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor. Make no commits. No npm install. Build fails on fonts in your sandbox — run build:manifest + typecheck/lint/test only.

# ISSUE-019 — Languages region authored (REQ-008; VAL-030, VAL-037, VAL-038)

Bound: src/content/languages/*.ts (6 modules), docs/content/reviews/languages.md (new), public/content-manifest.v1.json (regenerate).

READ FIRST: docs/content/VOICE.md (FROZEN) and src/content/databases/sql.ts (gold exemplar). Taxonomy ids (LOCKED): javascript-typescript, python, html-css, types-and-contracts, runtimes-and-packages, reading-generated-code.

Author all 6 to full schema quality, draft: false, per VOICE.md. Central regional message (from TAXONOMY): syntax is the road sign, not the road — agents made memorizing syntax less central but reading/verifying generated code more central. Frame each landmark for someone who directs agents: what the language/runtime IS, when it's the right pick, what to tell the agent, how to verify generated code. Concrete defaults (e.g. TypeScript as default for agent-written web apps; Python for data/AI/scripts).

Sources: official docs — developer.mozilla.org (MDN for JS/HTML/CSS), typescriptlang.org/docs, python.org/doc or docs.python.org, nodejs.org/docs, docs.npmjs.com, pip/pypi docs. sources[] 2-4 per landmark, checked "2026-07-17". Every URL HTTP-verified by orchestrator — prefer stable doc roots.

docs/content/reviews/languages.md: per-landmark claim → source → checked → checker; voice self-check; "## Orchestrator verification" PENDING placeholder.

Then: npm run build:manifest && npm run typecheck && npm run lint && npm run test (invariants green; no drafts in languages).

Stop conditions: command fails twice → STOP.

Print EXACTLY this structured handoff: Completed work / Unresolved work / Files touched / Commands run (with exit codes) / Issues surprises discovered / Next Context Slice.
