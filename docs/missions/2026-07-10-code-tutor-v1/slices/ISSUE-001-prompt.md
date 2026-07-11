You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor (you are already in it). Implement only this issue; touch nothing outside its bound; make no commits (the orchestrator commits).

# ISSUE-001 — Scaffold normalization + repo truth
Bound (files you may touch): package.json, package-lock.json (via npm), CLAUDE.md, AGENTS.md, CONTEXT.md (new), WORK_LEDGER.md, src/data/*, src/__tests__/*, src/content/schema.ts (new), app/layout.tsx metadata, and — orchestrator-authorized addition — app/page.tsx + src/components/MapExperience.tsx (see Discovered Defect).

Tasks:
1. Rename package `vibe-tutor` → `code-tutor` in package.json (and lockfile name fields via `npm install --package-lock-only` or edit).
2. Rewrite CLAUDE.md and AGENTS.md: DELETE stale Vite/local-first/no-auth content; keep engineering standards; add a pointer to docs/missions/2026-07-10-code-tutor-v1/HANDOFF.md as mission source of truth; the two files must stay synchronized (same substantive content).
3. Create CONTEXT.md — glossary of terms ONLY (no implementation detail): region, landmark, canonical content, manifest, access seam, entitlement, trial, snapshot.
4. REPLACE the obsolete 2-deep-regions test in src/__tests__/ with invariant tests: exactly 8 regions; each region has a landmarks array; all region/landmark ids unique. Update src/data/regions.ts as needed so the invariants hold (8 regions matching the product: Databases, Infra/Hosting, AI Types, Git, Languages, Security, Design Systems, PM Tools — landmark arrays may be empty for now).
5. Drop `stub` from the RegionStatus type and any usages.
6. Add Zod schema module src/content/schema.ts mirroring the Landmark/Region types (install zod as a dependency). Schema must parse the existing sample data (add a test proving it).
7. DISCOVERED DEFECT (must fix): app/page.tsx imports @/components/MapExperience which does not exist. Create a minimal placeholder src/components/MapExperience.tsx (client component fine) that renders the 8 region names from src/data/regions.ts as a simple accessible list — NO map implementation, NO styling ambition (map work is gated behind a later design artifact).
8. Update app/layout.tsx metadata (title/description) to neutral placeholder branding "code-tutor — A Map for Post-AI Builders".

Requirement (REQ-001): Repo baseline + scaffold normalization — rename package; rewrite stale CLAUDE.md/AGENTS.md; add CONTEXT.md glossary; replace obsolete test with 8-regions invariants; drop `stub`; introduce runtime Zod schema.

Validation you must satisfy locally before finishing:
- VAL-001: `npm run typecheck && npm run lint && npm run test && npm run build` all exit 0.
- VAL-002: no secrets introduced anywhere.
- VAL-003: no files touched outside the bound (orphan-free).
- VAL-030 (partial): schema module parses existing sample data.

When done, print EXACTLY this structured handoff as your final message:
- Completed work:
- Unresolved work:
- Files touched:
- Commands run (with exit codes):
- Issues / surprises discovered:
- Next Context Slice:
