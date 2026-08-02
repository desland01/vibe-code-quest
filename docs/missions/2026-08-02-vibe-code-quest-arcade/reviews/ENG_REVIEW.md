# Engineering Review

### E-001 — Level is missing from the sequence identity
**Severity:** BLOCKING
**Dimension:** 1. Content model
**Finding:** `BeatSequence` is currently identified only by `regionId` and `landmarkId` (`src/content/beats/schema.ts:60-65`). The registry uses the same two-part key and rejects duplicates (`src/content/beats/index.ts:28-35`). Registering `l1`, `l2`, and `l3` for one landmark without changing this identity will either overwrite a sequence or fail duplicate detection. A level dimension on `BeatSequence` is therefore required regardless of where canonical tier content is authored.
**Recommendation:** Add a shared `LevelId = 'l1' | 'l2' | 'l3'`, require `level` on `beatSequenceSchema`, and key every sequence lookup as `(regionId, landmarkId, level)`. Use nested canonical level fields on each landmark as the authoring source, for example `levels: { l1: ..., l2: ..., l3: ... }`, rather than unrelated flat fields. A required level on `BeatSequence` is the runtime identity for that canonical source, not a competing content store.
**status:** accepted — DATA_MODEL.md decision 1 adds LevelId, required level on beatSequenceSchema, and (regionId, landmarkId, level) registry keys.

### E-002 — The current check beat cannot assess three different levels
**Severity:** HIGH
**Dimension:** 1. Content model
**Finding:** A `check` beat carries no question or options of its own (`src/content/beats/schema.ts:42-54`). `BeatPlayer` renders and grades every check against the one landmark-level `quiz` (`src/components/landmark/Beats/BeatPlayer.tsx:552-625`), and the landmark schema exposes only that one quiz (`src/content/schema.ts:19-27`). Three tier-specific sequences would therefore share the same assessment unless the model changes, which is unsound for vocabulary, concrete decisions, and tradeoffs.
**Recommendation:** Put a required assessment inside each canonical level and either make `check` a typed choice beat or pass a level-specific assessment with the resolved sequence. The server and XP logic should continue to treat the registered sequence as authoritative. Do not infer the assessment from the top-level landmark quiz after level selection.
**status:** accepted — DATA_MODEL.md decision 1 adds required assessment per level; level-specific assessment projected into selected sequence.

### E-003 — M1 cannot require complete tier fields while authoring zero content
**Severity:** HIGH
**Dimension:** 1. Content model
**Finding:** M1 says all 48 landmarks must satisfy non-optional L1 and L2 fields while authoring zero new content (`EXECUTION_PLAN.md:35-45`). Today all 48 modules are statically imported (`src/content/index.ts:1-48`), typed as `Landmark` (`src/content/index.ts:50-60`), and parsed through `landmarkSchema` during every manifest build (`src/content/manifest.ts:7-10`). Making new fields non-optional immediately breaks typecheck and manifest generation until all 48 modules contain real values. Placeholders would satisfy structure while defeating provenance, word-budget, and content-completeness checks.
**Recommendation:** Amend the milestone boundary. M1 may build schemas and validate complete test fixtures, but the production manifest cannot enforce all 48 required level objects until the content migration lands. A safe sequence is: introduce the nested level schema and registry API, migrate Git with strict enforcement, then migrate each island, and finally remove the temporary legacy adapter and enable the global 144-sequence assertion. Do not represent placeholders as finished canonical content.
**status:** accepted — EXECUTION_PLAN.md M1 split into M1a (validators against fixtures, tier fields optional) and M1b (Git reference corpus).

### E-004 — “144 sequences in the manifest” is not defined by the current manifest boundary
**Severity:** MEDIUM
**Dimension:** 1. Content model
**Finding:** The public manifest schema contains version, timestamp, and regions only (`src/content/schema.ts:54-58`). `build-manifest.ts` validates the beat registry, then separately writes the result of `buildContentManifest()` (`scripts/build-manifest.ts:33-45`). `buildContentManifest()` serializes canonical landmarks but no beat registry (`src/content/manifest.ts:5-29`). The packet's 144-sequence assertion can be a build report assertion, but it is not currently a manifest-shape assertion.
**Recommendation:** Define two explicit artifacts: a canonical/server beat registry that must contain 144 `(region, landmark, level)` keys, and a public client manifest that contains only the content needed by map and overview clients. Have `build-manifest.ts` fail unless the registry count is 144, but do not add all rendered sequences to the public manifest merely to make the wording literal.
**status:** accepted — DATA_MODEL.md section 8 separates server-only 144-sequence registry from public manifest; VAL-004 validates registry count as build report.

### E-005 — The progress table cannot store three independent level rows
**Severity:** BLOCKING
**Dimension:** 2. State and resume
**Finding:** Progress is uniquely keyed by `(profile_id, region, landmark)` (`db/migrations/0001_schema.sql:19-27`). `BEAT_PROGRESS_UPSERT_SQL` conflicts on that same tuple (`src/server/beatProgress.ts:94-98`). If three level writes share this row, the first completed level's `checked`, `completed`, and `stampedAt` values will be OR or first-value merged into later levels (`src/server/beatProgress.ts:103-117`). Adding `level` only inside JSON does not change the conflict identity.
**Recommendation:** Add a real `level` column, constrain it to `l1`, `l2`, or `l3`, backfill every existing beat-progress row as `l3`, then replace the unique constraint with `(profile_id, region, landmark, level)`. Update GET and PUT response shapes and every progress query to include level. Keep immutable sequence identity outside `PlayerState`; use a `SequenceRef { regionId, landmarkId, level }` beside the reducer state.
**status:** accepted — DATA_MODEL.md decisions 3 and 4, level column added with level-inclusive unique constraints and L3 backfill.

### E-006 — Local resume needs a versioned, one-time L3 migration
**Severity:** HIGH
**Dimension:** 2. State and resume
**Finding:** The local key is `ct-beat-progress:{regionId}/{landmarkId}` (`src/components/landmark/Beats/beatStorage.ts:8-10`), and the stored state is strictly version 1 (`src/content/beats/schema.ts:94-103`). `BeatPlayer` reads and writes that two-part key on mount and persistence (`src/components/landmark/Beats/BeatPlayer.tsx:173-185`, `src/components/landmark/Beats/BeatPlayer.tsx:206-219`). Simply switching to a three-part key loses anonymous and offline resume state.
**Recommendation:** Introduce `ct-beat-progress:v2:{regionId}/{landmarkId}/{level}`. When an L3 v2 key is absent, read the v1 key, validate it with the old schema, write the equivalent v2 L3 state, and retain the v1 key for rollback. L1 and L2 start empty. Test partial, checked, and completed legacy states, malformed storage, repeated migration, and rollback safety.
**status:** accepted — DATA_MODEL.md section 5 specifies v1-to-v2 migration with v1 key retained; VAL-057 requires idempotent migration across all frontier states.

### E-007 — Monotonic merge is only meaningful within one sequence
**Severity:** HIGH
**Dimension:** 2. State and resume
**Finding:** The pure merge takes the greatest beat index and ORs completion flags (`src/content/beats/schema.ts:118-131`); SQL mirrors those operations (`src/server/beatProgress.ts:103-117`). Beat indexes from L1 and L3 can refer to different beat types and terminal positions, so comparing them across levels is meaningless. A completed eight-beat L3 row merged with a five-beat L1 write would also fail later bounds checks or make L1 appear completed.
**Recommendation:** Preserve the current merge algorithm unchanged inside each four-part progress identity. Change `validateBeatStateWrite` and `resolveProgressWrite` to accept the server-resolved `SequenceRef`, then calculate terminal and check indexes from that exact level sequence. Add integration tests that interleave stale and fresh writes within one level and writes across different levels, proving that cross-level writes never touch one another.
**status:** accepted — DATA_MODEL.md section 3 specifies four-part merge algebra with cross-level isolation; monotonic merge preserved per level.

### E-008 — Level gating must execute inside the authoritative server transaction
**Severity:** BLOCKING
**Dimension:** 3. Level gating
**Finding:** `resolveProgressWrite` currently makes a pure registry and shape decision before the database transaction (`src/server/beatProgress.ts:67-83`, `app/api/progress/route.ts:91-111`). The transaction begins only for the upsert and XP work (`app/api/progress/route.ts:110-123`). L2 and L3 gating depends on the authenticated user's persisted prerequisite rows, so it cannot be enforced by the reducer and cannot be decided by the current pure resolver. A pre-transaction read would also introduce a race between checking the prerequisite and writing the new level.
**Recommendation:** Keep client gating as presentation only. Inside `withUserTransaction`, resolve the server-registered `(region, landmark, level)` sequence, lock or read the prerequisite row under the same transaction, require `completed = true` for L1 before any L2 write and for L2 before any L3 write, then run the level-specific atomic upsert. Apply the same authorization when the server page resolves a requested level, returning the highest unlocked level or a locked response instead of sending playable locked content.
**status:** accepted — DATA_MODEL.md decision 7 implements hosted gating inside same transaction with prerequisite row reads; REQ-006 and VAL-009 enforce transactional gating.

### E-009 — Self-host mode cannot make server-authoritative unlock claims
**Severity:** HIGH
**Dimension:** 3. Level gating
**Finding:** With no database, GET returns no progress (`app/api/progress/route.ts:53-59`) and PUT echoes validated state without persistence (`app/api/progress/route.ts:99-107`). The server therefore has no prerequisite history with which to authorize L2 or L3. The browser's local storage is the only state source in that mode, so the packet's universal server-authority wording and local-only self-host requirement cannot both be literally true.
**Recommendation:** State the mode boundary explicitly. Hosted mode enforces unlocks transactionally on the server. Self-host mode enforces unlocks locally from versioned local progress, while the server still owns sequence existence, level identity, terminal bounds, and beat kind for any request it receives. Add separate hosted and self-host gating tests rather than pretending the same authority model applies to both.
**status:** accepted — DATA_MODEL.md section 4 defines mode boundary explicitly; REQ-006 specifies self-host gating from local progress while server owns sequence shape.

### E-010 — XP award identity will suppress rewards after the first level
**Severity:** BLOCKING
**Dimension:** 4. XP
**Finding:** XP derivation correctly finds scenario and gotcha positions by type within one sequence (`src/server/xp.ts:42-70`), but insertion is idempotent only on `(profile_id, region, landmark, award_key)` (`src/server/xp.ts:83-88`). The database has the same uniqueness constraint (`db/migrations/0009_xp.sql:5-19`). After L1 inserts `check_passed` and `landmark_stamped`, identical L2 and L3 keys will conflict and award nothing. The current schema therefore still caps a landmark at 100, not 300.
**Recommendation:** Add `level` to `xp_awards`, backfill existing awards as `l3`, and use uniqueness `(profile_id, region, landmark, level, award_key)`. Pass the registered level through `deriveXpAwardsForLandmark` and `applyXpAwards`. Keep the existing point values and continue deriving from the server-merged state for the exact level row.
**status:** accepted — DATA_MODEL.md decision 4 adds level column to xp_awards with level-inclusive unique constraints; XP derivation passes registered level.

### E-011 — Byte-identical XP is achievable only if migration does not recompute awards
**Severity:** HIGH
**Dimension:** 4. XP
**Finding:** Current totals are the sum of immutable `xp_awards` rows (`src/server/xp.ts:90-94`), and existing awards were historically backfilled from progress (`db/migrations/0009_xp.sql:40-91`). Re-running award derivation while mapping old stamps to L3 could add rows that were previously absent, changing totals. The packet phrase “grant the L3 award set” is unsafe if interpreted as an insert backfill.
**Recommendation:** Make the migration identity-only for XP: add and backfill `level = 'l3'` on existing award rows without inserting any new award. Backfill the progress row to L3 separately. Snapshot per-profile totals before DDL, run the migration, and assert identical totals and identical award-row points after DDL. New L1 and L2 awards are earned only by future progress writes.
**status:** accepted — DATA_MODEL.md decision 5 mandates identity-only migration; REQ-020 and VAL-035b require zero award insertions and byte-identical totals.

### E-012 — Fixed no-scroll play conflicts with 200 percent text resizing
**Severity:** BLOCKING
**Dimension:** 5. The locked stage
**Finding:** VAL-013 forbids all page scroll and VAL-014 requires the stage itself not to overflow, but both are specified only at normal scale (`VALIDATION_CONTRACT.md:34-40`). The UI can render a prompt, up to four 52-pixel-minimum choices, feedback, and one or more action buttons (`src/components/landmark/Beats/BeatPlayer.tsx:462-666`; `src/components/landmark/Beats/beats.module.css:34-42`, `src/components/landmark/Beats/beats.module.css:58-79`). At 200 percent text size, preserving every label and control in a 640-pixel-high non-scrolling box is not a credible invariant. WCAG 2.2 SC 1.4.4 requires text to reach 200 percent without lost content or functionality, and clipping or obscuring controls is a documented failure: https://www.w3.org/WAI/WCAG22/Understanding/resize-text.
**Recommendation:** Narrow “never scrolls” to the standard 100 percent desktop presentation. At 200 percent text size or browser zoom, switch the play stage to a single-axis accessible overflow mode or a reflowed layout with persistent stage chrome and a scrollable content well. Never clip, scale text back down, or require two-dimensional scrolling. Amend VAL-013 and VAL-014 to test both modes. This accessibility exception preserves the arcade stage at normal scale and satisfies the stronger user need when text is enlarged.
**status:** accepted — VAL-013 implements two-mode scroll contract: no-scroll at 100%, single-axis vertical overflow at 200% with no clipping.

### E-013 — VAL-014 does not exercise the tallest dynamic render states
**Severity:** HIGH
**Dimension:** 5. The locked stage
**Finding:** A beat's height changes after interaction: reveal cards accumulate (`src/components/landmark/Beats/BeatPlayer.tsx:464-469`), feedback is inserted (`src/components/landmark/Beats/BeatPlayer.tsx:596-607`), and the completed recap is replaced by a stamp panel (`src/components/landmark/Beats/BeatPlayer.tsx:438-459`). Measuring one initial render per beat can miss the wrong-answer state, correct-answer state, all-cards-visible state, check explanation, and completed panel. A single `scrollHeight <= clientHeight` assertion also does not prove that transformed effects, focus rings, or fixed stage furniture remain inside the visible content box.
**Recommendation:** Define a deterministic render-state matrix per beat type. Measure the stage and every visible interactive/focusable descendant using bounding rectangles against the stage content box, in addition to `scrollHeight`, `scrollWidth`, body scroll, and active-element visibility. Run at 1024 by 640 at 100 percent, at 200 percent text size, with reduced motion, and with the longest permitted copy for each state.
**status:** accepted — VAL-014 implements render-state matrix covering all dynamic states per beat type with bounding rectangle measurements at 100% and 200%.

### E-014 — The audio engine needs an imperative boundary outside React renders
**Severity:** HIGH
**Dimension:** 6. Audio architecture
**Finding:** The creative contract requires one long-lived context and a 25 ms scheduler (`CREATIVE_BIBLE.md:462-481`). `BeatPlayer` currently owns gameplay transitions and persistence effects in React (`src/components/landmark/Beats/BeatPlayer.tsx:108-133`, `src/components/landmark/Beats/BeatPlayer.tsx:206-285`). Creating oscillators, timers, or the context from render state or per-beat effects would risk duplicate contexts under remounts, scheduler churn, and leaked nodes.
**Recommendation:** Put an imperative `AudioEngine` in a browser-only module with injected clock and audio backend, one lazy context, explicit `unlock`, `setMuted`, `setGameState`, `playSfx`, and `dispose` methods, and a read-only small state snapshot. A thin React provider owns subscription and visible mute state; BeatPlayer emits semantic game events to the engine. Keep scheduled nodes and timers out of React state. In self-host mode, audio works identically and stores mute locally because it has no database dependency.
**status:** deferred — imperative audio engine architecture deferred to execution; VAL-021 through VAL-023 specify Web Audio API constraints but not engine boundary design.

### E-015 — Audio E2E assertions need instrumentation, not audible-output assumptions
**Severity:** MEDIUM
**Dimension:** 6. Audio architecture
**Finding:** VAL-024 through VAL-028 propose testing a public state API, gesture behavior, and persistence (`VALIDATION_CONTRACT.md:57-69`), but no engine test seam is specified. A `data-audio-muted` attribute can prove UI state but cannot prove that `AudioContext.resume()` was not called before a gesture or that scheduler transitions occurred. Browser autoplay policy and headless audio output also make audible-output assertions nondeterministic.
**Recommendation:** Unit-test the engine with fake `AudioContext`, nodes, and clock, including channel stealing, one-context creation, transition timing, mute gain, and cleanup. In Playwright, install a recording `AudioContext` stub before page code, then assert constructor and `resume` call counts, semantic state transitions, visible control behavior, and localStorage across reload. Keep one manual listening gate for actual sound quality.
**status:** deferred — audio instrumentation strategy deferred to execution; VAL-024 through VAL-028 test public state API but not internal engine instrumentation.

### E-016 — Hosted mute persistence is internally inconsistent
**Severity:** MEDIUM
**Dimension:** 6. Audio architecture
**Finding:** The creative engine contract stores mute in localStorage for all modes (`CREATIVE_BIBLE.md:480-481`). VAL-028 says self-host uses localStorage and hosted mode uses the server, but its named automated check covers only localStorage (`VALIDATION_CONTRACT.md:64-68`). No profile field, API contract, migration, or server test is planned for hosted mute state.
**Recommendation:** Choose one contract before issues are written. The smallest sound design is localStorage in both modes, which satisfies persistence across sessions on one browser and keeps audio DB-free. If cross-device hosted mute is required, add the profile schema, API, conflict rule, and integration test explicitly.
**status:** deferred — hosted audio persistence conflicts with v1 cut; PRD.md stop-and-ask conditions note owner decision required before REQ-012/VAL-019 implementation.

### E-017 — Full interactive playthroughs for all 144 sequences do not belong in E2E
**Severity:** HIGH
**Dimension:** 7. Test strategy
**Finding:** The current E2E helper performs a route load plus many visible interactions for one eight-beat sequence (`e2e/beats.spec.ts:91-183`). The production procedure runs Playwright on one worker (`README.md:207-212`). Repeating full playthroughs for 144 sequences would create roughly a thousand browser interactions plus navigation, API, animation, and focus waits, making the gate slow and flaky without adding proportional behavioral coverage.
**Recommendation:** Split the pyramid. Use unit tests for all 144 schemas, provenance, word budgets, XP positions, and gating tables. Use a purpose-built test-only stage gallery that mounts one `BeatPlayer` shell and swaps deterministic sequence and beat states without route navigation; one Playwright spec measures every visual state for stage fit. Keep full E2E playthroughs to one representative L1, L2, and L3 sequence, plus focused legacy URL, migration, resume, keyboard, and hosted gating cases. Set a measured runtime budget after the gallery exists.
**status:** deferred — test strategy for 144 sequences deferred to execution; EXECUTION_PLAN.md volume estimate notes 144 runs but not full-E2E approach.

### E-018 — Per-island fan-out is safe only under a stricter ownership rule
**Severity:** MEDIUM
**Dimension:** 8. Parallelism
**Finding:** Existing island landmark files are disjoint, and `src/content/index.ts` already imports all 48 modules (`src/content/index.ts:1-48`), so nested level content added inside those existing files does not require parallel edits to the central index. However, every build loads every imported landmark (`src/content/manifest.ts:7-10`), while `build-manifest.ts` writes one shared generated file (`scripts/build-manifest.ts:33-45`). A worker branch containing only one migrated island will fail once strict required fields are globally enabled, and concurrent manifest generation creates shared-file churn.
**Recommendation:** Fan out only after the schema and Git tracer are integrated and the remaining island branches can typecheck through an explicit temporary legacy adapter. Give each content worker ownership only of existing files under one `src/content/<island>/` directory. Workers must not edit `src/content/index.ts`, the beat registry, global term lists, or `public/content-manifest.v1.json`. A serial integrator removes the adapter, runs the 144-key validation, and generates the manifest once after all islands merge.
**status:** accepted — EXECUTION_PLAN.md integrator ownership rule; island workers never touch shared registry files.

### E-019 — Canonical level content should not inflate every client route
**Severity:** MEDIUM
**Dimension:** 9. Performance and cost budget
**Finding:** The public manifest currently serializes full landmark objects (`src/content/manifest.ts:19-29`), and the client content module exposes every region from that manifest (`src/lib/content-client.ts:1-7`). `SubMapScene` is a client component receiving a whole region and an optional selected landmark (`src/components/map/SubMapScene.tsx:27-38`). If all tier canonical fields or all 144 rendered sequences are added to the public manifest, map and landmark clients receive content they do not need. Pixi is already lazily imported (`src/components/map/MapCanvas.tsx:93-109`), so the new audio engine should follow the same lazy browser-only pattern.
**Recommendation:** Keep the public manifest as a slim map and overview projection. Keep tier canonical sources and the 144 sequence registry server-only, and serialize only the selected sequence into the landmark page. Add budgets for public manifest bytes, selected route RSC payload, client JavaScript, and steady-state audio node and timer counts. No inherent performance blocker exists for Pixi plus synthesized audio plus CSS animation if these boundaries and budgets are enforced.
**status:** accepted — DATA_MODEL.md section 8 enforces payload budgets: 160KB manifest, 16KB sequence JSON, 24KB RSC payload, 20KB client JS, 8 audio nodes max.

## Design recommendations

1. Model canonical tier content as a required nested `levels` object on each landmark, and independently require `level` on every `BeatSequence` and registry key. Include a level-specific assessment.
2. Make level part of durable identity in both `progress` and `xp_awards`. Backfill existing progress and award rows as L3 without recomputing XP, then use level-specific unique constraints.
3. Enforce hosted level gating inside the same user transaction as the progress upsert. Treat self-host gating as an explicit local-state exception while retaining server authority over registered sequence shape.
4. Amend the locked-stage contract: no scroll at normal desktop scale, single-axis accessible reflow or internal overflow when text is enlarged. Test every tallest dynamic state at 100 and 200 percent.
5. Keep audio as an imperative, injected, browser-only service and split tests by responsibility: pure exhaustive validation, a single browser stage gallery for layout, representative end-to-end journeys, and fake-audio unit tests.

## Verdict

BLOCKING FINDINGS: 5

The product direction is coherent, but the design is not yet sound enough to write implementation issues against. Resolve E-001, E-005, E-008, E-010, and E-012 in the packet first; otherwise issue boundaries will encode incompatible sequence, persistence, XP, and accessibility contracts.
