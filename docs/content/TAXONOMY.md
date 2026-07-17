# Code Tutor Landmark Taxonomy

This document locks the 48 landmark slots for the eight-region learning map before content authoring begins, with each concept framed for builders whose AI agents write most of the code.

## Languages

Organizing question: What must you understand about the code your agent chooses, generates, and asks you to maintain?

1. `javascript-typescript` — JavaScript and TypeScript — JavaScript runs the web, while TypeScript adds contracts that catch mismatches before runtime (Node.js, React, type checking). When an agent writes your app, TypeScript is the sensible default because it gives both the agent and you faster, clearer feedback about what fits where.
2. `python` — Python — Python is the direct, library-rich language behind many scripts, data jobs, and AI services (FastAPI, pandas, notebooks). Reach for it when your agent is automating work or using Python-first tooling, not merely because the syntax looks friendly.
3. `html-css` — HTML and CSS — HTML gives a page meaning and CSS controls its presentation (semantic elements, responsive layout, cascade). Even when an agent builds the interface, knowing this pair lets you describe visual bugs precisely and recognize when generated markup is inaccessible or brittle.
4. `types-and-contracts` — Types and contracts — Types describe the shapes crossing functions, components, and APIs (interfaces, schemas, generated clients). Give agents explicit contracts at important boundaries so they can change code confidently; use loose, inferred shapes only for small local details.
5. `runtimes-and-packages` — Runtimes and packages — A language runs inside an environment and borrows code through an ecosystem (browser vs Node.js, Python environments, npm vs PyPI). This explains why agent-written code can be valid yet fail in your project: the runtime, version, or package may not match.
6. `reading-generated-code` — Reading code you did not write — You do not need to memorize syntax, but you do need to trace inputs, outputs, side effects, and failure paths in generated code (editor navigation, logs, stack traces). Read enough to verify the agent changed the right layer and to explain the behavior before you ship it.

## Databases

Organizing question: What storage shape and operating model should hold the app's durable data? (locked upstream)

1. `sql` — SQL — SQL (relational, the default-good-choice)
2. `nosql-document` — NoSQL document — NoSQL document (Mongo, Firestore — when the schema isn't done yet)
3. `vector` — Vector — Vector (Pinecone, pgvector — for AI features)
4. `graph` — Graph — Graph (Neo4j — when relationships ARE the data)
5. `orm-vs-raw-sql` — ORM vs raw SQL — ORM vs raw SQL (Prisma, Drizzle, raw — what changes for the agent that writes your queries)
6. `hosted-vs-self-hosted-databases` — Hosted vs self-hosted — Hosted vs self-hosted (Supabase / Neon / PlanetScale vs you-run-Postgres — vibe-coder default = hosted).

## Infra / Hosting

Organizing question: Where and in what execution shape should the app run? (locked upstream)

1. `serverless-functions` — Serverless functions — Serverless functions (Vercel Functions / AWS Lambda — the vibe-coder default)
2. `vps-single-server` — VPS / single server — VPS / single server (DigitalOcean / Hetzner — when you outgrow free tiers)
3. `containers` — Containers — Containers (Docker / Fly.io — when the app needs background work or websockets)
4. `edge-compute` — Edge compute — Edge compute (Cloudflare Workers / Vercel Edge — when latency matters)
5. `static-cdn` — Static + CDN — Static + CDN (Vercel static, Cloudflare Pages — when there's no backend)
6. `managed-platforms` — Managed platforms — Managed platforms (Railway / Render / Heroku-style — when you don't want to think about infra).

## AI Types

Organizing question: What kind of AI behavior does the product need, and how much autonomy should the model receive?

1. `model-call-vs-agent` — Model call vs agent — A model call produces one bounded response, while an agent can choose steps and continue toward a goal (chat completion, coding agent). When your coding agent adds AI to a product, start with the bounded call and grant autonomy only when the task genuinely needs decisions across steps.
2. `retrieval-augmented-generation` — Retrieval-augmented generation — RAG supplies relevant private or current context before a model answers (embeddings, chunking, citations). Reach for it when the answer must come from your material; ask the agent to preserve source links and test retrieval quality rather than treating extra context as automatic truth.
3. `tool-use` — Tool use — Tool use lets a model request defined actions instead of merely describing them (function calling, structured outputs, API tools). Give the agent narrow schemas, validation, and confirmation points so model intent becomes controlled application behavior.
4. `workflows-vs-agents` — Workflows vs agents — Workflows follow code-defined steps, while agents choose their next step dynamically (state machines, queues, planning loops). Prefer a workflow when your coding agent can enumerate the path; use an agent only where that flexibility is worth less predictability.
5. `ai-evals` — Evals — Evals are repeatable checks for whether AI behavior is useful, correct, and safe enough (golden examples, rubric graders, regression sets). Because generated features can sound convincing while drifting, have the agent run representative cases whenever prompts, tools, context, or models change.
6. `model-selection-routing` — Model selection and routing — Different models trade capability, speed, cost, and modality, and routing decides which request gets which model (small vs frontier models, fallback chains). Let the agent implement routing behind one seam, but choose it from measured task needs rather than model hype.

## PM Tools

Organizing question: How do you turn product intent into bounded, durable instructions that humans and coding agents can execute?

1. `issues-as-specs` — Issues as executable specs — A strong issue states the outcome, boundaries, acceptance checks, and relevant context (GitHub Issues, Linear). For an agent-written codebase, the issue is the work order: make it precise enough that completion can be verified without guessing your intent.
2. `prd-lite` — PRD-lite — A lightweight product brief aligns the user, problem, promise, constraints, and success signal before implementation (one-page brief, decision memo). Give this shared context to agents when several issues serve one outcome, while keeping implementation detail in the individual work orders.
3. `vertical-slices` — Scope as vertical slices — A vertical slice delivers one testable user outcome across the necessary layers (thin end-to-end feature, walking skeleton). Ask agents for the smallest complete slice so you learn from working software instead of accumulating disconnected backend and frontend parts.
4. `dependencies-and-work-graphs` — Dependencies and work graphs — A work graph makes prerequisites, parallel-safe tasks, and blockers explicit (dependency links, milestone ordering). Agents move faster when they know what source of truth must exist first and which files or contracts another task owns.
5. `decision-logs` — Decision logs — A decision log records what was chosen, why, and what would trigger reconsideration (ADRs, dated project notes). Use it to stop future agents from reopening settled debates or following stale chat context after the code has moved on.
6. `backlog-vs-now` — Backlog vs now — A backlog preserves possible work; the active queue is the small set currently worth executing (kanban, milestones, work-in-progress limits). Keep agents focused on the active outcome and park attractive extras instead of letting generated scope quietly become product scope.

## Git

Organizing question: How do you preserve, inspect, and safely combine changes made by you and your coding agents?

1. `commits-as-checkpoints` — Commits as checkpoints — A commit is a named, inspectable snapshot of one coherent change (diff, message, hash). Have agents commit at verified boundaries so you can understand, compare, or undo their work without losing unrelated progress.
2. `branches-as-isolation` — Branches as isolation — A branch gives a line of work its own history until it is ready to combine (feature branch, trunk-based development). Use one when an agent's change needs review or may collide with other work; keep short fixes on the current branch only when the repo's workflow allows it.
3. `pull-requests-and-review` — Pull requests and review — A pull request presents a proposed change, its evidence, and the conversation around it (diff review, required approval). Even if another agent performs the first review, you remain responsible for checking that the result matches the product intent and acceptance criteria.
4. `merge-conflicts` — Merge conflicts — A conflict means two histories changed the same area and Git cannot safely choose the result (conflict markers, rebase, merge). Let an agent explain both sides before resolving; a clean file is not proof that the combined behavior is correct.
5. `working-tree-hygiene` — Working-tree hygiene — Tracked, untracked, generated, and ignored files describe what belongs in project history (status, diff, ignore rules). Before an agent edits, make it inspect the working tree and preserve changes it does not own so one task cannot erase another.
6. `revert-and-recovery` — Revert and recovery — Git can back out a bad change or recover an earlier state without pretending the mistake never happened (revert, reflog, bisect). Prefer a reversible history operation when agent-written code breaks production, then diagnose the cause before trying a second fix.

## Security

Organizing question: Where can untrusted input or excessive authority hurt the app, and how do you limit the damage?

1. `secrets-and-environment` — Secrets and environment — Secrets are credentials, not configuration to expose in source, browsers, prompts, or logs (environment variables, secret managers, key rotation). When an agent needs a credential, provide only the variable name and server-side access pattern; never paste the value into its working context.
2. `authentication-vs-authorization` — Authentication vs authorization — Authentication proves who is acting; authorization decides what that identity may do (sessions, roles, row-level security). Agent-written routes need both checks on the server, because hiding a button does not protect the underlying action or record.
3. `trust-boundaries` — Trust boundaries — A trust boundary is where data or control crosses between differently trusted systems (browser to server, webhook to app, model output to tool). Mark these boundaries for the agent so it knows where to verify identity, validate claims, and fail closed.
4. `input-validation-and-injection` — Input validation and injection — Untrusted input can alter queries, markup, commands, or model instructions when it is treated as trusted structure (schema validation, parameterized queries, prompt injection). Require agents to validate at every boundary and use safe APIs rather than trying to sanitize danger after the fact.
5. `dependency-supply-chain` — Dependency and supply-chain risk — Every package and external build step adds code you did not author to the app (lockfiles, advisories, provenance). Have agents justify new dependencies, pin reproducible versions, and remove unused packages instead of installing a library for every small task.
6. `least-privilege-blast-radius` — Least privilege and blast radius — Give each user, service, and agent only the permissions and resources needed for its job (scoped tokens, separate environments, spending caps). Assume mistakes will happen, then design access so one bad instruction or leaked credential cannot reach everything.

## Design Systems

Organizing question: What reusable visual rules help agent-generated interfaces stay coherent, usable, and accessible as the product grows?

1. `design-tokens` — Design tokens — Tokens name the recurring visual decisions behind an interface (color roles, spacing steps, radii). Give agents tokens instead of one-off values so a brand change is deliberate and generated screens still look like the same product.
2. `component-libraries` — Component libraries — A component library packages repeated interface behavior and appearance into maintained building blocks (buttons, dialogs, form fields). Agents should reuse or extend these components before inventing new ones, especially where interaction states and accessibility are easy to miss.
3. `layout-and-spacing-rhythm` — Layout and spacing rhythm — Layout rules control alignment, density, and responsive structure across screens (grid, stack, container, spacing scale). Clear constraints help an agent produce intentional composition instead of a collection of locally plausible margins.
4. `typography-and-hierarchy` — Typography and hierarchy — Type scale, weight, line length, and contrast tell users what matters and what belongs together (headings, body, labels, metadata). Ask agents to express hierarchy through the established type roles, not by making every new element louder.
5. `accessibility-floor` — Accessibility floor — Accessibility is the minimum interaction contract for different bodies, devices, and preferences (semantic controls, keyboard access, focus, contrast, reduced motion). Make these requirements part of every agent's definition of done, because a polished screenshot cannot prove the interface is usable.
6. `consistency-vs-novelty` — Consistency vs novelty — Most interface patterns should stay predictable, while a few moments can carry the product's character (standard forms, signature map, motion accents). Direct agents to spend novelty where it reinforces meaning and keep routine tasks familiar.

## Coherence check

- PASS — All eight regions contain exactly six landmarks, for 48 total slots.
- PASS — All 48 kebab-case ids are unique.
- PASS — Concepts have one regional owner: code media in Languages, storage in Databases, runtime hosting in Infra / Hosting, model behavior in AI Types, executable intent in PM Tools, version history in Git, trust and permissions in Security, and interface rules in Design Systems.
- PASS — Every rationale is framed around what a vibe coder should understand, request, verify, or default to when an agent writes the code.
- PASS — Each set of six answers its organizing question, and named products appear only as concrete parenthetical anchors rather than recommendations or ads.

## Sign-off

Orchestrator sign-off: **APPROVED** — 2026-07-17, mission orchestrator (Claude Fable 5, code-tutor v1 execution session). Reviewed all 48 slots against VAL-036: exactly 8×6 with unique kebab-case ids; locked Databases/Infra taxonomies copied verbatim from the upstream design doc; no cross-region conceptual overlap found (checked the risky seams: package supply-chain [Security] vs work-graph dependencies [PM Tools]; prompt injection [Security, input-validation] vs model behavior [AI Types]; secrets [Security] vs working-tree hygiene [Git]; TypeScript-as-language vs types-as-contracts within Languages — distinct and intentional); every rationale is vibe-coder-first with products as parenthetical anchors only. No region judged contestable — HITL escape hatch not triggered. This taxonomy is LOCKED for all M4 content authoring.
