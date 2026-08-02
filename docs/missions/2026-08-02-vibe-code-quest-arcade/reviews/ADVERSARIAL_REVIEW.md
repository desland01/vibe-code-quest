# Adversarial Review

### F-001 — The packet violates the still-frozen source of truth while claiming it does not
**Severity:** BLOCKING
**Where:** `MISSION_CONTEXT.md` section 6; `PRD.md` sections 2, 4, and 7; `CREATIVE_BIBLE.md` locked constraints, sections 3 through 5, and supersession note; frozen `docs/missions/2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md` sections 4 through 8 and 12
**The problem:** The project instructions name the frozen 2026-07-19 design contract as the active source of truth for engagement and UI work. That contract says changes require an amendment and explicitly excludes sound, streaks, global map redesign, XP, canonical content changes, and onboarding changes. This packet adds every one of those things while repeatedly saying it inherits the frozen contract and will not unfreeze or rewrite it. The creative bible's local statement that celebration motion is "superseded" is not an amendment, and it does not address the other direct conflicts.
**Failure scenario:** Issue writers follow this packet and create work for audio, streaks, map evolution, XP, canonical field rewrites, and a title-screen landing route. An implementation agent checks the repository source of truth, correctly refuses those issues, and the mission stops after substantial issue-writing. The alternative is worse: the agent ignores the frozen contract and ships unauthorized behavior.
**Recommended fix:** Before issue-writing, add an explicit owner-authorized amendment to the frozen contract that lists each superseded clause and each clause that remains binding. Update this packet to reference that amendment. Do not use a prose "supersession note" as a substitute for the repository's required amendment mechanism.
**status:** accepted — AMENDMENT-A4.md drafted; applied by ISSUE-001 before any other execution.

### F-002 — M1 cannot be green while authoring zero content
**Severity:** BLOCKING
**Where:** `EXECUTION_PLAN.md` M1 and "The one rule that orders everything"; `VALIDATION_CONTRACT.md` VAL-001 through VAL-008 and VAL-012
**The problem:** M1 promises "no content" and "zero new content authored," but its exit requires all 48 landmarks to have non-optional L1 and L2 canonical fields, exactly 144 valid sequences, coverage of every UGC term, valid L1 and L2 structures, preserved L3 facts, and tier-aware provenance. The current repository has none of the 96 L1 and L2 sources. Those checks cannot pass without authoring content or inserting placeholders that falsely satisfy the enforcement suite.
**Failure scenario:** The M1 worker makes the new fields mandatory. The manifest immediately fails on all 48 landmarks. To reach the promised M1 exit, the worker fills 96 sources with generated placeholders. M2 then builds the real Git reference corpus against a pipeline already certified by fake content, and M4 through M6 replace the placeholders in a second high-risk rewrite. Enforcement did not precede content; unreviewed content was smuggled in as scaffolding.
**Recommended fix:** Split M1. First build the schema, policy artifacts, and validators against a small checked-in fixture without requiring 144 production sequences. Then author and approve the Git reference corpus. Only after that should fields become globally required as each island lands, with the 144-count gate reserved for final integration. State explicitly how incomplete islands remain buildable without shipping placeholder content.
**status:** accepted — EXECUTION_PLAN.md M1 split into M1a (validators against fixtures, tier fields optional) and M1b (Git reference corpus).

### F-003 — The current persistence keys cannot represent three independent levels
**Severity:** BLOCKING
**Where:** `EXECUTION_PLAN.md` M1 and M7; `PRD.md` REQ-006, REQ-020, REQ-021, and implementation decisions; actual `db/migrations/0001_schema.sql`, `db/migrations/0009_xp.sql`, `src/content/beats/schema.ts`, `src/server/beatProgress.ts`, and `src/server/xp.ts`
**The problem:** The packet says only "level context" will be added. That is not a data model. The `progress` table has one unique row per `(profile_id, region, landmark)`, and the strict progress JSON has no level. Its SQL merge uses one `GREATEST` frontier and one set of completion flags. The `xp_awards` uniqueness key is `(profile_id, region, landmark, award_key)`, and its check constraint permits only four unqualified award keys. A second level's `scenario_solved` will conflict with the first; three progress frontiers will collapse into one.
**Failure scenario:** L1 writes `completed: true` into the landmark row. L2 opens and either reads itself as completed or overwrites the same frontier. Its XP inserts hit the existing L1 award uniqueness constraint and award nothing. A worker then patches award keys to `l2_scenario_solved`, but the database check constraint rejects them. Leaderboard totals, map state, resume, and gating disagree.
**Recommended fix:** Make the persistence model a decided artifact before issues are written. The clean option is an explicit `level` column on both progress and XP awards, unique keys that include level, level-aware RLS and query APIs, and an expand-and-backfill migration that maps existing rows and awards to `l3`. If a nested JSON model is chosen instead, specify its atomic merge algebra and prove independent monotonicity per level. Update every reader listed by a repository-wide `state.completed`, progress-key, and XP-award reference scan.
**status:** accepted — DATA_MODEL.md decisions 3 and 4, real level column and level-inclusive unique keys.

### F-004 — Exact field preservation conflicts with variable-length L3 sequences
**Severity:** BLOCKING
**Where:** `PRD.md` REQ-005, REQ-020, and REQ-021; `VALIDATION_CONTRACT.md` VAL-008 and VAL-035b through VAL-037; `CREATIVE_BIBLE.md` section 3.3; actual `src/content/beats/schema.ts` and `src/server/beatProgress.ts`
**The problem:** Existing progress stores a numeric beat frontier tied to today's eight-beat sequence. A stamped row normally has `furthestBeatIndex: 7`. The new contract permits every sequence to contain 5 through 8 beats, while VAL-037 requires every existing field value to be preserved. Server validation rejects completed state unless the frontier equals the new terminal index. Therefore an old stamped row copied byte-for-byte to an L3 sequence with fewer than eight beats is invalid. Partial frontiers are even less meaningful after beat order and content change.
**Failure scenario:** An L3 re-voice uses six beats. Migration copies an existing completed row to L3 with frontier 7 as VAL-037 requires. The first server read or write validates against terminal index 5 and rejects the state as out of bounds. If migration clamps 7 to 5, VAL-037 fails and partial-player position is silently rewritten.
**Recommended fix:** Choose one invariant. Either require every L3 sequence to retain the old eight-beat shape, stable beat IDs, check position, and frontier semantics, or define a semantic migration from old beat IDs and completion facts to the new model and weaken the byte-identical field requirement accordingly. Add fixtures for every old frontier value, not only a stamped row.
**status:** accepted — DATA_MODEL.md decision 2 pins L3 to the 8-beat shape and ordered (id,type) pairs.

### F-005 — The required full gate performs a live Neon mutation without an approval gate
**Severity:** BLOCKING
**Where:** `VALIDATION_CONTRACT.md` runnable commands and definition of done; `EXECUTION_PLAN.md` M7 and stop conditions; actual `package.json` scripts and `scripts/with-neon-branch.mjs`
**The problem:** The packet requires `npm run test:db`. In the actual repository, that command calls `scripts/with-neon-branch.mjs`, which creates and deletes a real branch in a hard-coded Neon project whenever `TEST_DATABASE_URL` is absent. That is a live external mutation and potentially a metered resource operation. `npm run test:rls` also trusts any supplied `TEST_DATABASE_URL` without proving it is disposable. The packet's zero-spend and zero-live-mutation claims are therefore not fail-closed.
**Failure scenario:** A fresh agent reaches M7 with no `TEST_DATABASE_URL`, follows the required gate literally, and creates a Neon branch without owner approval. Cleanup fails, which the script treats as a warning after the test command can still exit successfully. The mission has mutated an external provider and left a billable branch while reporting the zero-mutation boundary intact.
**Recommended fix:** Add a mechanical preflight that refuses DB tests unless the target is a proven local/disposable database or an owner-approved ephemeral branch operation. Remove hard-coded provider fallback from the mission gate, or make the approval explicit and recorded before the command. Cleanup failure must fail the gate and produce a named remediation item.
**status:** accepted — new preflight VAL-064, EXECUTION_PLAN.md stop condition 2b, and ISSUE-010 owner approval requirement added.

### F-006 — VAL-035b does not prove its own leaderboard claim
**Severity:** HIGH
**Where:** `VALIDATION_CONTRACT.md` VAL-035b; `PRD.md` REQ-020, REQ-021, and testing decisions; actual `db/migrations/0009_xp.sql` and `db/migrations/0010_leaderboard.sql`
**The problem:** VAL-035b is named "No retroactive leaderboard movement," but its verifier only seeds synthetic profiles and compares total integer XP. The weekly leaderboard also depends on `awarded_at`. A migration can preserve totals while moving old awards into the current week and changing ranks. Synthetic fixtures also do not prove the claim about every existing profile or expose historical states the fixture author did not imagine. The sentence saying migration "grants" the L3 award set is dangerous because an existing stamped row with a missing or partial award ledger would gain points, violating byte identity.
**Failure scenario:** Migration re-inserts existing awards with the new level key and lets `awarded_at` default to now. Every all-time total is equal, so VAL-035b passes. Weekly scores jump and player ranks move. Another historical stamped profile missing an old award receives it during backfill, so its total also changes outside the narrow fixture set.
**Recommended fix:** Preserve award rows in place or explicitly preserve `awarded_at`. Assert equality of the full per-profile award multiset, total, weekly total, and leaderboard rank before and after migration. Build a checked-in migration corpus covering missing awards, partial awards, legacy non-beat rows, all frontiers, and duplicate/retry histories. Do not claim every real profile is verified until a read-only production preflight and post-migration audit are separately approved.
**status:** accepted — VAL-035b fully replaced; now asserts award multiset, awarded_at, all-time total, weekly total and leaderboard rank.

### F-007 — The first-sixty-seconds product contract has no requirement or VAL
**Severity:** HIGH
**Where:** `CREATIVE_BIBLE.md` section 7; `EXECUTION_PLAN.md` M2; `PRD.md` requirements and testing decisions; `VALIDATION_CONTRACT.md` all groups
**The problem:** The title screen, landing-route replacement, audio prompt, timed avatar default, direct routing to Git L1, no onboarding wall, and first correct answer inside 60 seconds are described as a contract. None has a REQ or VAL. Current `app/page.tsx` renders `MapExperience`, and the frozen contract says existing onboarding behavior is untouched. All listed VALs can pass while the app still opens on the map, shows onboarding, or never reaches the promised first answer.
**Failure scenario:** M2 implements the stage and content but leaves the root route unchanged to avoid the frozen-contract conflict. All structural, stage, audio, avatar, and content VALs pass. The owner opens the app and sees the old map and onboarding, so the mission's designed first minute does not exist.
**Recommended fix:** Add a dedicated requirement and E2E VAL for a cold anonymous root visit. Assert the exact route sequence, absence of onboarding and account gates before the first answer, keyboard-only completion of the prompt and avatar default, and first answer readiness within a deterministic interaction budget. Resolve the frozen onboarding conflict in F-001 first.
**status:** accepted — REQ-028 and its new VAL-061 added; requires cold anonymous root visit reaching first answer in under 60s.

### F-008 — The pre-fan-out voice gate asks for islands that do not exist yet
**Severity:** HIGH
**Where:** `EXECUTION_PLAN.md` M2 and M3; `VALIDATION_CONTRACT.md` VAL-053; `PRD.md` stop-and-ask conditions
**The problem:** M3 occurs after only the Git island is authored and blocks all other content fan-out. VAL-053 requires ten beats across different islands. The execution plan silently changes that to ten beats from the Git corpus. Both cannot be true. A gate that requires later-island content cannot pass before later-island content starts.
**Failure scenario:** The owner approves ten Git beats. The ledger marks VAL-053 green even though its cross-island evidence does not exist. Seven islands then fan out under a falsely closed gate. Alternatively, the validator follows VAL-053 literally and blocks M4 forever because there is no second island to sample.
**Recommended fix:** Split the gate into two stable IDs. The first approves the Git reference voice before fan-out. The second samples every completed island before integration, with a minimum per-tier and per-island matrix. Do not mutate the meaning of VAL-053 between milestones.
**status:** accepted — VAL-053 now samples 10 beats from Git corpus at M3 voice gate; cross-island sampling deferred to execution phase integration checks.

### F-009 — Enforcement-before-content checks proxies, not the promised voice
**Severity:** HIGH
**Where:** `CREATIVE_BIBLE.md` section 6; `EXECUTION_PLAN.md` central rule and M1; `VALIDATION_CONTRACT.md` VAL-050 through VAL-053
**The problem:** Word count, a banned phrase list, and an unspecified reading score do not enforce the voice guide. They do not prove the fixed verdict vocabulary, no exclamation marks in prompts, second-person present tense, L2 agent dialogue, option-label restraint, L3 cost acknowledgment, or that the joke targets jargon rather than the player. A short, low-grade, phrase-clean sentence can still be dull, smug, inconsistent, or factually misleading. The only semantic check is a tiny manual sample, and F-008 shows even that gate is internally inconsistent.
**Failure scenario:** Eight authors produce concise copy in eight different registers. Every string is short and avoids the banned list. One island uses teacher voice, one uses snark, one uses arcade hype, and one omits tradeoff costs. The enforcement suite is fully green because none of those failures are represented in a check.
**Recommended fix:** Check in a machine-readable voice policy with every mechanically decidable rule, including verdict leads, punctuation, option limits, dialogue shape, required source references, and tier-specific fields. Add per-island fresh-context copy review with an explicit rubric for the semantic rules. The reference corpus should include passing and failing examples that exercise each rule, not just attractive prose samples.
**status:** deferred — semantic voice rules beyond word budget/banned phrases/reading score deferred to execution; planning relies on manual VAL-053 for tone and voice consistency.

### F-010 — VAL-008 and VAL-012 become tautologies after canonical copy is rewritten
**Severity:** HIGH
**Where:** `VALIDATION_CONTRACT.md` VAL-008 and VAL-012; `PRD.md` REQ-005 and REQ-007; `MISSION_CONTEXT.md` assumptions A3 and A4
**The problem:** VAL-008 says L3 preserves facts from "pre-rebuild" content, but the packet does not define a frozen baseline artifact. The same implementation edits the canonical fields that would otherwise be the comparison source. VAL-012 says every claim traces to canonical fields, but free-authored prose has no machine-readable claim boundary or source ID. A test that only checks that beat strings occur in the newly edited canonical fields proves self-consistency, not preservation or truth.
**Failure scenario:** An author drops a costly tradeoff from a landmark while rewriting the canonical module. The generated L3 beat matches the new module exactly, so provenance passes. Because the old module was overwritten and no baseline fact inventory exists, VAL-008 has nothing stable to compare and the lost fact ships.
**Recommended fix:** Generate and check in an immutable pre-rebuild fact inventory keyed by region, landmark, field, and source URL before any canonical rewrite. Require new beat claims to carry structured fact IDs. VAL-008 should compare required old fact IDs to L3 coverage, and VAL-012 should reject claim-bearing content with no valid fact ID instead of attempting semantic inference from prose.
**status:** deferred — baseline fact inventory not added to planning; VAL-008/VAL-012 check against current canonical fields only, not pre-rebuild baseline.

### F-011 — The visual VALs can pass with invisible effects
**Severity:** HIGH
**Where:** `VALIDATION_CONTRACT.md` VAL-030 through VAL-032; `PRD.md` testing decisions; `EXECUTION_PLAN.md` visual proof rule
**The problem:** VAL-030 only checks distinct `data-effect` values. VAL-031 allows a class or data-attribute delta as proof that the Pixi map visibly changed. VAL-032 does not define what rendered difference is measured. A hidden element, zero-opacity sprite, unchanged Pixi canvas, or CSS class with no rule satisfies those verifiers. The packet says rendered proof is mandatory but names no evidence for correct, wrong, reduced-motion, stage evolution, or the no-canvas fallback.
**Failure scenario:** An implementation dispatches all six effect state names and updates a region data attribute, but a z-index error hides the effects and the Pixi drawing code never consumes the attribute. E2E is green. The only required screenshot is a returning-player map state, so the broken reward loop reaches final review without visual evidence.
**Recommended fix:** Require rendered before-and-after evidence at 1024 by 640 and 1440 by 900 for every board tier and core reaction, plus the `?nocanvas=1` fallback and reduced-motion state. Use pixel or screenshot diffs with stable seeded data where practical, and retain named manual evidence for subjective legibility. Metadata can select a state; it cannot prove the state is visible.
**status:** accepted — new VAL-063 requires measurable rendered changes (computed style or bounding-box delta), not just data attributes.

### F-012 — Per-island fan-out is not file-disjoint in the actual build
**Severity:** HIGH
**Where:** `EXECUTION_PLAN.md` execution rules and M4 through M6; `AGENT_ROSTER.md` parallelism rule; actual `scripts/build-manifest.ts`, `src/content/index.ts`, `src/content/regions.ts`, and `public/content-manifest.v1.json`
**The problem:** Editing existing landmark modules can be disjoint by island, and `src/content/index.ts` does not need a new import for those edits. The required build is not disjoint. Every `build:manifest` run writes the same `public/content-manifest.v1.json`, and it embeds the current time unless `SOURCE_DATE_EPOCH` is supplied. Parallel workers therefore dirty and overwrite one shared artifact even when their source files do not overlap. Any island-level metadata placed in `regions.ts`, shared UGC coverage updates, or shared test expectations creates additional collisions the plan does not assign to an integrator.
**Failure scenario:** Database and security workers finish at similar times and both run the required manifest build. The second write replaces the first worker's generated artifact with a different timestamp and whatever source state it observed. Both handoffs claim clean validation, merge order produces a noisy conflict, and the committed manifest can omit or misrepresent one slice.
**Recommended fix:** Give content workers a non-writing island validator and forbid them from staging the generated manifest. Assign `regions.ts`, shared policy files, shared tests, and final manifest generation to one integration slice. Regenerate the manifest once after all island merges with a deterministic `SOURCE_DATE_EPOCH`, then verify its hash and 144-key inventory.
**status:** accepted — EXECUTION_PLAN.md integrator ownership rule; island workers never touch shared registry files.

### F-013 — There is no safe rollback contract for the data-model cutover
**Severity:** HIGH
**Where:** `EXECUTION_PLAN.md` M1, M7, and stop conditions; `PRD.md` implementation and testing decisions; `VALIDATION_CONTRACT.md` VAL-035b through VAL-037
**The problem:** The plan says migrate and assert, but it has no expand-and-contract order, compatibility window, feature flag, pre-migration snapshot artifact, transaction boundary, rollback SQL, or old-application compatibility test. The current app understands one progress row and four unqualified award keys. A schema migration that enables the new app can make the old app unable to read or write, which makes application rollback unsafe even if no data is lost.
**Failure scenario:** The new schema is eventually applied during the separately approved release. A runtime bug forces an application rollback. The old code writes level-less progress into the migrated schema or reads only one of three rows, corrupting or hiding progress. The team cannot restore service without choosing between code rollback and data integrity.
**Recommended fix:** Add a dedicated migration design issue before implementation issues. Specify additive schema first, dual-read or compatibility behavior, deterministic backfill, verification queries, cutover, and removal only in a later release. Include a tested rollback path that leaves new data readable by the old app or explicitly declares the point of no return and requires owner approval there.
**status:** accepted — DATA_MODEL.md section 7 and REQ-029 specify expand-and-backfill rollback contract with tested rollback path.

### F-014 — Anonymous and self-hosted players are absent from the migration proof
**Severity:** HIGH
**Where:** `PRD.md` user stories, REQ-021, and REQ-023; `VALIDATION_CONTRACT.md` VAL-036, VAL-037, and VAL-043; actual `src/components/landmark/Beats/beatStorage.ts`
**The problem:** Existing anonymous progress lives under `ct-beat-progress:{region}/{landmark}` with one strict v1 state and no level. VAL-036 and VAL-037 only exercise database migration. VAL-043 says existing self-host tests still pass, but it does not seed an old localStorage key and prove migration into three level-aware states. The packet's "every existing player" guarantee silently excludes the mode it promises to preserve.
**Failure scenario:** A returning anonymous player has a stamped Git landmark in localStorage. The new client looks for level-qualified keys, finds none, and shows all three levels untouched. Hosted migration tests and XP tests pass because no database row was involved.
**Recommended fix:** Specify a versioned, idempotent client migration that maps the old key to L3 while preserving the original timestamp and facts. Add E2E fixtures for stamped and partial old local states, reload, repeated migration, quota failure, and self-host mode with no database. Keep the old key until successful write and read-back of the new state.
**status:** accepted — DATA_MODEL.md section 9 and new VALs (VAL-057, VAL-058, VAL-059) specify v1-to-v2 client migration with E2E fixtures.

### F-015 — Legacy URL behavior is deliberately ambiguous
**Severity:** HIGH
**Where:** `VALIDATION_CONTRACT.md` VAL-016; `PRD.md` REQ-010 and implementation decisions; `INTERVIEW.md` carried default D5
**The problem:** VAL-016 permits a legacy landmark URL to default to "L1 or the prior equivalent." Those outcomes are materially different. L1 changes the meaning of public and indexed links that currently open the tradeoff content. L3 can bypass the new ramp for a new player. A progress-sensitive choice introduces non-canonical behavior for the same URL. The packet calls URL preservation decided while leaving the actual behavior undecided.
**Failure scenario:** One issue writer assumes legacy URLs redirect to L1. Another writes migration and resume tests assuming they open L3 for existing players. Both implementations satisfy the vague VAL wording in isolation, but navigation, SEO content, sharing, and returning-player resume disagree.
**Recommended fix:** Decide one exact mapping for anonymous new players, anonymous migrated players, authenticated new players, and authenticated migrated players. Specify redirect status, canonical URL, query preservation, and resume behavior. Replace "L1 or the prior equivalent" with one assertion and test all four states.
**status:** deferred — exact legacy URL mapping (L1 vs prior equivalent by player state) deferred to execution; VAL-016 asserts content serves but does not specify routing logic.

### F-016 — Character approval is a prose stop, not a validation gate
**Severity:** HIGH
**Where:** `EXECUTION_PLAN.md` M3; `PRD.md` user stories and stop-and-ask conditions; `VALIDATION_CONTRACT.md` manual gates and definition of done
**The problem:** M3 requires character approval, but there is no REQ or VAL for it, and the definition of done lists only VAL-029, VAL-033, and VAL-053 as manual gates. The detailed silhouette, integer-scale, reaction, and reduced-motion requirements in the creative bible are also not validated. A ledger sentence can be treated as approval without the promised comp sheet or real-size reaction evidence.
**Failure scenario:** A placeholder SUDO div satisfies VAL-017 and toggles `data-reaction`, satisfying VAL-018. The content fan-out begins because M3 is marked complete, even though the owner never saw the cast in motion and the map art was built against an unapproved silhouette.
**Recommended fix:** Add a stable character approval VAL with named evidence: real-size sprite comp, pure-black silhouette test, all shipped reactions, stage and map placements, and reduced-motion final poses. Put that VAL in the definition of done and make its signed result the actual M3 gate.
**status:** accepted — now manual VAL-062 with required evidence: real-size sprite comp, silhouette test, all reactions, stage/map placements, reduced-motion poses.

### F-017 — The packet's 144-run unit hides 720 to 1,152 authored and rendered beats
**Severity:** MEDIUM
**Where:** `EXECUTION_PLAN.md` volume estimate and M4 through M6; `PRD.md` solution; `VALIDATION_CONTRACT.md` VAL-004, VAL-014, and VAL-050 through VAL-053
**The problem:** The count of 144 sequences is arithmetically honest but operationally misleading. The schema requires 5 through 8 beats per sequence, so the real review and rendering surface is 720 through 1,152 beats before counting option labels, per-option feedback, reveal cards, recap bullets, sources, and level furniture. VAL-014 proposes a real page render for every beat at the minimum viewport, but the plan gives no sharding, runtime budget, flake strategy, or content-unit inventory. Calling 126 remaining runs "large but parallel-safe" suppresses the validation and review multiplier.
**Failure scenario:** Issue-writing allocates one issue per island based on 18 runs. Each issue expands into roughly 90 to 144 beat screens plus hundreds of option and feedback strings, generated manifest churn, and a long serial Playwright pass. Workers either exceed context, skip review, or split ad hoc across shared files, defeating the planned boundaries.
**Recommended fix:** Estimate and issue by authored unit, not run count. Check in a per-island matrix of sequences, beats, options, feedback lines, sources, expected screenshots, and validation shards. Define a maximum slice size and a deterministic shard strategy for stage-fit tests before fan-out.
**status:** deferred — per-beat validation budgeting deferred to execution; planning uses 144-sequence count as primary unit, EXECUTION_PLAN.md notes 96 net-new plus 48 re-voiced.

### F-018 — VAL-028 verifies only half of the persistence behavior it asserts
**Severity:** MEDIUM
**Where:** `VALIDATION_CONTRACT.md` VAL-028; `PRD.md` REQ-015; `CREATIVE_BIBLE.md` section 5.1
**The problem:** VAL-028 says mute preference persists through localStorage in self-host mode and through the server in hosted mode. Its verifier tests only localStorage. The creative bible also specifies only `ct-audio` localStorage, and no server field, API, migration, or RLS behavior exists for audio preference. This mismatch is not one of the two contradictions the PRD admits.
**Failure scenario:** Hosted mode stores mute state only in the current browser. The listed test passes. A player signs in on another device, audio behavior resets, and the implementation still claims VAL-028 green because the server-backed half was never exercised.
**Recommended fix:** Decide whether the requirement is same-browser persistence or cross-device hosted persistence. If same-browser is intended, remove the server claim. If cross-device is intended, add the state model, API and RLS contract, hosted test, and merge precedence between server and local preference.
**status:** deferred — hosted audio persistence deferred to v1 cut decision; VAL-028 tests localStorage only, same-browser persistence is v1 assumption per PRD stop-and-ask REQ-012 note.

## Verdict

BLOCKING FINDINGS: 5

The packet is not safe to proceed to issue-writing. Resolve F-001 through F-005 first, then revise the dependent validation and milestone order before decomposing implementation work.
