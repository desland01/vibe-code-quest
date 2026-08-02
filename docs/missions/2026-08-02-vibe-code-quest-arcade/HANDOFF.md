# HANDOFF: Vibe Code Quest Arcade Rebuild

Mission directory: `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade`

## 1. Mission goal and approval state

Build Vibe Code Quest as a desktop-first arcade game for people shipping with AI coding tools who do not yet understand software vocabulary or the decisions their agents ask them to make. Each of 48 landmarks gets three ordered runs: Level 1 vocabulary, Level 2 one concrete agent decision, and Level 3 tradeoffs. The rebuild adds a locked game stage, original player avatars, synthesized Web Audio music and effects, visible board evolution, clearer copy, exact progress migration, and a first correct answer within 60 seconds. The owner's grill closed on 2026-08-02 with the explicit confirmation `Grill closed - go`. Under the AFK doctrine, that closed grill is execution approval. A fresh session may execute safe, reversible local work in this packet without asking for another general approval. It does not authorize spending, deployment, production mutation, public or customer messaging, legal, pricing, payment, destructive work, a real Neon branch operation, the M3 taste decisions, or the M7 database cutover. Those remain named stops.

## 2. Artifact index

- `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/HANDOFF.md`: Fresh-session entry point, execution order, gates, and safety boundary.
- `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/INTERVIEW.md`: Owner directive, resolved grill decisions, carried defaults, and research record.
- `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/MISSION_CONTEXT.md`: Existing system, product failure, preserved guarantees, assumptions, and context sufficiency.
- `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/PRD.md`: Requirements REQ-001 through REQ-029, implementation decisions, testing decisions, exclusions, and stop conditions.
- `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/VALIDATION_CONTRACT.md`: Stable VAL checks, regression floor, manual gates, and definition of done.
- `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/DATA_MODEL.md`: Decided sequence identity, persistence, SQL, gating, migration, rollback, payload, and self-host contracts.
- `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/CREATIVE_BIBLE.md`: Creative source for avatars, level names, board states, effects, sound, voice, first minute, and v1 cuts.
- `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/EXECUTION_PLAN.md`: Milestone order, enforcement-first rule, integration ownership, stops, and volume.
- `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/ISSUES.md`: Self-contained ISSUE-001 through ISSUE-033 execution contracts.
- `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/AGENT_ROSTER.md`: Role tiers, capability evidence, escalation, validators, and parallelism rules.
- `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/AMENDMENT-A4.md`: Exact governance amendment that ISSUE-001 must append before implementation.
- `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/reviews/ADVERSARIAL_REVIEW.md`: Independent product and safety review with findings and dispositions.
- `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/reviews/ENG_REVIEW.md`: Independent engineering review with findings and dispositions.
- `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/reviews/ISSUES_VALIDATION.md`: Mechanical issue-format and dependency report. Its A12 path-label note predates this handoff and is not authority over current issue text.
- `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/mission-state.json`: Planning harness snapshot. It still says review phase, so use the closed grill, this handoff, and current packet as approval truth.
- **NOT packet artifacts — stray, awaiting owner disposition:** `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/constants.md` and `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/.constance/` were created during planning by a worker that ran `constance session-start` from inside the mission directory instead of the repository root. They are gitignored, are not part of this packet, and must not be read (raw Constance stores are off-limits per the project `CLAUDE.md`). The canonical store is at `/Users/thebeast/code-tutor/.constance/`. This stray store is the sole remaining failure of the deterministic packet gate — see §9. Do not delete it without owner instruction: its contents differ from the canonical store, so it is not a safe duplicate.

## 3. Requirements summary

### Content and level structure

- REQ-001: Every landmark has required canonical L1 vocabulary and L2 decision sources, enforced at schema and manifest boundaries.
- REQ-002: Every landmark exposes `l1`, `l2`, and `l3`, for exactly 144 server-side sequences.
- REQ-003: L1 teaches vocabulary only and covers every documented UGC term mapped to its island.
- REQ-004: L2 has exactly one agent decision with one correct option and feedback for every option.
- REQ-005: L3 preserves all old canonical facts and the exact eight-beat `L3_SHAPE` with its check at index 6.
- REQ-006: L1 opens L2 and L2 opens L3 per landmark; islands stay open; hosted gating is transactional and self-host gating is local.
- REQ-007: Remove `deriveBeatSequence()` and replace it with tier-aware authored content and provenance checks.

### Stage and routes

- REQ-008: Gameplay uses one fixed, non-scrolling desktop stage at 1024 by 640 and 1440 by 900, with vertical reflow at 200 percent text.
- REQ-009: Every rendered state fits the stage; real DOM measurements are authority and word budgets are the fast guard.
- REQ-010: All 48 legacy landmark URLs keep working and any level segment is additive.

### Avatars, audio, effects, and board

- REQ-011: The chosen player avatar appears on stage, celebrates correct answers, and shrugs at wrong answers.
- REQ-012: Avatar selection persists through localStorage in hosted and self-host modes; cross-device server persistence is deferred.
- REQ-013: Audio uses Web Audio only, adds no runtime dependency, creates no HTML audio element, and ships no audio file.
- REQ-014: Music reacts to streak growth, wrong answers, level tier, and level completion.
- REQ-015: Audio starts muted, waits for a gesture, exposes a persistent mute control, and remembers the preference.
- REQ-016: The owner gets one sampling page with all required music variants before choosing the default.
- REQ-017: Correct, wrong, streak build, streak break, level clear, and island clear each produce a distinct visible effect.
- REQ-018: Level clears visibly change both the island map and the DOM play stage.
- REQ-019: A returning player can see position and progress without reading labels.

### Progress, XP, preservation, and safety

- REQ-020: Keep award values, cap XP at 100 per level and 300 per landmark, and preserve every old award row and total exactly.
- REQ-021: Backfill old progress and XP rows to L3 without inserting, deleting, or changing historical facts, timestamps, totals, or ranks.
- REQ-022: Preserve keyboard completion, named screen-reader controls, reduced motion, non-color signals, and the trusted axe baseline.
- REQ-023: With `DATABASE_URL` unset, core play works from local state and server-only features hide cleanly.
- REQ-024: Level-aware progress keeps RLS isolation, monotonic merge, immutable identity, and server authority over accepted writes.
- REQ-025: Shipped characters, assets, and in-world names use no third-party product branding.
- REQ-026: Every level completes with the AI guide disabled or its network unavailable.

### Voice, first run, and rollback

- REQ-027: Every beat passes word, banned-phrase, reading-level, provenance, and owner voice review gates.
- REQ-028: A cold anonymous root visit reaches the first correct answer within 60 seconds with no account, form, map choice, or reading gate.
- REQ-029: Use expand, verify, and separately approved cutover; the first non-L3 row is the old-binary rollback point of no return.

## 4. Validation contract summary

Done proves the product has 144 valid level sequences, a playable locked stage, level-safe progress and XP, exact migration preservation, accessible input and output paths, no guide dependency, no branding leak, no content overflow, and no regression against the named existing suites.

The automatic side is VAL-001 through VAL-064 plus VAL-014b and VAL-035b, except the four manual checks. It uses schema and manifest checks, unit tests, database integration, RLS tests, Playwright, DOM measurements, migration equality assertions, and build and payload limits. `npm run test:db` and `npm run test:rls` are not safe automatic commands until VAL-064 proves a disposable `TEST_DATABASE_URL` or the owner records approval for that exact ephemeral branch operation.

The manual side is:

- VAL-029: owner hears the music variants and chooses one.
- VAL-033: owner confirms returning-player position is visually obvious from desktop evidence.
- VAL-053: owner approves a ten-beat Git voice sample.
- VAL-062: owner approves SUDO and NULL at real size, in motion, in all shipped reactions and reduced-motion poses.

Definition of done requires all VAL IDs green, all four manual evidence records signed, all named regression tests still passing, rendered evidence inspected, and these commands exiting 0: `npm run typecheck`, `npm run lint`, `npm run test`, gated `npm run test:db`, gated `npm run test:rls`, `npm run build`, and `npm run test:e2e`. A green build alone is not visual proof.

## 5. Issue list and dependency order

### M0: Governance and clean baseline

- ISSUE-001, HITL root: append Amendment A4 verbatim to `/Users/thebeast/code-tutor/docs/missions/2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md`. It gates every other issue.
- ISSUE-002, HITL: classify the dirty tree by provenance, preserve foreign work, repair the axe baseline, and pass the normal project gate. It depends on ISSUE-001 and gates M1a.

### M1a: Model, persistence, and validators against fixtures

- ISSUE-003: level identity, canonical levels, assessments, registry, public projection, and provenance foundation.
- ISSUE-004: expand and cutover migration files plus four-part progress identity. Depends on ISSUE-003.
- ISSUE-005: hosted transaction gating and self-host authority boundary. Depends on ISSUE-003 and ISSUE-004.
- ISSUE-006: per-level XP identity. Depends on ISSUE-004 and ISSUE-005.
- ISSUE-007: localStorage v2 and v1-to-L3 migration. Depends on ISSUE-003.
- ISSUE-008: word, banned-phrase, reading-level, and manifest copy guards. Depends on ISSUE-003.
- ISSUE-009: rendered stage-fit harness. Depends on ISSUE-003.
- ISSUE-010: DB-test preflight. Depends on ISSUE-004 and gates every DB test.
- ISSUE-011: landmark aggregate deduplication across level rows. Depends on ISSUE-005.
- No production content is authored in M1a. Fixtures only.

### M1b: Git reference corpus

- ISSUE-012: six Git L3 rewrites and normalization of the two hand-authored L3 sequences. Depends on ISSUE-003, ISSUE-008, and ISSUE-009.
- ISSUE-013: six Git L1 runs and the sourced UGC term list. Depends on ISSUE-012.
- ISSUE-014: six Git L2 runs and the agent-chat-bubble prototype. Depends on ISSUE-012 and ISSUE-013.
- The finished 18-run Git corpus becomes the only voice reference for later content.

### M2: Git tracer bullet

- ISSUE-015: locked stage and additive level routes. Depends on ISSUE-009 and ISSUE-012 through ISSUE-014.
- ISSUE-017: SUDO avatar and answer reactions. Depends on ISSUE-015.
- ISSUE-018: Web Audio engine, three main-theme variants, core SFX, reactive layers, and mute contract. Depends on ISSUE-015.
- ISSUE-016: title screen and first-sixty-seconds route. Depends on ISSUE-015 and ISSUE-017.
- ISSUE-019: six visible effects and reduced-motion fallbacks. Depends on ISSUE-015 and ISSUE-017.
- ISSUE-020: trail, Git board evolution, and returning-player marker. Depends on ISSUE-015 and ISSUE-017. Map visuals also require the approved design artifact chain.

### M3: Owner taste gates

- ISSUE-021, HITL, VAL-029: owner chooses the default music variant. Depends on ISSUE-018.
- ISSUE-022, HITL, VAL-062: owner approves SUDO and NULL. Depends on ISSUE-017.
- ISSUE-023, HITL, VAL-053: owner approves the ten-beat Git voice sample. Depends on ISSUE-012 through ISSUE-014.
- All three gates must close before any M4 through M6 content fan-out.

### M4 through M6: Remaining island content

- M4: ISSUE-024 Databases and ISSUE-025 Security.
- M5: ISSUE-026 Infra, ISSUE-027 AI Types, and ISSUE-028 Languages.
- M6: ISSUE-029 PM Tools, ISSUE-030 Design, and ISSUE-031 NULL plus the four-slot picker.
- ISSUE-024 through ISSUE-030 depend on ISSUE-023 and run only after all M3 approvals. ISSUE-031 depends on ISSUE-022 and uses localStorage in both runtime modes. It does not add cross-device server persistence.

### M7: Migration and final proof

- ISSUE-032, HITL: run the approved migration proof, preserve rows and ranks, verify self-host and anonymous paths, and run `0012_arcade_level_cutover.sql` only with explicit owner approval. It depends on the data work, DB preflight, aggregate fix, and all remaining island content.
- ISSUE-033, HITL: run the full gate, activate the 144-count assertion, capture rendered evidence, and update `/Users/thebeast/code-tutor/CONTEXT.md`. It depends on ISSUE-032. It never authorizes deployment.

## 6. Agent roster and execution rules

The session orchestrator owns architecture boundaries, sharding, routing, diff review, integration, and stop decisions. Fable is the architect tier for one-way product and scope calls. The senior developer tier reviews slices and integration. Engineering and adversarial review route to GPT-5.6-sol at high effort. Current global routing sends user-facing writing to GPT-5.6-terra at high effort, frontend UI implementation to Kimi-K3, substantive validator-guarded work to the approved worker tier, and mechanical matrix work to GLM-4.7. Gemini owns screenshots, sprite sheets, and other visual review. Never send images to GLM. No dispatched agent exceeds high effort. Current Constance rules and the live model roster override stale backend names in the planning snapshot.

Execution is serial by default: one worker, one issue, one validator, one structured handoff, then integration. Never parallelize the content model, stage shell, audio engine, or migration.

The single write fan-out is ISSUE-024 through ISSUE-030 after M3 closes. Each island worker writes only inside its absolute island directory under `/Users/thebeast/code-tutor/src/content/`. It may not edit `/Users/thebeast/code-tutor/src/content/index.ts`, `/Users/thebeast/code-tutor/src/content/regions.ts`, `/Users/thebeast/code-tutor/src/content/schema.ts`, any shared manifest code, or `/Users/thebeast/code-tutor/public/content-manifest.v1.json`. The session orchestrator is the sole integrator. The orchestrator makes shared-file edits and regenerates the manifest serially after each island lands. A worker that needs a shared-file change stops and returns it to the integrator.

Every implementation slice ends with completed work, unfinished work, files touched, commands with exit codes, findings, and the next slice. Every UI slice includes a rendered screenshot inspection. Validators use fresh context and do not inherit the worker's reasoning.

## 7. THE EXACT NEXT STEP

The first command in the fresh execution session is:

```sh
cd /Users/thebeast/code-tutor && constance session-start
```

Then read `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/HANDOFF.md`, inspect `git status` without changing the tree, and execute ISSUE-001. Do not begin ISSUE-002 or any implementation issue until the exact Amendment A4 log entry is present in `/Users/thebeast/code-tutor/docs/missions/2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md` and its diff proves no other clause changed.

## 8. WHAT NOT TO DO

- Never blanket-stage or blanket-commit the dirty tree. Never run `git add -A` or `git add .`.
- Never start any issue before ISSUE-001 applies Amendment A4 exactly and only to the frozen contract's amendment log.
- Never run `npm run test:db` or `npm run test:rls` without a proven disposable `TEST_DATABASE_URL` or recorded owner approval. `/Users/thebeast/code-tutor/scripts/with-neon-branch.mjs` creates a real Neon branch when that variable is absent.
- Never deploy, promote, publish, post, or mutate production.
- Never spend money.
- Never send customer or public messages, change legal, pricing, or payment state, or take reputation-affecting action.
- Never author production content before the M1a validators exist and pass against fixtures.
- Never write placeholder content to satisfy a schema, manifest, sequence-count, provenance, or voice validator.
- Never let an island worker edit `/Users/thebeast/code-tutor/src/content/index.ts`, `/Users/thebeast/code-tutor/src/content/regions.ts`, `/Users/thebeast/code-tutor/src/content/schema.ts`, shared manifest code, or `/Users/thebeast/code-tutor/public/content-manifest.v1.json`.
- Never modify migrations `/Users/thebeast/code-tutor/db/migrations/0001_schema.sql` through `/Users/thebeast/code-tutor/db/migrations/0010_leaderboard.sql`.
- Never run `/Users/thebeast/code-tutor/db/migrations/0012_arcade_level_cutover.sql` or commit the first non-L3 row without explicit owner approval for that exact cutover.
- Never change the 8-region by 6-landmark shape, rename Region to Island in code, weaken RLS, move gating outside the authoritative transaction, or merge progress across levels.
- Never recompute old XP, top up historical awards, change `awarded_at`, or accept rank movement during migration.
- Never add an audio dependency, ship audio files, use HTML audio, autoplay sound, or add an animation library.
- Never use third-party product names for characters or in-world branding.
- Never punish a broken streak, shame the player, add lives, leagues, timers, daily quests, or fake urgency.
- Never implement portrait layouts, BOO, DUCKY, long-idle easter eggs, leaderboard changes, attract-mode playback, or other v1 cuts.
- Never treat a green build as visual proof. Render and inspect every visual slice.
- Never print secrets, bypass hooks, force-push, or use destructive Git or database actions.

## 9. Known blockers and open questions

- Governance blocker: Amendment A4 is drafted but not applied. ISSUE-001 closes this before any other work.
- Baseline blocker: `/Users/thebeast/code-tutor/docs/missions/2026-07-10-code-tutor-v1/evidence/ISSUE-013/axe-report.json` is modified. ISSUE-002 must explain the diff and establish a trusted axe baseline before VAL-042 can mean anything.
- Dirty-tree blocker: Constance files and prior-mission screenshots are foreign or unattributed work. Preserve them. Do not stage them. ISSUE-002 classifies them without blanket actions.
- DB blocker: no DB integration command is unattended-safe until ISSUE-010 installs and proves VAL-064.
- M3 owner gate 1: choose V1 Attract Mode, V2 Bedroom Tape, or V3 Final Boss of Not Knowing after hearing all three.
- M3 owner gate 2: approve or reject the SUDO and NULL character direction from rendered motion and silhouette evidence.
- M3 owner gate 3: approve or reject the deadpan Git voice after reviewing the named ten-beat sample.
- ISSUE-020 manual gate: the owner must confirm the returning-player marker is visually obvious without reading text.
- Avatar persistence is settled for v1: current REQ-012, VAL-019, VAL-020, and ISSUE-031 use localStorage in hosted and self-host modes. Cross-device server persistence is deferred. The conflicting sentence still present in PRD sections 8 and 9 is stale and must not reopen this decision.
- VAL-028's table still mentions server persistence for hosted mute state, but its test and the creative engine contract use localStorage. Treat v1 mute persistence as same-browser localStorage in both modes. Do not invent server audio state.
- VAL-053's table still says the ten-beat sample spans different islands, which cannot happen before fan-out. Follow ISSUE-023 and the execution plan: review ten beats from the Git reference corpus across all three levels. Do not author later islands to satisfy the stale phrase.
- Legacy URL mapping is not fully decided for every new, migrated, anonymous, and authenticated state. Preserve resolution and additive paths. Do not invent redirects or canonical behavior beyond the current tested contract without an owner decision.
- VAL-008 and VAL-012 lack an immutable pre-rebuild fact inventory. Preserve current canonical facts explicitly and treat any uncertainty as a content-review stop, not permission to drop a fact.
- VAL-033's row is desktop-only, while an older definition-of-done sentence mentions mobile evidence. Portrait is out of scope. Use the desktop contract unless the owner explicitly expands scope.
- `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/mission-state.json` and `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/reviews/ISSUES_VALIDATION.md` contain planning-era status. They do not reopen the closed grill or replace the current packet.

## 10. Review history

Two independent fresh-context reviews ran at high effort. `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/reviews/ADVERSARIAL_REVIEW.md` found five blocking findings. `/Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/reviews/ENG_REVIEW.md` found five blocking findings. All ten blocking findings are now closed in this packet through Amendment A4, the decided data model, the fixture-first M1 split, the DB-test preflight, transactional gating, level-aware XP identity, the two-mode stage contract, and the rollback design. Deferred high and medium findings remain recorded in those files and are listed above when they can affect execution.

## Kickoff prompt

```text
Begin execution of the approved Vibe Code Quest Arcade mission. The owner's grill closed on 2026-08-02, and the mission packet at /Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade is approved for safe local execution under the AFK doctrine. Read /Users/thebeast/code-tutor/docs/missions/2026-08-02-vibe-code-quest-arcade/HANDOFF.md and every artifact it indexes, start Constance from the repository root, inspect the dirty tree without changing it, and execute ISSUE-001 as the first work item by appending Amendment A4 exactly as specified. Continue serially through the dependency order, with fresh validators and rendered proof for UI work. The safety floor remains binding: no spend, deploy, production or live external mutation, customer or public messaging, legal, pricing, payment, destructive action, force-push, secret output, or database test without a proven disposable TEST_DATABASE_URL or recorded approval. Never blanket-stage the dirty tree, and stop at every named HITL gate.
```

---

STOP: Planning packet complete. Do not execute implementation until the user approves this Mission packet and starts a fresh execution session with HANDOFF.md.
