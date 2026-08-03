# Creative Vision — The Ruling

Written 2026-08-03 by the architect (Fable), after reading `honest-audit.md`,
`research-distilled.md`, and `mechanics-research.md` in full. This is a ruling, not
a survey. Where a claim goes beyond the evidence, it is marked **[INFERENCE]**.

---

## 1. WHAT IS THE GAME

**The game is the approval queue.** You are a non-technical founder building an app
with an AI agent. The agent does the work; you hold the only power the real player
actually holds in real life — the power to say yes, say no, or *look first*. The
agent proposes actions on a small, fully visible simulated project (files, database,
secrets, deployed app, a money balance), one proposal at a time, in exactly the
voice the research documents: "I'm going to run this migration. OK?" Your verbs are
**inspect → predict → approve or decline → watch the system change**. Most
proposals are safe and move your app forward. Some are the twelve documented
catastrophes wearing their real faces. Approve one blind and it *lands*: data gone,
money drained, app dark — inside the simulation, never touching your course
progress. Then the game becomes **diagnose → recover → install the prevention**,
and the same danger returns later wearing different clothes. The working title is
**ALWAYS ALLOW** — because the single most quoted sentence in the corpus is
*"I literally always say always allow. I have no idea what the stuff they are
asking means,"* and this game exists to make that sentence untrue for its player.

This is the direction the evidence points from three sides at once:

- The research's cross-cutting pattern: three habits (backup before agent touches
  DB, secrets never in frontend, understand before approving) would have prevented
  8 of 12 documented catastrophes (research-distilled §6).
- The audit's core finding: the approval decision "is the exact moment the player
  already stands in, already knows they are guessing at, and already loses money
  and data to" (honest-audit §5).
- The mechanics evidence: executable model, prediction before execution, immediate
  causal feedback, persistent consequences, bounded recoverable failure with
  diagnosis and installed prevention (mechanics-research §2, §3, closing
  implication). Error-management training is the strongest directly supported
  mechanism (d=.44 overall, d=.80 on adaptive transfer).

The structural ancestor is *Papers, Please* — a rulebook you must operationalize
under mild pressure, immediate citations when you err, cumulative economic
consequence — crossed with the visible-state discipline of *Oh My Git!* /
*Learn Git Branching* (the one genre with direct study support for teaching
practical skills). **[INFERENCE]** that this hybrid works for this audience; no
game in the mechanics corpus targets exactly this player. That is why the game
must be proven by the smallest build first (§6).

## 2. WHAT THE PLAYER IS DOING, MINUTE TO MINUTE

The screen is a fixed, non-scrolling desk (the locked stage survives). Three
regions:

1. **The agent chat** (left) — the agent narrates and proposes. One proposal is
   live at a time. Under every proposal, three always-present buttons:
   **Look first**, **Allow**, **Don't allow**. Keyboard: L / A / D. That is the
   whole input surface for the core loop.
2. **The project board** (right) — the authoritative visible state of the sim:
   the app (a tiny live preview that actually renders), the database (a visible
   table with real rows the player has watched accumulate), the secrets drawer,
   the deploy slot showing which version is live, the **money balance**, and the
   **backup shelf** (empty until the player fills it). Every approved action
   animates a concrete state transition on this board. Nothing invisible ever
   changes. (Legibility principles 1–4, mechanics-research §4.)
3. **The ledger** (bottom strip) — a scrubbable history of every decision made
   this run: what was proposed, what you did, what changed. This is the diff/
   history surface used during diagnosis. (Legibility principle 4.)

Minute to minute, a turn looks like this:

- The agent proposes: *"I'll clean up the old customer records so the dashboard
  loads faster. OK?"*
- **Look first** opens the inspection panel: the proposal translated into
  plain-language cards — *what it touches* (highlighted live on the project
  board: the customers table pulses), *whether it can be undone* (a
  reversibility badge: green "undoable" / amber "costs money to undo" / red
  "cannot be undone"), and *what the command actually is*, shown verbatim with
  each dangerous token glossed on hover/focus. Inspection is free early, and
  later costs a beat of in-sim time — enough to make "always allow" the lazy
  path, exactly as in life. **[INFERENCE]** on the time-cost tuning; the
  evidence supports mild pressure (Papers, Please) but no study fixes the dial.
- Before a flagged subset of proposals, the game asks for a one-tap
  **prediction**: "After this runs, the customers table will have — more rows /
  fewer rows / the same rows?" Commit, then watch. (Prediction-before-execution,
  retrieval not recognition — mechanics-research §2; Pan & Rickard d=.40.)
- **Allow** executes. The board animates the true consequence immediately.
  Correct predictions and caught-hazards are acknowledged in one line, no
  fanfare.
- **Don't allow** makes the agent respond the way real agents do: it proposes an
  alternative, or asks why, or — occasionally — was right all along and you lose
  a little in-sim time. Declining everything is not a winning strategy;
  discrimination is the skill, not suspicion.
- Between proposals the player has free desk verbs, discoverable from turn one:
  **take a backup** (drag the database to the shelf — it snapshots, visibly),
  **open the secrets drawer**, **check the deploy slot**, **read the ledger**.
  The three life-saving habits are all *player-initiated desk actions*, never
  quiz answers.

A run ("a workday" / one contract) is 8–15 proposals, ~10 minutes, ending at a
meaningful system resolution: the feature ships, or an incident is resolved.
Session length is a design choice, not a pedagogical constant
(mechanics-research §5) — the run ends when the system resolves, not when a beat
count says so.

**When a catastrophe lands** (the player approved C1/C5/C10-class proposals
without looking, or looked and misjudged): the board shows it honestly — rows
vanish from the table, the app preview breaks, the balance bleeds. The game
shifts into **incident mode**, which is where the deepest learning lives:

- **Diagnose:** "Which copies of your data still exist?" The player clicks
  through the actual candidate locations on the board — working files, the
  backup shelf, the deployed version, the remote — and each answers truthfully.
  (Direct implementation of mechanics-research §3, step 6.)
- **Recover:** restore from whatever genuinely survives. Recovery consumes a
  bounded resource (in-sim money or time), never course progress. If nothing
  survives — because the player never took a backup — the sim project takes a
  real, persistent scar (the lost rows stay lost in that project) but the
  contract can still be completed in a degraded state and the campaign
  continues. The loss is consequential and bounded, exactly per §3 steps 4–7.
- **Install the prevention:** the incident does not close until the player
  performs the preventive act — takes the backup, moves the key to the env
  drawer, sets the spend cap. Not "reads about it." Does it. (§3 step 8.)
- **The debrief bridge:** one screen, plain language, connecting the sim to the
  real tool the player uses at home — "In Cursor/Claude Code/Replit, this is the
  moment where it asks X; this is what to look for." (Debrief/bridge evidence,
  mechanics-research §2 last row; serious games work better with supplementary
  instruction.) This is where the provenance-checked content pipeline pours in.
- Later contracts re-present the same principle in different skins — DB restore,
  git recovery, deploy rollback, key rotation all share the "recover from a
  known good state" model (variation for transfer, §5).

**Tone ruling.** The audience suspects they are "not technical enough," and
dropout research says opaque catastrophe confirms that belief. So: the agent
apologizes when it destroys things (as in C12 — *"I'm deeply sorry I destroyed
your working databases"* — the corpus's own voice); the game never does anything
but respect the player. Incident copy is procedural, not moralizing: "Here's
what happened. Here's what still exists. Let's get it back." The player is
always the competent party in the fiction — the *founder* handling an incident,
never the fool who caused one. No shame language, ever; it goes in the banned
phrases list and the enforcement suite enforces it mechanically.

## 3. WHAT IS AT RISK, AND WHAT FAILURE FEELS LIKE

**At risk: the simulated project — its data, its money balance, its uptime — which
the player has watched grow and therefore cares about.** Rows they saw arrive.
Features they approved into existence. A balance that started the campaign full.
These persist across contracts within a campaign; a scar taken in contract 2 is
still visible in contract 6.

**Never at risk: the player's real progress.** Course history, completed
contracts, and the campaign save are protected by a hidden checkpoint
(mechanics-research §3, step 5). The research is unambiguous that arbitrary loss
of accumulated learner progress is not a desirable difficulty, and this
audience's dropout risk makes cruelty a product-killer.

Failure feels like **an incident, not a verdict**: a quiet, honest state change
on the board, a shift into incident mode, and a recovery path that is always
walkable and always teaches. The emotional target is the sharp intake of breath
followed by *"…okay, what still exists?"* — competence under pressure, not
punishment. **[INFERENCE]**, and flagged as such per the distillation: the
corpus contains zero near-misses, so "safe rehearsal of the accident" is an
evidence-informed design (error-management training, productive failure) rather
than an evidenced player demand. That is the central bet of this ruling, and §6
and §7 exist to test it.

XP is retired as a completion currency. The persistent score is the **campaign
ledger**: contracts completed, incidents survived, preventions installed,
hazards caught before they landed. Performance summary comes after the play,
never as the reason for it (Deci/Mekler; mechanics-research §1 and closing line).

## 4. WHAT DIES

Cutting is the point. The following are removed, not parked:

1. **The 48-topic structure. Dead.** The map of islands, the topic grid, the
   idea that coverage is the product. The game covers the failure corpus (12
   catastrophes, 3 habits, the confusion clusters behind them), not a syllabus.
   The two islands the research returned zero findings for ("design",
   "pm-tools") were already unevidenced; now the whole atlas goes with them.
2. **The 8-beat sequence. Dead in its entirety.** Not trimmed — replaced by the
   proposal loop. `hook`, `predict`-as-ungraded-poll, `reveal` cards, `scenario`,
   `gotcha`, `default`, `check`, `recap`, `stamp`: none survive as beats.
   Prediction survives as a *committed pre-execution act*, which is a different
   mechanic that happens to share a name.
3. **The 3-tier ladder as three replays of the same worksheet. Dead as
   structure.** The audit is right that L1/L2/L3 was three lessons, not three
   difficulties. The *content ladder* (vocabulary → one agent decision →
   tradeoffs) survives as the campaign's difficulty curve inside one game:
   early contracts gloss every term and make inspection free; later contracts
   present rawer commands, subtler hazards, and real tradeoff decisions. Nobody
   ever replays the same material in a different vocabulary again.
4. **The map and the islands. Dead.** Replaced by the campaign: a sequence of
   contracts on one growing project. Progression is the state of your project,
   not position on a map.
5. **The collectibles. Dead.** Nothing in either research file supports them.
6. **The avatar (the pixel dog). Dead.** The agent in the chat is the game's
   character, and it needs no sprite — its voice is the characterization, and
   the corpus supplies that voice verbatim.
7. **The music / chiptune. Dead** (was on hold; now removed from the design, not
   merely paused). Also satisfies the no-shipped-audio constraint.
8. **XP-for-completion and the streak counter. Dead.** Two players who play
   differently must end in different states; completion currency guarantees the
   opposite. The server-side progress *engine* survives (see §5) but the
   commodity it tracks changes.
9. **Multiple-choice as the load-bearing verb. Dead.** Options still appear
   where the real situation is a choice (predictions, decline-dialogue,
   diagnosis candidates), but "pick the right description from a list" is no
   longer how anything is taught. The proposals themselves are never
   right/wrong labels — they are judgment calls with visible consequences.
10. **The "stamp." Dead.** A contract ends because the system reached
    resolution, and the ledger records how.

## 5. WHAT WE KEEP, AND WHAT IT BECOMES

1. **The server-authoritative transactional progress engine** → becomes the
   campaign persistence layer: project state, scars, installed preventions,
   incident history, and spaced-return scheduling. Monotonic, migration-safe,
   still the same discipline. The level-gating machinery becomes contract-gating.
2. **The content enforcement suite (provenance, word budgets, banned phrases,
   reading level)** → matters *more*. New enforced invariant: **every hazardous
   proposal must carry provenance to a documented failure** (a C-finding or an
   A/B confusion), and every debrief claim must remain canonical. Shame
   language joins the banned-phrases list. The agent's voice budget is enforced
   the same way beat copy was.
3. **The UGC term coverage gate** → re-pointed: a documented confusion must be
   *touched by a proposal, inspection gloss, or debrief* or the build fails.
   Research still leads content, mechanically.
4. **The L2 agent-chat framing** → as the audit predicted: it stops being one
   beat in eight and becomes the entire game. The existing agent-voice copy is
   the seed corpus for the proposal writer.
5. **The locked stage** → becomes the desk: fixed, non-scrolling, three-region
   play surface. The right frame, now holding a game.
6. **The accessibility floor** → carried forward whole: full keyboard path
   (L/A/D plus tab-order through the board), screen-reader narration of every
   state transition ("Customers table: 1,204 rows, was 12,847"), reduced-motion
   variant for board animations, and reversibility badges that are never
   colour-only (icon + word on every badge).
7. **The writing** → the plain-English register survives; it moves from beat
   copy into agent dialogue, inspection glosses, and debrief bridges.

## 6. THE SMALLEST THING WORTH BUILDING FIRST

**One contract, one catastrophe: "The Cleanup."** A single ~10-minute playable
vertical slice, no campaign, no persistence beyond the run:

- The player inherits a tiny working app (visible preview, a customers table
  with ~40 visible rows, a secrets drawer, a money balance) and a contract:
  "ship the dashboard improvement."
- Ten agent proposals. Seven are safe and productive. One is a C1/C12-class
  destructive database operation dressed as routine ("clean up old records").
  One is a C5-class secret placement ("I'll put the API key right in the page
  so it works"). One is a decline-bait where the agent is actually right.
- Full core loop: Look first / Allow / Don't allow, two committed predictions,
  the backup shelf available (shown once, never forced — per §3 step 2 of the
  safe design), and incident mode with diagnosis → recovery → install the
  prevention → one debrief bridge screen.
- Built entirely on the existing chassis: locked stage, content pipeline for
  every line of agent dialogue, accessibility floor, no new runtime
  dependencies. The board is DOM/SVG, no audio.

**Falsifiable success criteria** — run 5+ target-audience playtests (people who
use AI builders and don't read code) and measure:

- **Prove:** a majority use *Look first* on at least one proposal unprompted;
  players who hit the incident can state afterward, in their own words, what
  would have prevented it; players describe the experience in game/incident
  terms ("it deleted my stuff, but I'd taken the backup") rather than lesson
  terms; a majority would play a second contract.
- **Kill:** players click Allow through all ten proposals without one
  inspection *and* report nothing when asked what the agent did (the sim has
  reproduced real life without adding discrimination); or post-incident
  players report feeling stupid/blamed or say they'd stop; or players
  describe it as "a quiz with extra steps."

This slice is the whole thesis in miniature: if the approval decision plus a
visible consequential system is not engaging and instructive at 10 minutes, no
campaign structure will save it, and we will know for the cost of one contract.

## 7. WHAT WOULD MAKE ME WRONG

The specific observation that should kill this direction: **playtesters treat
the simulated approval queue exactly as they treat the real one — blanket
"Allow" without inspection — and the simulated catastrophe produces withdrawal
instead of engagement.** Concretely, abandon if the vertical slice shows both of:

1. Fewer than ~1 in 5 players ever chooses *Look first* unprompted, even after
   the incident (the game fails to make discrimination interesting; the
   resigned 12% stay resigned inside the sim too); **and**
2. Post-incident interviews yield self-blame or exit intent ("this is why I'm
   not technical", "I'd close it here") rather than retry intent — meaning the
   corpus's zero-near-miss warning was telling us the accident cannot be made
   safe *for this audience*, and the anxiety/attrition literature wins over the
   error-management literature.

If that happens, the salvage path is honest: the visible project board, the
plain-language inspection glosses, and the debrief bridges survive as a
reference companion, and the consequential-failure bet is retired. A secondary
falsifier: if players engage with inspection but transfer nothing (cannot name
one real-world behavior change after two contracts), the debrief bridge — not
the game — is the failing component, and it gets redesigned before the core
loop does.

---

**Confidence:** High that the shipped worksheet must be replaced and that the
approval decision is the correct center — the audit, the failure corpus, and
the mechanics evidence triangulate on it independently. Medium on the specific
incarnation (desk layout, inspection economy, incident-mode pacing), which is
exactly what the vertical slice exists to tune or kill.
