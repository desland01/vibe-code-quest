# MISSION CONTEXT — Vibe Code Quest Arcade Rebuild

Mission: `2026-08-02-vibe-code-quest-arcade`
Target repo: `/Users/thebeast/code-tutor`
Mission tier: **Long Mission** (multi-milestone, 144 content runs, new audio subsystem, UI shell rebuild)

---

## 1. Sources read

| Source | Present? | What it contributed |
|---|---|---|
| `/Users/thebeast/code-tutor/CLAUDE.md` | yes | Project standards; Constance session rules; verification gate (`typecheck`/`lint`/`test`/`build`); "render the affected surface and inspect it" for visual work |
| `/Users/thebeast/code-tutor/CONTEXT.md` | yes | Glossary: Region, Landmark, Canonical content, Manifest, Access seam, Entitlement, Trial, Snapshot |
| `/Users/thebeast/code-tutor/AGENTS.md` | yes | Mirror of CLAUDE.md (kept in sync per project rule) |
| `/Users/thebeast/code-tutor/README.md` | yes | Product shape, self-host vs hosted mode, load-bearing architectural decisions |
| `/Users/thebeast/code-tutor/package.json` | yes | Next 16.2.6, React 19.2.1, pixi.js 8.14.3, ai 6, zod 4, vitest 4, playwright 1.56. **No audio dependency.** |
| `docs/missions/2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md` | yes (referenced) | Prior FROZEN contract — see §6 Conflicts |
| `.frugal-fable/mission-arcade/repo-map.md` | generated this mission | Content schema, beat grammar, state machine, XP seam, test blast radius |
| `.frugal-fable/mission-arcade/ugc-research.md` | generated this mission | 51 live-sourced findings on real user confusion |

**Absent / not applicable:** none blocking. `docs/` is writable.

---

## 2. Status quo — what exists today

- **8 regions × 6 landmarks = 48 landmarks**, hard-locked by Zod: `regionsSchema` is `.length(8)`, `landmarks` is `.length(6)` (`src/content/schema.ts:49-55`). The build fails on violation.
- **Each landmark is one 5–8 beat run.** 9 beat types: `hook`, `predict`, `reveal`, `scenario`, `tradeoff`, `gotcha`, `default`, `check`, `recap` (`src/content/beats/schema.ts:7-17`). Sequence rules: final beat must be `recap`, a `check` beat is required.
- **46 of 48 runs are machine-derived.** `deriveBeatSequence()` (`src/content/beats/derive.ts:237-298`) projects canonical landmark fields into a fixed 8-beat template with a copy-loyalty rule forcing verbatim field reuse plus an allowlist of framing phrases (`FACTORY_FRAMING`, `derive.ts:16-39`). Only `git/commits-as-checkpoints` and `security/trust-boundaries` are hand-authored.
- **The map is already a fixed 1024×640 Pixi viewport** with camera pan/zoom (`src/lib/mapState.ts:1-2`, `MapCanvas.tsx:109`). The **landmark pages are the scrolling DOM surface** that breaks the game feel.
- **XP is server-derived** from recorded progress: `scenario_solved` 15, `gotcha_solved` 15, `check_passed` 20, `landmark_stamped` 50, capped at 100 per landmark (`src/server/xp.ts:14-33`).
- **Progress merges are monotonic** — a single SQL statement with `GREATEST`/`OR`/`COALESCE` (`src/server/beatProgress.ts:94-122`). Server validates against the registered sequence; the client cannot declare its own beat `kind`.
- **Zero audio exists.** No Web Audio, no Howler, no media files, no audio dependency (verified by repo-wide grep).
- **Motion is CSS-only** with `steps()` timing and full `prefers-reduced-motion` blocks (`beats.module.css:183-187`).
- **Two runtime modes.** Hosted (Postgres/Neon: XP, leaderboard, share cards, cross-device) and self-host (`DATABASE_URL` unset: localStorage only, server-dependent features hidden not broken).
- **Test surface:** 28 unit/integration suites under `src/__tests__/`, 16 Playwright specs under `e2e/`.

## 3. What hurts

The owner — the person who commissioned the product — could not complete `languages/javascript-typescript` and described the experience as "a class that missed the first two semesters." That is a total-failure signal on the primary user journey, not a polish complaint.

Root causes, in order of blast radius:

1. **No on-ramp.** Every landmark opens at tradeoff-level abstraction. There is no vocabulary tier, so a player who does not already know what a repo or a runtime is cannot parse the question, let alone answer it.
2. **The copy is structurally identical across 46 runs** because it is generated from one template with a verbatim-reuse rule. This is the mechanical cause of the "claude-slop word salad" complaint. It is not fixable by editing pages.
3. **The surface is a website, not a game.** Scrolling DOM landmark pages, no sound, no character presence, no persistent state visible on the board, no reward loop beyond a static stamp.
4. **Content is aimed at the wrong confusions.** Research shows real pain concentrates in `.env` files, API keys, "always allow" prompts, deploy, and database choice. The catalogue is organised by subject, not by where people actually get hurt.

## 4. What must not break

| Guarantee | Where enforced today |
|---|---|
| Self-host mode works with `DATABASE_URL` unset — features hidden, never broken | `src/__tests__/hosting.test.ts`, README |
| Keyboard-only play is a supported path | `RegionControls.tsx:16-37`, `e2e/a11y.spec.ts` |
| Screen-reader region list and skip link | `MapExperience.tsx:48-56` |
| `prefers-reduced-motion` disables all animation | `beats.module.css:183-187`, `MapExperience.tsx:35-44` |
| Colour is never the only signal | `✓`/`✗` key icons, `BeatPlayer.tsx:506` |
| The AI guide is never a gate — landmarks complete with it off | `src/__tests__/guide.test.ts`, README |
| Progress writes are monotonic; a stale write never clobbers a newer one | `src/server/beatProgress.ts:94-122` |
| The client cannot declare its own progress `kind` | `resolveProgressWrite`, `beatProgress.ts:67-83` |
| Row-level security — `app_user` role with per-transaction `app.user_id` | `db/migrations/`, `src/__tests__/rls.integration.test.ts` |
| Existing player progress survives | **New requirement this mission** — no current test |
| 48 public landmark URLs keep resolving | **New requirement this mission** — no current test |

## 5. Desperate specificity — who this is for

Not "beginners." Specifically: a person shipping a real product with Replit Agent, Lovable, Cursor, Bolt, v0 or Claude Code, who has already spent money, who does not know what language their app is written in, and who is about to be asked a question they cannot evaluate.

Sourced, verbatim, from live research:

- *"I literally always say always allow. I have no idea what the stuff they are asking means haha. Just out of curiosity how dangerous is that?"* — r/cursor
- *"I have no cookado what code is in my app don't even know what language it is but it works."* — r/vibecoding
- *"That data represents six years of effort…"* — r/replit, after an agent deleted 90% of their database
- *"I'm not a coder and have never created anything before… In under 72 hours, my project had racked up over $700 in expenses."* — r/vibecoding

**The unacceptable failure** is a player who finishes a run and still cannot answer the agent's next prompt. Entertainment without transfer is the failure mode, and it is the one gamification makes easier to hit.

**Where the pain concentrates** (51 findings bucketed): databases 22%, infra 19%, security 15%, ai-types 15%, git 13%, languages 11%, pm-tools 0%, design 0%. Owner directed full build regardless — `design` and `pm-tools` Level 1 content is authored from first principles.

## 6. Conflicts with prior frozen work

`docs/missions/2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md` is marked FROZEN and its §6 constrains motion to CSS `steps()` only. **This mission does not unfreeze it — it inherits it.** Locked decision 6 keeps CSS-only stepped motion, so the arcade juice is built inside the existing constraint rather than against it. No unfreeze request is made.

The v1 mission (`docs/missions/2026-07-10-code-tutor-v1/`) retains open HITL gates (ISSUE-030/032). Nothing here reopens them.

## 7. Glossary changes

`CONTEXT.md` gains these terms (glossary only, zero implementation detail). To be applied during execution, not now:

- **Island:** player-facing name for a Region.
- **Level:** one of three difficulty tiers within a Landmark — Name That Thing, Pick a Lane, Tradeoffs.
- **Run:** one playable pass through a Level's beat sequence.
- **Stage:** the fixed, non-scrolling viewport that all play occurs inside.
- **Avatar:** the player's on-screen character, which reacts to the player's own answers.

**Existing terms unchanged.** "Region" and "Landmark" stay canonical in code; "Island" is presentation only. Flagged because the owner speaks in islands and the code speaks in regions — the packet must not let that drift into a rename.

## 8. Context Sufficiency Gate

| Dimension | Score | Evidence |
|---|---:|---|
| Intent | 2 | Outcome concrete: 3 levels per landmark, locked stage, reactive avatars, synthesized reactive audio, rewritten voice. Success is a player who can answer their agent's next prompt. |
| Boundaries | 2 | Non-goals explicit: no portrait, no deploy, no spend, no unfreeze of the v2 design contract, no schema change to the 8×6 shape, no trademark use. |
| Existing system | 2 | Full cartography with file:line citations; test blast radius enumerated; audio confirmed absent by grep. |
| Validation | 2 | Every locked decision maps to a testable assertion; the overflow rule is deliberately mechanical. Two taste gates are scheduled as HITL, not left implicit. |
| Context slices | 2 | Work decomposes cleanly: content authoring is per-island (8 independent slices), audio is one subsystem, shell is one slice, avatars are one slice. |
| Handoff | 2 | Creative bible, repo map and research file are on disk; no decision lives only in chat. |

**Total: 12/12 — proceed to spec/PRD.**

## 9. Assumptions recorded

- A1: `pixi.js` stays for the island map; the arcade stage is DOM/CSS, not a Pixi rewrite. Rationale: reuse, and the a11y path already lives in DOM.
- A2: The 8×6 Zod locks stay. Levels are a new dimension *inside* a landmark, not a change to region/landmark counts.
- A3: New canonical fields are added to `landmarkSchema` to source L1/L2 content, rather than adding parallel content files. Rationale: one source of truth per landmark; the manifest build already validates it.
- A4: `deriveBeatSequence()` is replaced, not patched. The copy-loyalty rule is the cause of the sameness, so tier-specific authoring supersedes it. Provenance testing must be re-established under the new scheme.
- A5: Audio is Web Audio API synthesis with no files and no dependency, consistent with the repo's "no animation dependencies" discipline.
- A6: Existing stamped landmarks map to L3-cleared on migration.

## 10. State recovery

No temp state file encountered. `mission-state.json` written before each phase transition.
