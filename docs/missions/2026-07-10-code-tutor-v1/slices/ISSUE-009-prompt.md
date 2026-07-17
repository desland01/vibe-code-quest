You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor (you are already in it). Implement only this issue; make no commits.

# ISSUE-009 — Taxonomy lock for 6 regions (REQ-008, VAL-036)

Bound: docs/content/TAXONOMY.md ONLY. No code, no other files (WORK_LEDGER.md entry allowed).

Product context: code-tutor, "A Map for Post-AI Builders" — an interactive 8-region learning map for vibe coders (people who build real apps primarily by directing AI agents, without traditional CS training). Content framing is vibe-coder-first: what each concept means for someone whose AI writes the code, when to reach for it, what the sensible default is. NOT big-tech interview prep.

The 8 regions (ids from src/data/regions.ts): languages, databases, infra, ai-types, pm-tools, git, security, design.

Two regions have LOCKED taxonomies from the upstream design doc — copy them in VERBATIM (mark "locked upstream"):
**Databases** — 1. SQL (relational, the default-good-choice) · 2. NoSQL document (Mongo, Firestore — when the schema isn't done yet) · 3. Vector (Pinecone, pgvector — for AI features) · 4. Graph (Neo4j — when relationships ARE the data) · 5. ORM vs raw SQL (Prisma, Drizzle, raw — what changes for the agent that writes your queries) · 6. Hosted vs self-hosted (Supabase / Neon / PlanetScale vs you-run-Postgres — vibe-coder default = hosted).
**Infra/Hosting** — 1. Serverless functions (Vercel Functions / AWS Lambda — the vibe-coder default) · 2. VPS / single server (DigitalOcean / Hetzner — when you outgrow free tiers) · 3. Containers (Docker / Fly.io — when the app needs background work or websockets) · 4. Edge compute (Cloudflare Workers / Vercel Edge — when latency matters) · 5. Static + CDN (Vercel static, Cloudflare Pages — when there's no backend) · 6. Managed platforms (Railway / Render / Heroku-style — when you don't want to think about infra).

Task: author docs/content/TAXONOMY.md with ALL 48 landmark slots:
- For each of the 6 remaining regions (Languages, AI Types, PM Tools, Git, Security, Design Systems): exactly 6 landmarks, each with a stable kebab-case id, a title, and a 1-2 sentence rationale in the same voice/quality as the locked exemplars above (concept + parenthetical concrete anchors + when/why for a vibe coder).
- Region intros: 1 line per region stating the region's organizing question.
- Coherence rules (self-check before finishing, and state the check results at the bottom of the file):
  - No conceptual overlap ACROSS regions (e.g., CI/CD belongs to ONE region; auth/secrets live in Security not Infra; prompt techniques live in AI Types not Languages).
  - Vibe-coder-first framing on every rationale (what it means when an agent writes the code).
  - Each region's 6 landmarks collectively answer the region's organizing question; no landmark is a product ad — products appear only as parenthetical anchors.
  - Ids unique across all 48.
- File structure: H1, short purpose paragraph, per-region H2 with intro + numbered 6-landmark list (id — Title — rationale), then "## Coherence check" section, then "## Sign-off" section containing a placeholder line: "Orchestrator sign-off: PENDING".
- Suggested strawmen to beat (improve on these freely, do not treat as fixed): Languages: javascript-typescript, python, sql-the-language, html-css, typed-vs-untyped, reading-code-you-didnt-write. AI Types: chat-vs-agent, rag, tool-use, workflows-vs-agents, evals, model-routing. PM Tools: issues-as-specs, prd-lite, scoping-slices, work-graph-for-agents, changelogs-decision-logs, kanban-vs-backlog. Git: commits-as-checkpoints, branches, prs-and-review, merge-conflicts, gitignore-secrets-hygiene, when-to-revert. Security: secrets-and-env, auth-vs-authz, trust-boundaries, injection-and-validation, dependencies-supply-chain, blast-radius-least-privilege. Design Systems: design-tokens, component-libraries, layout-spacing-rhythm, typography-hierarchy, accessibility-floor, consistency-vs-novelty.

Validation: VAL-036 (48 slots, no overlap, rationale each, sign-off section present). This file gates ALL content authoring.

Print EXACTLY this structured handoff as your final message:
- Completed work:
- Unresolved work:
- Files touched:
- Commands run (with exit codes):
- Issues / surprises discovered:
- Next Context Slice:
