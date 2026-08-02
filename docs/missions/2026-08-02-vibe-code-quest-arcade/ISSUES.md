# ISSUES — Vibe Code Quest Arcade Rebuild

Mission: `2026-08-02-vibe-code-quest-arcade`
Repo: `/Users/thebeast/code-tutor`

Issue boundaries are decided by the orchestrator. Do not re-shard. Each issue body is
self-sufficient for a fresh agent with no chat history. Read the named artifacts before
starting any issue: [`PRD.md`](./PRD.md), [`VALIDATION_CONTRACT.md`](./VALIDATION_CONTRACT.md),
[`DATA_MODEL.md`](./DATA_MODEL.md), [`EXECUTION_PLAN.md`](./EXECUTION_PLAN.md),
[`CREATIVE_BIBLE.md`](./CREATIVE_BIBLE.md), [`AMENDMENT-A4.md`](./AMENDMENT-A4.md),
and the repo map at [`file:///Users/thebeast/code-tutor/.frugal-fable/mission-arcade/repo-map.md`](file:///Users/thebeast/code-tutor/.frugal-fable/mission-arcade/repo-map.md).

File paths below are relative to the repo root `/Users/thebeast/code-tutor/`.

---

## M0 — Pre-flight (blocking, HITL)

### ISSUE-001 — Apply Amendment A4 to the frozen 2026-07-19 design contract amendment log
**Milestone:** M0
**Label:** HITL
**Depends on:** none
**Covers:** REQ-001..REQ-029 (authorization prerequisite)
**Validated by:** VAL-065 (Amendment A4 present in the frozen contract's amendment log — its absence blocks every downstream issue)
**Files expected to change:** `docs/missions/2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md` (existing)
**Scope:** Append the amendment-log entry drafted in section "Amendment log entry to be appended" of `AMENDMENT-A4.md` to the `## Amendment log` section of the frozen `DESIGN_CONTRACT.md`. Do not modify any other clause in that contract. Do not unfreeze or rewrite it. The entry is the block-quoted text starting with "**A4 (2026-08-02, mission `2026-08-02-vibe-code-quest-arcade`):**" — copy it verbatim. After appending, verify the contract still parses as valid Markdown and the amendment log now contains A1, A3, and A4.
**Acceptance criteria:**
- The A4 log entry appears verbatim in `DESIGN_CONTRACT.md` under `## Amendment log`.
- No existing clause in `DESIGN_CONTRACT.md` is modified, deleted, or reordered.
- `AMENDMENT-A4.md` itself is unchanged (it records "Status: Applied" only if the owner directs a status flip; otherwise leave as-is and note application in WORK_LEDGER).
- Record the application in `WORK_LEDGER.md` with a dated entry.
**Out of bounds:** Do not touch any clause other than the amendment log. Do not edit `AMENDMENT-A4.md`'s body. Do not start any other issue until this one is closed.

### ISSUE-002 — Clean the working tree by provenance and re-establish the axe accessibility baseline
**Milestone:** M0
**Label:** HITL
**Depends on:** ISSUE-001
**Covers:** REQ-022
**Validated by:** VAL-042
**Files expected to change:** `docs/missions/2026-07-10-code-tutor-v1/evidence/ISSUE-013/axe-report.json` (existing), `docs/missions/2026-08-02-vibe-code-quest-arcade/` (this packet, untracked), `WORK_LEDGER.md` (existing), and any file the provenance audit determines is owned by this mission
**Scope:** Run `git status` and classify every dirty/untracked file by provenance using the table in `EXECUTION_PLAN.md` M0. Stage and commit ONLY files this mission owns. For the axe baseline at `docs/missions/2026-07-10-code-tutor-v1/evidence/ISSUE-013/axe-report.json` (itself modified): determine what changed (diff against `HEAD`), re-run the axe scan on the current build at the same URL if the modification is stale, and commit a trusted baseline. For the 24 evidence PNGs across three prior missions: classify each — if a re-render artifact, regenerate from the build; if a real change, investigate. For Constance harness files (`.claude/commands/constance-install.md`, `constance-report.html`, `constants.md.reground-log.jsonl`, `CLAUDE.md`): STOP — these are foreign WIP; confirm with the owner whether a parallel session owns them before touching any. For `public/content-manifest.v1.json`: it is a build artifact; do not hand-edit; let `npm run build:manifest` regenerate it. Record per-file provenance in the commit message and `WORK_LEDGER.md`.
**Acceptance criteria:**
- Every dirty file is classified: committed (this mission), committed (foreign, owner-confirmed), left untouched (foreign, unconfirmed), or regenerated (build artifact).
- The axe baseline `axe-report.json` is trusted: either reverted to `HEAD` version if the modification was accidental, or re-generated from a fresh scan and committed with the scan date recorded.
- The commit message and `WORK_LEDGER.md` entry list every file touched with its provenance classification.
- `npm run typecheck && npm run lint && npm run test && npm run build` all pass after cleanup.
**Out of bounds:** NEVER run `git add -A` or `git add .` — blanket staging is forbidden. Do not stage Constance harness files unless the owner confirms this session owns them. Do not delete any file you did not create. Do not force-push. Do not touch `main` branch protection.

---

## M1a — Schema, data model, and validators against fixtures (NO production content authored)

### ISSUE-003 — Level identity in the content model
**Milestone:** M1a
**Label:** AFK
**Depends on:** ISSUE-001, ISSUE-002
**Covers:** REQ-001, REQ-002, REQ-005, REQ-007
**Validated by:** VAL-001, VAL-002, VAL-003, VAL-004, VAL-008, VAL-011, VAL-012, VAL-056
**Files expected to change:** `src/content/schema.ts` (existing), `src/content/beats/schema.ts` (existing), `src/content/beats/index.ts` (existing), `src/content/beats/derive.ts` (existing), `src/content/index.ts` (existing), `src/content/manifest.ts` (existing), `scripts/build-manifest.ts` (existing), `src/lib/content.ts` (existing), `src/lib/content-client.ts` (existing), `src/__tests__/regions.test.ts` (existing), `src/__tests__/beats.test.ts` (existing)
**Scope:** Implement the type definitions from `DATA_MODEL.md` §1: `LevelId`, `levelIdSchema`, `assessmentSchema`, `levelContentSchema`, `landmarkLevelsSchema`, `canonicalLandmarkSchema`, the `L3_SHAPE` constant, and the extended `beatSequenceSchema` with required `level`, `assessment`, three-part identity, the pinned L3 shape `superRefine`, and the `SequenceRef` type. Update `src/content/beats/index.ts` to build 144-key registry lookups keyed by `${regionId}/${landmarkId}/${level}` (currently two-part at line 27). Split `src/content/schema.ts` into canonical landmark schema (with nested `levels`) and a separate public projection schema. The new tier fields on `landmarkSchema` are OPTIONAL at this milestone — validators run against a small checked-in fixture corpus, not production content. Update `src/content/manifest.ts` and `scripts/build-manifest.ts` to project only public overview data (no `levels`, no assessments, no answer keys) and validate 144 server keys separately from manifest generation. Remove `deriveBeatSequence()` export and all call sites (REQ-007). Add the `SequenceRef`-accepting registry API.
**Acceptance criteria:**
- `npm run typecheck` passes with no dangling `deriveBeatSequence` imports.
- `npm run test` passes: `src/__tests__/regions.test.ts` asserts landmarks with missing tier fields are rejected (VAL-001), manifest build fails on missing fields (VAL-002), every landmark exposes exactly 3 sequences (VAL-003). The 144-count assertion (VAL-004) is NOT required yet — fixtures only.
- `npm run test` passes: `src/__tests__/beats.test.ts` asserts `deriveBeatSequence` is no longer exported (VAL-011), tier-aware provenance rejects facts absent from canonical fields (VAL-012), L3 sequences match pinned `L3_SHAPE` (VAL-056), L3 sequences preserve canonical facts (VAL-008).
- A checked-in fixture corpus exists under `src/content/__fixtures__/` with at least one complete landmark (all three levels) for testing.
- `npm run build:manifest` succeeds against the fixture corpus.
**Out of bounds:** Do not author production landmark content (no changes to `src/content/{languages,databases,...}/*.ts` landmark files). Do not write the 144-count gate as a hard requirement yet. Do not touch the database layer (that is ISSUE-004). Do not touch server progress/XP code (ISSUE-005, ISSUE-006).

### ISSUE-004 — Database expand migration
**Milestone:** M1a
**Label:** AFK
**Depends on:** ISSUE-003
**Covers:** REQ-006, REQ-020, REQ-021, REQ-024, REQ-029
**Validated by:** VAL-060 (rollback contract), VAL-045 (monotonic merge still holds per level); integration assertions deferred to ISSUE-032 with live DB
**Files expected to change:** `db/migrations/0011_arcade_level_expand.sql` (new), `db/migrations/0012_arcade_level_cutover.sql` (new), `src/server/beatProgress.ts` (existing), `app/api/progress/route.ts` (existing)
**Scope:** Create the two migration files exactly as specified in `DATA_MODEL.md` §2. `0011_arcade_level_expand.sql` adds the `level` column to `progress` and `xp_awards` (backfilled to `'l3'`, `NOT NULL`, `DEFAULT 'l3'`), adds `CHECK` constraints, adds the new four-part unique constraints WHILE RETAINING the old three-part constraints (compatibility window), updates RLS policies to include `level IN ('l1','l2','l3')`, and creates the `reject_progress_identity_change()` trigger function and `progress_identity_immutable` trigger. `0012_arcade_level_cutover.sql` drops the old three-part constraints (runs only after cutover approval). Update `BEAT_PROGRESS_UPSERT_SQL` in `src/server/beatProgress.ts` to the four-part conflict identity from `DATA_MODEL.md` §3. Update `app/api/progress/route.ts` GET/PUT to thread `level` through all queries, params, and response types. Existing migration files (`0001` through `0010`) are immutable — do not modify them.
**Acceptance criteria:**
- Both migration files exist and match the SQL in `DATA_MODEL.md` §2 exactly.
- `0011` retains old three-part unique constraints (rollback window). `0012` drops them.
- `npm run typecheck` passes with the updated `BEAT_PROGRESS_UPSERT_SQL` and route types.
- A unit test in `src/__tests__/beatProgress.server.test.ts` validates the four-part conflict target SQL string and the identity-immutability trigger logic conceptually (full DB integration is ISSUE-032).
- The identity-immutability trigger function rejects changes to `(profile_id, region, landmark, level)`.
**Out of bounds:** Do not run `npm run test:db` or `npm run test:rls` without the preflight from ISSUE-010. Do not modify existing migration files. Do not run `0012` — it is cutover-only (ISSUE-032). Do not author production content.

### ISSUE-005 — Server level gating and the self-host mode boundary
**Milestone:** M1a
**Label:** AFK
**Depends on:** ISSUE-003, ISSUE-004
**Covers:** REQ-006, REQ-023, REQ-024
**Validated by:** VAL-009, VAL-010, VAL-043, VAL-046, VAL-054, VAL-059
**Files expected to change:** `src/server/beatProgress.ts` (existing), `app/api/progress/route.ts` (existing), `app/map/[region]/[landmark]/page.tsx` (existing), `src/__tests__/beatProgress.server.test.ts` (existing), `e2e/beats.spec.ts` (existing)
**Scope:** Implement hosted-mode gating per `DATA_MODEL.md` §4: move sequence resolution and prerequisite reads INSIDE `withUserTransaction` (currently the route resolves before opening the transaction at `app/api/progress/route.ts:91`). The transaction: authenticates and parses `SequenceRef`, resolves the server registry entry, reads all progress rows for the same profile/region/landmark with `FOR SHARE`, computes highest unlock (L1 open; completed L1 opens L2; completed L2 opens L3; existing L3 row grandfathers `highestUnlocked = L3` per the legacy rule), rejects writes above unlock with `423` and `{ error: 'Level locked', requestedLevel, highestUnlockedLevel }`, validates state against the selected sequence's terminal/check/kind bounds, then runs the four-part upsert. Implement the self-host mode boundary (`DATA_MODEL.md` §4 "Anonymous and self host mode"): server resolves sequence existence, identity, level, terminal bounds, and beat kind for every request but never claims to verify the locally held prerequisite. The page resolver uses the same transaction and unlock function; with no requested level it returns the highest unlocked level; with a locked level it returns a locked response and serializes no playable sequence. An anonymous local L3 state does NOT grant hosted L3 after sign-in (VAL-059).
**Acceptance criteria:**
- `npm run test` passes: `src/__tests__/beatProgress.server.test.ts` rejects progress writes to a locked level (VAL-009), validates the server owns beat kind and level state (VAL-046), grandfathers legacy L3 without synthesizing L1/L2 (VAL-054), and rejects anonymous local L3 promotion to hosted (VAL-059).
- `npm run test` passes: `src/__tests__/hosting.test.ts` confirms self-host mode hides server features without breaking (VAL-043).
- `npm run test:e2e` passes: `e2e/beats.spec.ts` confirms all 48 landmark URLs resolve with zero progress (VAL-010).
- The transaction order matches `DATA_MODEL.md` §4 steps 1–8 exactly.
**Out of bounds:** Do not touch XP derivation (ISSUE-006). Do not touch localStorage migration (ISSUE-007). Do not author production content. Do not run `test:db`/`test:rls` without ISSUE-010 preflight.

### ISSUE-006 — Per-level XP identity and the identity-only XP migration
**Milestone:** M1a
**Label:** AFK
**Depends on:** ISSUE-004, ISSUE-005
**Covers:** REQ-020, REQ-021
**Validated by:** VAL-034, VAL-035
**Files expected to change:** `src/server/xp.ts` (existing), `src/__tests__/xp.test.ts` (existing), `app/api/progress/route.ts` (existing)
**Scope:** Thread `level` through XP lookup, derivation, insertion, and return rows per `DATA_MODEL.md` §3. The XP insert becomes the five-column conflict identity `(profile_id, region, landmark, level, award_key)` with `ON CONFLICT DO NOTHING`. Award derivation continues to find scenario and gotcha positions by beat type in the exact selected sequence (`src/server/xp.ts:42`), then writes that sequence's `level` column. Keep the four unqualified award keys (`scenario_solved`, `gotcha_solved`, `check_passed`, `landmark_stamped`) and fixed point values unchanged. The cap is per-level (100 per level, 300 per landmark across L1+L2+L3). The migration is IDENTITY-ONLY: adds and backfills the `level` column on existing award rows, inserts zero new rows, deletes zero, and preserves `awarded_at`. A profile with an incomplete historical award ledger is NOT topped up.
**Acceptance criteria:**
- `npm run test` passes: `src/__tests__/xp.test.ts` derives per-level awards correctly (VAL-034), caps at 100 per level and 300 per landmark (VAL-035), and existing award tests still pass.
- The XP insert SQL matches `DATA_MODEL.md` §3 exactly (five-column conflict target).
- No new award key variants (`l1_`, `l2_`, `l3_` prefixed) are introduced — the existing four unqualified keys remain the only valid award keys.
- The migration SQL in `0011` contains no `INSERT INTO xp_awards`.
**Out of bounds:** Do not run `test:db` without ISSUE-010. Do not change point values. Do not add an XP difficulty multiplier (cut in §8.1 item 6). Do not author production content.

### ISSUE-007 — localStorage v2 keys and the one-time v1-to-L3 migration
**Milestone:** M1a
**Label:** AFK
**Depends on:** ISSUE-003
**Covers:** REQ-021
**Validated by:** VAL-057, VAL-058
**Files expected to change:** `src/components/landmark/Beats/beatStorage.ts` (existing), `src/__tests__/beatReducer.test.ts` (existing), `src/__tests__/beatStorage.test.ts` (new)
**Scope:** Implement the localStorage v2 key scheme from `DATA_MODEL.md` §5. New key format: `ct-beat-progress:v2:{regionId}/{landmarkId}/{level}`. The value remains the strict `BeatProgressState` with `v: 1` — `level` is never inside the JSON. On an L3 read only, if the v2 key is absent: read the v1 key `ct-beat-progress:{regionId}/{landmarkId}` without deleting it, parse and validate with the existing strict v1 schema, if invalid return empty progress and retain original bytes with no write, if valid write the same fields to the v2 L3 key, read back and require deep equality, and retain the v1 key permanently through the rollback window. If the v2 write or read-back fails, use valid v1 state in memory, leave v2 absent, retain v1, retry next mount. If a valid v2 key exists, it wins and migration does not run. L1 and L2 never read v1 and start empty.
**Acceptance criteria:**
- `npm run test` passes: the migration is idempotent across partial frontier (0–7), checked state, completed state, malformed JSON, schema-invalid JSON, storage read failure, quota write failure, read-back failure, repeated migration, existing v2 key, and rollback to a v1-only client (VAL-057).
- `npm run test:e2e` passes: anonymous/self-hosted v1 local progress migrates to v2 L3 and is retained across reload (VAL-058).
- The v1 key is NEVER deleted by the migration.
- `level` never appears inside the persisted JSON value.
**Out of bounds:** Do not change the `BeatProgressState` JSON shape (it stays `v: 1`). Do not migrate L1 or L2 from v1 (they start empty). Do not touch server progress code. Do not author production content.

### ISSUE-008 — The copy enforcement suite
**Milestone:** M1a
**Label:** AFK
**Depends on:** ISSUE-003
**Covers:** REQ-009, REQ-027
**Validated by:** VAL-014b, VAL-050, VAL-051, VAL-052
**Files expected to change:** `src/__tests__/beats.test.ts` (existing), `src/content/beats/derive.ts` (existing), `scripts/build-manifest.ts` (existing)
**Scope:** Build four mechanical enforcement checks that fail the build, per `CREATIVE_BIBLE.md` §6 and `EXECUTION_PLAN.md` "Enforcement before content": (1) Word-budget test — every beat's `prompt` and option labels are within the per-beat-type ceilings in `CREATIVE_BIBLE.md` §6.3 (hook 14w, predict 16w, reveal 18w/card, scenario 28w, options 9w, gotcha 14w, default 20w, check 16w, recap 10w/bullet, feedback 12w after verdict, subtitle 14w). (2) Banned-phrase test — no beat contains any phrase from `CREATIVE_BIBLE.md` §6.2 DO NOT list (the coursework tics: "this approach", "holds up under real use", "Which move fits best?", trailing coach-isms, double abstract nouns, semicolon splices, hedge adverbs, banned words, em-dash chains, colon-crutch prompts, etc.). (3) Reading-level ceiling test — no beat exceeds the configured grade level (use a reading-level library; set the ceiling to grade 8). (4) Fast-fail manifest guard — `npm run build:manifest` exits non-zero when a beat exceeds the per-beat-type word budget (VAL-014b). Replace the `FACTORY_FRAMING` allowlist in `derive.ts` with the new framing phrases and verdict leads from §6.1 and §6.4. The tier-aware provenance check (VAL-012) was implemented in ISSUE-003; this issue adds the voice-specific checks on top.
**Acceptance criteria:**
- `npm run test` passes: `src/__tests__/beats.test.ts` enforces word budgets per beat type (VAL-050), banned phrases (VAL-051), and reading-level ceiling (VAL-052).
- `npm run build:manifest` exits non-zero when a fixture beat exceeds its word budget (VAL-014b).
- The banned-phrase list is checked into the test file or a shared constant, sourced from §6.2.
- The verdict-lead allowlist is exactly `Yep.` / `Not that one.` / `Noted.` (§6.1 rule 8).
**Out of bounds:** Do not author production content (validate against fixtures only). Do not change the stage-fit e2e harness (ISSUE-009). Do not touch the beat schema structural rules (ISSUE-003 owns those).

### ISSUE-009 — The stage-fit harness
**Milestone:** M1a
**Label:** AFK
**Depends on:** ISSUE-003
**Covers:** REQ-008, REQ-009
**Validated by:** VAL-013, VAL-014, VAL-014b
**Files expected to change:** `e2e/stage-fit.spec.ts` (new), `e2e/beats.spec.ts` (existing)
**Scope:** Create `e2e/stage-fit.spec.ts` implementing the two-mode scroll contract and the render-state matrix from `VALIDATION_CONTRACT.md` VAL-013 and VAL-014. Mode 1 (100% presentation): assert `document.body.scrollHeight <= window.innerHeight` at 1024×640 and 1440×900 — no page scroll, single fixed stage. Mode 2 (200% text size): the stage switches to single-axis VERTICAL overflow with persistent stage chrome; assert no clipping, no text downscale, no two-axis scrolling, and every focusable descendant's bounding rectangle is inside the reachable scroll area. The render-state matrix covers, per beat type, at minimum: initial render, wrong-answer feedback shown, correct-answer feedback shown, all reveal cards visible, check explanation shown, and completed stamp panel. For each state, measure the stage and every visible focusable descendant via bounding rectangles against the stage content box. Run at 1024×640 at 100%, at 200% text size, with `prefers-reduced-motion: reduce`, and with the longest permitted copy per state. This harness runs against fixture content (the same fixture corpus from ISSUE-003), not production content.
**Acceptance criteria:**
- `e2e/stage-fit.spec.ts` exists and passes at 1024×640 and 1440×900 for Mode 1 (VAL-013).
- The render-state matrix iterates every beat type and every named render state, asserting no overflow at 100% and correct vertical-only reflow at 200% (VAL-014).
- All measurements use real rendered DOM (`getBoundingClientRect`, `scrollHeight`/`clientHeight`), not string-length estimates.
- Reduced-motion path is tested.
**Out of bounds:** Do not author production content. Do not implement the stage shell itself (that is ISSUE-015 — this issue writes the test that the shell must pass). Do not touch unit test files.

### ISSUE-010 — DB-test preflight
**Milestone:** M1a
**Label:** AFK
**Depends on:** ISSUE-004
**Covers:** REQ-024
**Validated by:** VAL-064
**Files expected to change:** `src/__tests__/withNeonBranch.test.ts` (existing), `scripts/with-neon-branch.mjs` (existing)
**Scope:** Implement a preflight that refuses to run `npm run test:db` and `npm run test:rls` unless `TEST_DATABASE_URL` points at a proven disposable or local database, or an owner-approved ephemeral branch operation is recorded for that run. The preflight must check before the Neon branch creation at `scripts/with-neon-branch.mjs:76-77` (which hard-codes a Neon org and project and creates a real branch when `TEST_DATABASE_URL` is absent). If no proven disposable target and no recorded approval exist, the preflight exits non-zero with a clear message. Cleanup failure (branch not deleted after test) must fail the gate, not warn.
**Acceptance criteria:**
- `npm run test` passes: `src/__tests__/withNeonBranch.test.ts` asserts the preflight refuses to run without a proven disposable target or recorded owner approval, and that cleanup failure fails the gate (VAL-064).
- Running `npm run test:db` without `TEST_DATABASE_URL` or recorded approval exits non-zero before any Neon branch is created.
- The existing `withNeonBranch.test.ts` regression assertions still pass.
**Out of bounds:** Do not remove or weaken the existing Neon branch creation logic. Do not run `test:db` or `test:rls` live in this issue. Do not modify migration files.

### ISSUE-011 — Landmark aggregate facts must not triple count across three level rows
**Milestone:** M1a
**Label:** AFK
**Depends on:** ISSUE-005
**Covers:** REQ-021
**Validated by:** VAL-055
**Files expected to change:** `app/map/[region]/[landmark]/page.tsx` (existing), `src/lib/collectibles.ts` (existing), `src/components/map/SubMapScene.tsx` (existing), `src/__tests__/collectibles.test.ts` (existing), `src/__tests__/regions.test.ts` (existing)
**Scope:** Fix the triple-counting bug documented in `DATA_MODEL.md` ADDITIONAL CONSEQUENCES ("Landmark aggregate facts must not triple count"). The page currently increments the region stamp count once per completed progress row (`app/map/[region]/[landmark]/page.tsx:80`); three level rows would allow a count of 18 in a six-landmark region. Region stamp counts and collectible ownership must remain LANDMARK-level facts: count distinct landmark IDs for which any level is completed. The collectible helper at `src/lib/collectibles.ts:394` must explicitly OR across levels. Update `SubMapScene.tsx` response item parsing to handle level-aware progress and deduplicate landmark completion across level rows.
**Acceptance criteria:**
- `npm run test` passes: `src/__tests__/collectibles.test.ts` and `src/__tests__/regions.test.ts` assert region stamp count never exceeds landmark count (6 max) and collectibles deduplicate across level rows (VAL-055).
- A region with all three levels completed on all 6 landmarks reports exactly 6 stamps, not 18.
- XP remains level-specific (this fix is about aggregates only).
**Out of bounds:** Do not change XP per-level logic (ISSUE-006). Do not author production content. Do not change the region/landmark count.

---

## M1b — The Git reference corpus (voice reference for everything after)

### ISSUE-012 — Git L3 re-voice (6 runs) plus normalizing the two hand-authored sequences
**Milestone:** M1b
**Label:** AFK
**Depends on:** ISSUE-003, ISSUE-008, ISSUE-009
**Covers:** REQ-005, REQ-007, REQ-027
**Validated by:** VAL-008, VAL-011, VAL-012, VAL-050, VAL-051, VAL-052, VAL-056
**Files expected to change:** `src/content/git/commits-as-checkpoints.ts` (existing), `src/content/git/branches-as-isolation.ts` (existing), `src/content/git/pull-requests-and-review.ts` (existing), `src/content/git/merge-conflicts.ts` (existing), `src/content/git/working-tree-hygiene.ts` (existing), `src/content/git/revert-and-recovery.ts` (existing), `src/content/git/beats/commits-as-checkpoints.ts` (existing), `src/content/security/beats/trust-boundaries.ts` (existing)
**Scope:** Re-voice all 6 Git L3 sequences through the enforcement suite from ISSUE-008. Each L3 run must preserve every canonical fact from its landmark's pre-rebuild tradeoff content (no field dropped), use the deadpan/dry voice from `CREATIVE_BIBLE.md` §6, honor the `L3_SHAPE` pinned beat IDs and types, and pass word-budget, banned-phrase, reading-level, and tier-aware provenance checks. Apply the specific before/after rewrites from §6.4 items 7–8 (branches-as-isolation hook and gotchas[1]). Additionally, normalize the two hand-authored sequences (`src/content/git/beats/commits-as-checkpoints.ts` and `src/content/security/beats/trust-boundaries.ts`) onto the pinned L3 beat IDs from `L3_SHAPE` — their bespoke predict/scenario/default IDs would otherwise drift XP award thresholds (`DATA_MODEL.md` ADDITIONAL CONSEQUENCES: "L3 beat types must be pinned with IDs"). The copy remains hand-authored; only the beat IDs change to match the derived factory tuple. Remove `deriveBeatSequence()` for Git (it was removed globally in ISSUE-003; confirm no Git-specific call sites remain).
**Acceptance criteria:**
- All 6 Git L3 runs pass every enforcement check: word budget (VAL-050), banned phrases (VAL-051), reading level (VAL-052), tier-aware provenance (VAL-012), L3 canonical fact preservation (VAL-008), `L3_SHAPE` pin (VAL-056).
- The two hand-authored sequences use the pinned L3 beat IDs (`hook`, `predict-core`, `reveal-definition`, `scenario-default`, `gotcha-trap`, `default-commit`, `check-quiz`, `recap`).
- `npm run typecheck && npm run lint && npm run test && npm run build:manifest` all pass.
- `npm run test:e2e` passes: `e2e/stage-fit.spec.ts` confirms all 6 Git L3 beats fit the stage at both viewports and both modes.
**Out of bounds:** Do not author L1 or L2 Git content (ISSUE-013, ISSUE-014). Do not touch other islands' content. Do not change the L3 beat shape. Do not touch shared registry files (`src/content/index.ts`, `src/content/regions.ts`, `src/content/schema.ts`) — integrator-only.

### ISSUE-013 — Git L1 "Name That Thing" (6 runs)
**Milestone:** M1b
**Label:** AFK
**Depends on:** ISSUE-012
**Covers:** REQ-001, REQ-003
**Validated by:** VAL-001, VAL-005, VAL-006
**Files expected to change:** `src/content/git/commits-as-checkpoints.ts` (existing), `src/content/git/branches-as-isolation.ts` (existing), `src/content/git/pull-requests-and-review.ts` (existing), `src/content/git/merge-conflicts.ts` (existing), `src/content/git/working-tree-hygiene.ts` (existing), `src/content/git/revert-and-recovery.ts` (existing), `src/content/beats/ugcTerms.ts` (new)
**Scope:** Author 6 Git L1 sequences ("Name That Thing" — vocabulary tier) using the level names and learning objectives from `CREATIVE_BIBLE.md` §2 Island 6. Each L1 sequence uses only vocabulary-tier beat types (no `tradeoff`, no domain-knowledge `scenario`), names the thing in the first sentence, and covers every documented UGC term on the Git island. Create `src/content/beats/ugcTerms.ts` with the Git terms from the research corpus (`/Users/thebeast/code-tutor/.frugal-fable/mission-arcade/ugc-research.md` findings A3, A4, A16) and their source URLs. The L1 runs must pass all enforcement checks from ISSUE-008.
**Acceptance criteria:**
- All 6 Git L1 runs pass: vocabulary-tier-only beat types (VAL-005), UGC term coverage (VAL-006), word budgets (VAL-050), banned phrases (VAL-051), reading level (VAL-052).
- `src/content/beats/ugcTerms.ts` exists with Git terms and source URLs.
- `npm run typecheck && npm run lint && npm run test && npm run build:manifest` all pass.
- `npm run test:e2e` passes: `e2e/stage-fit.spec.ts` confirms all Git L1 beats fit the stage.
**Out of bounds:** Writes only under `src/content/git/`; never touches `src/content/index.ts`, `src/content/regions.ts`, `src/content/schema.ts`, or the manifest — those are integrator-only, serial, shared files. Do not author L2 Git content (ISSUE-014). Do not touch other islands.

### ISSUE-014 — Git L2 "Pick a Lane" (6 runs) plus prototyping the agent-chat-bubble beat rendering mode
**Milestone:** M1b
**Label:** AFK
**Depends on:** ISSUE-012, ISSUE-013
**Covers:** REQ-004
**Validated by:** VAL-007
**Files expected to change:** `src/content/git/commits-as-checkpoints.ts` (existing), `src/content/git/branches-as-isolation.ts` (existing), `src/content/git/pull-requests-and-review.ts` (existing), `src/content/git/merge-conflicts.ts` (existing), `src/content/git/working-tree-hygiene.ts` (existing), `src/content/git/revert-and-recovery.ts` (existing), `src/components/landmark/Beats/BeatPlayer.tsx` (existing), `src/components/landmark/Beats/beats.module.css` (existing)
**Scope:** Author 6 Git L2 sequences ("Pick a Lane" — agent-decision tier) using the level names and learning objectives from `CREATIVE_BIBLE.md` §2 Island 6. Each L2 sequence contains exactly one agent-decision beat with one `correctOptionId` and per-option `feedback` on every option. L2 choice beats render as a mock agent chat bubble (`AGENT: "I'm going to X. OK?"`) with the options written as things a person would actually type back — this is a rendering contract per §6.1 rule 10, not a style hint. Prototype the agent-chat-bubble rendering mode in `BeatPlayer.tsx` (`CREATIVE_BIBLE.md` §8.5 secondary risk (a): prototype it here before 48 L2 runs are written against it). The bubble must fit within the stage at both viewports.
**Acceptance criteria:**
- All 6 Git L2 runs pass: exactly one decision beat with `correctOptionId` set and per-option feedback (VAL-007), word budgets (VAL-050), banned phrases (VAL-051), reading level (VAL-052).
- The agent-chat-bubble render mode is implemented and renders the `AGENT:` prefix + player-reply options.
- `npm run typecheck && npm run lint && npm run test && npm run build:manifest` all pass.
- `npm run test:e2e` passes: `e2e/stage-fit.spec.ts` confirms the agent-chat-bubble beat fits the stage at both viewports and both modes.
**Out of bounds:** Writes only under `src/content/git/` for content; the `BeatPlayer.tsx` and CSS changes are scoped to the L2 render mode only. Never touches `src/content/index.ts`, `src/content/regions.ts`, `src/content/schema.ts`, or the manifest. Do not touch L1 or L3 Git content. Do not touch other islands.

---

## M2 — One island, end to end (the tracer bullet)

### ISSUE-015 — Locked stage shell, two-mode scroll, routing with the additive level path segment
**Milestone:** M2
**Label:** AFK
**Depends on:** ISSUE-009, ISSUE-012, ISSUE-013, ISSUE-014
**Covers:** REQ-008, REQ-010
**Validated by:** VAL-013, VAL-015, VAL-016
**Files expected to change:** `src/components/landmark/LandmarkView.tsx` (existing), `src/components/landmark/Beats/BeatPlayer.tsx` (existing), `src/components/landmark/Beats/beats.module.css` (existing), `app/map/[region]/[landmark]/page.tsx` (existing), `app/map/[region]/[landmark]/layout.tsx` (existing), `e2e/beats.spec.ts` (existing), `e2e/stage-fit.spec.ts` (existing)
**Scope:** Build the locked landscape stage shell: one fixed, non-scrolling DOM/CSS stage at every supported desktop viewport (1024×640 and 1440×900). The stage holds the beat card center, avatar corner, trail tiles at the bottom, and HUD furniture. Implement the additive level path segment: `/map/[region]/[landmark]` continues to serve content (defaulting to L1 or highest unlocked), and `/map/[region]/[landmark]/l1|l2|l3` is additive — legacy URLs without the segment still resolve. Update `LandmarkView.tsx` to carry `SequenceRef` and key the player by all three identity parts (currently keys by two parts at line 58). The page resolver selects the requested or highest-unlocked level and serializes exactly one `BeatSequence` (never all three).
**Acceptance criteria:**
- `npm run test:e2e` passes: `e2e/beats.spec.ts` confirms all 48 legacy landmark URLs return 200 (VAL-015) and legacy URLs without level segment resolve and serve playable content (VAL-016).
- `npm run test:e2e` passes: `e2e/stage-fit.spec.ts` confirms no page scroll at 100% at both viewports and correct vertical-only reflow at 200% (VAL-013).
- The stage is a single fixed DOM element; beat content, avatar, trail, and HUD live inside it.
- `npm run typecheck && npm run lint && npm run build` all pass.
**Out of bounds:** Do not build the Pixi map changes (ISSUE-020). Do not implement audio (ISSUE-018). Do not implement juice effects (ISSUE-019). Do not author new content beyond Git.

### ISSUE-016 — Title screen and the first-sixty-seconds flow
**Milestone:** M2
**Label:** AFK
**Depends on:** ISSUE-015, ISSUE-017
**Covers:** REQ-028
**Validated by:** VAL-061
**Files expected to change:** `app/page.tsx` (existing), `app/layout.tsx` (existing), `src/components/TitleScreen.tsx` (new), `src/components/landmark/Beats/beats.module.css` (existing), `e2e/first-run.spec.ts` (new)
**Scope:** Implement the first-sixty-seconds flow from `CREATIVE_BIBLE.md` §7. The root route lands the player directly into the title screen (not `/map`). The title screen shows the logo, "Be the human in the loop.", blinking `PRESS ANY KEY`, SUDO idling beside the logo, and a `SOUND: OFF — M` corner chip. Any key/click/tap is the audio-unlock gesture (routes to ISSUE-018's gesture handler). After the gesture, the avatar picker shows (SUDO pre-highlighted, auto-continues on SUDO after 8s), then a hard cut to Git L1 `commits-as-checkpoints` with the level card and the first question. The map is deliberately withheld until after the first stamp. A brand-new player must reach their first correct answer within 60 seconds from landing, with no account, no form, no settings screen, no map decision, and no reading gate before the first interaction.
**Acceptance criteria:**
- `npm run test:e2e` passes: `e2e/first-run.spec.ts` confirms a cold anonymous root visit reaches the first correct answer in under 60 seconds with no signup, form, or reading gate (VAL-061).
- The root route renders the title screen, not `/map`.
- `/map` is reachable only after the first stamp (or directly by URL — it is not removed, just not the default landing).
- `npm run typecheck && npm run lint && npm run build` all pass.
**Out of bounds:** Do not implement audio beyond the gesture hook (ISSUE-018 owns the engine). Do not implement the avatar picker logic beyond what the first-60s flow needs (ISSUE-031 owns the full picker). Do not touch the Pixi map.

### ISSUE-017 — SUDO avatar and the reaction state machine bound to answer outcomes
**Milestone:** M2
**Label:** AFK
**Depends on:** ISSUE-015
**Covers:** REQ-011
**Validated by:** VAL-017, VAL-018
**Files expected to change:** `src/components/Avatar.tsx` (new), `src/components/landmark/Beats/BeatPlayer.tsx` (existing), `src/components/landmark/Beats/beats.module.css` (existing), `public/sprites/sudo-*.png` (new), `e2e/beats.spec.ts` (existing)
**Scope:** Implement the SUDO avatar per `CREATIVE_BIBLE.md` §1. Build the sprite strip PNGs for SUDO's reactions (idle, thinking, correct, wrong, level-clear, island-clear) at 32×32 native grid, rendered at ×2 (64px) in HUD/trail and ×3 (96px) on stamp panel/title. Animation = `background-position` keyframes with `steps(N)` matching the codebase's existing idiom. Bind the reaction state machine to answer outcomes: `data-reaction="celebrate"` on correct answer, `data-reaction="shrug"` on wrong answer. The avatar renders on the play stage (VAL-017) and reacts to the player's answer, never inside the question card. Every reaction is double-coded in posture + prop so it reads without sound and without color. Reduced-motion: every reaction renders its final frame as a static pose. Implement the pure-black silhouette test (all sprites distinguishable as pure black shapes at 32px).
**Acceptance criteria:**
- `npm run test:e2e` passes: `e2e/beats.spec.ts` confirms a visible `[data-avatar]` element on the stage during beat playback (VAL-017) and `data-reaction="celebrate"` on correct / `data-reaction="shrug"` on wrong (VAL-018).
- SUDO sprite strips exist for all shipped reactions at the specified dimensions and frame counts.
- Reduced-motion renders static final-frame poses for every reaction.
- `npm run typecheck && npm run lint && npm run build` all pass.
**Out of bounds:** Do not implement NULL, BOO, or DUCKY (ISSUE-031 for NULL; BOO/DACKY are v1.1 cut). Do not implement the full avatar picker (ISSUE-031). Do not implement audio reactions (ISSUE-018).

### ISSUE-018 — Web Audio engine: main theme with 3 variants, core six SFX, reactive layers, muted-by-default
**Milestone:** M2
**Label:** AFK
**Depends on:** ISSUE-015
**Covers:** REQ-013, REQ-014, REQ-015
**Validated by:** VAL-021, VAL-022, VAL-023, VAL-024, VAL-025, VAL-026, VAL-027, VAL-028
**Files expected to change:** `src/audio/AudioEngine.ts` (new), `src/audio/themes.ts` (new), `src/audio/sfx.ts` (new), `src/components/landmark/Beats/BeatPlayer.tsx` (existing), `src/__tests__/hosting.test.ts` (existing), `e2e/beats.spec.ts` (existing)
**Scope:** Implement the Web Audio engine per `CREATIVE_BIBLE.md` §5. One lazily-created `AudioContext`, master `GainNode` at 0 until opt-in, NES-strict four voices (pulse1, pulse2, triangle, noise), 16th-note grid scheduler with 25ms lookahead. Build the main theme "Insert Coin, Ask Questions" (§5.5) with all three variants (V1 Attract Mode, V2 Bedroom Tape, V3 Final Boss) from the same pattern data with parameter deltas. Build the core six SFX (§5.4): `sfx-correct`, `sfx-wrong`, `sfx-nav`, `sfx-stamp`, `sfx-streak`, `jingle-level`. Implement reactive layers (§5.3): streak ≥3 doubles hats, streak ≥5 adds harmony, streak broken drops layers, wrong answer dips gain to 0.5 for one bar, level complete hard-stops. Audio starts muted on page load, requires a user gesture before producing sound, has a visible working mute control (M key + HUD icon with text label), and persists mute preference in localStorage `ct-audio`. No audio files ship. No runtime dependency added. No `<audio>` elements or `new Audio()`.
**Acceptance criteria:**
- `npm run test` passes: `src/__tests__/hosting.test.ts` confirms no audio files under `public/` (VAL-021), no audio libraries in `package.json` deps (VAL-022), audio code uses `AudioContext` only with no `HTMLAudioElement` or `new Audio()` (VAL-023), mute preference persists in localStorage (VAL-028).
- `npm run test:e2e` passes: `e2e/beats.spec.ts` confirms audio engine exposes distinct music states for streak/wrong/tier/complete (VAL-024), audio is muted on initial page load (VAL-025), no `AudioContext` resumed before user gesture (VAL-026), mute toggle is visible and functional (VAL-027).
- Audio runtime stays within budget: at most 8 live audio nodes and 1 active scheduler timer while playing; zero live nodes and timers after pause or unmount (`DATA_MODEL.md` §8 budget 5).
- All three main theme variants are built from the same pattern data with parameter deltas, not hand-copied.
**Out of bounds:** Do not implement island-specific themes beyond Git (§8.1 cut item 3 — only main theme + git/databases/security themes ship in v1; the others use main theme at island tempo). Do not implement generative/adaptive composition beyond §5.3 layer rules. Do not ship audio files. Do not add audio dependencies.

### ISSUE-019 — Juice: the six effects with reduced-motion fallbacks and measurable rendered visibility
**Milestone:** M2
**Label:** AFK
**Depends on:** ISSUE-015, ISSUE-017
**Covers:** REQ-017, REQ-022
**Validated by:** VAL-030, VAL-063, VAL-040, VAL-041
**Files expected to change:** `src/components/landmark/Beats/BeatPlayer.tsx` (existing), `src/components/landmark/Beats/beats.module.css` (existing), `src/components/Juice.tsx` (new), `e2e/beats.spec.ts` (existing), `e2e/a11y.spec.ts` (existing)
**Scope:** Implement the six juice effects from `CREATIVE_BIBLE.md` §4: answer correct (hitstop + card pop + ✓ stamp + pixel burst + avatar celebrate), answer wrong (card dip + ✗ + avatar shrug, NO shake/flash), streak building (combo badge slides in at streak 3, marching-ants border at 5+), streak broken (badge falls, campfire → embers, no extra sting), level complete (banner stamps in, stage punch, screen shake ±2px, star burst, XP tally, avatar level-clear), island complete (everything from level complete plus shake ±3px, three staggered bursts, banner, inset map cut-in, avatar island-clear). All effects use CSS `steps()` on transform/opacity/background-position — no easing curves, no animation libraries, no JS rAF tweens. Shake and flash fire ONLY on victories. Every effect has a reduced-motion fallback that communicates the outcome via text + icon + border/shape change. Each effect must produce a measurable rendered change (computed style or bounding-box delta), not just a `data-effect` attribute. Particles are fixed sprite strips, max two bursts on screen. XP values rendered are always server-derived — the juice layer never invents numbers.
**Acceptance criteria:**
- `npm run test:e2e` passes: `e2e/beats.spec.ts` confirms six distinct `[data-effect]` classes fire for correct/wrong/streak-build/streak-break/level-complete/island-complete (VAL-030) AND each produces a measurable rendered change (computed style or bounding-box delta) (VAL-063).
- `npm run test:e2e` passes: `e2e/a11y.spec.ts` confirms reduced-motion disables all animations including avatar and juice effects (VAL-040), and no state relies on colour alone — icon or text present (VAL-041).
- No shake or flash fires on a wrong answer or any failure state.
- `npm run typecheck && npm run lint && npm run build` all pass.
**Out of bounds:** Do not implement audio SFX for juice events (ISSUE-018 owns audio). Do not implement map visual changes (ISSUE-020). Do not add animation dependencies. Do not implement long-idle easter eggs (v1.1 cut).

### ISSUE-020 — Board evolution: trail, lanterns, overworld tiers 0-1 for Git, returning-player marker
**Milestone:** M2
**Label:** AFK
**Depends on:** ISSUE-015, ISSUE-017
**Covers:** REQ-018, REQ-019
**Validated by:** VAL-031, VAL-032, VAL-033
**Files expected to change:** `src/components/landmark/Beats/BeatPlayer.tsx` (existing), `src/components/landmark/Beats/beats.module.css` (existing), `src/components/MapExperience.tsx` (existing), `src/components/map/MapCanvas.tsx` (existing), `src/components/map/SubMapScene.tsx` (existing), `e2e/map-top.spec.ts` (existing), `e2e/beats.spec.ts` (existing)
**Scope:** Implement board evolution per `CREATIVE_BIBLE.md` §3. (1) The level stage trail: a horizontal strip of tiles along the stage bottom, one tile per beat (5–8 tiles). The avatar stands on the current beat's tile. Tile states are shape-coded: untouched (flat plank), resolved first-try (plank + lit lantern sprite), resolved after wrong pick (plank + patched board sprite), current (outlined + avatar). Streak set-dressing: campfire at streak 3, flag at streak 5. (2) Overworld island tiers 0–1 for Git only: Tier 0 "Charted" (bare terrain, dashed shoreline, signpost) is default; Tier 1 "Settled" (solid shoreline, dirt path, `L1 ✓` badge) triggers when all 6 Git landmarks' L1 are stamped. Per-landmark structures: empty site → tent (L1 stamped). Structure-rise reveal animation (6 frames, 480ms steps(6)), reduced-motion: instant. (3) Returning-player "you are here" marker: avatar sprite at last-played landmark's structure site with bobbing chevron, `CONTINUE` chip on the island banner. The sr-only region list gains per-island text ("Git — Level 1 complete, 4 of 6 Level 2"). The sub-map landmark cards show three level pips (filled/half/empty). NOTE: `CREATIVE_BIBLE.md` §3 precondition requires the sprite comp sheet before touching `MapCanvas` — confirm it exists from ISSUE-022 (character approval) or produce the island structure sprites from §3.1 specs first.
**Acceptance criteria:**
- `npm run test:e2e` passes: `e2e/map-top.spec.ts` confirms island visual state changes after a level is cleared (VAL-031).
- `npm run test:e2e` passes: `e2e/beats.spec.ts` confirms stage visual state changes after level clear (VAL-032).
- VAL-033 (manual): render `/map` with seeded Git progress at 2 landmarks partially cleared. Evidence: screenshot at 1440×900 saved to `docs/missions/2026-08-02-vibe-code-quest-arcade/evidence/VAL-033-returning-player-desktop.png`. Owner confirms progress is visually obvious without reading any label.
- Tier transitions are readable from structure shapes and text badges, not colour alone.
- `npm run typecheck && npm run lint && npm run build` all pass.
**Out of bounds:** Do not implement tier 2 "Built" or tier 3 "Mastered" (§8.1 cut items 3–4; ship tiers 0–1 only for Git). Do not implement island themes for non-Git islands. Do not implement the L3 dusk stage variant (cut-first order item 5). Do not touch non-Git island map visuals.

---

## M3 — Owner gates (HITL, blocking, all block fan-out)

### ISSUE-021 — Music sampling page and owner variant pick
**Milestone:** M3
**Label:** HITL
**Depends on:** ISSUE-018
**Covers:** REQ-016
**Validated by:** VAL-029
**Files expected to change:** `app/audio-preview/page.tsx` (new), `src/audio/AudioEngine.ts` (new)
**Scope:** Build a sampling page (e.g. `/audio-preview`) that presents every required music variant for owner listening: the main theme V1 "Attract Mode", V2 "Bedroom Tape", and V3 "Final Boss of Not Knowing". Each variant must be individually playable, looped, and clearly labeled with its one-line description from `CREATIVE_BIBLE.md` §5.5. The page must also play the Git island theme for context.
**Acceptance criteria:**
- The sampling page exists and is reachable at `/audio-preview`.
- All three main theme variants are audible and individually distinct.
- VAL-029 (manual): owner reviews the sampling page, confirms every variant is audible and distinct. Evidence: screenshot at 1440×900 saved to `docs/missions/2026-08-02-vibe-code-quest-arcade/evidence/VAL-029-audio-sampling-desktop.png` plus a signed note in `WORK_LEDGER.md` with the chosen variant.
**Owner decision (one sentence):** Which of the three main theme variants (V1 Attract Mode / V2 Bedroom Tape / V3 Final Boss of Not Knowing) should ship as the default main theme?
**Out of bounds:** Do not finalize island themes beyond Git. Do not implement reactive layer changes on the sampling page (it plays base themes only). Do not touch content.

### ISSUE-022 — Character approval render — SUDO and NULL at real size, in motion, every reaction state
**Milestone:** M3
**Label:** HITL
**Depends on:** ISSUE-017
**Covers:** REQ-011, REQ-025
**Validated by:** VAL-062
**Files expected to change:** `public/sprites/sudo-*.png` (existing), `public/sprites/null-*.png` (new), `docs/missions/2026-08-02-vibe-code-quest-arcade/evidence/` (new), `WORK_LEDGER.md` (existing)
**Scope:** Produce the character comp sheet for SUDO and NULL. Render both characters at real size (32×32 native, ×2 and ×3 scale), in motion (every reaction animation playing), in every reaction state (celebrate, shrug, idle, thinking, level-clear, island-clear, reduced-motion final poses). Include the pure-black silhouette test (both characters distinguishable as pure black shapes at 32px). Show stage placement (HUD corner ×2, trail tile ×2, stamp panel ×3, title screen ×3) and map placement (you-are-here marker ×2). Verify no third-party product name appears in any shipped character name, asset, or in-world branding (VAL-047).
**Acceptance criteria:**
- VAL-062 (manual): owner reviews the character comp sheet. Evidence: screenshots saved under `docs/missions/2026-08-02-vibe-code-quest-arcade/evidence/` (real-size sprite comp, pure-black silhouette test, all shipped reactions, stage and map placements, reduced-motion final poses) plus a signed sign-off in `WORK_LEDGER.md`.
- Both characters pass the silhouette test.
- No third-party product name in any shipped string or asset.
**Owner decision (one sentence):** Does the character direction (SUDO and NULL as designed) have owner approval to proceed to content fan-out and map-art implementation?
**Out of bounds:** Do not implement BOO or DUCKY (v1.1 cut). Do not touch content. Do not deploy.

### ISSUE-023 — Voice review of 10 beats sampled from the Git corpus
**Milestone:** M3
**Label:** HITL
**Depends on:** ISSUE-012, ISSUE-013, ISSUE-014
**Covers:** REQ-027
**Validated by:** VAL-053
**Files expected to change:** `WORK_LEDGER.md` (existing)
**Scope:** Select 10 beats from the Git corpus (2 per level tier across different landmarks — e.g. 4 L1 beats from 2 landmarks, 4 L2 beats from 2 landmarks, 2 L3 beats from 2 landmarks) for owner manual review. Present them in a reviewable format (a simple page or a document listing beat ID, level, landmark, and full beat text including prompt, options, feedback, and recap). The owner reviews for tone, clarity, and voice consistency per `CREATIVE_BIBLE.md` §6.
**Acceptance criteria:**
- VAL-053 (manual): owner reviews the 10-beat sample. Evidence: signed note in `WORK_LEDGER.md` with the 10 beat IDs reviewed and pass/fail per beat.
- The sample spans all three level tiers and multiple landmarks.
**Owner decision (one sentence):** Does the voice (deadpan, dry, short — per `CREATIVE_BIBLE.md` §6) have owner approval to proceed to content fan-out across the remaining 7 islands?
**Out of bounds:** Do not author new content. Do not touch other islands. Do not deploy. Nothing fans out before this gate closes.

---

## M4 — Wave 1: databases, security

### ISSUE-024 — Databases island (18 runs: 6 L1 + 6 L2 + 6 L3 re-voice)
**Milestone:** M4
**Label:** AFK
**Depends on:** ISSUE-023
**Covers:** REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-027
**Validated by:** VAL-001, VAL-005, VAL-006, VAL-007, VAL-008, VAL-050, VAL-051, VAL-052, VAL-056
**Files expected to change:** `src/content/databases/sql.ts` (existing), `src/content/databases/nosql-document.ts` (existing), `src/content/databases/vector.ts` (existing), `src/content/databases/graph.ts` (existing), `src/content/databases/orm-vs-raw-sql.ts` (existing), `src/content/databases/hosted-vs-self-hosted-databases.ts` (existing), `src/content/beats/ugcTerms.ts` (existing)
**Scope:** Author 18 Databases runs using the level names and learning objectives from `CREATIVE_BIBLE.md` §2 Island 2. L1 "WHERE THE STUFF LIVES" (6 runs): vocabulary tier, covers documented databases UGC terms (A10, A11, A12 — Supabase/PostgreSQL/Firebase/MongoDB as brand names, table/record/query). L2 "SQL OR NAH" (6 runs): agent-decision beats rendered as agent-chat-bubbles, covers the pick-a-database question, dev-vs-prod distinction, the backup question (B1, B6, B10, C1). L3 "SCHEMA THERAPY" (6 runs): re-voiced tradeoff content preserving every canonical fact, pinned `L3_SHAPE`. Apply the specific before/after rewrites from §6.4 items 9–10 (sql.ts hook and vibe_coder_default). Add databases terms to `src/content/beats/ugcTerms.ts` with source URLs. All runs must pass every enforcement check from ISSUE-008.
**Acceptance criteria:**
- All 18 Databases runs pass: L1 vocabulary-tier-only (VAL-005), L1 UGC term coverage (VAL-006), L2 exactly one decision beat with correctOptionId and per-option feedback (VAL-007), L3 canonical fact preservation (VAL-008), L3 `L3_SHAPE` pin (VAL-056), word budgets (VAL-050), banned phrases (VAL-051), reading level (VAL-052), tier fields present (VAL-001).
- `npm run typecheck && npm run lint && npm run test && npm run build:manifest` all pass.
- `npm run test:e2e` passes: `e2e/stage-fit.spec.ts` confirms all Databases beats fit the stage at both viewports and both modes.
**Out of bounds:** Writes only under `src/content/databases/`; never touches `src/content/index.ts`, `src/content/regions.ts`, `src/content/schema.ts`, or the manifest — those are integrator-only, serial, shared files. Do not touch other islands. Do not touch server/UI code.

### ISSUE-025 — Security island (18 runs: 6 L1 + 6 L2 + 6 L3 re-voice)
**Milestone:** M4
**Label:** AFK
**Depends on:** ISSUE-023
**Covers:** REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-027
**Validated by:** VAL-001, VAL-005, VAL-006, VAL-007, VAL-008, VAL-050, VAL-051, VAL-052, VAL-056
**Files expected to change:** `src/content/security/secrets-and-environment.ts` (existing), `src/content/security/authentication-vs-authorization.ts` (existing), `src/content/security/trust-boundaries.ts` (existing), `src/content/security/input-validation-and-injection.ts` (existing), `src/content/security/dependency-supply-chain.ts` (existing), `src/content/security/least-privilege-blast-radius.ts` (existing), `src/content/security/beats/trust-boundaries.ts` (existing), `src/content/beats/ugcTerms.ts` (existing)
**Scope:** Author 18 Security runs using the level names and learning objectives from `CREATIVE_BIBLE.md` §2 Island 7. L1 "SECRETS ARE CALLED THAT FOR A REASON" (6 runs): vocabulary tier, covers API key/secret/.env terms (A1, A2 — Very High confusion). L2 "THE ALWAYS-ALLOW BUTTON" (6 runs): agent-decision beats, covers reading permission prompts, the three stop words (delete/production/all), saying no as default (A6/B4, C1, C7, C10). L3 "BLAST RADIUS" (6 runs): re-voiced tradeoff content, pinned `L3_SHAPE`. Normalize `src/content/security/beats/trust-boundaries.ts` onto pinned L3 beat IDs (same as Git's commits-as-checkpoints in ISSUE-012). Apply the specific before/after rewrites from §6.4 items 11–12 (secrets-and-environment.ts hook and example). Add security terms to `src/content/beats/ugcTerms.ts` with source URLs. All runs must pass every enforcement check.
**Acceptance criteria:**
- All 18 Security runs pass: VAL-005, VAL-006, VAL-007, VAL-008, VAL-056, VAL-050, VAL-051, VAL-052, VAL-001.
- `trust-boundaries.ts` uses pinned L3 beat IDs.
- `npm run typecheck && npm run lint && npm run test && npm run build:manifest` all pass.
- `npm run test:e2e` passes: `e2e/stage-fit.spec.ts` confirms all Security beats fit the stage.
**Out of bounds:** Writes only under `src/content/security/`; never touches `src/content/index.ts`, `src/content/regions.ts`, `src/content/schema.ts`, or the manifest — those are integrator-only, serial, shared files. Do not touch other islands. Do not touch server/UI code.

---

## M5 — Wave 2: infra, ai-types, languages

### ISSUE-026 — Infra island (18 runs: 6 L1 + 6 L2 + 6 L3 re-voice)
**Milestone:** M5
**Label:** AFK
**Depends on:** ISSUE-023
**Covers:** REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-027
**Validated by:** VAL-001, VAL-005, VAL-006, VAL-007, VAL-008, VAL-050, VAL-051, VAL-052, VAL-056
**Files expected to change:** `src/content/infra/serverless-functions.ts` (existing), `src/content/infra/vps-single-server.ts` (existing), `src/content/infra/containers.ts` (existing), `src/content/infra/edge-compute.ts` (existing), `src/content/infra/static-cdn.ts` (existing), `src/content/infra/managed-platforms.ts` (existing), `src/content/beats/ugcTerms.ts` (existing)
**Scope:** Author 18 Infra runs using the level names and learning objectives from `CREATIVE_BIBLE.md` §2 Island 3. L1 "THE CLOUD IS A BUILDING" (6 runs): vocabulary tier — server, deploy, build, terminal, IDE as plain words (A5, A8, A9, A17). L2 "SHIP IT (BUT WHERE)" (6 runs): agent-decision beats — answering "deploy to X?", recognizing metered vs flat choices (B9, B5, C9). L3 "IT WORKS ON MY MACHINE" (6 runs): re-voiced tradeoff content, pinned `L3_SHAPE`. Add infra terms to `src/content/beats/ugcTerms.ts`. All runs pass every enforcement check.
**Acceptance criteria:**
- All 18 Infra runs pass: VAL-005, VAL-006, VAL-007, VAL-008, VAL-056, VAL-050, VAL-051, VAL-052, VAL-001.
- `npm run typecheck && npm run lint && npm run test && npm run build:manifest` all pass.
- `npm run test:e2e` passes: `e2e/stage-fit.spec.ts` confirms all Infra beats fit the stage.
**Out of bounds:** Writes only under `src/content/infra/`; never touches `src/content/index.ts`, `src/content/regions.ts`, `src/content/schema.ts`, or the manifest — those are integrator-only, serial, shared files. Do not touch other islands. Do not touch server/UI code.

### ISSUE-027 — AI-types island (18 runs: 6 L1 + 6 L2 + 6 L3 re-voice)
**Milestone:** M5
**Label:** AFK
**Depends on:** ISSUE-023
**Covers:** REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-027
**Validated by:** VAL-001, VAL-005, VAL-006, VAL-007, VAL-008, VAL-050, VAL-051, VAL-052, VAL-056
**Files expected to change:** `src/content/ai-types/model-call-vs-agent.ts` (existing), `src/content/ai-types/retrieval-augmented-generation.ts` (existing), `src/content/ai-types/tool-use.ts` (existing), `src/content/ai-types/workflows-vs-agents.ts` (existing), `src/content/ai-types/ai-evals.ts` (existing), `src/content/ai-types/model-selection-routing.ts` (existing), `src/content/beats/ugcTerms.ts` (existing)
**Scope:** Author 18 AI-types runs using the level names and learning objectives from `CREATIVE_BIBLE.md` §2 Island 4. L1 "ROBOT OR AUTOCOMPLETE" (6 runs): vocabulary tier — model call vs agent vs workflow, "hallucination", "tools" (A14, A22). L2 "PICK YOUR FIGHTER" (6 runs): agent-decision beats — matching tool shape to job shape, noticing when an agent is looping and stopping it (B2, B3, B7, C4). L3 "TRUST FALLS" (6 runs): re-voiced tradeoff content, pinned `L3_SHAPE`. Add ai-types terms to `src/content/beats/ugcTerms.ts`. All runs pass every enforcement check.
**Acceptance criteria:**
- All 18 AI-types runs pass: VAL-005, VAL-006, VAL-007, VAL-008, VAL-056, VAL-050, VAL-051, VAL-052, VAL-001.
- `npm run typecheck && npm run lint && npm run test && npm run build:manifest` all pass.
- `npm run test:e2e` passes: `e2e/stage-fit.spec.ts` confirms all AI-types beats fit the stage.
**Out of bounds:** Writes only under `src/content/ai-types/`; never touches `src/content/index.ts`, `src/content/regions.ts`, `src/content/schema.ts`, or the manifest — those are integrator-only, serial, shared files. Do not touch other islands. Do not touch server/UI code.

### ISSUE-028 — Languages island (18 runs: 6 L1 + 6 L2 + 6 L3 re-voice)
**Milestone:** M5
**Label:** AFK
**Depends on:** ISSUE-023
**Covers:** REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-027
**Validated by:** VAL-001, VAL-005, VAL-006, VAL-007, VAL-008, VAL-050, VAL-051, VAL-052, VAL-056
**Files expected to change:** `src/content/languages/javascript-typescript.ts` (existing), `src/content/languages/python.ts` (existing), `src/content/languages/html-css.ts` (existing), `src/content/languages/types-and-contracts.ts` (existing), `src/content/languages/runtimes-and-packages.ts` (existing), `src/content/languages/reading-generated-code.ts` (existing), `src/content/beats/ugcTerms.ts` (existing)
**Scope:** Author 18 Languages runs using the level names and learning objectives from `CREATIVE_BIBLE.md` §2 Island 1. L1 "WHAT EVEN IS CODE" (6 runs): vocabulary tier — what a programming language is, what a file of code is, that one app mixes JS/HTML/CSS (A7, A21). L2 "DON'T JUST NOD" (6 runs): agent-decision beats — the three things a non-coder can check when shown a diff (A15, A19, A14). L3 "STRONGLY TYPED OPINIONS" (6 runs): re-voiced tradeoff content, pinned `L3_SHAPE`. Add languages terms to `src/content/beats/ugcTerms.ts`. All runs pass every enforcement check.
**Acceptance criteria:**
- All 18 Languages runs pass: VAL-005, VAL-006, VAL-007, VAL-008, VAL-056, VAL-050, VAL-051, VAL-052, VAL-001.
- `npm run typecheck && npm run lint && npm run test && npm run build:manifest` all pass.
- `npm run test:e2e` passes: `e2e/stage-fit.spec.ts` confirms all Languages beats fit the stage.
**Out of bounds:** Writes only under `src/content/languages/`; never touches `src/content/index.ts`, `src/content/regions.ts`, `src/content/schema.ts`, or the manifest — those are integrator-only, serial, shared files. Do not touch other islands. Do not touch server/UI code.

---

## M6 — Wave 3: pm-tools, design

### ISSUE-029 — PM-tools island (18 runs: 6 L1 + 6 L2 + 6 L3 re-voice)
**Milestone:** M6
**Label:** AFK
**Depends on:** ISSUE-023
**Covers:** REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-027
**Validated by:** VAL-001, VAL-005, VAL-006, VAL-007, VAL-008, VAL-050, VAL-051, VAL-052, VAL-056
**Files expected to change:** `src/content/pm-tools/issues-as-specs.ts` (existing), `src/content/pm-tools/prd-lite.ts` (existing), `src/content/pm-tools/vertical-slices.ts` (existing), `src/content/pm-tools/dependencies-and-work-graphs.ts` (existing), `src/content/pm-tools/decision-logs.ts` (existing), `src/content/pm-tools/backlog-vs-now.ts` (existing), `src/content/beats/ugcTerms.ts` (existing)
**Scope:** Author 18 PM-tools runs using the level names and learning objectives from `CREATIVE_BIBLE.md` §2 Island 5. This island had ZERO research findings (D: 0) — frame it honestly as prevention per §2 design note. L1 "TICKETS ARE JUST LISTS" (6 runs): vocabulary tier — issue, backlog, spec, acceptance criteria (D, C6). L2 "SPEC IT OR REGRET IT" (6 runs): agent-decision beats — turning a wish into a checkable slice (C6, C11). L3 "SCOPE CREEPS" (6 runs): re-voiced tradeoff content, pinned `L3_SHAPE`. Add pm-tools terms to `src/content/beats/ugcTerms.ts`. All runs pass every enforcement check.
**Acceptance criteria:**
- All 18 PM-tools runs pass: VAL-005, VAL-006, VAL-007, VAL-008, VAL-056, VAL-050, VAL-051, VAL-052, VAL-001.
- `npm run typecheck && npm run lint && npm run test && npm run build:manifest` all pass.
- `npm run test:e2e` passes: `e2e/stage-fit.spec.ts` confirms all PM-tools beats fit the stage.
**Out of bounds:** Writes only under `src/content/pm-tools/`; never touches `src/content/index.ts`, `src/content/regions.ts`, `src/content/schema.ts`, or the manifest — those are integrator-only, serial, shared files. Do not touch other islands. Do not touch server/UI code.

### ISSUE-030 — Design island (18 runs: 6 L1 + 6 L2 + 6 L3 re-voice)
**Milestone:** M6
**Label:** AFK
**Depends on:** ISSUE-023
**Covers:** REQ-001, REQ-002, REQ-003, REQ-004, REQ-005, REQ-027
**Validated by:** VAL-001, VAL-005, VAL-006, VAL-007, VAL-008, VAL-050, VAL-051, VAL-052, VAL-056
**Files expected to change:** `src/content/design/design-tokens.ts` (existing), `src/content/design/component-libraries.ts` (existing), `src/content/design/layout-and-spacing-rhythm.ts` (existing), `src/content/design/typography-and-hierarchy.ts` (existing), `src/content/design/accessibility-floor.ts` (existing), `src/content/design/consistency-vs-novelty.ts` (existing), `src/content/beats/ugcTerms.ts` (existing)
**Scope:** Author 18 Design runs using the level names and learning objectives from `CREATIVE_BIBLE.md` §2 Island 8. This island had ZERO research findings (D: 0) — frame it as teaching the player to SAY what they see (vocabulary for precision, per §2 design note). L1 "WHY IT LOOKS OFF" (6 runs): vocabulary tier — token, component, spacing, hierarchy (D). L2 "MAKE IT POP (PRECISELY)" (6 runs): agent-decision beats — answering design questions with a specific noun instead of adjectives. L3 "BORING ON PURPOSE" (6 runs): re-voiced tradeoff content, pinned `L3_SHAPE`. Add design terms to `src/content/beats/ugcTerms.ts`. All runs pass every enforcement check.
**Acceptance criteria:**
- All 18 Design runs pass: VAL-005, VAL-006, VAL-007, VAL-008, VAL-056, VAL-050, VAL-051, VAL-052, VAL-001.
- `npm run typecheck && npm run lint && npm run test && npm run build:manifest` all pass.
- `npm run test:e2e` passes: `e2e/stage-fit.spec.ts` confirms all Design beats fit the stage.
**Out of bounds:** Writes only under `src/content/design/`; never touches `src/content/index.ts`, `src/content/regions.ts`, `src/content/schema.ts`, or the manifest — those are integrator-only, serial, shared files. Do not touch other islands. Do not touch server/UI code.

### ISSUE-031 — NULL avatar and the character picker (4 slots, 2 filled)
**Milestone:** M6
**Label:** AFK
**Depends on:** ISSUE-022
**Covers:** REQ-011, REQ-012
**Validated by:** VAL-017, VAL-018, VAL-019, VAL-020
**Files expected to change:** `src/components/Avatar.tsx` (existing), `src/components/CharacterPicker.tsx` (new), `src/components/landmark/Beats/BeatPlayer.tsx` (existing), `public/sprites/null-*.png` (existing), `src/__tests__/avatar.test.ts` (new), `src/__tests__/hosting.test.ts` (existing)
**Scope:** Implement the NULL avatar per `CREATIVE_BIBLE.md` §1 (all reactions: idle, thinking, correct, wrong, level-clear, island-clear, reduced-motion final poses, silhouette test). Implement the character picker: title screen card row + swap option on pause/menu overlay. Keyboard: ←/→ to highlight, Enter to lock. Four picker slots — SUDO (default, filled) and NULL (filled, unlockable) are active; BOO and DUCKY slots render as ink silhouettes with plain-text unlock conditions (v1.1 cut, but the slots exist so adding them later is sprite work not UI work). Avatar selection persists across sessions in localStorage in both hosted and self-host mode (`ct-avatar` + `ct-avatar-unlocks` per §1 "Default, picking, unlocking"). Cross-device (server-side) avatar persistence is out of scope for v1 per CREATIVE_BIBLE.md §8.1 item 9.
**Acceptance criteria:**
- NULL avatar renders on stage with all reactions bound to answer outcomes (VAL-017, VAL-018).
- Character picker renders 4 slots: 2 filled (SUDO, NULL), 2 silhouette (BOO, DUCKY) with plain-text unlock conditions.
- `npm run test` passes: avatar selection persists in localStorage in both hosted mode and self-host mode (VAL-019, VAL-020).
- NULL unlocks when the player clears Level 1 on all 6 landmarks of any one island (§1 unlock condition).
- `npm run typecheck && npm run lint && npm run build` all pass.
**Out of bounds:** Do not implement BOO or DUCKY sprites or reactions (v1.1 cut). Do not implement long-idle easter eggs. Do not implement server-side avatar persistence (cross-device persistence is deferred to v1.1 per CREATIVE_BIBLE.md §8.1 item 9).

---

## M7 — Migration, full gate, evidence

### ISSUE-032 — Migration cutover, rollback contract, and the anonymous/self-hosted migration proof
**Milestone:** M7
**Label:** HITL
**Depends on:** ISSUE-004, ISSUE-005, ISSUE-006, ISSUE-007, ISSUE-010, ISSUE-011, ISSUE-024..ISSUE-030
**Covers:** REQ-021, REQ-023, REQ-029
**Validated by:** VAL-035b, VAL-036, VAL-037, VAL-054, VAL-058, VAL-059, VAL-060
**Files expected to change:** `db/migrations/0011_arcade_level_expand.sql` (existing), `db/migrations/0012_arcade_level_cutover.sql` (existing), `src/__tests__/beatProgress.integration.test.ts` (existing), `src/__tests__/xp.integration.test.ts` (existing), `src/__tests__/leaderboard.integration.test.ts` (existing), `e2e/anon-session.spec.ts` (existing)
**Scope:** Execute the migration plan from `DATA_MODEL.md` §6 with live DB integration tests (requires ISSUE-010 preflight). Build a checked-in migration corpus covering: every frontier 0–7, checked and completed states, incomplete award ledgers, retry duplicates, anonymous v1 storage, and leaderboard ties. Capture a read-only preflight artifact from the target database. Run `0011_arcade_level_expand.sql` and assert all equality checks from §6 (progress multiset identical excluding new `level` column, every row `level = 'l3'`, XP award multiset identical including `awarded_at`, row counts identical, per-profile all-time and weekly `SUM(points)` identical, leaderboard ranks identical). Run the anonymous and self-hosted proof matrix from §9 (anonymous hosted migration, anonymous-then-sign-in, self-host with no DATABASE_URL, authenticated hosted legacy profile, cross-level isolation, RLS). Run `0012` only after explicit owner approval and after the level-aware binary is healthy against `0011`.
**Acceptance criteria:**
- `npm run test:db` passes (with ISSUE-010 preflight): award-row multiset, `awarded_at`, all-time total, weekly total, and leaderboard rank are all unchanged for every pre-migration profile (VAL-035b); migration backfills stamped landmarks as L3 cleared (VAL-036); no existing progress field is dropped or nulled (VAL-037).
- `npm run test:rls` passes: row-level security holds with per-user isolation on level rows (VAL-044 regression).
- `npm run test:db` passes: rollback contract — old binary/reader continues writing L3 through defaults during expand window; cutover is reversible before first non-L3 row (VAL-060).
- `npm run test:e2e` passes: anonymous/self-hosted v1 local progress migrates to v2 L3 and is retained across reload (VAL-058).
- `npm run test` passes: legacy L3 row grandfathers L3 unlock without synthesizing L1/L2 or XP (VAL-054); anonymous local L3 does not promote to hosted L3 (VAL-059).
- The first committed non-L3 database row requires the same explicit owner approval as the cutover (REQ-029).
**Owner decision (one sentence):** Has the owner approved running `0012_arcade_level_cutover.sql` (dropping old constraints, enabling multi-level rows — the point of no return for old-binary rollback)?
**Out of bounds:** Do not run `0012` without explicit owner approval. Do not deploy to production. Do not run `test:db`/`test:rls` without ISSUE-010 preflight. Do not modify existing migration files.

### ISSUE-033 — Full gate, rendered evidence, and the CONTEXT.md glossary update
**Milestone:** M7
**Label:** HITL
**Depends on:** ISSUE-032
**Covers:** REQ-022, REQ-026
**Validated by:** VAL-038, VAL-039, VAL-040, VAL-041, VAL-042, VAL-048, VAL-049, VAL-047 (plus full-gate sweep of all VAL IDs)
**Files expected to change:** `CONTEXT.md` (existing), `docs/missions/2026-08-02-vibe-code-quest-arcade/evidence/` (new), `WORK_LEDGER.md` (existing)
**Scope:** Run the full gate: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:db` (with ISSUE-010 preflight), `npm run test:rls`, `npm run build`, `npm run test:e2e`. All must pass clean. Verify the 144-sequence count is now asserted (it was deferred in M1a; with all 8 islands authored, the full count gate is active). Verify every "must still pass unchanged" regression file from `VALIDATION_CONTRACT.md` passes without modification to its existing assertions. Capture rendered evidence at 1440×900 via visual review: desktop play stage, map evolution, reduced-motion state, character reactions, returning-player marker. Update `CONTEXT.md` glossary with the five terms from `EXECUTION_PLAN.md` M7: Island, Level, Run, Stage, Avatar. Verify no third-party product names in shipped strings or assets (VAL-047). Confirm every level completes with the AI guide disabled (VAL-048) and with the network blocked (VAL-049).
**Acceptance criteria:**
- Full gate passes clean: `typecheck`, `lint`, `test`, `test:db`, `test:rls`, `build`, `test:e2e` all exit 0.
- All VAL IDs VAL-001 through VAL-064 (plus VAL-014b, VAL-035b) are green.
- Every "must still pass unchanged" regression file passes without modification to its existing assertions.
- The manifest asserts exactly 144 sequences (8 × 6 × 3) — VAL-004 now active.
- Rendered evidence saved to `docs/missions/2026-08-02-vibe-code-quest-arcade/evidence/` at 1440×900.
- `CONTEXT.md` glossary updated with Island, Level, Run, Stage, Avatar definitions.
- `npm run test:e2e` passes: keyboard-only play completes a level (VAL-038), all interactive elements have accessible names and roles (VAL-039), reduced-motion disables all animations (VAL-040), colour is never the only signal (VAL-041), axe reports no new violations vs baseline (VAL-042).
- Every level completes with guide disabled (VAL-048) and network blocked (VAL-049).
**Out of bounds:** Do not deploy to production. Do not modify existing migration files. Do not change the region/landmark count. Any finding outside this mission's scope goes to a separate owner decision, not a silent fix.
