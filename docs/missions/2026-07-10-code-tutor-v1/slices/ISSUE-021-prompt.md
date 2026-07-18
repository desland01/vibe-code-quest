You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor. Make no commits. No npm install. Build fails on fonts in your sandbox — run build:manifest + typecheck/lint/test only.

# ISSUE-021 — Design Systems region authored (REQ-008; VAL-030, VAL-037, VAL-038)

Bound: src/content/design/*.ts (6 modules), docs/content/reviews/design.md (new), public/content-manifest.v1.json (regenerate).

READ FIRST: docs/content/VOICE.md (FROZEN) and src/content/databases/sql.ts (gold exemplar). Taxonomy ids (LOCKED): design-tokens, component-libraries, layout-and-spacing-rhythm, typography-and-hierarchy, accessibility-floor, consistency-vs-novelty.

Author all 6 to full schema quality, draft: false, per VOICE.md. Regional thesis: the layer between a working app and a believable app. Frame for builders directing agents: give agents design tokens and a component library so generated screens stay coherent; how to get intentional layout/typography from an agent instead of locally-plausible margins; accessibility as part of the agent's definition of done; where to spend novelty vs stay conventional. Concrete defaults (design tokens over one-off values; a maintained component library like shadcn/ui or Radix + Tailwind; system type scale; WCAG AA floor).

Sources: authoritative design/a11y docs — www.w3.org/WAI (WCAG/ARIA), developer.mozilla.org accessibility, tailwindcss.com/docs, ui.shadcn.com/docs, radix-ui.com, m3.material.io or spectrum.adobe.com for token concepts. sources[] 2-4 per landmark, checked "2026-07-17". Every URL HTTP-verified by orchestrator — prefer stable roots.

docs/content/reviews/design.md: per-landmark claim → source → checked → checker; voice self-check; "## Orchestrator verification" PENDING placeholder.

Then: npm run build:manifest && npm run typecheck && npm run lint && npm run test (invariants green; no drafts in design).

Stop conditions: command fails twice → STOP.

Print EXACTLY this structured handoff: Completed work / Unresolved work / Files touched / Commands run (with exit codes) / Issues surprises discovered / Next Context Slice.
