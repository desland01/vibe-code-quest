You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor (you are already in it). Implement only this issue; make no commits. No npm install. Build fails on fonts in your sandbox — run typecheck/lint/test + build:manifest only.

# ISSUE-015 — Databases region (gold standard) + VOICE.md (REQ-008; VAL-030, VAL-037, VAL-038)

Bound: src/content/databases/*.ts (6 modules — full authoring), docs/content/VOICE.md (new), docs/content/reviews/databases.md (new), public/content-manifest.v1.json (regenerate via npm run build:manifest).

Context:
- Schema: src/content/schema.ts (landmark: id, title, hook, definition, when_to_use[], tradeoffs{pros,cons}, example, gotchas[], vibe_coder_default, quiz{question,options,answer∈options,explanation}, sources[]{url,checked}, draft). Taxonomy ids (LOCKED): sql, nosql-document, vector, graph, orm-vs-raw-sql, hosted-vs-self-hosted-databases.
- The existing src/content/databases/sql.ts draft was ported from the upstream design doc's sample — its voice IS the quality bar: direct, concrete, vibe-coder-first (the reader directs AI agents that write the code; no CS-course tone, no interview prep), short punchy hook, honest tradeoffs, concrete example scenario, gotchas as imperative warnings, a named sensible default.
- Audience: builders shipping real apps by directing AI agents. Every landmark answers: what is it, when do I reach for it, what do I tell my agent, what's the default.

Tasks:
1. Author ALL 6 Databases landmarks to FULL schema quality, `draft: false`:
   - hook: one sharp sentence. definition: 2-3 sentences, plain language. when_to_use: 3-4 concrete situations. tradeoffs: 3+ pros / 2+ cons, honest. example: a 2-3 sentence realistic app scenario. gotchas: 2-3 imperative warnings (include agent-specific ones — e.g. what agents get wrong). vibe_coder_default: one decisive recommendation naming current products. quiz: one question, 3 options, canonical answer, explanation.
   - sources[]: 2-4 PRIMARY sources per landmark for every named-product claim (official docs URLs: postgresql.org, mongodb.com, firebase.google.com, pinecone.io, github.com/pgvector, neo4j.com, prisma.io, orm.drizzle.team, supabase.com, neon.com, planetscale.com — use the real current doc paths you are confident in), checked: "2026-07-17". The orchestrator will verify every URL resolves — prefer stable root doc pages over deep links you are unsure of.
   - Expand/complete sql.ts from its draft (keep its voice, fill any thin fields, draft: false).
2. docs/content/VOICE.md — distill the voice from sql.ts + your authored region into a durable spec ALL later regions must follow: tone (direct, warm, zero condescension), person (second person), sentence length (mostly <20 words), structure conventions per schema field, example style (real app scenarios, never foo/bar), gotcha framing (imperative, agent-aware), product-naming rules (concrete products in defaults + parenthetical anchors, always sourced), banned patterns (marketing fluff, "simply/just", interview-prep framing, hedge stacks). End with "VOICE FROZEN — <date>. Later regions conform or record a justified deviation in their review artifact."
3. docs/content/reviews/databases.md — the VAL-037/038 review artifact: per landmark, list each named-product claim → source URL → checked date → checker ("codex gpt-5.6-sol worker; orchestrator URL verification pending"); voice-conformance self-check against VOICE.md; any deviations justified. Leave a "## Orchestrator verification" section with placeholder PENDING.
4. npm run build:manifest (regenerates manifest with draft:false region), then npm run typecheck && npm run lint && npm run test. The invariant tests must stay green.

Validation: VAL-030 (region schema-valid, no drafts in databases), VAL-037/038 (artifacts above), VAL-001/003.

Stop conditions: command fails twice → STOP.

Print EXACTLY this structured handoff:
- Completed work:
- Unresolved work:
- Files touched:
- Commands run (with exit codes):
- Issues / surprises discovered:
- Next Context Slice:
