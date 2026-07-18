You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor (you are already in it). Make no commits. No npm install. Build fails on fonts in your sandbox — run build:manifest + typecheck/lint/test only.

# ISSUE-016 — Infra/Hosting region authored (REQ-008; VAL-030, VAL-037, VAL-038)

Bound: src/content/infra/*.ts (6 modules), docs/content/reviews/infra.md (new), public/content-manifest.v1.json (regenerate).

READ FIRST: docs/content/VOICE.md (FROZEN — every field must conform) and src/content/databases/sql.ts + vector.ts (gold exemplars). Taxonomy ids (LOCKED): serverless-functions, vps-single-server, containers, edge-compute, static-cdn, managed-platforms.

Author all 6 to full schema quality, draft: false, exactly per VOICE.md field conventions (serverless-functions and containers have design-doc seeds in their current drafts — keep their intent, complete them). Audience: builders directing AI agents. Every named-product claim gets a primary source (official docs: vercel.com/docs, aws.amazon.com/lambda docs, digitalocean.com/docs, hetzner docs, docker.com docs, fly.io/docs, developers.cloudflare.com, railway.com/docs (railway.app may redirect), render.com/docs), sources[] 2-4 per landmark, checked: "2026-07-17". Prefer stable doc roots you are confident exist — every URL will be HTTP-verified by the orchestrator.

docs/content/reviews/infra.md: per-landmark claim → source → checked → checker table; voice-conformance self-check against VOICE.md; "## Orchestrator verification" section with PENDING placeholder.

Then: npm run build:manifest && npm run typecheck && npm run lint && npm run test (invariant tests must stay green; no drafts may remain in infra).

Stop conditions: command fails twice → STOP.

Print EXACTLY this structured handoff: Completed work / Unresolved work / Files touched / Commands run (with exit codes) / Issues surprises discovered / Next Context Slice.
