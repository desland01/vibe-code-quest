# Mission Context — code-tutor v1 (2026-07-10)

## Goal (verbatim from user)

Build the code-tutor app (formerly vibe-tutor) at `/Users/thebeast/code-tutor` all the way to completion. Scope = office-hours design doc Approach B PLUS the deferred features: all 8 regions with deep content (not 2+6 stubs), opt-in email account upgrade, per-user AI cost caps, share/export artifact. Run the plan through /autoplan before building, then complete the app.

## Sources read (Phase 0)

| Source | Status | Notes |
|---|---|---|
| `/Users/thebeast/.gstack/projects/code-tutor/thebeast-greenfield-design-20260503-023821.md` | READ (full, 305 lines) | Approved office-hours design doc, rev 3, 9/10. Primary spec input. |
| `/Users/thebeast/code-tutor/CLAUDE.md` | READ | STALE — describes Vite local-first app, forbids auth/DB/AI. Contradicts mission. Must be rewritten in an early issue. |
| `/Users/thebeast/code-tutor/AGENTS.md` | PRESENT (mirror of CLAUDE.md) | Same staleness; must stay synchronized. |
| `/Users/thebeast/code-tutor/WORK_LEDGER.md` | READ | Records May 18 committee run + a Vite "3Ms workflow tutor" build that was later replaced by a Next.js scaffold. |
| `/Users/thebeast/code-tutor/package.json` | READ | Next.js ^16.2.6, pixi.js ^8.14.3, React ^19.2.1, vitest. Name still `vibe-tutor`. |
| `/Users/thebeast/code-tutor/src/data/regions.ts` | READ | Canonical content schema already typed (Landmark/Region), matches design doc schema. |
| `CONTEXT.md`, `README.md` | ABSENT | Recorded per missing-source rule. CONTEXT.md will be created as glossary. |
| `~/.gstack/projects/vibe-tutor/timeline.jsonl` | READ | office-hours completed 2026-05-03; design-shotgun (map aesthetic, O1) ran 2026-05-03 and ended BLOCKED — aesthetic validation never completed. |

## Known constraints and assumptions

- Repo relocated from `~/vibe-tutor` → `~/code-tutor` on 2026-07-10; git initialized (branch `main`), initial commit made. No remote yet.
- Design doc O1 (Pixi aesthetic validation) is UNRESOLVED — the prior /design-shotgun run blocked. The plan must re-run aesthetic validation or take the documented SVG fallback.
- Design doc O2 (domain) unresolved — external spend gate (~$12-20).
- Design doc O3 (AI SDK v6 GA check) unresolved — verify at execution start.
- Design doc O4 / The Assignment (5-vibe-coder region validation) is human-only work; mooted in part by the user's directive to build all 8 regions deep.
- Global stack defaults apply: latest Next.js App Router, AI SDK v6, AI Gateway `provider/model` strings, Vercel deploy, Supabase for auth/data.
- Safety gates: no spend >$5, no production deploy/launch posts without approval.
- Stale project CLAUDE.md/AGENTS.md contradiction surfaced (interview rule): they will be rewritten as an early issue; product decision authority is the design doc + this mission packet.

## Deviations from design doc (user-directed scope expansions)

1. **All 8 regions deep** (design doc v1: 2 deep + 6 stub; deep content for 6 more regions was v1.5+).
2. **Opt-in email account upgrade** (was v2, premise 3).
3. **Per-user AI cost caps** (was v2; v1 had only a global cap).
4. **Share/export artifact** (design doc named the map as the share-worthy artifact; explicit share/export feature was implied-later).

Paid tier and Approach C (IDE extension) remain OUT unless the user overrides at the gate.

## Recovery / state notes

- 2026-07-10: mission folder created fresh; no prior mission-state.json existed.

## Context Sufficiency Gate (Phase 2) — 2026-07-10

| Dimension | Score | Evidence |
|---|---|---|
| Intent | 2 | Outcome concrete in INTERVIEW.md §1; user-visible value per user stories. |
| Boundaries | 2 | Out-of-scope + guardrails explicit (PRD, INTERVIEW §7). |
| Existing system | 2 | Design doc read in full; scaffold inspected; stale CLAUDE.md contradiction surfaced. |
| Validation | 2 | VALIDATION_CONTRACT.md written before issues; every REQ maps to VALs. |
| Context slices | 2 | One-issue-one-slice rule; content sliced per region; validators get bounded packets. |
| Handoff | 2 | HANDOFF.md planned with no-chat-dependency rule; state file maintained. |

**Total: 12/12 — proceed to spec/PRD (done) and reviews.**
