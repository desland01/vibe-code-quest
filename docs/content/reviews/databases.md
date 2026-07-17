# Databases content review

Checked: 2026-07-17  
Checker: codex gpt-5.6-sol worker; orchestrator URL verification pending

## SQL

Named-product claims:

- PostgreSQL models relational data → https://www.postgresql.org/docs/current/tutorial-concepts.html → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending
- PostgreSQL supports transactions → https://www.postgresql.org/docs/current/tutorial-transactions.html → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending
- PostgreSQL supports database constraints → https://www.postgresql.org/docs/current/ddl-constraints.html → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending

Voice conformance: PASS. The hook is short, the definition is plain language, and the example directs an agent in a real client portal. Gotchas are imperative and agent-aware. The PostgreSQL default is decisive and sourced.

Deviations: None.

## NoSQL document

Named-product claims:

- MongoDB stores records as documents → https://www.mongodb.com/docs/manual/core/document/ → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending
- MongoDB documents support flexible data models and embedding → https://www.mongodb.com/docs/manual/data-modeling/ → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending
- Firebase Firestore uses documents and collections → https://firebase.google.com/docs/firestore/data-model → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending
- Firebase Firestore queries can require indexes → https://firebase.google.com/docs/firestore/query-data/indexing → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending

Voice conformance: PASS. Situations are workload-specific, tradeoffs name consistency costs, and the inspection-report example is concrete. The default distinguishes MongoDB and Firestore by need.

Deviations: None.

## Vector

Named-product claims:

- pgvector adds vector similarity search to PostgreSQL → https://github.com/pgvector/pgvector → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending
- Pinecone is a managed vector database for semantic search → https://docs.pinecone.io/guides/get-started/overview → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending
- Pinecone supports metadata filtering during search → https://docs.pinecone.io/guides/search/filter-by-metadata → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending

Voice conformance: PASS. The definition draws a firm boundary around vector search. The support-copilot example gives agent instructions, and the warnings cover permissions and evaluation.

Deviations: None.

## Graph

Named-product claims:

- Neo4j uses a property-graph model → https://neo4j.com/docs/getting-started/graph-database/ → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending
- Neo4j uses the Cypher query language → https://neo4j.com/docs/cypher-manual/current/introduction/ → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending
- Cypher patterns express graph paths and relationships → https://neo4j.com/docs/cypher-manual/current/patterns/ → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending

Voice conformance: PASS. The hook states the decision boundary. The fraud example is realistic, and the gotchas direct the reader to bound traversals and define data ownership.

Deviations: None.

## ORM vs raw SQL

Named-product claims:

- Drizzle provides a TypeScript ORM with a SQL-like query API → https://orm.drizzle.team/docs/overview → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending
- Drizzle supports embedded SQL expressions → https://orm.drizzle.team/docs/sql → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending
- Prisma ORM provides a generated database client and schema workflow → https://www.prisma.io/docs/orm → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending
- Prisma supports raw database queries → https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending

Voice conformance: PASS. Guidance rejects a false either-or choice, names agent failure modes, and gives an actionable Drizzle default with a Prisma alternative.

Deviations: None.

## Hosted vs self-hosted databases

Named-product claims:

- Neon provides managed serverless PostgreSQL → https://neon.com/docs/introduction → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending
- Neon supports database branching → https://neon.com/docs/introduction/branching → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending
- Neon documents pooled database connections → https://neon.com/docs/connect/connection-pooling → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending
- Supabase provides a managed Postgres database within its platform → https://supabase.com/docs/guides/database/overview → 2026-07-17 → codex gpt-5.6-sol worker; orchestrator URL verification pending

Voice conformance: PASS. The hook is memorable without marketing language. The tradeoffs name operational ownership, and the example gives a small team concrete agent instructions.

Deviations: None.

## Region-wide voice check

- Direct, warm, second-person voice: PASS.
- Most sentences under 20 words: PASS; longer sentences are limited to definitions and examples where context improves clarity.
- Three or four concrete use cases per landmark: PASS.
- At least three pros and two cons per landmark: PASS.
- Real app scenarios with no foo/bar examples: PASS.
- Imperative, agent-aware gotchas: PASS.
- Decisive, product-named, sourced defaults: PASS.
- No marketing fluff, “simply/just,” interview framing, or hedge stacks: PASS.

## Orchestrator verification

**COMPLETE — 2026-07-17, mission orchestrator (Claude Fable 5).**

- All 21 unique source URLs verified live by HTTP check: 20× 200 on first pass; 1 dead link (postgresql.org tutorial-relational.html, 404) replaced with tutorial-concepts.html (200) and manifest regenerated.
- Content review by direct read: all 6 landmarks conform to VOICE.md (hooks sharp, second person, agent-aware gotchas, decisive sourced defaults, no banned patterns found); claims are accurate and conservative (pgvector-in-Postgres, Neo4j/Cypher property graphs, Firestore document model, Prisma/Drizzle raw-SQL escape hatches, Neon branching/pooling).
- VAL-030: databases region fully authored, draft:false, schema-valid (build:manifest green).
- VOICE.md reviewed and **FROZEN** as the M4 bar.
