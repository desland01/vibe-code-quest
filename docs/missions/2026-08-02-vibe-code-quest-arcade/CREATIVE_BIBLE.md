# VIBE CODE QUEST — CREATIVE BIBLE

Mission: 2026-08-02 arcade rebuild. This document is the single creative source of truth
for the 144-run content pass, the character system, the music engine, and the UI rebuild.
Implementation agents build from this file. Nothing here is a suggestion unless marked
"scope call" — everything else is a decision.

Sources read for this document (all real, all cited inline):
- Repo map: `/Users/thebeast/code-tutor/.frugal-fable/mission-arcade/repo-map.md`
- Research: `/Users/thebeast/code-tutor/.frugal-fable/mission-arcade/ugc-research.md`
  (findings cited as A# = vocabulary gaps, B# = decision paralysis, C# = expensive
  mistakes, D = island heat map)
- Copy factory: `/Users/thebeast/code-tutor/src/content/beats/derive.ts`
- Canonical landmark: `/Users/thebeast/code-tutor/src/content/git/branches-as-isolation.ts`
- Motion vocabulary: `/Users/thebeast/code-tutor/src/components/landmark/Beats/beats.module.css`
- Region metadata: `/Users/thebeast/code-tutor/src/content/regions.ts`

## Locked constraints (recap — do not re-litigate)

1. 8 islands × 6 landmarks × 3 levels = 144 runs. Landmark count is Zod-locked
   (`regionsSchema` requires exactly 8 regions × 6 landmarks — repo-map §1).
2. One locked, no-scroll stage. Desktop-first landscape. Stage-fit is a build-failing
   test, so every word budget in §6 is a hard ceiling, not a style note.
3. Characters are the PLAYER'S avatar. Original, legally clean. No real product names.
4. Music is synthesized in code (Web Audio, NES layout: pulse ×2, triangle, noise).
   No audio files. Reacts to gameplay. Starts muted until a user gesture.
5. Voice: deadpan, dry, short. Arcade loudness lives in the furniture only.
6. Motion: CSS `steps()` only, no animation dependencies. Pixel motion snaps.
7. Accessibility is a floor: keyboard-only play, screen-reader path, reduced-motion,
   never color-only, audio muted by default.

**Supersession note for implementers:** the header comment in
`beats.module.css` ("no shake/red-flash", frozen contract §6 of the 2026-07-19 v2
mission) is superseded by this mission's owner interview for CELEBRATION moments only.
The spirit survives as a rule in §4: screen shake and flash NEVER fire on a wrong
answer or any failure state. Wins may shake. Losses stay quiet.

---

# 1. THE CAST

Four "model pets." All are the player's avatar — they react to the PLAYER's answer,
never explain, never tutor, never speak in the question area. They are garnish, not
signal: the UI's existing ✓/✗ icons, border weights, and feedback text (BeatPlayer.tsx
per repo-map §4) remain the primary outcome channel, which is what keeps the avatar
system accessibility-legal. Every reaction below is double-coded in posture + prop so
it reads without sound and without color.

## Shared technical spec

- Native grid: 32×32 px (BOO is 28×32, DUCKY 32×28). Render at integer scale only:
  ×2 (64 px) in HUD and trail, ×3 (96 px) on stamp panel and title screen.
  `image-rendering: pixelated` everywhere.
- Palette: max 5 colors per character + the shared 1 px outline `var(--ink)` (#1a1a1a).
  Fills draw from the existing surface tokens (`--paper` #fff8e9, `--banner`,
  `--region-accent` #d96c6c family) so pets sit on any island without restyling.
- Implementation: one horizontal sprite strip PNG per character per reaction.
  Animation = `background-position` keyframes with `steps(N)` where N = frame count,
  exactly the codebase's existing idiom (`flip-in 240ms steps(4)` etc., beats.module.css).
- Reduced-motion: every reaction renders its FINAL frame as a static pose (pose alone
  must carry the verdict — verified per-reaction below). Idle is static frame 1.
- Silhouette test: all four must be distinguishable as pure black shapes at 32 px:
  dog (flop ear + snout), cat (tall pointed ears + wrapped tail), ghost (scalloped hem,
  no legs), duck (beak wedge + flat bottom). Do not ship a sprite that fails this.

## SUDO — pixel dog. DEFAULT AVATAR.

- Personality (one line): Approves everything instantly. Your cautionary tale, made
  adorable. (He is the "always allow" button with a tail — research A6.)
- Look: 32×32. Body golden #e8b04b, chest/muzzle #fff8e9, collar #d96c6c with a 3×3 px
  tag that reads as a glint pixel, nose ink. Sitting quadruped. Distinguishing feature:
  LEFT EAR permanently flopped over; right ear stands. Stubby tail.
- Reactions:
  - **idle** — 2 frames, 1200ms, steps(2), infinite. Tail nub wags 1 px; chest rises 1 px.
  - **thinking** (player idle on a choice > 4 s) — 2 frames, 900ms, steps(2), infinite.
    Head tilts 2 px left then right; flop ear slides over one eye.
  - **correct** — 4 frames, 360ms, steps(4), once, then idle. Full-body hop: crouch 2 px,
    airborne 4 px, BOTH ears up, landing frame has a 3-position tail-blur. Static pose
    (reduced-motion): airborne frame, ears up.
  - **wrong** — 3 frames, 270ms, steps(3), once; hold final frame 600ms. The shrug:
    shoulders up 2 px, ears drop 2 px, eyes become closed 2 px lines. Static pose:
    the held shrug. Never sad — resigned.
  - **level-clear** — 6 frames, 720ms, steps(6), loops ×2. Backflip: crouch, 4 rotation
    frames, land with an 8×4 px dust-puff sprite that lives inside the strip.
  - **island-clear** — 8 frames, 960ms, steps(8), loops until panel dismissed. Zoomies:
    tight circle run (mirror the sprite horizontally on frames 5–8), collar tag flashes
    one white pixel on frame 6.
  - **long-idle easter egg** (45 s no input, fires once per screen) — 4 frames, 1600ms,
    steps(4), once. Lies down; one ear twitch; a 4×4 px "z" rises 6 px and pops.
- Verdict legibility without color/sound: ears up + airtime = correct; ears flat +
  eyes closed = wrong. Two different silhouettes.

## NULL — void cat. UNLOCKABLE.

- Personality: Unimpressed by you, the agent, and causality.
- Look: 32×32. Body near-black #2b2b33 over the ink outline with a mandatory 1 px
  #fff8e9 rim-light along the top edge (keeps the silhouette readable on dark panels).
  Empty white oval eyes (no pupils), inner-ear #d96c6c, tail tip #fff8e9. Sitting,
  tall pointed ears, tail wrapped around feet. Distinguishing feature: on one thinking
  frame the eyes render as the ∅ glyph.
- Reactions:
  - **idle** — 2 frames, 1600ms, steps(2), infinite. Tail-tip flick 2 px. Every 4th cycle
    swap in a 1-frame slow blink (build the blink into an 8-frame extended strip).
  - **thinking** — 2 frames, 1000ms, steps(2). Stares directly at the viewer; pupil
    pixels appear and shift 1 px left/right.
  - **correct** — 3 frames, 300ms, steps(3), once. One approving slow blink; tail
    lifts into a check-mark curve for the final frame. The minimum legally required
    celebration. Static pose: tail-check frame.
  - **wrong** — 3 frames, 270ms, steps(3), hold 600ms. Ears rotate sideways 2 px,
    head turns 2 px away from the choices. Disappointment, not anger.
  - **level-clear** — 5 frames, 600ms, steps(5), ×2. An 8×8 trophy sprite sits at
    panel edge; NULL pushes it off with one paw; trophy exits the stage; NULL watches.
  - **island-clear** — 6 frames, 900ms, steps(6), loop. Tucks into a loaf; 1 px purr
    vibration; three 5×5 px ∅ particles rise like bubbles and pop.
  - **long-idle** — 4 frames, 2000ms, steps(4), once. Walks 8 px and sits facing away
    from the screen. Any input: play the strip mirrored to return.
- Verdict legibility: tail-check up = correct; head turned away = wrong.

## BOO — boolean ghost. UNLOCKABLE. (v1.1 — see §8)

- Personality: Has exactly two states and manages both poorly.
- Look: 28×32. Sheet #fff8e9, cheeks #d96c6c, underside shadow #b8b0a0, ink outline.
  Rounded top, 3-scallop wavy hem, stub arms, no legs (hovers 2 px above its shadow
  ellipse). Distinguishing feature: a 5×7 px chest glyph — `1` normally, `0` when wrong.
- Reactions:
  - **idle** — 2 frames, 1000ms, steps(2). Hover bob 2 px; hem scallops alternate.
  - **thinking** — 2 frames, 800ms. Chest glyph flickers 1 ↔ 0. (Uncertainty, rendered.)
  - **correct** — 4 frames, 360ms, steps(4). Loop-the-loop (4 rotation frames); glyph
    `1` rendered bold at 2 px stroke on the final frame. Static pose: bold-1 frame.
  - **wrong** — 3 frames, 270ms, hold 600ms. Body drops to 50% via checkerboard dither
    frame (NOT alpha — stays crisp), glyph flips to `0`, drifts down 2 px.
  - **level-clear** — 6 frames, 720ms, ×2. Multiplies: two 14×16 mini-boos pop out,
    orbit once, merge back. (true AND true.)
  - **island-clear** — 8 frames, 960ms, loop. Slot-machine spin: glyph cycles
    1-0-1-0 while the body spins, lands on `1`; hem flares on the landing frame.
  - **long-idle** — 3 frames, 1400ms. Dithers to 25% and "leaves"; frame 3 is just the
    eyes peeking back in from the panel edge.
- Verdict legibility: glyph literally prints the boolean; loop vs droop.

## DUCKY — rubber duck. UNLOCKABLE. (v1.1 — see §8)

- Personality: Says nothing. Hears everything. Judges silently. (Rubber-duck
  debugging: the player explains, the duck listens — which is exactly the
  human-in-the-loop posture this game teaches.)
- Look: 32×28. Body #f2d94e, beak wedge #e07a3f, ink outline, single 1 px white eye
  glint. Classic bath-duck silhouette: flat bottom, round head. Sits on a 32×4 px
  water-line strip. Distinguishing feature: the duck itself NEVER animates in idle.
- Reactions:
  - **idle** — duck: 1 frame, static. Water-line beneath: 2 frames, 1600ms, steps(2).
    The world moves; the duck does not. This is the joke; protect it.
  - **thinking** — duck static + an 8×8 "…" bubble typing dots 1→2→3, 900ms, steps(3).
  - **correct** — 2 frames, 200ms, steps(2), once. A single 15° forward bow-tilt and
    return. Devastatingly sufficient. Static pose: bowed frame.
  - **wrong** — 2 frames, 240ms, once. Tips 15° BACKWARD, roly-polys upright. No facial
    change (it has no face to change).
  - **level-clear** — 4 frames, 480ms, ×2. Full 360° roll in place; ends pixel-identical
    to idle; eye glint flashes on frame 3.
  - **island-clear** — 5 frames, 800ms, loop. A 7×5 px crown descends onto its head.
    The duck remains motionless. Water ripple doubles to 4 px amplitude.
  - **long-idle** — 3 frames, 2400ms, once. A second, smaller duck surfaces beside it,
    floats for two frames, submerges. Never referenced again anywhere in the game.
- Verdict legibility: tilt direction is the verdict — forward = yes, backward = no.

## Default, picking, unlocking

- Default: **SUDO**. Selected automatically for a brand-new player (first-60s must not
  stall on a decision — §7 gives the picker 8 seconds, auto-continues on SUDO).
- Picker: title screen card row + swap option on the pause/menu overlay. Keyboard:
  ←/→ to highlight, Enter to lock. Each card = ×3 sprite in idle + name + one-line
  personality. Locked cards render as ink silhouettes with their unlock condition in
  plain text (no mystery boxes).
- Unlocks (progress-based, no currency):
  - NULL — clear Level 1 on all 6 landmarks of any one island (first island tier-1).
  - BOO — stamp your first Level 3 run.
  - DUCKY — reach a 10-answer streak (any level).
- Storage: `ct-avatar` + `ct-avatar-unlocks` in localStorage beside the existing
  `ct-beat-progress:*` keys (beatStorage.ts pattern, try/catch-wrapped, repo-map §4).
  Server profile column is NOT in scope (§8).
- Where the avatar appears: HUD corner during a run (×2), standing on the current
  trail tile (§3, ×2), the map "you are here" marker (×2), stamp panel (×3), title
  screen (×3). It never appears inside the question card.

---

# 2. LEVEL NAMES — ALL 24

Format per level: NAME — subtitle (this exact copy ships, deadpan voice) — what the
player actually learns — research grounding for L1/L2.

The three-level frame, everywhere in UI copy:
- Level 1 "Name That Thing" — vocabulary. Zero prior knowledge. (Owner: today's game
  is "a class that missed the first two semesters." L1 is those two semesters.)
- Level 2 "Pick a Lane" — an agent asks you something real, you answer. L2 beats render
  as an agent chat bubble + player replies (see §6, L2 register).
- Level 3 "Tradeoffs" — ambiguous, no clean answer. Roughly today's content, re-voiced.

## Island 1 — Languages ("Syntax is the road sign, not the road." — regions.ts)

- **L1: WHAT EVEN IS CODE** — "Your app speaks three languages. You speak none of them.
  Yet." — Learns: what a programming language is, what a file of code is, that one app
  mixes JavaScript/HTML/CSS and why. Grounding: A7 ("I have no cookado what code is in
  my app don't even know what language it is"), A21 ("vibe coding is fun until you
  realize you dont understand what you built").
- **L2: DON'T JUST NOD** — "The agent asks if the code looks right. It can tell when
  you're bluffing." — Learns: the three things a non-coder CAN check when shown a diff
  (which files, how much, does the description match the ask). Grounding: A15 ("I have
  no idea why half of it is the way it is"), A19 ("Just vibe. I couldn't read the code
  anyway"), A14 (can't tell when AI hallucinates).
- **L3: STRONGLY TYPED OPINIONS** — "Types, runtimes, and other fights you didn't know
  you were in." — Learns: tradeoffs of types-and-contracts, runtimes-and-packages, and
  reading generated code at depth (existing landmark material, re-voiced).

## Island 2 — Databases ("Where app memory becomes product memory.")

- **L1: WHERE THE STUFF LIVES** — "Your data is in a building somewhere. Let's find out
  which one." — Learns: what a database is, table/record/query as words, that
  Supabase/PostgreSQL/Firebase/MongoDB are brand names for two or three ideas.
  Grounding: A10 ("I've come across terms Supab, PostgreSQL Firebase, MongoDB, but I'm
  feeling quite overwhelmed"), A12 (told data was "in a Neon database": "I'm not quite
  sure what this refers to, but it definitely seems negative").
- **L2: SQL OR NAH** — "The agent wants to pick your database. It will pick with
  confidence either way." — Learns: how to answer the pick-a-database question, the
  dev-vs-prod distinction, and the one question to ask before saying yes to anything
  touching data ("is this the production database, and is there a backup?").
  Grounding: B1, B6 (database choice paralysis), B10 (dev vs prod confusion),
  A11 (doesn't know how to back up), C1 (agent deleted six years of data).
- **L3: SCHEMA THERAPY** — "Migrations, ORMs, and long-term commitment issues." —
  Learns: tradeoffs of schema change, ORM vs raw SQL, hosted vs self-hosted (existing
  landmark material, re-voiced).

## Island 3 — Infra / Hosting ("The deployment terrain under every working app.")

- **L1: THE CLOUD IS A BUILDING** — "Servers are computers. Deploying is copying. Feel
  better?" — Learns: server, deploy, build, terminal, IDE — as plain words with plain
  referents. Grounding: A5 ("How are you guys deploying your vibecoded apps?" — a
  recurring open question), A8 ("could you explain what VS Code is"), A9 (terminal fear),
  A17 (what a "build" is).
- **L2: SHIP IT (BUT WHERE)** — "Live URL today, or a bill you meet next month.
  Choose." — Learns: answering the agent's "deploy to X?" question; recognizing which
  choices carry meters (usage billing) and which are flat. Grounding: B9 ("no idea how
  to get from a chat window to a live URL"), B5 (can Replit handle it / €5,000–10,000
  fear), C9 ($1,982 in 24 days pre-launch).
- **L3: IT WORKS ON MY MACHINE** — "Famous last words, now with tradeoffs." — Learns:
  environment differences, portability, scale — serverless vs VPS vs containers vs edge
  (existing landmark material, re-voiced).

## Island 4 — AI Types ("Chat, agents, RAG, tools, evals, and model routing.")

- **L1: ROBOT OR AUTOCOMPLETE** — "Model, agent, workflow. Three words the tools use
  interchangeably. They aren't." — Learns: model call vs agent vs workflow; what
  "hallucination" means; what "tools" means when an AI says it. Grounding: A14 ("How do
  you know the AI is hallucinating if you don't code?"), A22 (completely lost about
  where to begin among AI tools).
- **L2: PICK YOUR FIGHTER** — "Every tool claims to be the best one. Someone is
  wrong." — Learns: matching the shape of the tool to the shape of the job, and the
  one skill that beats tool choice: noticing when an agent is looping and stopping it.
  Grounding: B2, B3, B7 (Cursor/Lovable/Windsurf/Claude Code/v0 paralysis),
  C4 ($700+ runaway retry loop: "a single click from a user set off an endless loop").
- **L3: TRUST FALLS** — "You can't check everything. You can't check nothing.
  Welcome." — Learns: evals, verification depth, model routing tradeoffs (existing
  landmark material, re-voiced).

## Island 5 — PM Tools ("Linear, issues, specs, and the work graph agents read.")

Design note: research found ZERO pm-tools confusion (D: 0 findings — "non-technical
users are not confused about project management tooling; they're confused about the
building itself"). So this island is framed honestly as prevention: the specs island
exists because vague asks are how the OTHER islands' disasters start.

- **L1: TICKETS ARE JUST LISTS** — "The least scary island. That's the trap." —
  Learns: issue, backlog, spec, acceptance criteria as words; why agents need written
  scope at all. Grounding: D (zero findings — the level says so out loud), C6 ($1,000
  for a refactor "the AI never actually completed" — an unscoped ask).
- **L2: SPEC IT OR REGRET IT** — "The agent will build exactly what you said. That's
  the problem." — Learns: turning a wish into a checkable slice when the agent asks
  "what exactly should I build?"; writing the done-condition before the work.
  Grounding: C6, C11 ($400 "fixing my code" — changes the user didn't scope or expect).
- **L3: SCOPE CREEPS** — "It's one more feature. It's always one more feature." —
  Learns: backlog-vs-now, dependencies and work graphs, decision logs (existing
  landmark material, re-voiced).

## Island 6 — Git ("The time machine every serious builder eventually needs.")

- **L1: SAVE POINTS** — "You already understand git. You've just never died in it
  before." — Learns: repo, commit, branch, push — mapped to game-save vocabulary the
  player already owns. Grounding: A3 (repos: "What's confusing about repos?"), A4
  (post titled "Git for what?"), A16 (wiped repo AND commit history, "baffled").
- **L2: THE AGENT MADE A BRANCH** — "It did this without asking. Let's decide how to
  feel." — Learns: what to say when a tool branches, merges, or pushes on your behalf;
  which git actions are reversible and which need a breath first. Grounding: B14
  ("v0 keeps creating a new git branch each time I deploy"), B13 (doesn't know the
  technical process for major revisions), C3 (accidentally wiped repo + history).
- **L3: TIME TRAVEL RESPONSIBLY** — "Undo exists. It has fine print." — Learns:
  revert vs reset, merge conflicts, long-lived branch drift (existing landmark
  material — including `branches-as-isolation` — re-voiced).

## Island 7 — Security ("Secrets, permissions, trust boundaries, and blast radius.")

- **L1: SECRETS ARE CALLED THAT FOR A REASON** — "If your API key is in the code, it's
  a donation." — Learns: what an API key, a secret, and a .env file are; why "in the
  code" and "in the browser" mean "public." Grounding: A1 (.env confusion, Very High,
  8+ threads), A2 (API key confusion, Very High, 10+ threads), C5 (key in frontend JS,
  $40 exploited).
- **L2: THE ALWAYS-ALLOW BUTTON** — "'I literally always say always allow.' — someone,
  shortly before the incident." — Learns: how to read a permission prompt; the three
  words that mean stop (delete, production, all); saying no as a default. Grounding:
  A6/B4 (verbatim quote in the subtitle — r/cursor thread "how bad is always saying
  always allow"), C1 (agent deleted 90% of a six-year database), C7 ("Claude Code wiped
  my entire production database"), C10 (approved `rmdir /s /q` without understanding).
- **L3: BLAST RADIUS** — "Not if something leaks. How much burns when it does." —
  Learns: least privilege, trust boundaries, supply chain, injection (existing
  landmark material, re-voiced).

## Island 8 — Design Systems ("The layer between a working app and a believable app.")

Design note: research found zero design confusion (D: AI handles "make it look like
Apple's website" fine). So the design island teaches the player to SAY what they see —
vocabulary that makes their natural-language design requests precise.

- **L1: WHY IT LOOKS OFF** — "You can see it's wrong. Now learn to say it's wrong." —
  Learns: token, component, spacing, hierarchy as words — names for the things their
  eyes already notice. Grounding: D (0 findings — natural language covers design;
  the gap is precision, not capability).
- **L2: MAKE IT POP (PRECISELY)** — "The agent heard 'make it pop.' It is now
  guessing." — Learns: answering the agent's design questions with a specific noun
  (which token, which size step, which component) instead of adjectives.
- **L3: BORING ON PURPOSE** — "Consistency is a feature. Novelty is a budget." —
  Learns: consistency-vs-novelty, the accessibility floor, layout rhythm (existing
  landmark material, re-voiced).

---

# 3. THE BOARD EVOLVES

Two boards evolve: the overworld map (8 islands) and the level stage (during a run).
Everything below is state-driven from data that already exists or is already planned
(per-landmark per-level completion), rendered as sprite-state swaps — visible at a
glance, never color-only, and instant under reduced-motion.

Precondition note (project CLAUDE.md: "Do not implement map visuals before the
mission's required design artifact exists"): §3 of this bible plus a sprite comp sheet
produced from it IS that artifact chain. Build the comp sheet before touching
MapCanvas.

## 3.1 Overworld island states

Each island renders one of four visual tiers, derived from completion counts:

| Tier | Name | Trigger | What the player sees |
|---|---|---|---|
| 0 | Charted | default | Bare terrain, DASHED shoreline outline, one wooden signpost sprite (12×16) with the island name banner. No structures. |
| 1 | Settled | all 6 landmarks' L1 stamped | Dashed shoreline becomes solid. A dirt path sprite connects the 6 structure sites. Badge chip under the banner: `L1 ✓`. |
| 2 | Built | all 6 landmarks' L2 stamped | Central plaza tile + banner pole added at island center. Badge chip: `L2 ✓`. |
| 3 | Mastered | all 6 landmarks' L3 stamped | Beacon tower (16×24) at the plaza, lit: 2-frame glow pulse, 1200ms steps(2) infinite. Shoreline gains crenellation pixels (a SHAPE change, not just gold color). Badge: `★`. |

Per-landmark structures on the island (progressive, independent of tier):

| Landmark state | Structure sprite | Size |
|---|---|---|
| Nothing stamped | empty site: 4 ground pixels | — |
| L1 stamped | tent | 8×8 |
| L2 stamped | hut (replaces tent) | 12×12 |
| L3 stamped | tower with pennant; pennant flutters 2 frames, 800ms steps(2) | 12×16 |

- Reveal animation when a structure appears/upgrades (fires once, on the map visit
  after the stamp): structure rises from the ground, 6 frames, 480ms steps(6) — the
  same grammar as `stamp-in 480ms steps(6)` (beats.module.css). Reduced-motion:
  appears instantly, no rise.
- Non-color redundancy: tier is readable from STRUCTURE SHAPES (tent/hut/tower),
  path presence, and the text badge chip. The sr-only region list (MapExperience.tsx
  per repo-map §3) gains per-island text: "Git — Level 1 complete, 4 of 6 Level 2."

## 3.2 Returning player — "you are here"

- The player's avatar sprite (×2) stands at the last-played landmark's structure site
  on the overworld map, with a bobbing chevron above it: 2 frames, 600ms steps(2),
  2 px amplitude. Reduced-motion: static chevron.
- The island banner of that island gains a `CONTINUE` text chip.
- Map camera initial position centers that island (camera state machinery exists —
  mapState.ts pan/zoom per repo-map §3).
- Source of truth: latest `stampedAt`/furthest progress from the existing progress
  rows (server GET /api/progress for authed, localStorage for anon — repo-map §5).
- On the sub-map (SubMapScene landmark grid), each landmark card shows THREE level
  slots as pips (replacing the single stamped state): filled square = stamped, half
  square = in progress (furthest > 0), empty = untouched. Text equivalent in the
  card's aria-label.

## 3.3 The level stage evolves during a run

The run stage gains a **trail**: a horizontal strip of tiles along the stage bottom,
one tile per beat (5–8 tiles, matching `beatSequenceSchema`'s 5–8 beat bound,
repo-map §1). This REPLACES the current `.pips` visually; the sr-only pip labels
stay for screen readers.

- The avatar stands on the tile of the current beat. On advance, it hops to the next
  tile: translateX one tile-width with a 8 px arc, 240ms steps(3). Reduced-motion:
  avatar teleports; tile states still change.
- Tile states (shape-coded):
  - untouched: flat plank tile
  - resolved first-try: plank + LIT LANTERN sprite (6×10, 2-frame flicker 900ms steps(2))
  - resolved after a wrong pick: plank + PATCHED board sprite (visible nail pixels —
    different SHAPE from lantern; the run remembers, without punishing)
  - current: tile outlined 3 px `var(--ink)` + avatar standing on it
- Streak set-dressing (backdrop props accumulate; all are state swaps):
  - streak 3: a campfire sprite lights behind the trail (2-frame flicker)
  - streak 5: a flag hoists on a pole behind the avatar (3-frame raise, 360ms steps(3),
    then 2-frame flutter)
  - wrong answer: campfire drops to embers state (1 frame); flag stays (streaks are
    celebrated, their loss is not dramatized — §4)
- Level 3 stage variant: dusk backdrop tile-set + moon sprite + lanterns become
  torches (shape change accompanies the palette change). Signals "harder" at a glance.
- Resume mid-run: existing frontier behavior (beatReducer per repo-map §4) — trail
  renders lanterns/patches up to `furthestBeatIndex`, avatar on the display tile.

## 3.4 Run-complete → board feedback loop

After the stamp panel, the map visit shows the structure-rise reveal (3.1). This is
the loop the owner asked for: play a run → the world visibly accretes → the map is
the trophy case. The stamp panel's "next landmark" link (existing, BeatPlayer stamp
panel per repo-map §4) gains a second link: `SEE THE ISLAND` → sub-map, where the
new structure rises on arrival.

---

# 4. JUICE

Global rules:
- Every effect is CSS `steps()` on transform/opacity/background-position. No easing
  curves, no animation libraries, no JS-driven rAF tweens.
- Shake and flash fire ONLY on victories (level/island complete). Wrong answers get
  quieter, never louder (supersession note, header).
- Every effect has a reduced-motion fallback that still communicates the outcome via
  text + icon + border/shape change. SFX still plays under reduced-motion (sound is
  not motion); muted state is orthogonal.
- Particles are fixed sprite strips (pre-drawn burst frames), not a particle system.
  One "burst" = a single absolutely-positioned div playing an N-frame strip. Max two
  bursts on screen at once.
- Hitstop = pausing the typewriter/sprite for a fixed ms; implement as a delayed
  class flip, not a JS animation.

| Event | Visual (exact) | Sonic (spec in §5) | Reduced-motion fallback |
|---|---|---|---|
| **Answer correct** | 80ms hitstop (nothing moves). Then: chosen card pops scale 1→1.06→1, 180ms steps(3); ✓ key icon stamps in 120ms steps(2); one 6-particle pixel burst (4×4 px squares rising 24 px), 400ms steps(5), from the card's top edge; avatar plays `correct`; feedback text types on. | SFX `sfx-correct` at hitstop end | Card border thickens 3→4 px + ✓ icon + feedback text instantly; avatar static correct pose; no burst |
| **Answer wrong** | Card dips translateY(2 px), 120ms steps(2), returns; ✗ icon; avatar plays `wrong`; feedback text leads with the L-word set (§6). No shake. No flash. Existing red-brown border (#b0432f) stays but is never the only cue (icon + text + dip). | SFX `sfx-wrong` (soft, quieter than correct) | Border + ✗ + text instantly; avatar static shrug |
| **Streak building** | Combo badge (HUD furniture, top-right): appears at streak 3 — slides in from right edge 16 px, 160ms steps(2), pixel-font `×3`. Each increment: badge pops scale 1→1.15→1, 90ms steps(3). At 5+: badge border becomes marching-ants (4-frame dashed-border strip, 480ms steps(4) infinite). Trail props per §3.3. | SFX `sfx-streak` (pitch climbs per step); music layers per §5 | Badge appears/updates with no pop; ants static dashed border; number is the signal |
| **Streak broken** | Badge falls: translateY(10 px) + opacity 0, 200ms steps(3), gone. Campfire → embers. Nothing else. The wrong-answer sound already played; no extra sting. | music layers drop (§5) | Badge disappears; embers state |
| **Level complete** | Banner `LEVEL CLEAR` in pixel font: letters stamp in one-by-one, 60ms per letter, steps(1) each (staggered `animation-delay`). Stage punch-in: wrapper scale(1.02) for 120ms then back, steps(1) each way. Screen shake: wrapper translate ±2 px, 3 frames, 180ms steps(3), once. One 12-particle star burst behind the banner, 600ms steps(6). XP tally counts up in 8 ticks (text swaps, 80ms apart). Avatar `level-clear`. | music hard-stops on the next 8th; `jingle-level` (1.5 s); XP tick per count | Banner + final XP total render instantly; avatar static victory pose; no shake/burst |
| **Island complete** (6th stamp of a level tier on an island) | Everything from level complete, plus: shake ±3 px, 4 frames, 240ms steps(4); THREE staggered 8-particle bursts (0/200/400ms delays); banner `ISLAND CLEAR — <NAME>`; then an inset map cut-in panel (320×200) showing the island playing its tier-upgrade rise (480ms steps(6), §3.1); avatar `island-clear` loops. | `fanfare-island` (2.5 s) | Banner + static cut-in of the NEW island state + text "Git island: Level 1 complete."; no shake/bursts |
| **First entry to a new island** | Island title card overlays the stage: name banner unfurls vertically 0→100% height, 240ms steps(4); island label line (regions.ts `label`) types on at 20ms/char; card auto-dismisses on first input. Camera on the map pans to the island before entry: world-container translate over 500ms steps(8) (choppy pan IS the aesthetic). | island theme starts (crossfade at next bar, §5) | Title card appears fully formed, dismiss on input; map jumps without pan |

Text pops (used with correct answers and XP): `+15` in pixel font rises 16 px,
300ms steps(4), then gone. Reduced-motion: appears beside the XP counter for 800ms,
no travel. XP values are the existing server-derived awards
(`scenario_solved: 15, gotcha_solved: 15, check_passed: 20, landmark_stamped: 50`,
xp.ts per repo-map §5) — the juice layer NEVER invents numbers, it renders what
`/api/progress` returns.

---

# 5. SOUND DESIGN

## 5.1 Engine contract

- One `AudioContext`, created lazily on first user gesture (locked constraint:
  starts muted — see gesture flow in §7). Master `GainNode` at 0 until the player
  opts in; the scheduler RUNS regardless, so unmuting mid-run lands on-beat.
- Channel budget, NES-strict — exactly four voices:
  - `pulse1` — lead melody (square oscillator; duty via PeriodicWave: 50% default,
    25% variant)
  - `pulse2` — harmony/counter-line/offbeat stabs (square, 25% duty default)
  - `triangle` — bass (triangle oscillator, no volume envelope — NES-authentic:
    it's on or off)
  - `noise` — drums/SFX transients (looped white-noise AudioBuffer through a
    bandpass; "kick" = lowpassed long decay, "snare" = mid, "hat" = highpassed short)
- Scheduler: 16th-note grid, lookahead timer 25ms interval scheduling 100ms ahead
  (the standard Web Audio pattern). Patterns are plain arrays of `{note, len}` in
  16th-steps; tempo per island.
- SFX may steal a music channel for their duration (NES-authentic priority:
  SFX > music on pulse2/noise; pulse1 melody is never stolen).
- Mute toggle: `M` key + HUD icon (icon + text label, not color-only). State in
  localStorage `ct-audio`. Default OFF.
- Note format used below: `PITCH:len` where len is in 16th-note steps
  (16 steps/bar, 4/4). `r` = rest. Bars separated by `|`.

## 5.2 Island themes — tempo, key, feel, signature riff

Each island theme = signature riff (lead), a chord loop, and the standard drum kit.
Composer-agent expands each to 8 bars using the riff as bars 1–2; the riff below is
the identity and ships verbatim.

| Island | BPM | Key | Feel | Signature riff (pulse1 unless noted, one bar) |
|---|---|---|---|---|
| languages | 112 | C major | bright primer | `C5:2 E5:2 G5:4 A5:2 G5:2 E5:4` |
| databases | 96 | A minor | basement bassline (riff on triangle, pulse1 sparse) | `A3:4 A3:2 C4:2 E4:4 D4:2 C4:2` |
| infra | 120 | E minor | driving, motorik | `E4:2 E4:2 G4:2 A4:2 B4:4 A4:2 G4:2` |
| ai-types | 132 | D dorian | glassy 16th arpeggios | `D5:1 F5:1 A5:1 C6:1 D6:2 C6:1 A5:1 F5:2 A5:2 D5:4` |
| pm-tools | 104 | F major | tidy, clipboard bounce | `F5:2 A5:2 F5:2 C5:2 G5:2 A5:2 G5:2 F5:2` |
| git | 116 | G major | overworld adventure | `G4:2 B4:2 D5:2 G5:2 F#5:2 D5:2 E5:4` |
| security | 100 | C# minor | staccato sneak | `C#4:1 r:1 C#4:1 r:1 E4:2 F#4:2 G#4:4 E4:2 r:2` |
| design | 108 | B♭ lydian | dreamy showroom | `Bb4:4 D5:2 E5:2 F5:4 D5:2 Bb4:2` |

Standard drum kit (noise channel, per bar of 16 steps): kick @ 0 and 8; snare @ 4
and 12; hats on every even step. Islands may thin this (security drops hats; design
drops the snare) but never add a fifth voice.

## 5.3 How music reacts

| Game state | Music change |
|---|---|
| streak ≥ 3 | noise hats double: every even step → every step (8ths → 16ths) |
| streak ≥ 5 | pulse2 enters with a harmony line a 3rd below pulse1's melody notes |
| streak broken | added layers drop on the next 8th note (no sting — silence is the message) |
| wrong answer | music master gain dips to 0.5 for exactly one bar, then restores (SFX unaffected) |
| entering a Level 3 run | island theme variant: tempo ×0.94 (≈ −8 BPM), transposed −3 semitones, pulse2 silent until streak 5. The room gets quieter. |
| level complete | music hard-stops at the next 8th → `jingle-level` → theme resumes on the stamp panel at half master gain |
| island complete | as above but `fanfare-island`, and the NEXT map visit plays the main theme, not the island theme |
| idle > 60 s | master music gain glides to 0.3 (attract hush); restores on input |

## 5.4 SFX list (every §4 event, waveform + envelope)

| SFX id | Trigger | Spec |
|---|---|---|
| `sfx-correct` | answer correct | pulse 50%: C6 30ms → E6 30ms → G6 60ms; gain 0.30, exponential decay to 0 over the final note |
| `sfx-wrong` | answer wrong | pulse 25%: E4 60ms → C4 90ms; gain 0.22 (quieter than correct — losses are quiet), linear decay |
| `sfx-nav` | keyboard/hover moves selection | noise, highpass 6 kHz, 12ms, gain 0.12 |
| `sfx-lock` | option locked (Enter) | pulse 50%: A5 25ms, gain 0.2 |
| `sfx-flip` | reveal card flip-in | noise 30ms highpass sweep + pulse chirp A5→C6 40ms, gain 0.2 |
| `sfx-streak` | combo increments | pulse 50% arpeggio C5-E5-G5 at 25ms/note; each combo level transposes the whole figure +1 semitone, capped at +7 |
| `sfx-combo-break` | streak broken | pulse 25%: G4 40ms → E4 60ms, gain 0.18 (the quietest sound in the game) |
| `sfx-stamp` | stamp pressed | triangle C3 40ms + simultaneous noise burst lowpassed 400 Hz, 80ms decay ("thunk-hiss") |
| `sfx-xp-tick` | each XP tally tick | pulse 50%: G6 12ms, gain 0.15, +1 semitone per consecutive tick (8 ticks = one octave run) |
| `jingle-level` | level complete | pulse1: `C5:1 E5:1 G5:1 C6:1 E6:3 D6:1 C6:8` at 132 BPM; pulse2 harmony a 6th below entering on E6; triangle C3:4 G3:4 C4:8; noise: snare roll on the four 16ths, long-decay crash on the landing |
| `fanfare-island` | island complete | phrase 1: `G5:2 G5:2 A5:2 B5:2 C6:4` (announce); phrase 2: `C6:1 B5:1 A5:1 B5:1 C6:2 D6:2 E6:8` held; pulse2 arpeggiates C-major triad in 8ths under the hold; triangle roots C3→G3→C4; kick + crash on the downbeats |
| `sfx-build` | map structure rises | triangle glissando C3→C4 over 300ms + noise shimmer (highpass, 300ms linear fade) |
| `sfx-title` | title "press any key" | two blips: C6 30ms, E6 30ms, gain 0.25 |
| `sfx-unlock` | avatar unlocked | `jingle-level` transposed +5 semitones, half gain |

The question text NEVER makes sound (no typewriter clicks) — locked voice rule:
the question stays calm; loudness lives in the furniture.

## 5.5 MAIN THEME — "Insert Coin, Ask Questions"

Title screen + overworld map. C major, 132 BPM, 4/4, 8 bars, loops. Note data is
final; translate directly to pattern arrays.

**pulse1 (melody), 50% duty:**

```
Bar 1: C5:2 E5:2 G5:2 C6:2 B5:2 G5:2 A5:4
Bar 2: F5:2 A5:2 C6:2 A5:2 G5:4 E5:4
Bar 3: D5:2 F5:2 A5:2 D6:2 C6:2 A5:2 B5:4
Bar 4: G5:2 E5:2 D5:2 E5:2 C5:8
Bar 5: E5:2 G5:2 C6:2 E6:2 D6:2 C6:2 B5:4
Bar 6: F5:2 A5:2 C6:2 F6:2 E6:2 C6:2 D6:4
Bar 7: G5:2 B5:2 D6:2 G6:2 F6:2 D6:2 E6:2 C6:2
Bar 8: D6:2 B5:2 G5:2 B5:2 C6:8
```

**triangle (bass):** roots in 8ths (each `:2`), alternating root/fifth —
Bar 1 `C3 G3 C3 G3 C3 G3 C3 G3`; Bar 2 on F; Bar 3 on D; Bar 4 `G2` first half,
`C3` second; Bars 5–6 as 1–2; Bar 7 on G; Bar 8 `G2 G2 G2 G2 C3:8`.

**pulse2 (25% duty):** offbeat chord stabs — rest on every downbeat 8th, chord
third on every offbeat 8th (Bar 1: `r:2 E4:2 r:2 E4:2 r:2 G4:2 r:2 G4:2`; follow
the chord per bar: C / F / Dm / C-G / C / F / G / G→C). On bars 4 and 8, pulse2
holds the third under the melody's long note instead of stabbing.

**noise:** standard kit (5.2): kick @ 0, 8; snare @ 4, 12; hats on evens.

### Three variants — owner picks by ear

| Variant | One line on what's different |
|---|---|
| **V1 "Attract Mode"** | Exactly as written: 132 BPM, 50% duty lead, bright and pushy — the arcade floor version. |
| **V2 "Bedroom Tape"** | 96 BPM, both pulses at 25% duty, melody dropped one octave, 55% swing on the 8ths, hats halved — lo-fi study-stream version of the same tune. |
| **V3 "Final Boss of Not Knowing"** | 152 BPM, transposed to A minor, triangle bass runs constant 16ths, snare on every offbeat — the same melody played like something is chasing it. |

Build all three from the same pattern data with parameter deltas (tempo, duty,
transpose, swing, drum map) — not three hand-copies.

---

# 6. VOICE GUIDE

One voice across 144 runs, written by many agents, enforced by tests. Register:
deadpan. Dry, self-aware, short sentences. Says the obvious thing everyone is
thinking. Never mean, never smug, no hype inside a question. Jokes live in level
names, subtitles, banners, and stingers — never inside option labels, and never at
the player's expense.

## 6.1 The rules

1. **Short sentences. Full stops.** If a comma can be a period, it is.
2. **Name the thing in the first sentence.** L1 especially: define, then riff.
3. **Say the obvious thing.** The reader is thinking "so it's just a folder?" —
   the copy says "It's a folder. With a memory." before they can.
4. **The stakes are real; state them flat.** "People have lost six years of data
   this way." is deadpan AND true (C1). Flat delivery of a true horror beats hype.
5. **Never mock the player.** The butt of every joke is the situation, the jargon,
   or the tools — never the person who doesn't know. (The research subjects asked
   "please do not be rude" — B4. That's a design requirement.)
6. **No hype in questions.** Exclamation points may appear ONLY in furniture
   (banners, stingers, combo badges). Zero in prompts, options, feedback, or recaps.
7. **Options are scannable claims, not jokes.** A player comparing three options is
   working; don't make them parse humor mid-decision.
8. **Feedback = one dry verdict + one flat fact.** Fixed verdict leads (replaces the
   current "Good call." / "Not quite." / "Noted." set):
   - correct: `Yep.` — wrong: `Not that one.` — info/predict: `Noted.`
   These three strings are the entire allowlisted verdict vocabulary.
9. **Second person, present tense.** "Your agent just asked…" not "A user might…"
10. **L2 register is dialogue.** Every L2 choice beat renders as a mock agent chat
    bubble (`AGENT: "I'm going to X. OK?"`) and the options are written as things a
    person would actually type back. This is a rendering contract, not a style hint.
11. **L3 feedback honors the tradeoff.** When there's no clean answer, the correct
    option's feedback names its cost: "Yep. It costs you X, and it's still right."

## 6.2 DO NOT list — the coursework tics (all found in current copy)

- ❌ "this approach" / "a real strength of this approach" (derive.ts `predictPrompt`)
- ❌ "holds up under real use" (derive.ts `predictHint`) — abstract hedge
- ❌ "Which move fits best?" (derive.ts `scenarioPromptPrefix`) — no one says "move fits"
- ❌ Trailing coach-isms: "Keep this default close." (derive.ts `recapPromptSuffix`)
- ❌ Double abstract nouns: "operating discipline", "deliberate maintenance"
  (secrets-and-environment.ts, sql.ts)
- ❌ Semicolon splices doing two sentences' work
  ("…separate worktrees or clones for simultaneous agents; branch names alone do
  not…" — branches-as-isolation.ts gotcha 2)
- ❌ Every example starting "Tell your agent to…" (sql.ts, secrets-and-environment.ts
  — imperative homework rhythm)
- ❌ Hedge adverbs: often, quite, generally, typically, arguably
- ❌ Banned words: leverage, robust, utilize, comprehensive, crucial, seamless(ly),
  simply, journey, explore, dive, empower, ensure (as filler), "when it comes to"
- ❌ "It's important to note…" / "In the world of…" openers
- ❌ Rhetorical double questions ("But what is a branch? Let's find out.")
- ❌ Em-dash chains — two per sentence — like this — never
- ❌ Colon-crutch prompts: "Prove it: <question>" (derive.ts `checkPromptPrefix`)

## 6.3 Hard word budgets per beat type (stage-fit is a build-failing test)

| Beat type | Budget (hard ceiling) |
|---|---|
| hook | 14 words, 1 sentence |
| predict prompt | 16 words; option labels 9 words each, max 4 options |
| reveal | max 3 cards, 18 words per card |
| scenario setup | 28 words, max 2 sentences (incl. the agent bubble in L2) |
| scenario/gotcha options | 9 words each |
| gotcha prompt | 14 words |
| default | 20 words, 1 sentence |
| check question | 16 words; options 8 words each |
| recap | max 4 bullets, 10 words each; no prompt suffix |
| any feedback line | 12 words after the verdict lead |
| level subtitle | 14 words |

Enforcement: add a word-budget unit test alongside the existing provenance tests
(beats.test.ts, repo-map §7) so drift fails the build, same as stage-fit.

## 6.4 Before / after — real strings, slop → fix

1. **derive.ts `predictPrompt`**
   - BEFORE: "Before the reveal: which of these is a real strength of this approach?"
   - AFTER: "One of these actually helps. Which?"

2. **derive.ts `predictHint`**
   - BEFORE: "Pick the option that holds up under real use."
   - AFTER: "One of these survives contact with reality."

3. **derive.ts `scenarioPromptPrefix`**
   - BEFORE: "This is the situation. Which move fits best?"
   - AFTER: "Here's the spot you're in. What do you do?"

4. **derive.ts `gotchaPrompt` + `gotchaHint`**
   - BEFORE: "Which of these can burn you if you are not watching?" /
     "Pick the real risk, not a safe practice."
   - AFTER: "One of these bites you later. Find it." / "Two of these are fine.
     One is not."

5. **derive.ts `recapPromptSuffix`**
   - BEFORE: hook + " Keep this default close."
   - AFTER: hook, unmodified. (The suffix is deleted. The recap earns its exit.)

6. **derive.ts wrong-feedback frame**
   - BEFORE: "That is a tradeoff to plan for, not the strength: <label>"
   - AFTER: "Not that one. That's the bill, not the benefit: <label>"

7. **branches-as-isolation.ts `hook`**
   - BEFORE: "Give each agent task its own line of work."
   - AFTER: "Two agents, one folder, zero survivors. Give each its own lane."

8. **branches-as-isolation.ts `gotchas[1]`**
   - BEFORE: "Use separate worktrees or clones for simultaneous agents; branch names
     alone do not separate files on disk."
   - AFTER: "Branch names don't separate files on disk. Two agents in one folder
     overwrite each other. Worktrees fix that."

9. **sql.ts `hook`**
   - BEFORE: "The durable database choice that is often right."
   - AFTER: "The boring database. Boring is a compliment."

10. **sql.ts `vibe_coder_default`**
    - BEFORE: "Start with PostgreSQL for application records, and keep it until a
      measured need proves another store fits better."
    - AFTER: "Start with Postgres. Switch when something measurable hurts. Not before."

11. **secrets-and-environment.ts `hook`**
    - BEFORE: "A secret copied into code is already exposed."
    - AFTER: "An API key in your code isn't a secret. It's a donation." (C5: this
      donation cost a real person $40.)

12. **secrets-and-environment.ts `example`**
    - BEFORE: "A booking app needs database and email credentials. Tell your agent to
      read named environment variables only in server code, fail closed when they are
      absent, and document rotation without printing values."
    - AFTER: "Your booking app needs two passwords. They live in the environment,
      server-side. The code asks for them by name. It never contains them."

Provenance note for implementers: the current test regime locks copy to verbatim
canonical fields + an allowlisted framing set (`FACTORY_FRAMING`, derive.ts:16–39;
beats.test.ts provenance checks, repo-map §7). Re-voicing means the CANONICAL FIELDS
change (rewrites like #7–#12 happen in the landmark modules), and the framing
allowlist is replaced with the new frames + verdict leads from this guide. The
copy-loyalty mechanism stays; the corpus it protects gets better.

---

# 7. THE FIRST SIXTY SECONDS

The contract: a brand-new player reaches their first correct answer inside 60
seconds, with zero reading walls, zero decisions they can't make, and zero account
friction. First run = **Git L1 "SAVE POINTS"**, `commits-as-checkpoints` — chosen
because "save point" is vocabulary a game-player already owns (research A3/A4 says
git is the identity-level confusion; the save-point metaphor converts it instantly).

Routing scope note: this timeline needs the app's landing surface to BE the title
screen with a straight path into the first run — not the `/map` route. The map is
deliberately withheld until after the first stamp.

| Clock | What the player sees | What they do |
|---|---|---|
| 0:00 | Title stage. Logo `VIBE CODE QUEST` pixel-stamps in (word groups, 60ms each, steps(1)). Below: "Be the human in the loop." and a blinking `PRESS ANY KEY` (2-frame blink, 800ms steps(2)). SUDO idles beside the logo. Corner chip: `SOUND: OFF — M`. | Reads 6 words. |
| 0:02 | Any key/click/tap (this is the audio-unlock gesture). Chip expands: `SOUND ON? [Y] yes [any] later`. 3-second auto-dismiss to "later". | Presses Y or anything. |
| 0:05 | Avatar row: SUDO and NULL cards (idle sprites ×3, name + one personality line), two ink-silhouette locked cards with plain-text unlock conditions. SUDO pre-highlighted. Caption: "Pick your pet. They react. You decide." Auto-continues on SUDO after 8 s. | ←/→, Enter — or nothing. |
| 0:10 | Hard cut. Level card, 900ms: `GIT ISLAND — LEVEL 1: SAVE POINTS` + subtitle "You already understand git. You've just never died in it before." Then the stage: trail tiles along the bottom, avatar on tile 1, question card center. | Watches 0.9 s. |
| 0:12 | Q1 (the gimme — teaches controls and lands the metaphor): prompt "An AI agent is about to change your files. What do you want first?" Options: `A save point I can go back to` / `A faster computer` / `More confidence`. Inline control hint under the options, first question only: `↑↓ pick · Enter locks`. | Arrows + Enter (or click). |
| ~0:20 | First answer. Correct: 80ms hitstop → card pop → ✓ → pixel burst → SUDO hops → `Yep. That save point is called a commit.` → trail tile 1 gets its lantern. Wrong (they picked confidence — fair): dip + shrug + `Not that one. Confidence is not a backup.` — reselect free, no penalty (existing fail-soft rule, beatReducer per repo-map §4). | First win, ~0:20–0:30. |
| 0:30 | Advance (button labeled by beat type, existing pattern). Reveal beat, 2 cards flip in: `A commit is a save point for your whole project.` / `Made before the agent works, you can always go back.` | Reads 2 cards. |
| 0:40 | Q2, vocab lock-in: "The agent says 'I'll commit first.' What is it offering?" Options: `A save point` / `A performance boost` / `A promise to be careful`. | Second answer. |
| 0:50 | Correct: full juice + combo badge slides in at `×2`… (badge shows from 2 in the first run only, so the streak system introduces itself; from 3 thereafter). XP `+15` pop. Trail: two lanterns lit. | Second win. |
| 0:60 | Mid-run, two correct answers, controls learned, streak visible, music on if they said Y. The map has not yet been mentioned. It appears after the first stamp as the payoff: "Here's the rest of the world." | Keeps going. |

What is deliberately ABSENT before the first correct answer: signup, email, map,
settings, tutorial modal, cookie/consent interstitial, format switcher, difficulty
choice, "how it works" copy. Anonymous localStorage progress is already supported
(anon-session path, repo-map §7) — identity is asked for later, at stamp/leaderboard
moments, never here.

---

# 8. SCOPE BOUNDARY (architect call)

The design above is the full target. This section is the honest cut list — what NOT
to build first, the smallest version that still delivers the feel, and the risk I'd
watch. Scaling down further than this is the owner's call; everything cut here is
flagged, not silently dropped.

## 8.1 Do NOT build in v1

1. **Portrait/mobile layouts** — owner-deferred already. Landscape desktop only.
2. **BOO and DUCKY** — ship SUDO (default) + NULL (first unlock). The picker UI
   ships with 4 slots so adding two characters later is sprite work, not UI work.
3. **8 unique island themes** — v1 ships the main theme (all 3 variants for the
   owner's ear-pick) + git, databases, and security themes (the wave-1 content
   islands, 8.3). Remaining islands play the main theme at their island's tempo
   until their content wave lands. The §5.2 riff table already specifies them all.
4. **Island tier-3 "Mastered" map state** — ship tiers 0–2. The beacon is a reward
   for completionists who will not exist in week one.
5. **Long-idle easter eggs** (all four characters) — pure delight, zero information.
   First thing cut, last thing added back.
6. **XP difficulty multiplier** — repo-map §5 is explicit that XP is flat per beat
   type and a multiplier needs schema/server changes. v1 keeps flat XP per run
   (three runs per landmark = 3× the XP opportunity already — that IS the reward).
7. **Leaderboard changes** — none. It reads XP totals; those still work.
8. **Attract-mode demo playback** on the title screen.
9. **Server-side avatar persistence** — localStorage only (v1 accepts avatar reset
   across devices).
10. **Generative/adaptive music beyond the layer rules in §5.3** — layers add and
    remove; nothing composes at runtime.

## 8.2 Smallest version that still delivers the feel

One island, complete: **Git × 3 levels × 6 landmarks = 18 runs**, SUDO only,
main theme V1 + `sfx-correct`/`sfx-wrong`/`sfx-nav`/`sfx-stamp`/`sfx-streak`/
`jingle-level`, the trail + lanterns, the level-clear banner, the title screen and
first-60-seconds flow, overworld tiers 0–1 for Git only. That slice proves every
system end-to-end (cast, music engine, juice, board evolution, voice, L1/L2 content
pipeline) on 12.5% of the content. If this slice doesn't feel right, more content
won't fix it — iterate here before fanning out.

## 8.3 Content rollout order (research-driven)

- **Wave 1: git, databases, security** — databases + security + infra hold 56% of
  documented confusion (research D); git is the identity confusion ("Git for what?")
  and owns the first-60-seconds flow. Each wave = 12 new L1/L2 runs per island +
  6 L3 re-voices per island.
- **Wave 2: infra, ai-types, languages.**
- **Wave 3: pm-tools, design** — the zero-finding islands (D) ship last, as designed.

## 8.4 Cut-first order if the build runs long

1. Long-idle easter eggs (already out — stays out)
2. Island-complete map cut-in panel (banner + text still communicate it)
3. Streak set-dressing props (campfire/flag — badge and music layers carry streaks)
4. Third and fourth SFX refinements (`sfx-flip`, `sfx-xp-tick` — keep the core six)
5. Level-3 dusk stage variant (Level 3 still announces itself via music + banner)
6. NULL (ship SUDO alone before shipping a broken picker)
7. Structure-rise reveal animation (structures may pop in; states must still differ)

Never cut (these ARE the product): the trail, correct/wrong juice with reduced-motion
fallbacks, the verdict-lead voice, word budgets, the first-60-seconds flow, keyboard
play, the muted-by-default audio gate.

## 8.5 The riskiest thing in this design

**The 96 new runs (L1 + L2) have no pipeline.** The existing factory (derive.ts)
projects canonical landmark fields into L3-shaped sequences under a verbatim-copy
provenance regime (repo-map §1, §7). Level 1 needs vocabulary items and Level 2
needs agent-dialogue scenarios — content that does not exist in the landmark schema
today. That means: extend the content model (per-level content modules or new
canonical fields), re-voice the canonical corpus per §6, replace the framing
allowlist, and extend the provenance + stage-fit + word-budget test regime to the
new voice BEFORE content fan-out begins. If 96 runs are written by many agents
without the §6.3 budgets and §6.2 DO-NOT list enforced as failing tests, the voice
drifts back to coursework within a week and the whole rebuild reads like the thing
the owner called word salad. Build the enforcement first, then the content.

Secondary risks, named: (a) the L2 agent-chat-bubble beat is a new beat rendering
mode — prototype it in the 8.2 slice before writing 48 L2 runs against it;
(b) NES-authentic Web Audio (duty-cycle PeriodicWaves, channel stealing) should be
proven with the main theme's three variants before eight island themes are
transcribed; (c) map-visual work requires the sprite comp sheet (§3 precondition)
— do not let an implementation agent invent island art from prose.

— end of bible —
