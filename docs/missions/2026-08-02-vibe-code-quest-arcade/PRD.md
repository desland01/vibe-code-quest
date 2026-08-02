## 1. Problem Statement

The product starts after the knowledge its intended player needs. The owner could not complete `languages/javascript-typescript` and described the experience as "a class that missed the first two semesters" ([INTERVIEW.md](./INTERVIEW.md)). The current game asks for tradeoff judgment before it teaches the words in the question.

The same gap appears in the 51 sourced research findings:

- A player clicks through permission prompts without a basis for consent: "I literally always say always allow. I have no idea what the stuff they are asking means haha. Just out of curiosity how dangerous is that?" ([source](https://www.reddit.com/r/cursor/comments/1v97cvq/how_bad_is_always_saying_always_allow/)).
- A builder does not know what language their working app uses: "I have no cookado what code is in my app don't even know what language it is but it works" ([source](https://www.reddit.com/r/vibecoding/comments/1qfn0m9/comment/o06skgl/)).
- A database mistake destroyed most of six years of work: "That data represents six years of effort..." ([source](https://www.reddit.com/r/replit/comments/1ts5zzd/lost_90_of_my_database_data_while_adding_simple/)).
- One click started an agent loop that incurred more than $700 in under 72 hours ([source](https://www.reddit.com/r/vibecoding/comments/1qvclj0/trusting_ai_cost_me_over_usd_700/)).

The issue is not visual polish. The game has no vocabulary on-ramp, 46 of 48 runs share one generated copy structure, and the playable lesson surface scrolls like a page. It has no audio, persistent avatar, visible board growth, or staged reward loop. A player can finish content without gaining the mental model needed to answer an AI coding agent's next question.

The mission succeeds when a person with no software background can name the terms, answer a concrete agent decision, and then reason about a tradeoff. Game feedback must support that transfer without hiding weak instruction behind effects.

## 2. Solution

Rebuild the existing eight-island game as a desktop-first arcade stage while preserving its architectural and safety floors.

Each of the 48 landmarks contains three ordered runs:

1. `Name That Thing`: vocabulary with zero assumed software knowledge.
2. `Pick a Lane`: one concrete decision an AI coding agent could ask the player to make.
3. `Tradeoffs`: the current conceptual ceiling, rewritten for clarity.

This produces 144 runs. Level progression is per landmark. All islands remain open. The player sees one fixed, non-scrolling DOM/CSS stage, a reactive original avatar, synthesized Web Audio music and effects, a beat trail, and visible map growth. The existing Pixi island map remains.

The creative system follows `CREATIVE_BIBLE.md` sections 1 through 7. The first playable slice follows section 8.2. Content rolls out in the order in section 8.3. The cut list in section 8.1 remains outside v1.

## 3. User Stories

- As a person who does not know software vocabulary, I can learn the plain meaning of a term before I must use it in a decision.
- As a person answering an AI coding agent, I can practice one realistic choice and see why each response is safe or unsafe.
- As a returning player, I can see where I was and what changed without reading a progress report.
- As a keyboard or screen-reader user, I can complete every level without losing information carried by motion, color, or sound.
- As a player who does not want audio, I start muted and can keep the game muted across sessions.
- As an existing player, I retain every progress value and the exact same total XP after migration.
- As a self-hosting operator, I can run the full core game with `DATABASE_URL` unset.
- As the owner, I can approve the character direction and choose music by ear before those taste decisions spread across the full content set.

## 4. Requirements

### REQ-001

Every landmark must define non-optional canonical source fields for Level 1 vocabulary and Level 2 decisions, and schema or manifest validation must reject any landmark missing them. VAL IDs: VAL-001, VAL-002.

### REQ-002

Every landmark must expose exactly three sequences named `l1`, `l2`, and `l3`, for exactly 144 sequences across 8 regions and 6 landmarks. VAL IDs: VAL-003, VAL-004.

### REQ-003

Every Level 1 sequence must use vocabulary-tier content, contain no tradeoff or domain-knowledge scenario beat, and cover every documented UGC term on its mapped island. VAL IDs: VAL-005, VAL-006.

### REQ-004

Every Level 2 sequence must contain exactly one agent-decision beat with one `correctOptionId` and feedback for every option. VAL IDs: VAL-007.

### REQ-005

Every Level 3 sequence must preserve every canonical fact from that landmark's pre-rebuild tradeoff content, and must retain the pre-rebuild 8-beat shape with its exact ordered `(id, type)` pairs (the pinned `L3_SHAPE`) including the check beat at its original position. This fixed shape is what makes existing progress preservable — a stamped `furthestBeatIndex: 7` remains valid against the same terminal index after the cutover. VAL IDs: VAL-008, VAL-056.

### REQ-006

Level 2 must remain locked until Level 1 is cleared for the same landmark, Level 3 must remain locked until Level 2 is cleared, and all islands and landmark routes must remain open at zero progress. Gating authority is split by mode: **hosted mode** enforces unlock inside the same database transaction as the progress upsert (read prerequisite rows under `FOR SHARE`, compute highest unlock, reject writes above it); **self-host mode** enforces unlock locally from versioned local progress, while the server still owns sequence existence, level identity, terminal bounds, and beat kind for every request it receives. An existing pre-migration L3 row grandfathers `highestUnlocked = L3` without synthesizing L1 or L2 rows. VAL IDs: VAL-009, VAL-010, VAL-054.

### REQ-007

`deriveBeatSequence()` must be removed with no export or call site, and the replacement tier-aware provenance check must reject any factual beat claim absent from canonical landmark fields. VAL IDs: VAL-011, VAL-012.

### REQ-008

Beat playback must fit in one fixed, non-scrolling stage at every supported desktop viewport, including 1024 by 640 and 1440 by 900. VAL IDs: VAL-013.

### REQ-009

Every rendered beat must fit within the stage at 1024 by 640, with rendered DOM measurement as the authority and manifest word budgets as the fast-fail guard. VAL IDs: VAL-014, VAL-014b.

### REQ-010

All 48 existing `/map/[region]/[landmark]` URLs must keep serving playable content, and any level path segment must be additive. VAL IDs: VAL-015, VAL-016.

### REQ-011

The selected player avatar must render on the stage and expose `celebrate` after a correct answer and `shrug` after a wrong answer. VAL IDs: VAL-017, VAL-018.

### REQ-012

Avatar selection must persist across sessions in localStorage in both hosted mode and self-host mode. Cross-device (server-side) avatar persistence is out of scope for this mission per CREATIVE_BIBLE.md section 8.1 item 9. VAL IDs: VAL-019, VAL-020.

### REQ-013

Audio must use the Web Audio API only, add no runtime dependency, create no HTML audio element, and ship no audio file. VAL IDs: VAL-021, VAL-022, VAL-023.

### REQ-014

Music state must change for streak growth, a wrong answer, level tier, and level completion. VAL IDs: VAL-024.

### REQ-015

Audio must start muted, require a user gesture before sound, provide a visible working mute control, and persist the mute preference across sessions. VAL IDs: VAL-025, VAL-026, VAL-027, VAL-028.

### REQ-016

A sampling page must present every required music variant for owner listening and selection before final music approval. VAL IDs: VAL-029.

### REQ-017

The stage must emit distinct, test-identifiable effects for correct, wrong, streak building, streak broken, level complete, and island complete. VAL IDs: VAL-030.

### REQ-018

Clearing levels must cause visible state changes on both the Pixi island map and the DOM/CSS play stage. VAL IDs: VAL-031, VAL-032.

### REQ-019

A returning player's current position and progress must be visually identifiable without reading text. VAL IDs: VAL-033.

### REQ-020

XP must retain the current award values, cap awards at 100 per level and 300 per landmark, and leave every pre-migration player total exactly unchanged. The XP migration is IDENTITY-ONLY — it adds and backfills a `level` column on existing award rows, inserts zero new award rows, deletes zero, and preserves `awarded_at` in place. A profile with an incomplete historical award ledger is NOT topped up. VAL IDs: VAL-034, VAL-035, VAL-035b.

### REQ-021

Migration must mark each previously stamped landmark as Level 3 cleared while preserving every existing progress field and every existing total XP value exactly. The migration is IDENTITY-ONLY for both progress and XP: the `level` column is added and backfilled to `l3` on existing rows, no new rows are inserted, and `awarded_at` is preserved. A profile with an incomplete historical award ledger remains missing those awards. VAL IDs: VAL-035b, VAL-036, VAL-037, VAL-054, VAL-055, VAL-057, VAL-058, VAL-059, VAL-060.

### REQ-022

Every level must support keyboard-only completion, named screen-reader controls, reduced motion, non-color outcome signals, and no accessibility violation increase from the recorded baseline. VAL IDs: VAL-038, VAL-039, VAL-040, VAL-041, VAL-042.

### REQ-023

With `DATABASE_URL` unset, the core game must work from local state and hide server-only features without breaking the experience. VAL IDs: VAL-043.

### REQ-024

Level-aware progress must preserve row-level user isolation, monotonic merges, and server authority over beat kind and level state. VAL IDs: VAL-044, VAL-045, VAL-046.

### REQ-025

Shipped character names, character assets, and in-world branding must contain no third-party product name. VAL IDs: VAL-047.

### REQ-026

Every level must remain completable with the AI guide disabled or its network API unavailable. VAL IDs: VAL-048, VAL-049.

### REQ-027

Every beat must pass the configured word budget, banned-phrase, and reading-level checks, then pass the named ten-beat owner review for tone, clarity, and voice consistency. VAL IDs: VAL-050, VAL-051, VAL-052, VAL-053.

### REQ-028

First-sixty-seconds contract. A brand-new player reaches their first correct answer within 60 seconds from landing, with no account, no form, no settings screen, no map decision, and no reading gate before the first interaction. The root route lands the player directly into play. VAL ID: VAL-061.

### REQ-029

Migration rollback contract. The expand-and-backfill cutover can be reversed at the documented point: additive columns and new constraints land first (`0011_arcade_level_expand.sql`), old readers and writers keep working through the compatibility window using retained old unique constraints and `l3` defaults, and the old unique constraints are dropped only in a separately approved later migration (`0012_arcade_level_cutover.sql`). The first committed non-L3 database row is the point of no return for a lossless old-binary rollback and requires the same explicit owner approval as the cutover. VAL ID: VAL-060.

## 5. Implementation Decisions

- The decided persistence design lives in [DATA_MODEL.md](./DATA_MODEL.md) (Status: DECIDED). It closes the sequence identity, gating, migration, rollback, and payload boundary questions. The `level` column lives on the `progress` and `xp_awards` tables as row identity, not inside the progress JSON. That document is the authority for all persistence decisions in this mission.
- Keep the Zod-enforced 8-region by 6-landmark shape. Add level as a dimension inside each landmark. Do not change region or landmark counts. This preserves the build lock and public model. Source: `MISSION_CONTEXT.md` A2.
- Add tier-specific canonical fields to `landmarkSchema`. Do not create a parallel content store. One landmark remains the source of truth, and manifest validation stays at the existing boundary. Source: `MISSION_CONTEXT.md` A3.
- Remove `deriveBeatSequence()` rather than adding conditions to it. Keep the copy-loyalty mechanism as tier-aware provenance enforcement. Rewrite the canonical corpus and framing vocabulary it protects. This removes template sameness without permitting unsupported claims. Source: `MISSION_CONTEXT.md` A4 and `CREATIVE_BIBLE.md` section 6.4.
- Keep Pixi for the island map. Build the arcade stage in DOM/CSS. This retains existing camera behavior and the DOM accessibility path. Source: `MISSION_CONTEXT.md` A1.
- Use one lazily created Web Audio `AudioContext`, synthesized voices, and the state rules in `CREATIVE_BIBLE.md` section 5. Ship no audio files and add no audio dependency. Source: `MISSION_CONTEXT.md` A5.
- Use CSS `steps()` motion and the reduced-motion fallbacks in `CREATIVE_BIBLE.md` sections 1, 3, and 4. Do not add an animation dependency.
- Treat region as the canonical code term and island as presentation copy. Do not rename the code model.
- Preserve existing URLs. A level segment is additive. A legacy landmark URL must still open playable content.
- Keep islands open while gating levels inside each landmark. This provides choice without skipping the learning ramp.
- Cap XP at 100 per level, not 100 per landmark. The maximum becomes 300 per landmark. Keep the current award values.
- Migrate each existing stamp to Level 3 cleared. Grant only the Level 3 award set already represented by that stamp. Snapshot and compare every player total so migration changes no existing total. Source: `MISSION_CONTEXT.md` A6.
- Keep progress monotonic and server-authoritative. Extend the registered sequence and write-validation boundaries for level context.
- Use the first-session route and timing in `CREATIVE_BIBLE.md` section 7. A new player reaches the first answer without signup, a map decision, settings, or a tutorial modal.
- Build the schema, provenance rules, word-budget checks, one Level 2 rendering prototype, and the section 8.2 vertical slice before content fan-out.

## 6. Testing Decisions

- The validation contract is the acceptance source. Every requirement above maps to its stable VAL IDs. Do not replace or renumber them.
- The full gate is `npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:db`, `npm run test:rls`, `npm run build`, and `npm run test:e2e`.
- The manifest build checks schema completeness, 144-sequence count, tier structure, provenance, UGC term coverage, and fast word budgets.
- Playwright measures actual stage scroll and overflow at 1024 by 640. Character count or estimated height is not proof of fit.
- DB integration tests seed pre-migration profiles, snapshot all progress and XP totals, run migration, and require exact equality afterward.
- Existing self-host, guide-off, row-level security, monotonic merge, leaderboard, map, onboarding, access, analytics, share, legal, and anonymous-session tests remain regression gates as listed in `VALIDATION_CONTRACT.md`.
- Visual verification is required for the desktop play stage, map evolution, reduced-motion state, character reactions, and returning-player marker. Save the evidence named by the applicable manual VAL.
- Manual gates are VAL-029 for music, VAL-033 for returning-player progress, and VAL-053 for voice. A manual pass requires the evidence specified in `VALIDATION_CONTRACT.md`.
- The review loop ends when no high-severity finding that this mission can close remains open and every VAL is green. Findings outside this mission go to a separate owner decision.

## 7. Out of Scope

This mission's authorization to touch sound, canonical content, the beat factory, XP, map evolution, and the landing route comes from [AMENDMENT-A4.md](./AMENDMENT-A4.md) against the frozen 2026-07-19 design contract. A4's retained clauses remain binding on all work in this mission: no punitive streak loss or streak-shame copy, no autoplaying sound, no lives/leagues/timers/daily quests/fake urgency, no animation dependency (CSS `steps()` only), 44px touch targets, and colour never the only signal.

The v1 architect cut from `CREATIVE_BIBLE.md` section 8.1 is binding:

1. Portrait and mobile layouts. Landscape desktop only.
2. BOO and DUCKY. Ship SUDO and NULL, with four picker slots retained.
3. Eight unique island themes. Ship the three main-theme variants plus git, databases, and security themes. Other islands use the main theme at their specified tempo until their content wave lands.
4. The island tier-3 `Mastered` map state.
5. Long-idle character easter eggs.
6. An XP difficulty multiplier.
7. Leaderboard changes.
8. Title-screen attract-mode demo playback.
9. Server-side avatar persistence. v1 stores avatar choice locally.
10. Generative or adaptive composition beyond the layer rules in `CREATIVE_BIBLE.md` section 5.3.

Mission-level exclusions:

- No portrait layout work.
- No production deploy.
- No external spend.
- No unfreeze or rewrite of the frozen 2026-07-19 design contract.
- No schema change to the 8-region by 6-landmark shape.
- No third-party product name as a character name or in-world brand.
- Cross-device (server-side) avatar persistence, deferred to v1.1 per CREATIVE_BIBLE.md section 8.1 item 9.

## 8. Stop-and-ask Conditions

Execution must stop for owner action when any of these conditions occurs:

- Music variants are ready for VAL-029. The owner must listen and choose one.
- The initial character cast and sprite comp sheet are ready. The owner must approve the character direction before the 144-run content pass or map-art implementation proceeds.
- VAL-033 evidence is ready. The owner must confirm that returning-player position is clear without reading labels.
- The ten-beat VAL-053 sample is ready. The owner must approve tone, clarity, and voice consistency before content fan-out continues.
- Any action would incur external spend.
- Any action would deploy or mutate production.
- Running any database integration test (`npm run test:db`, `npm run test:rls`) that would create or mutate a real Neon branch. This is a live external mutation and requires a proven disposable `TEST_DATABASE_URL` or a recorded owner-approved ephemeral branch operation (VAL-064).
- Any discovery would require changing the 8-region by 6-landmark content shape.
- Any implementation would require unfreezing or weakening the 2026-07-19 design contract.
- Migration cannot preserve every existing progress field and exact player XP total.
- A proposed character, asset, or in-world name creates a third-party branding or legal question.
- REQ-012 reaches implementation. Its required hosted persistence conflicts with the section 8.1 v1 cut that excludes server-side avatar persistence. The owner must choose which boundary governs before that slice starts.

## 9. Further Notes

- `INTERVIEW.md` contains eight locked decisions and no unresolved planning question. The two planned taste gates remain owner approvals, not reasons to delay schema, test, or vertical-slice work.
- Research found 51 confusion cases. Databases, infrastructure, and security account for 56 percent. The owner still directed all eight islands to be built. Use `CREATIVE_BIBLE.md` section 8.3 for order, not for scope reduction.
- The creative bible defines the cast, level names, board states, effects, sound, voice, and first minute. This PRD references those sections instead of duplicating them.
- `VALIDATION_CONTRACT.md` has two internal boundary mismatches to resolve without silent interpretation. REQ-012 and VAL-019 require hosted avatar persistence while the v1 cut excludes it. VAL-033 specifies desktop-only evidence, while the contract's definition of done also says mobile evidence. This PRD treats portrait as excluded and requires an owner decision before either conflicting check is implemented.
- The mission changes no launch, payment, legal, access, or deployment approval from the v1 production mission.
