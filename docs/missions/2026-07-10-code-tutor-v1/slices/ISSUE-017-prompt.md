You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor (you are already in it). Make no commits. No npm install. Build fails on fonts in your sandbox — run build:manifest + typecheck/lint/test only.

# ISSUE-017 — AI Types region authored (REQ-008; VAL-030, VAL-037, VAL-038)

Bound: src/content/ai-types/*.ts (6 modules), docs/content/reviews/ai-types.md (new), public/content-manifest.v1.json (regenerate).

READ FIRST: docs/content/VOICE.md (FROZEN — conform every field) and src/content/databases/sql.ts + vector.ts (gold exemplars). Taxonomy ids (LOCKED): model-call-vs-agent, retrieval-augmented-generation, tool-use, workflows-vs-agents, ai-evals, model-selection-routing.

Author all 6 to full schema quality, draft: false, per VOICE.md. Audience: builders directing AI agents to add AI features to their own products. This is the highest-accuracy region — be precise and current about AI concepts; do not overstate capabilities; frame agent autonomy honestly (agents are useful but need bounds, evals, and tool schemas). Concrete vibe-coder defaults (e.g. "start with a single model call + structured outputs before reaching for a multi-step agent").

Sources: primary/official docs for every named-product or named-technique claim. Prefer stable roots you are confident exist. Good candidates (verify by choosing stable pages): platform.openai.com/docs, docs.anthropic.com (Claude docs), ai-sdk.dev or sdk.vercel.ai docs, docs.pinecone.io, python.langchain.com/docs, modelcontextprotocol.io. For general concepts (RAG, evals, tool use), you may cite the primary vendor doc that documents that capability. sources[] 2-4 per landmark, checked "2026-07-17". Every URL will be HTTP-verified by the orchestrator — prefer doc roots over deep links you are unsure of.

docs/content/reviews/ai-types.md: per-landmark claim → source → checked → checker table; voice self-check; "## Orchestrator verification" PENDING placeholder.

Then: npm run build:manifest && npm run typecheck && npm run lint && npm run test (invariants green; no drafts in ai-types).

Stop conditions: command fails twice → STOP.

Print EXACTLY this structured handoff: Completed work / Unresolved work / Files touched / Commands run (with exit codes) / Issues surprises discovered / Next Context Slice.
