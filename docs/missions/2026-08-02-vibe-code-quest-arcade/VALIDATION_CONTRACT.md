# VALIDATION CONTRACT — Vibe Code Quest Arcade Rebuild

Mission: `2026-08-02-vibe-code-quest-arcade`
Repo: `/Users/thebeast/code-tutor`

Every VAL below is a mechanical check: a command that exits 0/non-zero, a named test assertion, or a named manual gate with required evidence. VAL IDs are stable and never reused.

**Runnable commands referenced** (from [package.json](file:///Users/thebeast/code-tutor/package.json) `scripts`):
`npm run typecheck`, `npm run lint`, `npm run test`, `npm run build` (runs `build:manifest` first), `npm run build:manifest`, `npm run test:e2e`, `npm run test:db`, `npm run test:rls`.

> **⚠ LIVE EXTERNAL MUTATION WARNING.** `npm run test:db` and `npm run test:rls` can perform a LIVE EXTERNAL MUTATION against Neon. In the actual repository, `scripts/with-neon-branch.mjs` (lines 76-77) hard-codes a Neon org and project and creates a real branch when `TEST_DATABASE_URL` is absent. This is a named owner-approval stop condition (see [PRD.md](./PRD.md) section 8). The DB-test preflight (VAL-064) MUST exist and pass before this gate is treated as safe to run unattended. Do not run `npm run test:db` or `npm run test:rls` without either a proven disposable/local `TEST_DATABASE_URL` or a recorded owner-approved ephemeral branch operation.

**Existing test files referenced** are listed in §Regression baseline.

---

## GROUP A — LEVEL STRUCTURE

| VAL ID | REQ | Assertion | How it is verified | Type |
|---|---|---|---|---|
| VAL-001 | REQ-001 | `landmarkSchema` includes non-optional tier-specific canonical source fields for L1 (vocabulary) and L2 (decision). A landmark missing any of them fails Zod parse. | `npm run test` — `src/__tests__/regions.test.ts`, test: *"landmarks missing L1/L2 canonical fields are rejected by schema"* (new assertion in existing file). Also enforced at manifest build: `npm run build:manifest` exits non-zero when any of 48 landmarks is missing the fields. | auto |
| VAL-002 | REQ-001 | The manifest build fails if any of the 48 landmarks lacks the tier-specific fields. | `npm run build:manifest` (or `npm run build`) exits non-zero when a landmark is missing tier fields. Covered by VAL-001's manifest build path. | auto |
| VAL-003 | REQ-002 | Every landmark exposes exactly 3 level sequences (`l1`, `l2`, `l3`). | `npm run test` — `src/__tests__/regions.test.ts`, test: *"every landmark exposes exactly 3 level sequences (l1/l2/l3)*. | auto |
| VAL-004 | REQ-002 | The manifest asserts exactly 144 sequences (8 × 6 × 3). | `npm run test` — `src/__tests__/regions.test.ts`, test: *"manifest contains exactly 144 sequences across 8 regions × 6 landmarks × 3 levels"*. | auto |
| VAL-005 | REQ-003 | Every L1 sequence uses only vocabulary-tier beat types (no `tradeoff`, no `scenario` requiring domain knowledge). | `npm run test` — `src/__tests__/beats.test.ts`, test: *"L1 sequences contain no tradeoff or domain-knowledge beats"*. | auto |
| VAL-006 | REQ-003 | **Coverage, not allowlist.** Every term documented in the UGC research term list appears in at least one L1 sequence on its mapped island. Authors may add terms; they may not skip a documented one. | `npm run test` — `src/__tests__/beats.test.ts`, test: *"every documented UGC term is covered by an L1 sequence on its mapped island"*. Term list is checked into `src/content/beats/ugcTerms.ts` with its source URL per term. | auto |
| VAL-007 | REQ-004 | Every L2 sequence presents exactly one agent-asks-you decision beat with `correctOptionId` set and per-option `feedback` on every option. | `npm run test` — `src/__tests__/beats.test.ts`, test: *"every L2 sequence has one decision beat with single correct answer and per-option feedback"*. | auto |
| VAL-008 | REQ-005 | Every L3 sequence preserves the canonical facts from its landmark's pre-rebuild tradeoff content (no field dropped). | `npm run test` — `src/__tests__/beats.test.ts`, test: *"L3 sequences preserve all canonical landmark facts from pre-rebuild content"*. This replaces the existing provenance/copy-loyalty test in the same file. | auto |
| VAL-009 | REQ-006 | Level gating: L2 is locked until L1 cleared for the same landmark; L3 locked until L2 cleared. Islands are never gated (all 48 resolve without any level cleared). | `npm run test` — `src/__tests__/beatReducer.test.ts`, test: *"level gating blocks L2 before L1 cleared and L3 before L2 cleared"*. Plus `npm run test` — `src/__tests__/beatProgress.server.test.ts`, test: *"server rejects progress writes to a locked level"*. | auto |
| VAL-010 | REQ-006 | Islands are never gated — all 48 landmark URLs resolve regardless of progress state. | `npm run test:e2e` — `e2e/beats.spec.ts`, test: *"landmark page resolves with zero progress"*. Covered jointly with VAL-015 (URL resolution). | auto |
| VAL-011 | REQ-007 | `deriveBeatSequence()` in `src/content/beats/derive.ts` is removed (no export, no call site). | `npm run typecheck` exits 0 (no dangling import). `npm run test` — `src/__tests__/beats.test.ts`, test: *"deriveBeatSequence is no longer exported from derive.ts"*. | auto |
| VAL-012 | REQ-007 | A content-provenance test under the new tier-aware scheme asserts that no beat asserts a fact absent from its landmark's canonical fields. | `npm run test` — `src/__tests__/beats.test.ts`, test: *"every beat's claim-bearing strings trace to landmark canonical fields (tier-aware provenance)"*. This is the re-established provenance test. | auto |

---

## GROUP B — LOCKED STAGE

| VAL ID | REQ | Assertion | How it is verified | Type |
|---|---|---|---|---|
| VAL-013 | REQ-008 | **Two-mode scroll contract (WCAG 2.2 SC 1.4.4 — [Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text)).** Mode 1 (100% presentation): no page scroll at any supported desktop viewport (1024×640 and 1440×900); the play surface is a single fixed stage. Mode 2 (200% text size or browser zoom): the stage switches to single-axis VERTICAL overflow with persistent stage chrome; never clips content, never scales text back down, never requires two-axis scrolling. Both modes tested in `e2e/stage-fit.spec.ts`. | `npm run test:e2e` — `e2e/stage-fit.spec.ts`, test: *"no page scroll at 100% at 1024×640 and 1440×900; at 200% text, single-axis vertical overflow with no clipping, no text downscale, and no two-axis scroll"*. Mode 1 asserts `document.body.scrollHeight <= window.innerHeight` at both viewports. Mode 2 asserts vertical-only overflow with all content fully reachable and no horizontal scroll. | auto |
| VAL-014 | REQ-009 | **Rendered truth — deterministic render-state matrix (WCAG 2.2 SC 1.4.4).** No beat's content overflows the stage at the minimum supported desktop size (1024×640). A single initial-render measurement is insufficient because beat height changes after interaction. The matrix covers, per beat type, at minimum these render states: initial, wrong-answer feedback shown, correct-answer feedback shown, all reveal cards visible, check explanation shown, and completed stamp panel. For each state the stage AND every visible focusable descendant is measured via bounding rectangles against the stage content box, plus `document.body` scroll and active-element visibility. Measured on the real rendered DOM, not estimated from string length. Run at 1024×640 at 100%, at 200% text size, with `prefers-reduced-motion: reduce`, and with the longest permitted copy per state. At 100% the stage must not overflow in either axis. At 200% the stage must reflow to single-axis vertical overflow (per VAL-013 Mode 2) with no clipped or unreachable focusable descendant. | `npm run test:e2e` — `e2e/stage-fit.spec.ts` (new file), test: *"render-state matrix: no overflow at 100% and correct vertical-only reflow at 200% across all beat types and render states"*. Iterates every beat type, drives each render state, asserts `scrollHeight <= clientHeight && scrollWidth <= clientWidth` on the stage at 100%, and at 200% asserts single-axis vertical overflow with every focusable descendant's bounding rectangle inside the reachable scroll area. | auto |
| VAL-014b | REQ-009 | **Fast fail.** The build rejects copy that cannot plausibly fit, before the slow e2e pass runs. This is the cheap guard, not the authority — VAL-014 is the authority. | `npm run build:manifest` exits non-zero when a beat exceeds the per-beat-type word budget (same budget as VAL-050). | auto |
| VAL-015 | REQ-010 | All 48 existing landmark URLs (`/map/[region]/[landmark]`) still resolve. | `npm run test:e2e` — `e2e/beats.spec.ts`, test: *"all 48 legacy landmark URLs return 200"*. Iterates the full landmark registry. | auto |
| VAL-016 | REQ-010 | The `level` path segment is additive — legacy URLs without `/l1`/`/l2`/`/l3` still serve content (defaulting to L1 or the prior equivalent). | `npm run test:e2e` — `e2e/beats.spec.ts`, test: *"legacy URL without level segment resolves and serves playable content"*. | auto |

---

## GROUP C — AVATARS

| VAL ID | REQ | Assertion | How it is verified | Type |
|---|---|---|---|---|
| VAL-017 | REQ-011 | The player avatar renders on the play stage. | `npm run test:e2e` — `e2e/beats.spec.ts`, test: *"avatar element is present on the stage during beat playback"*. Asserts a visible `[data-avatar]` element. | auto |
| VAL-018 | REQ-011 | Avatar reaction state binds to answer outcome: `data-reaction="celebrate"` on correct, `data-reaction="shrug"` on wrong. | `npm run test:e2e` — `e2e/beats.spec.ts`, test: *"avatar shows celebrate on correct answer and shrug on wrong answer"*. | auto |
| VAL-019 | REQ-012 | Avatar selection persists across sessions in hosted mode (localStorage; server-side persistence is deferred per CREATIVE_BIBLE.md section 8.1 item 9). | `npm run test` — `src/__tests__/avatar.test.ts`, test: *"avatar selection persists in localStorage in hosted mode"*. | auto |
| VAL-020 | REQ-012 | Avatar selection persists across sessions in self-host mode (localStorage with `DATABASE_URL` unset). | `npm run test` — `src/__tests__/hosting.test.ts`, test: *"avatar selection persists in localStorage when DATABASE_URL is unset"*. | auto |

---

## GROUP D — AUDIO

| VAL ID | REQ | Assertion | How it is verified | Type |
|---|---|---|---|---|
| VAL-021 | REQ-013 | No audio files ship — `public/` contains no `.mp3`, `.wav`, `.ogg`, `.flac`, `.m4a` files. | `npm run test` — new assertion in `src/__tests__/hosting.test.ts`, test: *"no audio files exist under public/"*. Scans `public/` with a glob and asserts empty. | auto |
| VAL-022 | REQ-013 | No new runtime dependency added to `package.json` for audio. | `npm run test` — `src/__tests__/hosting.test.ts`, test: *"package.json dependencies contain no audio libraries (howler, tone.js, etc.)"*. Parses `package.json` and asserts against a banned-dependency list. | auto |
| VAL-023 | REQ-013 | Audio code uses Web Audio API (`AudioContext`) only — no `<audio>` elements, no `new Audio()`. | `npm run test` — `src/__tests__/hosting.test.ts`, test: *"audio source uses AudioContext, no HTMLAudioElement or new Audio() in src/"*. Greps `src/` for banned patterns. | auto |
| VAL-024 | REQ-014 | Music reacts to at least four gameplay states: streak building, wrong answer, level tier, level complete. | `npm run test:e2e` — `e2e/beats.spec.ts`, test: *"audio engine exposes distinct music states for streak/wrong/tier/complete"*. Asserts the audio engine's public state API transitions. | auto |
| VAL-025 | REQ-015 | Audio starts muted on page load. | `npm run test:e2e` — `e2e/beats.spec.ts`, test: *"audio is muted on initial page load"*. Asserts `data-audio-muted="true"` or equivalent before any user gesture. | auto |
| VAL-026 | REQ-015 | Audio requires a user gesture before producing sound (no autoplay). | `npm run test:e2e` — `e2e/beats.spec.ts`, test: *"no AudioContext is resumed before a user gesture"*. | auto |
| VAL-027 | REQ-015 | A persistent mute control is visible and functional. | `npm run test:e2e` — `e2e/beats.spec.ts`, test: *"mute toggle is visible and toggles audio state"*. | auto |
| VAL-028 | REQ-015 | Mute preference persists across sessions (localStorage in self-host, server in hosted). | `npm run test` — `src/__tests__/hosting.test.ts`, test: *"mute preference persists in localStorage"*. | auto |
| VAL-029 | REQ-016 | A music sampling page presents every theme variant for owner selection. **OWNER TASTE GATE.** | Manual: owner reviews the sampling page (e.g. `/audio-preview`), confirms every theme variant is audible and distinct. Evidence: screenshot at 1440×900 saved to `docs/missions/2026-08-02-vibe-code-quest-arcade/evidence/VAL-029-audio-sampling-desktop.png` plus a signed note in `WORK_LEDGER.md`. | manual |

---

## GROUP E — JUICE AND BOARD

| VAL ID | REQ | Assertion | How it is verified | Type |
|---|---|---|---|---|
| VAL-030 | REQ-017 | Distinct visual effects fire for: correct, wrong, streak building, streak broken, level complete, island complete. | `npm run test:e2e` — `e2e/beats.spec.ts`, test: *"six distinct effect classes fire for correct/wrong/streak-build/streak-break/level-complete/island-complete"*. Asserts unique `[data-effect]` attributes per event. | auto |
| VAL-031 | REQ-018 | The island map visibly changes as levels are cleared (visual state diff on the Pixi canvas or DOM fallback). | `npm run test:e2e` — `e2e/map-top.spec.ts`, test: *"island visual state changes after a level is cleared"*. Asserts a class or data attribute delta on the region element pre/post clear. | auto |
| VAL-032 | REQ-018 | The play stage visibly changes as levels are cleared within a landmark. | `npm run test:e2e` — `e2e/beats.spec.ts`, test: *"stage visual state changes after level clear"*. | auto |
| VAL-033 | REQ-019 | A returning player sees their position without reading text (visual progress marker on the map or stage). | Manual: render `/map` with seeded progress at 2 landmarks partially cleared. Evidence: screenshot at 1440×900 saved to `docs/missions/2026-08-02-vibe-code-quest-arcade/evidence/VAL-033-returning-player-desktop.png`. **Desktop only — portrait is out of scope this mission** (INTERVIEW.md Q3). Owner confirms progress is visually obvious without reading any label. | manual |

---

## GROUP F — PROGRESS AND XP

| VAL ID | REQ | Assertion | How it is verified | Type |
|---|---|---|---|---|
| VAL-034 | REQ-020 | XP extends to per-level awards without breaking existing derivation logic. | `npm run test` — `src/__tests__/xp.test.ts`, test: *"per-level XP awards are derived correctly"*. Existing award tests in the same file must still pass. | auto |
| VAL-035 | REQ-020 | **The cap is per level, not per landmark.** Max 100 XP per level (unchanged award values), so max 300 per landmark across L1+L2+L3. A flat 100-per-landmark cap would make Levels 2 and 3 award nothing — the opposite of the intended reward curve. | `npm run test` — `src/__tests__/xp.test.ts`, test: *"XP per level does not exceed 100 and per landmark does not exceed 300"*. | auto |
| VAL-035b | REQ-020, REQ-021 | **No retroactive leaderboard movement — full award-row identity.** Before and after migration, for every seeded profile, ALL of the following are identical: the full per-profile award row multiset (by `id`, `profile_id`, `region`, `landmark`, `award_key`, `points`), each row's `awarded_at` timestamp, the all-time `SUM(points)` total, the weekly `SUM(points)` total (same UTC week boundary as `leaderboard_board`), and the leaderboard rank. `awarded_at` preservation is the specific mechanism that keeps weekly totals and ranks fixed. The migration inserts zero new award rows and deletes zero; a profile with an incomplete historical award ledger is NOT topped up. | `npm run test:db` — `src/__tests__/xp.integration.test.ts`, test: *"award-row multiset, awarded_at, all-time total, weekly total, and leaderboard rank are all unchanged for every pre-migration profile"*. Seeds a checked-in migration corpus (missing awards, partial awards, legacy non-beat rows, all frontiers, duplicate/retry histories, leaderboard ties), snapshots the full per-profile award multiset with `awarded_at` plus all-time total, weekly total, and rank, migrates, and asserts equality on every field. | auto |
| VAL-036 | REQ-021 | Migration marks every pre-existing stamped landmark as L3-cleared. Zero progress loss. | `npm run test:db` — `src/__tests__/beatProgress.integration.test.ts`, test: *"migration backfills stamped landmarks as L3 cleared"*. Seeds a pre-migration stamp row, runs the migration, asserts L3 cleared state. | auto |
| VAL-037 | REQ-021 | No existing progress field is dropped or nulled by the migration. | `npm run test:db` — `src/__tests__/beatProgress.integration.test.ts`, test: *"migration preserves all existing progress field values"*. | auto |

---

## GROUP G — PRESERVATION (regression floor)

| VAL ID | REQ | Assertion | How it is verified | Type |
|---|---|---|---|---|
| VAL-038 | REQ-022 | Keyboard-only play completes a level (no mouse required). | `npm run test:e2e` — `e2e/a11y.spec.ts`, test: *"keyboard-only play completes a full level"*. Extends the existing keyboard-nav test. | auto |
| VAL-039 | REQ-022 | Screen-reader path: all interactive elements have accessible names and roles. | `npm run test:e2e` — `e2e/a11y.spec.ts`, test: *"all interactive elements have accessible names and correct roles"*. | auto |
| VAL-040 | REQ-022 | `prefers-reduced-motion: reduce` disables all animations (including new avatar/audio-reactive visual motion). | `npm run test:e2e` — `e2e/a11y.spec.ts`, test: *"reduced-motion disables all animations including avatar and juice effects"*. | auto |
| VAL-041 | REQ-022 | Colour is never the only signal — every state also uses text or icon. | `npm run test:e2e` — `e2e/a11y.spec.ts`, test: *"no state relies on colour alone (icon or text present)"*. | auto |
| VAL-042 | REQ-022 | axe reports no new violations vs. the baseline report. | `npm run test:e2e` — `e2e/a11y.spec.ts` (axe scan). Baseline: `docs/missions/2026-07-10-code-tutor-v1/evidence/ISSUE-013/axe-report.json`. Asserts violation count ≤ baseline. | auto |
| VAL-043 | REQ-023 | Self-host mode works with `DATABASE_URL` unset — server-dependent features are hidden, not broken. | `npm run test` — `src/__tests__/hosting.test.ts`, existing test suite must pass unchanged. Plus `npm run test:e2e` — `e2e/anon-session.spec.ts`, existing suite must pass. | auto |
| VAL-044 | REQ-024 | Row-level security still holds — `app_user` role enforces per-user isolation. | `npm run test:rls` — `src/__tests__/rls.integration.test.ts`, existing suite must pass. | auto |
| VAL-045 | REQ-024 | Monotonic progress merge still holds — a stale write never clobbers a newer one. | `npm run test:db` — `src/__tests__/beatProgress.integration.test.ts`, existing monotonic merge test must pass. | auto |
| VAL-046 | REQ-024 | Server-authoritative progress validation still holds — client cannot declare its own beat `kind` or level state. | `npm run test` — `src/__tests__/beatProgress.server.test.ts`, existing suite must pass (extended for level context). | auto |
| VAL-047 | REQ-025 | Shipped strings and assets contain no third-party product names used as character or in-world branding. | `npm run test` — `src/__tests__/hosting.test.ts`, test: *"no third-party product names in shipped strings or assets"*. Greps `src/content/` and `public/` against a banned-names list (Replit, Cursor, Bolt, Lovable, v0, Claude Code, etc. when used as character/brand, not as educational references). | auto |
| VAL-048 | REQ-026 | Every level completes with the AI guide disabled. | `npm run test` — `src/__tests__/guide.test.ts`, existing suite must pass. Plus `npm run test:e2e` — `e2e/guide-chat.spec.ts` extended with a guide-disabled completion path. | auto |
| VAL-049 | REQ-026 | Every level completes with the network blocked (guide API returns 503/timeout). | `npm run test` — `src/__tests__/guide.test.ts`, test: *"level completes when guide API is unreachable"*. | auto |

---

## GROUP H — VOICE

| VAL ID | REQ | Assertion | How it is verified | Type |
|---|---|---|---|---|
| VAL-050 | REQ-027 | Per-beat word budget is enforced mechanically — no beat's `prompt` exceeds the configured ceiling. | `npm run test` — `src/__tests__/beats.test.ts`, test: *"every beat prompt is within the word budget"*. | auto |
| VAL-051 | REQ-027 | Banned filler phrases list is enforced — no beat contains a banned phrase. | `npm run test` — `src/__tests__/beats.test.ts`, test: *"no beat contains a banned filler phrase"*. | auto |
| VAL-052 | REQ-027 | Reading-level ceiling is enforced — no beat exceeds the configured grade level. | `npm run test` — `src/__tests__/beats.test.ts`, test: *"every beat is at or below the reading-level ceiling"*. | auto |
| VAL-053 | REQ-027 | Voice guide aspects that cannot be enforced mechanically are covered by a named manual review. | Manual: owner reviews a sample of 10 beats (2 per level tier across different islands) for tone, clarity, and voice consistency. Evidence: signed note in `WORK_LEDGER.md` with the 10 beat IDs reviewed and pass/fail per beat. | manual |

---

## GROUP I — MIGRATION, PROGRESS, AND PRODUCT CONTRACTS (amendment-driven)

| VAL ID | REQ | Assertion | How it is verified | Type |
|---|---|---|---|---|
| VAL-054 | REQ-021 | Existing players are not locked out: a pre-migration L3 row grants `highestUnlocked = L3` without synthesizing L1 or L2 rows and without granting any XP. | `npm run test` — `src/__tests__/beatProgress.integration.test.ts`, test: *"legacy L3 row grandfathers L3 unlock without synthesizing L1/L2 rows or XP"*. | auto |
| VAL-055 | REQ-021 | Region stamp counts and collectible ownership remain LANDMARK-level facts, counting distinct landmark IDs with any level completed. A six-landmark region can never report more than 6 stamps. (Closes the triple-counting bug in [DATA_MODEL.md](./DATA_MODEL.md) ADDITIONAL CONSEQUENCES.) | `npm run test` — `src/__tests__/collectibles.test.ts` and `src/__tests__/regions.test.ts`, test: *"region stamp count never exceeds landmark count; collectibles deduplicate across level rows"*. | auto |
| VAL-056 | REQ-005 | `L3_SHAPE` is pinned: every L3 sequence has exactly the 8 ordered `(id, type)` pairs of the pre-rebuild derived sequence, with the check beat at its original position (zero-based index 6). | `npm run test` — `src/__tests__/beats.test.ts`, test: *"every L3 sequence matches the pinned L3_SHAPE ordered (id, type) pairs"*. | auto |
| VAL-057 | REQ-021 | localStorage v1-to-v2 migration is correct and idempotent: covers partial frontier (0 through 7), checked state, completed state, malformed storage, schema-invalid storage, repeated migration, and rollback (v1 key retained). | `npm run test` — `src/__tests__/beatReducer.test.ts` (or a new `beatStorage.test.ts`), test: *"v1-to-v2 migration is idempotent across partial, checked, completed, malformed, and repeated-migration cases, with v1 key retained"*. | auto |
| VAL-058 | REQ-021, REQ-023 | Anonymous and self-hosted players survive migration with progress intact. | `npm run test:e2e` — `e2e/anon-session.spec.ts`, test: *"anonymous/self-hosted v1 local progress migrates to v2 L3 and is retained across reload"*. | auto |
| VAL-059 | REQ-021 | An anonymous local L3 state does NOT grant a hosted L3 unlock after sign-in; hosted grandfathering applies only to rows that existed in the database at migration time. (Security boundary, [DATA_MODEL.md](./DATA_MODEL.md) ADDITIONAL CONSEQUENCES.) | `npm run test` — `src/__tests__/beatProgress.server.test.ts`, test: *"anonymous local L3 does not promote to hosted L3 until hosted L2 is complete"*. | auto |
| VAL-060 | REQ-029 | The rollback contract works: the expand-and-backfill cutover can be reversed at the documented point, and old readers keep working during expand. (Closes F-013.) | `npm run test` — `src/__tests__/beatProgress.integration.test.ts`, test: *"old binary/reader continues writing L3 through defaults during expand window; cutover is reversible before first non-L3 row"*. | auto |
| VAL-061 | REQ-028 | The first-sixty-seconds contract holds: a brand-new player reaches their first correct answer within 60 seconds from landing, with no account, no form, and no reading gate. (Closes F-007.) | `npm run test:e2e` — `e2e/first-run.spec.ts` (new file), test: *"cold anonymous root visit reaches first correct answer in under 60s with no signup, form, or reading gate"*. | auto |
| VAL-062 | REQ-011 | **MANUAL, owner gate: character approval.** SUDO and NULL rendered at real size, in motion, in every reaction state (celebrate, shrug, idle, reduced-motion final poses), reviewed by the owner before content fan-out or map-art implementation proceeds. (Closes F-016.) | Manual: owner reviews the character comp sheet. Evidence: screenshots saved under `docs/missions/2026-08-02-vibe-code-quest-arcade/evidence/` (real-size sprite comp, pure-black silhouette test, all shipped reactions, stage and map placements, reduced-motion final poses) plus a signed sign-off in `WORK_LEDGER.md`. | manual |
| VAL-063 | REQ-017 | Visual effects are actually visible, not merely present in the DOM: each of the six effects (correct, wrong, streak building, streak broken, level complete, island complete) produces a measurable rendered change (computed style or bounding-box delta), not just a `data-effect` attribute. (Closes F-011.) | `npm run test:e2e` — `e2e/beats.spec.ts`, test: *"six effects produce measurable rendered changes (computed style or bounding-box delta), not just data attributes"*. | auto |
| VAL-064 | REQ-024 | **DB-test preflight.** `npm run test:db` and `npm run test:rls` REFUSE to run unless `TEST_DATABASE_URL` points at a proven disposable or local database, or an owner-approved ephemeral branch operation is recorded for that run. Cleanup failure fails the gate. (Closes F-005 — `scripts/with-neon-branch.mjs` lines 76-77 hard-code a Neon org and project and create a real branch when `TEST_DATABASE_URL` is absent.) | `npm run test` — `src/__tests__/withNeonBranch.test.ts`, test: *"DB test preflight refuses to run without a proven disposable target or recorded owner approval; cleanup failure fails the gate"*. | auto |
| VAL-065 | REQ-029 | **Governance precondition.** Amendment A4 is applied: the frozen `docs/missions/2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md` amendment log contains an `A4 (2026-08-02` entry naming this mission. Until this passes, every downstream issue contradicts the repository's declared source of truth for engagement/UI work. | `npm run test` — `src/__tests__/regions.test.ts`, test: *"Amendment A4 is present in the frozen v2 design contract amendment log"*. Asserts the amendment-log entry exists and names mission `2026-08-02-vibe-code-quest-arcade`. | auto |

---

## Regression baseline

### Must still pass unchanged

These existing test files are the regression floor — they must pass without modification (or only with additive, backward-compatible extensions):

| Test file | Scope |
|---|---|
| [`src/__tests__/mapState.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/mapState.test.ts) | Map camera pan/zoom bounds — unchanged (Pixi map layout is not touched by the stage rebuild) |
| [`src/__tests__/quiz.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/quiz.test.ts) | Legacy quiz grading — unchanged |
| [`src/__tests__/collectibles.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/collectibles.test.ts) | Collectible mapping — unchanged |
| [`src/__tests__/lesson.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/lesson.test.ts) | Lesson format — unchanged |
| [`src/__tests__/access.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/access.test.ts) | Access/paywall — unchanged (avatar persistence may add a test here) |
| [`src/__tests__/access.integration.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/access.integration.test.ts) | Access DB integration — unchanged |
| [`src/__tests__/analytics.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/analytics.test.ts) | Client event recording — unchanged |
| [`src/__tests__/hosting.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/hosting.test.ts) | Hosted vs self-hosted detection — must pass (extended with audio/avatar assertions) |
| [`src/__tests__/leaderboard.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/leaderboard.test.ts) | Leaderboard computation — unchanged |
| [`src/__tests__/leaderboard.integration.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/leaderboard.integration.test.ts) | Leaderboard DB integration — unchanged |
| [`src/__tests__/onboarding.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/onboarding.test.ts) | Onboarding — unchanged |
| [`src/__tests__/onboardingRoute.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/onboardingRoute.test.ts) | Onboarding API — unchanged |
| [`src/__tests__/session.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/session.test.ts) | Session tokens — unchanged |
| [`src/__tests__/share.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/share.test.ts) | Share links — unchanged |
| [`src/__tests__/upgrade.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/upgrade.test.ts) | Account upgrade — unchanged |
| [`src/__tests__/upgrade.integration.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/upgrade.integration.test.ts) | Upgrade DB integration — unchanged |
| [`src/__tests__/ai.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/ai.test.ts) | AI drill logic — unchanged |
| [`src/__tests__/rls.integration.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/rls.integration.test.ts) | Row-level security — unchanged |
| [`src/__tests__/withNeonBranch.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/withNeonBranch.test.ts) | Neon branch harness — unchanged |
| [`src/__tests__/guideRoute.integration.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/guideRoute.integration.test.ts) | Guide API DB integration — unchanged |
| [`e2e/landmark-formats.spec.ts`](file:///Users/thebeast/code-tutor/e2e/landmark-formats.spec.ts) | Format switching — unchanged (may need level-segment updates) |
| [`e2e/collectibles.spec.ts`](file:///Users/thebeast/code-tutor/e2e/collectibles.spec.ts) | Collectible grant — unchanged |
| [`e2e/xp.spec.ts`](file:///Users/thebeast/code-tutor/e2e/xp.spec.ts) | XP HUD — unchanged |
| [`e2e/anon-session.spec.ts`](file:///Users/thebeast/code-tutor/e2e/anon-session.spec.ts) | Anonymous/local progress — unchanged |
| [`e2e/analytics.spec.ts`](file:///Users/thebeast/code-tutor/e2e/analytics.spec.ts) | Client events — unchanged |
| [`e2e/onboarding.spec.ts`](file:///Users/thebeast/code-tutor/e2e/onboarding.spec.ts) | Onboarding flow — unchanged |
| [`e2e/paywall.spec.ts`](file:///Users/thebeast/code-tutor/e2e/paywall.spec.ts) | Paywall gating — unchanged |
| [`e2e/share.spec.ts`](file:///Users/thebeast/code-tutor/e2e/share.spec.ts) | Share links — unchanged |
| [`e2e/legal.spec.ts`](file:///Users/thebeast/code-tutor/e2e/legal.spec.ts) | Legal pages — unchanged |

### Expected to change

| Test file | Reason |
|---|---|
| [`src/__tests__/regions.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/regions.test.ts) | New tier-specific canonical field assertions (VAL-001) and 144-sequence count (VAL-004) |
| [`src/__tests__/beats.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/beats.test.ts) | Factory derivation test replaced by tier-aware provenance (VAL-012); L1/L2/L3 structural assertions (VAL-005–008); voice-budget checks (VAL-050–052) |
| [`src/__tests__/beatReducer.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/beatReducer.test.ts) | Level gating rules added (VAL-009) |
| [`src/__tests__/beatProgress.server.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/beatProgress.server.test.ts) | Server validation extended for locked-level rejection (VAL-009, VAL-046) |
| [`src/__tests__/beatProgress.integration.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/beatProgress.integration.test.ts) | Migration backfill test added (VAL-036, VAL-037); existing merge test must still pass |
| [`src/__tests__/xp.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/xp.test.ts) | Per-level awards added (VAL-034); cap assertion reinforced (VAL-035) |
| [`src/__tests__/guide.test.ts`](file:///Users/thebeast/code-tutor/src/__tests__/guide.test.ts) | Network-blocked completion test added (VAL-049) |
| [`e2e/beats.spec.ts`](file:///Users/thebeast/code-tutor/e2e/beats.spec.ts) | Major extension: fixed-stage scroll assertion (VAL-013), avatar (VAL-017–018), audio state (VAL-024–027), juice effects (VAL-030), stage visual change (VAL-032), 48-URL resolution (VAL-015–016) |
| [`e2e/map-top.spec.ts`](file:///Users/thebeast/code-tutor/e2e/map-top.spec.ts) | Island visual-change-on-clear assertion (VAL-031) |
| [`e2e/map-sub.spec.ts`](file:///Users/thebeast/code-tutor/e2e/map-sub.spec.ts) | Level-segment URL updates if sub-map links include level |
| [`e2e/a11y.spec.ts`](file:///Users/thebeast/code-tutor/e2e/a11y.spec.ts) | Extended for reduced-motion on new effects (VAL-040), keyboard level completion (VAL-038), colour-not-only (VAL-041), axe baseline (VAL-042) |
| [`e2e/guide-chat.spec.ts`](file:///Users/thebeast/code-tutor/e2e/guide-chat.spec.ts) | Guide-disabled completion path (VAL-048) |
| [`e2e/factory-spotcheck.spec.ts`](file:///Users/thebeast/code-tutor/e2e/factory-spotcheck.spec.ts) | Re-voiced for tier-aware content; factory is removed so spot-checks move to tier-specific content checks |

---

## Definition of done

The mission is done when **all** of the following are green:

**Full gate (must pass clean):**
- `npm run typecheck`
- `npm run lint`
- `npm run test` (all unit/integration suites including new VAL assertions)
- `npm run test:db` (DB integration including migration backfill)
- `npm run test:rls` (RLS regression)
- `npm run build` (manifest build + Next.js build)
- `npm run test:e2e` (all Playwright suites)

**All VAL IDs green:**
VAL-001 through VAL-064 inclusive, plus VAL-014b and VAL-035b, covering REQ-001 through REQ-029. The DB-integration portion of the gate (`npm run test:db`, `npm run test:rls`) requires recorded owner approval or a proven disposable target per VAL-064 before it is run unattended.

**Known limitation, accepted:** no automated check can prove Level 1 "assumes zero prior knowledge." VAL-005 constrains beat *types* and VAL-006 forces coverage of documented real-world confusions, but the claim itself is a judgement call and lands in the manual review at VAL-053. This is stated rather than papered over — an adversarial reviewer should treat it as the weakest assertion in the contract.

**Manual gates with captured evidence:**
- VAL-029 (music sampling page — owner taste gate) — screenshot + `WORK_LEDGER.md` sign-off
- VAL-033 (returning player visual progress) — desktop + mobile screenshots
- VAL-053 (voice guide manual review) — 10-beat review signed in `WORK_LEDGER.md`
- VAL-062 (character approval — SUDO and NULL at real size, in motion, all reactions) — evidence screenshots + `WORK_LEDGER.md` sign-off

**Zero regressions:**
Every file in the "must still pass unchanged" table passes without modification to its existing assertions.
