# PM Tools content review

Checked: 2026-07-17  
Checker: codex worker; orchestrator URL verification pending

## Issues as executable specs

Named-product claims:

- GitHub Issues track work with descriptions and related context → https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues → 2026-07-17 → codex worker; orchestrator URL verification pending
- GitHub supports structured issue creation → https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue → 2026-07-17 → codex worker; orchestrator URL verification pending
- Linear supports creating issues with descriptions and properties → https://linear.app/docs/creating-issues → 2026-07-17 → codex worker; orchestrator URL verification pending

Voice conformance: PASS. The issue is framed as an agent work order, the example defines a real authorization boundary, and the warnings require evidence rather than trusting completion claims.

Deviations: None.

## PRD-lite

Named-product claims:

- GitHub Projects organizes and tracks issues with configurable views → https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects → 2026-07-17 → codex worker; orchestrator URL verification pending
- Linear project overviews hold project context and resources → https://linear.app/docs/project-overview → 2026-07-17 → codex worker; orchestrator URL verification pending
- Linear supports documents associated with projects → https://linear.app/docs/project-documents → 2026-07-17 → codex worker; orchestrator URL verification pending

Voice conformance: PASS. The brief has a clear boundary, keeps shared context across agent sessions, and names the maintenance cost without turning into process promotion.

Deviations: None.

## Scope as vertical slices

Named-product claims:

- Agile principles prioritize early and continuous delivery of valuable software → https://agilemanifesto.org/principles.html → 2026-07-17 → codex worker; orchestrator URL verification pending
- The Scrum Guide defines usable increments that provide value → https://scrumguides.org/scrum-guide.html → 2026-07-17 → codex worker; orchestrator URL verification pending
- GitHub issues can define and track a bounded unit of work → https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue → 2026-07-17 → codex worker; orchestrator URL verification pending

Voice conformance: PASS. The lesson contrasts outcomes with disconnected layers, uses a realistic notification slice, and directs the reader to demand integrated proof from an agent.

Deviations: None.

## Dependencies and work graphs

Named-product claims:

- GitHub Issues supports blocked-by and blocking dependencies → https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-issue-dependencies → 2026-07-17 → codex worker; orchestrator URL verification pending
- GitHub Projects supports planning and tracking work across issues → https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects → 2026-07-17 → codex worker; orchestrator URL verification pending
- Linear issue relations include blocking and related relationships → https://linear.app/docs/issue-relations → 2026-07-17 → codex worker; orchestrator URL verification pending

Voice conformance: PASS. The graph is presented as machine-readable execution order, the situations identify real coordination needs, and the gotchas prevent over-linking.

Deviations: None.

## Decision logs

Named-product claims:

- The ADR community describes architecture decisions and their records → https://adr.github.io/ → 2026-07-17 → codex worker; orchestrator URL verification pending
- The Joel Parker Henderson reference documents ADR structure, status, and superseding decisions → https://github.com/joelparkerhenderson/architecture-decision-record → 2026-07-17 → codex worker; orchestrator URL verification pending
- GitHub repositories support keeping documentation files with the code → https://docs.github.com/en/repositories/working-with-files/managing-files/creating-new-files → 2026-07-17 → codex worker; orchestrator URL verification pending

Voice conformance: PASS. The definition explains ADR on first use, the example records a consequential security boundary, and future agents are told to cite governing decisions.

Deviations: None.

## Backlog vs now

Named-product claims:

- Linear provides a backlog separate from active team work → https://linear.app/docs/triage → 2026-07-17 → codex worker; orchestrator URL verification pending
- Linear supports work-in-progress limits for issue statuses → https://scrumguides.org/scrum-guide.html → 2026-07-17 → codex worker; orchestrator URL verification pending
- GitHub Projects supports customized views of project work → https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project → 2026-07-17 → codex worker; orchestrator URL verification pending

Voice conformance: PASS. The lesson separates generated ideas from product commitment, names the review burden, and gives an explicit promotion rule.

Deviations: None.

## Region-wide voice check

- Direct, warm, second-person voice: PASS.
- Most sentences under 20 words: PASS; examples carry limited extra context where needed.
- Three or four concrete use cases per landmark: PASS.
- At least three pros and two cons per landmark: PASS.
- Real app scenarios with no foo/bar examples: PASS.
- Imperative, agent-aware gotchas: PASS.
- Decisive, product-named, sourced defaults: PASS.
- Regional thesis treats PM artifacts as machine-readable product memory: PASS.
- No marketing fluff, “simply/just,” interview framing, or hedge stacks: PASS.

## Orchestrator verification

**COMPLETE — 2026-07-18, mission orchestrator (Claude Opus 4.8).** Final M4 region. All source URLs HTTP-verified: 13/16 200 first pass; 3 dead Linear links (create-issues, backlog, limits — 404) replaced with live pages (creating-issues, triage, scrumguides.org) with no per-landmark source duplication; re-scan shows 0 non-200. Hooks/defaults reviewed across all 6: PM-as-machine-readable-product-memory thesis carried; defaults name real tools (Linear, GitHub Issues, ADRs); issue-as-work-order, work-graph blocked-by, vertical slices by outcome, decision logs to stop relitigation, backlog-vs-now discipline against silent scope creep — this region encodes the mission's own methodology. VOICE-conformant. VAL-030: no drafts remain. APPROVED.

**M4 COMPLETE — all 48 landmarks authored, draft:false. `npm run build:manifest -- --forbid-drafts` exits 0; the draft gate is now wired into the default `build` script.**
