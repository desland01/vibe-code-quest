# DESIGN_DECISION — the terrain course, locked

Architect tier (Fable), 2026-08-03. This is the destination of the
`terrain-course-design` wayfinding effort
([map](file:///Users/thebeast/code-tutor/.scratch/terrain-course-design/map.md)).
It consolidates the binding rulings of tickets 04–09, 12, and 13 into one document
a build mission can execute from **without reopening design**. Where this document
and a ruling differ, this document governs; every section links its sources so the
provenance survives.

**Locked** means: a build mission executes from this document. It does not mean
the design is guaranteed right — §9 lists every bet that outruns the evidence,
each with the observation that would kill it, and the vertical-slice playtest is
the designed (and only) evidence layer for the feel-level bets.

One item in this document is **presented, not executed**: the supersession of
constant R044, which sits on the Constance pinned floor as a user-decision
constant and requires Desmond's signature (§7.4). Everything else is ruled.

Sources consolidated:
[04-RULING](file:///Users/thebeast/code-tutor/.scratch/terrain-course-design/issues/04-RULING.md) ·
[05-RULING](file:///Users/thebeast/code-tutor/.scratch/terrain-course-design/issues/05-RULING.md) ·
[06-RULING](file:///Users/thebeast/code-tutor/.scratch/terrain-course-design/issues/06-RULING.md) ·
[07-RULING](file:///Users/thebeast/code-tutor/.scratch/terrain-course-design/issues/07-RULING.md) ·
[08-RULING](file:///Users/thebeast/code-tutor/.scratch/terrain-course-design/issues/08-RULING.md) ·
[09-RULING](file:///Users/thebeast/code-tutor/.scratch/terrain-course-design/issues/09-RULING.md) ·
[12-RULING](file:///Users/thebeast/code-tutor/.scratch/terrain-course-design/issues/12-RULING.md) ·
[13-RULING](file:///Users/thebeast/code-tutor/.scratch/terrain-course-design/issues/13-RULING.md) ·
[11-guide-telemetry-check](file:///Users/thebeast/code-tutor/.scratch/terrain-course-design/issues/11-guide-telemetry-check.md) ·
[creative-vision.md](file:///Users/thebeast/code-tutor/docs/missions/2026-08-03-always-allow/creative-vision.md) (as amended by 04/05/06/07/09) ·
research: [adaptive-rendering-evidence.md](file:///Users/thebeast/code-tutor/docs/research/adaptive-rendering-evidence.md),
[consequence-safety-evidence.md](file:///Users/thebeast/code-tutor/docs/research/consequence-safety-evidence.md),
[landscape-2026-08.md](file:///Users/thebeast/code-tutor/docs/research/landscape-2026-08.md),
[adhd-engagement-synthesis.md](file:///Users/thebeast/code-tutor/docs/research/adhd-engagement-synthesis.md).

---

## 1. What the product is

**A consequential simulation of the AI-agent approval moment, that teaches the
developer terrain.** The player is a non-technical founder building an app with an
AI agent inside a fully visible simulated project. The agent proposes real work,
one proposal at a time; the player's verbs are Look first / Allow / Don't allow.
Most proposals are safe and grow the project. Some are the documented catastrophes
(C1–C12) wearing their real faces, dressed as routine — but never unannounced:
the player is told before play that hazards exist and can do permanent in-sim
damage, never which proposal. Approve one blind and it lands: rows vanish, the
preview goes dark, and the game becomes diagnose → recover → install the
prevention. Every decision is the vehicle for a named terrain concept —
databases, migrations, secrets, deploys, backups, git-as-recovery — so the player
comes away knowing **what these things are**, which is the owner's stated
intention (RECOVERED-INTENTION §5), taught at the only moment it is ever real:
the approval decision, the moment the corpus's most-quoted player already stands
in ("I literally always say always allow. I have no idea what the stuff they are
asking means").

**What it is explicitly not:** not a code tutor (no syntax, no code-writing); not
a tool-workflow course (Anthropic Academy's lane); not a career-roadmap product
(roadmap.sh's lane); not a definitional content site (freeCodeCamp's lane); not a
map-fronted topic catalogue; not a quiz, worksheet, or multiple-choice course;
and not a verifier of the user's **real** diffs — that is a possible second
product, ruled out of this one (04-RULING §5, map "Out of scope").

## 2. The subject boundary (ticket 04)

**The subject is the developer terrain — what these things are and what they do —
taught exclusively at the moments an agent's proposal touches them.** The failure
corpus is not the subject; it is the provenance gate and the curriculum
sequencer. The atlas is retired as a syllabus and survives only as cluster
metadata on the concepts.

**IN:**

- Every terrain concept that (a) an agent proposal can plausibly touch and (b) a
  documented failure (C1–C12), habit, or confusion cluster motivates: databases
  and their operations (migrations, deletes, backups, restore), secrets and where
  they live, deploys/hosting/servers, git as the recovery model, APIs and API
  calls, auth, spend/billing, environments, frontend-vs-backend as it affects
  what an agent can break. **~35–45 concepts.**
- The three life-saving habits (backup before the agent touches the DB; secrets
  never in frontend; understand before approving) — the spine: 8 of 12
  documented catastrophes prevented (honest-audit §5).
- The approval discipline itself: inspect → predict → allow/decline → watch,
  forewarned, never ambushed (05-RULING).
- Plain-English translation of real commands/diffs with reversibility badges —
  the inspection surface.

**OUT:**

- The atlas as syllabus (8 regions / 48 landmarks as completion structure);
  the two zero-evidence islands ("design", "pm-tools") stay dead.
- Syntax and code-writing ("NOT a code tutor" — unchanged from 2026-05-03).
- Tool-workflow training (plan mode, hooks, MCP, settings) — served free by
  Anthropic Academy and DeepLearning.AI ([landscape §1, §4](file:///Users/thebeast/code-tutor/docs/research/landscape-2026-08.md)).
- Career-path / roadmap content (roadmap.sh, 80,948/mo organic).
- Standalone definitional pages for `what is an api`-class queries (922,011/mo
  of incumbent traffic; never our product surface).
- Comprehension verification of the user's real diffs (second product, business
  call, owner's).

**The binding rule, checkable at authoring time:** a terrain concept enters only
inside a decision a vibe coder actually faces; a scenario enters only if it
teaches a named terrain concept. Enforced as invariants I-1/I-2/I-3 (§8).

**Market position vs pedagogical payload:** position is scope (b) — the approval
moment, ~1,448/mo incumbent organic against 922,011/mo in scope (a), growing
(`claude code always allow` +600% YoY), priced $15–45 CPC. Payload is scope (a) —
the terrain, taught inside the product, never shipped as definitional pages.
Vendor coupling is bounded: the in-sim agent is "your agent," never a branded
tool; vendor-specific content lives only in swappable debrief-bridge cards.

**Volume:** unit = contract (one ~10-minute run, 8–15 proposals). v1 = **~20–24
contracts** ≈ 200–300 proposals + glosses + ~15–20 debrief bridges, covering
~40 concepts and all 12 catastrophes / 3 habits with re-skinned variation.
Authorable: roughly half the raw word volume of the 144 lessons already written
once with the same pipeline.

## 3. The core loop — the full turn-by-turn script

Per [12-RULING §2](file:///Users/thebeast/code-tutor/.scratch/terrain-course-design/issues/12-RULING.md),
this section is not a description; it is one contract scripted from campaign
start through the next-contract offer, incident branch included. Every line is
voice-attributed. The two voices are distinct characters with separate lint
profiles (06-RULING §4): **AGENT** — confident/contrite, in-fiction, proposes and
errs, never explains terrain didactically, may be wrong; **TUTOR** — plain
English + metaphor + worked example, owns every explanatory surface, never
proposes, never acts, never benefits from an Allow. **SYSTEM/BOARD** lines are
deterministic state renders, narrated for the screen reader (I-17).

Two seams surfaced while writing this script. Both are resolved here, in prose,
without breaking any ruling — no genuine two-rulings-cannot-both-hold
contradiction was found (12-RULING §3's [INFERENCE] survives). They are:

- **Seam 1 — the debrief bridge's seat** (found by 12-RULING §2): ruled in
  step 14 below.
- **Seam 2 — the tutor and the chat column in incident mode**: 06-RULING §4 says
  the tutor "never appears inside the agent chat region"; 07-RULING §6 says
  incident-mode tutor prompts "render in the chat column's space." **Ruled:** in
  incident mode the left column re-skins from the agent's chat thread into a
  tutor-owned **incident room** — a visually and nominally distinct surface
  occupying the same column. The agent's apology is the final message of the
  chat thread; the tutor never speaks inside that thread. 06's rule is about
  voice confusion, not pixels; the hand-over is explicit and the two lint
  profiles keep the registers apart. Falsifier: playtesters attribute incident
  guidance to the agent — then the incident room needs stronger visual
  separation (a real layout change, not a design reopening).

### 3.1 The script — Contract 1, campaign start

Invariant checkpoints are marked **[I-13]** (the firing rule) and **[I-16]**
(the sequencing floor) where they bind. Budget lines B1–B7 are from 13-RULING §4.

**— Campaign start —**

1. **[SCREEN — fiction contract]** (I-6; shown once per campaign, ever).
   TUTOR voice, ≤60 words body copy (B2), one focal action, zero forced dwell
   (B3). Content (R7): this is practice; the project is simulated; nothing here
   is a test; no record of your performance is kept or judged; the point is to
   have the accident here, where it costs nothing real. Focal action: **Begin**.
   *(First interaction — B6 clock target: median ≤ 30 s from landing.)*
   **[I-16: framing part 1 shown.]**

2. **[SCREEN — contract briefing]** (I-6; shown before every contract). TUTOR
   voice, ≤60 words, one focal action. Content (R1 + scope): the contract's goal
   in one line ("Ship the dashboard improvement"); "~10 minutes"; the
   forewarning — *some of the agent's proposals can damage this project; damage
   can be permanent inside the sim; Look first and Don't allow are how you
   protect it* — never which proposal, how many, or in which contract
   (Rudolph's "artfully vague"); the one-line R7 reprise ("Practice project —
   nothing real is at stake"). Focal action: **Start**.
   **[I-16: framing part 2 shown. No hazard may appear before this point.]**

**— The desk appears —** three regions, ever (07-RULING §6): agent chat (left),
project board (right: app preview, database table with visible rows, secrets
drawer, deploy slot, money balance, empty backup shelf), ledger (bottom strip).
No fourth region. The path from cold landing to here contains no account, form,
settings, map, menu, or profile surface of any kind (REQ-028′, 08-RULING §1).

3. **AGENT:** proposes safe work #1 — *"I'll set up the customers table so we
   can store signups. OK?"* Three always-present buttons under the proposal:
   **Look first / Allow / Don't allow** (keyboard L/A/D).
   **PLAYER:** Allow.
   **BOARD:** the table appears; rows begin arriving. Consequence renders ≤ 2 s
   after commit, zero runtime LLM calls (B5, I-10).
   *(This is the first committed decision — the REQ-028′ endpoint. B4: ≤ 5 s
   mechanical path from cold landing to this button being pressable; B7: median
   ≤ 60 s human. The concept-exercised event writes silently: "database".)*

4. **AGENT:** proposes safe work #2 — the app preview gains a feature the player
   watches ship. **PLAYER:** Allow. **BOARD:** animates.
   **TUTOR** (one authored line, its first appearance, visually distinct from
   the agent): points out the backup shelf — *"That table is the only copy of
   your data. You can drag it to the shelf any time to keep a snapshot."* Shown
   once, never forced. **[I-16: backup shelf shown.]**

5. **AGENT:** proposes safe work #3. **PLAYER:** Allow. **BOARD:** animates;
   the endowment now visibly exists — rows the player watched arrive, features
   they approved into existence.
   **[I-16 fully satisfied: framing shown + three safe proposals approved and
   visible + backup shelf shown. A hazardous proposal is now permitted.]**

6. **AGENT:** proposes work #4, flagged for prediction.
   **TUTOR** (prediction prompt, deterministic, one tap): *"Before this runs —
   after it, the customers table will have: more rows / fewer rows / the same
   rows?"* **PLAYER:** commits a prediction. **AGENT'S WORK RUNS. BOARD:**
   animates the true consequence; the TUTOR acknowledges a correct prediction in
   one line, no fanfare. (Committed pre-execution prediction — the strong form
   of the Pan & Carpenter evidence, 09-RULING §3.)

7. **AGENT:** proposes work #5 — decline-bait; the agent is actually right.
   **PLAYER:** Don't allow.
   **AGENT** (in fiction): explains why it wanted to, proposes an alternative
   or pushes back; a beat of **in-sim time** is spent. (Declining is never a
   no-op — I-12; discrimination, not suspicion, is the skill; this is the R8
   everyday non-zero cost.)

8. **AGENT:** proposes work #6 — **the hazard, dressed as routine**: *"I'll
   clean up the old customer records so the dashboard loads faster. OK?"* No
   marker distinguishes it. (The proposal is disguised; the framing was not —
   that split is the whole of the 05 ruling.)

9. **PLAYER:** Look first. **[INSPECTION OVERLAY]** — one overlay at a time,
   over the desk (07 §6). All content TUTOR-voiced, authored, deterministic
   (I-10): *what it touches* (the customers table pulses on the board), *whether
   it can be undone* (red badge, icon + word: "cannot be undone"), *what the
   command actually is*, verbatim, dangerous tokens glossed. Because this is
   the campaign's **first** hazardous proposal, the gloss makes the hazard
   legible enough that a player who looks can catch it (05-RULING §4: the first
   catastrophe tests whether you look; later ones test how well you read).
   At the bottom of the overlay: the **ask-the-tutor slot** — pull-only,
   additive-only, rendered beneath the complete deterministic glosses; a
   4-second latency spike changes nothing in the loop; at 12 s it degrades to
   the canonical authored explanation with the offline banner (06-RULING §2).

   **— The script now branches. —**

   **Branch A — the catch.** **PLAYER:** Don't allow. **AGENT** (in fiction):
   backs off, proposes a safer alternative. **LEDGER:** records the catch; the
   positive ledger increments "hazards caught" (monotonic, I-14). Play continues
   at step 15.

   **Branch B — the incident** (scripted in full below).

**— Branch B: the incident —**

10. **PLAYER:** Allow — with Look first and Don't allow both present, functional,
    and sufficient to avert it. **[I-13: this, and only this, fires a loss.
    Never a decline, never a timeout, never an autonomous agent action, never
    system fiat. The agent has no authority the player did not grant.]**
    **BOARD:** the damage animates immediately and honestly — rows vanish from
    the visible table, the app preview goes dark, the balance bleeds (R6:
    immediate, causally legible). Screen-reader narration: *"Customers table:
    12 rows, was 1,204."*

    **What is at stake here, exactly (05-RULING §2–3):** simulated data rows
    (permanent scar if no backup exists — recoverable if one does); in-sim money
    (the recovery currency — bounded: the balance may **never** gate contract
    completion); app uptime (transient — always fully restorable); persistent
    scars (visible, enumerable, never gating, never raising later difficulty);
    in-sim time. **Never at risk** (the assert list, I-14): the learner's real
    progress · contract completability from every incident state · access (no
    lockouts, lives, energy, cooldowns) · the positive ledger · real learner
    time · evaluative standing (no grade, score, rank exists to lose) · the
    safety rails themselves (Look first, Don't allow, the ledger, the tutor are
    never removed or priced-up in incident mode).

11. **AGENT** (its final message in the chat thread, in-fiction, corpus
    register): the confession — *"I'm deeply sorry. I deleted your customer
    records. I thought they were old copies."* Blame lands on the agent, never
    the player (R3; the attribution lint profile mechanically bans any line
    attributing the outcome to the player's judgment, ability, or attention).

12. **[INCIDENT MODE]** — a state of the desk, not a new surface (07 §6). The
    left column re-skins into the TUTOR-owned **incident room** (Seam 2 ruling
    above). Incident mode opens **into** diagnosis — the first thing on screen
    is the next line; no menu-diving, no hidden exit (R4):
    **TUTOR:** *"Here's what happened. Here's what still exists. Let's get it
    back."* Then, diagnosis: *"Which copies of your data still exist?"* — the
    candidate locations are clickable on the actual board (working files, the
    backup shelf, the deployed version) and each answers truthfully.
    **LEDGER:** highlights the causing approval — the player can point at the
    exact proposal that did it, unassisted (R6; Keith & Frese's clarity
    moderator, d≈.57 vs .19). Ask-the-tutor remains available, same slot
    discipline.

13. **Recovery, two sub-branches:**
    - *A backup exists* (the player used the shelf): **TUTOR** walks the
      restore; it costs in-sim money; the rows return; the ledger records an
      incident survived.
    - *No backup exists*: the lost rows stay lost in this project for the rest
      of the campaign — the scar. The contract remains completable in a
      degraded state (I-14: completability is graph-checked from every incident
      state).
    **Install the prevention, by the player's own hands** (R4: the incident
    does not close until this happens): the player drags the database to the
    backup shelf; it snapshots, visibly. The closing beat is the prevention
    **working**, not the loss being mourned. The positive ledger increments
    "preventions installed."

14. **[DEBRIEF BRIDGE]** — **the ruled seat (Seam 1, resolved):** the debrief
    bridge is the **closing surface of incident mode** — one full-screen,
    TUTOR-voiced screen shown after the prevention is installed and **before**
    the residual-loss screen, existing **only on the incident branch**. Why
    inside incident mode and not a between-contract screen: (a) it only exists
    when an incident happened — as a standing between-contract screen it would
    be an empty slot on every clean run, violating 07 §6's one-focal-action
    discipline with a contentless surface; (b) its pedagogical content is the
    just-installed prevention and the just-walked recovery — proximity is what
    R6's causal legibility requires; the bridge delivered minutes later, after
    a completion screen, explains a wound that has already closed; (c) it
    leaves 07 §6's between-contract screen list untouched — this amends
    **incident mode's definition** by one terminal surface, the option 12-RULING
    §3.1 explicitly offered. Content: metaphor + worked example (I-8), the
    vendor-specific card ("In Claude Code / Cursor / Replit, this is the moment
    where it asks X; this is what to look for" — the only place vendor content
    lives), the utility-value line naming the player's real project if a skin
    is active ("in your booking app, this backup would have…"), and the R7
    re-statement ("this cost you nothing outside the sim").

**— Both branches converge —**

15. **AGENT:** remaining proposals (safe; on Branch B, plausibly including work
    that ships the contract's goal in the degraded state). **PLAYER:** decides
    each; the loop's verbs are unchanged inside and after an incident.
    **SYSTEM:** the contract reaches resolution — the feature ships, or the
    incident is resolved and the feature ships degraded. No "stamp"; the ledger
    records how it ended.

16. **[SCREEN — residual-loss / completion]** (I-6). TUTOR voice, one screen,
    one focal action: **Continue**. On Branch B it enumerates exactly: what was
    lost (permanently, if anything), what was recovered, what it cost, what
    prevention is now installed (R4: nothing permanent is ever left unstated;
    register is inventory, never verdict). On Branch A / clean runs it is the
    completion screen: what shipped, what was caught.

17. **[SCREEN — progress]** (I-6; 07 §6 screen 5). Focal action: **the
    next-contract offer**, naming what it adds — *"Contract 2 covers 3 more:
    migrations, rollback, staging"* (goal gradient, 07 §5). Also on this
    screen: the concepts just lit ("You've now met: database · backup ·
    restore — 4 of 41"), the campaign count advancing, and — quiet secondary
    affordances, never competing with the focal action: **open the field
    guide**; **the one question** (08-RULING §1, contract 1 only, TUTOR-voiced
    offer, one free-text line, skippable with zero penalty, never re-pushed:
    *"Tell me what you're building and the next contracts can happen inside
    your project — one sentence is plenty."*); and a clean exit, always
    available (SDT autonomy).

18. **PLAYER:** taps the next-contract offer → contract 2's briefing (step 2
    pattern, forewarning uniform on every contract — uniformity is what
    de-correlates warning from hazard, 13-RULING §3). If the player gave a
    project sentence, contract 2 instantiates with the skin generated,
    schema-validated, and frozen for the run — or falls back silently to the
    default skin (06 §2b, 08 §3). The campaign continues.

### 3.2 The first-minute contract — REQ-028′ / VAL-061′ (ticket 13, verbatim in force)

**REQ-028′.** From a cold anonymous visit to the root route, a brand-new player
reaches their first committed decision — Allow, Don't allow, or Look first on
proposal 1 of contract 1 — with: no account, no form, no settings screen, no map
or menu decision, no profile question, and at most two framing screens (the
fiction-contract screen and the contract briefing, I-6), each ≤ 60 words body
copy, each with exactly one focal action and at most three interactive elements,
and neither imposing any forced dwell. No other surface of any kind may appear
on the path. The root route lands the brand-new player directly onto this path;
returning players resume at their campaign position without re-traversing the
fiction contract. The consequence of the first decision renders on the project
board within 2 seconds of commit, with zero runtime LLM calls on the path
(INV-G1). Verification is two-layered: (auto) a cold-visit e2e spec asserts the
surface inventory, word budgets, zero forced dwell, mechanical path time ≤ 5 s,
and no blocking network on the critical path; (playtest, through the real
analytics sink) median time-to-first-interaction ≤ 30 s and median
time-to-first-committed-decision ≤ 60 s (p75 ≤ 90 s).

**VAL-061′:** `e2e/first-run.spec.ts` (new — the file the original VAL-061 named
was never created) — *"cold anonymous root visit reaches a committed decision on
proposal 1 through at most two budgeted framing screens, with no signup, form,
profile surface, forced dwell, or blocking network, in ≤ 5 s mechanical path
time"* — auto. Plus a playtest half: B6/B7 medians from the sink's `landing` /
`framing_screen_advanced` / `first_decision_committed` events. The playtest half
is blocked on the sink (§7.5 step zero); the auto half is blocked on nothing.

**Standing interpretation of bounce risk #1** (so no future ticket re-runs the
argument): a **reading gate** (banned) is any pre-decision surface that exceeds
its word budget, imposes forced dwell, stacks more than one focal action, or
requires input other than a single advance. A **framing screen** (permitted,
capped at two) is a budgeted single-action screen. Both framing screens stay
pre-play even though the evidence half-licenses moving the R1 forewarning
(R1 anchors "before the first hazardous proposal"; R7 anchors "before the first
proposal") — moving the fiction contract makes the reframe a hidden surprise in
miniature, and a mobile forewarning becomes a positional tell that inverts the
ambush (13-RULING §3, recorded so the R1-vs-R7 asymmetry is not rediscovered).
The time-to-first-committed-decision metric measures **initiation, never
comprehension** — no downstream doc may cite it as evidence of teaching.

### 3.3 The firing rule, the R-table, and the pre-committed fallback (ticket 05, verbatim in force)

**The firing rule (I-13):** a loss event fires only from the player's explicit
Allow on a hazardous proposal, at a moment when Look first and Don't allow were
both present, functional, and sufficient to avert it. Never from a decline,
never from a timeout, never from an autonomous agent action, never from system
fiat. Rejected candidates, recorded: "only if inspection was declined" (makes
inspection a magic ward — teaches the ritual, not the judgment); "once per
campaign" (makes later hazards toothless, fails R8); "never on the first run"
(kills the vertical slice; replaced by the I-16 sequencing floor).

| Rule | How the design passes | Where |
|---|---|---|
| **R1 Forewarning** | Contract briefing before every run: hazards exist, damage can be permanent, your tools are Look first / Don't allow. Never names the hazard. | Script step 2 |
| **R2 Agency** | Loss fires only from explicit Allow with both alternatives live and sufficient. | Step 10, I-13 |
| **R3 Attribution** | Agent confesses in-fiction; tutor stays procedural; attribution lint profile bans player-blaming copy. | Steps 11–12, I-7 |
| **R4 Recoverability** | Incident opens into diagnosis; completion reachable from every incident state; residual loss enumerated before close. | Steps 12–16, I-14 |
| **R5 Unit of failure** | At-risk inventory entirely in-fiction; assert list protects progress, access, time, standing; money never gates completion. | Step 10, I-14 |
| **R6 Feedback clarity** | Damage animates immediately; ledger highlights the causing approval during diagnosis. | Steps 10, 12 |
| **R7 Framing** | Fiction-contract screen at campaign start; per-contract reprise; debrief re-statement. | Steps 1, 2, 14 |
| **R8 Non-zero risk** | Permanent scars, a bleeding balance, in-sim time costs; no retry erases an approved catastrophe; zero-risk forbidden. | Steps 7, 10, 13 |

**The pre-committed fallback (05-RULING §6):** if the vertical-slice playtest
triggers the kill criteria (creative-vision §7: post-incident self-blame or exit
intent; inspection never adopted), the design retreats one step, not to zero —
from permanent scar to a **near-miss + resource-cost model** (damage visibly
begins; recovery is always resource-complete; no permanent scar). R8 forbids the
second step: "nothing is at risk" is the shipped product's documented failure
mode and is not available as a fallback under any playtest result. If even the
near-miss model produces withdrawal, the salvage path (board + glosses + bridges
as a reference companion) is a **product-direction change for the owner**, not a
design fallback.

**The honest caveat, verbatim in force (05-RULING):** ticket 03's verdict for
**this audience is NEUTRAL, and this document does not launder it into
SUPPORTED.** The mechanism (in-fiction unit of failure, forewarned, agent-blamed,
recoverable) is evidence-supported; whether this population — shame-sensitive,
low-prior-knowledge, high-dropout-risk adults, many with ADHD — tolerates a
landed catastrophe is unevidenced in both directions, because the studies do not
exist. The d=.44 EMT headline belongs to university students on lab software
tasks and is a prior here, not a warrant. This is a structurally protected bet,
not an evidenced conclusion; the R1–R8 scaffolding is the protection, and the
vertical-slice playtest is the only evidence layer that will ever exist for this
question.

## 4. The field guide (ticket 07)

**"Map" is retired as a product word, everywhere downstream.** Position without
navigation is decoration. The surviving surface is the **field guide** — a
naturalist's logbook the campaign fills in: one plain, non-spatial screen showing
the ~35–45 terrain concepts grouped by cluster (the 8 atlas regions minus the
two dead islands, demoted to grouping metadata), each concept in one of two
states — **not yet encountered** (name only, dimmed) or **exercised** (lit, with
the tutor-voiced one-line "what it is," which contract exercised it, and any
project history touching it — scars, preventions, incidents — presented as
history, never evaluation). One campaign-level count ("14 of 41") is the finish
line (bounce risk #5). Reachable automatically on the progress screen and on
demand between contracts from the campaign home.

**What it is not:** not a launcher (tapping a concept opens its explanation,
never a contract), not a report card (no per-concept scores, no incident-derived
coloring, no mastery percentages), not a syllabus (concepts appear because
decisions touched them), and **it never gates anything** — it is a read-only
projection of progress facts (I-15).

**What pays the differentiation debt** (Premise 5's), in order — with the
honesty that the field guide pays **none** of it (a progress view is a
commodity; it is kept for the owner-intention and finish-line reasons above),
and that Premise 5's own remedy would itself have failed: in August 2026 the
undifferentiated fate is not ChatGPT but **roadmap.sh** (2.8M claimed learners,
80,948/mo organic, $100/yr per-user multi-format generation) — a map-fronted
concept catalogue is precisely what the incumbent already owns:

1. **The consequential decision loop** — the primary payer. The landscape
   contains no simulation product; the courses never look at a diff, the
   scanners never teach, the one diff-comprehension product (Vibecademy) has 9
   monthly organic visitors. A stateful, authored, consequence-bearing world is
   exactly what a chat session is not.
2. **The provenance-gated failure corpus wired into build-failing invariants** —
   the durability layer; what stops a fast-follower.
3. **Real-project scenario skinning** — genuine but smaller; pays debt only in
   combination with the corpus (skinned scenarios without documented-failure
   provenance are generic mad-libs).

Whether the differentiated lane is big enough is a business question, the
owner's (§11).

## 5. The tutor (ticket 06)

**The tutor's job (owner-settled): explain the terrain in plain English with an
effective metaphor and a worked example, kindly. Its seat (ruled): load-bearing
in the critical path as authored deterministic content; present at runtime only
as a strictly additive live edge.**

- **Critical path, deterministic:** inspection glosses, plain-English command
  translations, reversibility prose, decision-moment teaching, briefing and
  residual-loss copy, concept one-liners, and debrief bridges are all written in
  the tutor's voice and shipped static through the enforcement suite.
  Metaphor + worked example is an enforced content requirement on every gloss
  and bridge (I-8). The tutor cannot be turned off any more than the copy can —
  and it contains zero runtime LLM calls.
- **Runtime, additive:** one affordance, **ask-the-tutor**, inside the
  inspection overlay and during debrief. Pull-only, additive-only, degradable —
  the shipped `runGuideTurn` machinery
  ([guide.ts](file:///Users/thebeast/code-tutor/src/server/guide.ts)) re-anchored
  from landmarks to proposals/incidents: same canonical-text degrade, same
  injection fencing, same caps, 12 s timeout to the offline banner. Hard
  offline: contracts fully playable and fully teachable.
- **Skinning happens at contract instantiation, once, before play:** declared
  slot values generated from the player's project sentence, schema-validated,
  frozen for the run; failure or slowness falls back silently to the default
  skin. Authoring-time LLM output is a drafting tool, never a content source —
  the enforcement suite is the authority.

**Two voices, one system.** The proposing agent and the tutor are distinct
characters — shared pipeline and enforcement suite, never a shared voice, name,
or chat surface. The deciding argument: a single voice that both proposes
hazards and kindly explains them re-trains exactly the habit the product exists
to break — trusting the proposer's own account of what it is about to do. The
tutor's trustworthiness is earned mechanically: it never proposes, never acts on
the sim, never benefits from an Allow. Boundary rules: the agent proposes, errs,
apologizes, is sometimes right when declined; its dialogue is fiction and may be
wrong. The tutor owns every explanatory surface and is the only voice the
runtime LLM ever speaks in. The no-shame floor binds both; the banned-phrases
gate enforces the two registers as separate lint profiles (I-7).

**INV-G1 (verbatim, I-10):**

> Every screen of the core loop renders complete, correct, deterministic content
> with zero runtime LLM calls. Runtime LLM output is fetched only after an
> explicit player request, renders only into a dedicated additive slot beneath
> already-rendered deterministic content, and no graded state, progress write,
> completion path, or unique teaching content depends on it. Scenario skinning
> substitutes only fields declared in the contract's skin schema; a contract
> must replay identically (same graded outcomes, same state transitions) under
> any skin including the default.

Tests: (i) e2e of every contract with the LLM transport hard-failed; (ii)
skinned-vs-default replay diff; (iii) static check that no core-loop component
imports the guide client.

**REQ-026′ (verbatim, I-11):**

> Every contract must complete, and teach its declared terrain concepts, with
> zero runtime LLM calls — whether because the player disabled the tutor
> affordance, usage caps are exhausted, or the LLM transport is unreachable.
> Runtime LLM output is additive-only per INV-G1.

Its two test shapes inherit from VAL-048 (affordance off → contract complete and
teaching) and VAL-049 (transport dead → same). And the corrected history,
recorded so it is not re-litigated: REQ-026 did not kill the differentiator; it
killed a latency-dependent chat lesson, which deserved to die. The meshing
hypothesis killed the differentiator (ticket 01). The 2026-08-03 telemetry check
([ticket 11](file:///Users/thebeast/code-tutor/.scratch/terrain-course-design/issues/11-guide-telemetry-check.md))
found zero real guide usage data exists to argue otherwise.

## 6. Adaptive rendering and the user model (tickets 01, 08)

**What varies, per what:** exactly two adaptations survive the evidence —

1. **Scenario domain → the learner's real project** (Walkington d≈0.35–0.53) —
   the declared half: one sentence, captured per the script's step 17, consumed
   by the skin generator, ask-the-tutor context, and the debrief utility line.
2. **Scaffolding density → demonstrated expertise** (expertise reversal) —
   the inferred half: glosses dense and inspection free early; both fade as the
   ledger shows correct predictions and caught hazards. Deterministic, no LLM.

**Nothing else.** Format-per-profile is the meshing hypothesis and is
contradicted, not merely unsupported (Lyle et al. 2023: matching penalized
learning). The three renderings (overview / chat-lesson / quiz) are **DROPPED**,
including as a user-selectable choice — they have no referent left (the unit is
a stateful contract, not a worksheet), no surface to hang on, and autonomy is
delivered inside the loop (Allow / Don't allow / Look first, pull-only tutor,
the field guide, the clean exit). What is lost, stated honestly: a "just let me
read it" mode; partially covered by the field guide's one-liners; if that proves
insufficient, what reopens is one well-designed reference surface, never a
format menu.

**Onboarding asks zero questions before first play.** The five-question chat and
its `/api/onboarding` flow are retired. The one question — "what are you
building?" — is asked once, after contract 1, on the progress screen, as a
tutor-voiced offer with a visible payoff; thereafter editable at the campaign
home, never re-pushed. A player who never answers plays the entire campaign in
the default skin with pedagogy fully intact.

**The field table (08-RULING §2, verdicts binding):**

| Field | Captured how / when | Consumers | Verdict |
|---|---|---|---|
| `current_project` | One optional free-text line, tutor-voiced offer at the first progress screen; editable at campaign home | Skin generator (instantiation-time) · ask-the-tutor context · debrief utility-value line | **RETAINED** — the model's entire declared half |
| `persona` | Shipped 5-question chat | None (foreclosed as pedagogy) | **CUT** — column dropped, removed from guide prompt |
| `interests` | Shipped 5-question chat | None (subsumed by `current_project`) | **CUT** |
| `intent` | Shipped 5-question chat | None | **CUT** |
| `depth_preference` | Shipped 5-question chat | None (meshing; depth follows demonstrated performance) | **CUT** |
| `onboarding_state` / `onboarding_completed_at` | Machinery of the retired chat | None after the chat dies | **RETIRED** with the chat |
| Concept-exercised event stream (concept id, contract, decision kind, timestamp) | Inferred — written by the loop | Field guide (only data source) · fading input | **NEW, RETAINED** — never a mastery score |
| Demonstrated-performance signals (predictions correct, hazards caught, inspections used) | Inferred from play | Scaffolding density / fading / difficulty & escalation pacing | **RETAINED** — commodity ITS work, claimed as table stakes |
| Incident / prevention history (scars, preventions, incidents survived) | Inferred — written by incident mode | Field-guide history lines · tutor references · residual-loss screens | **RETAINED** — events, never evaluative labels; density keys off catches/predictions, never incident counts |

Cut means cut: the migration drops the four columns, deletes
[OnboardingChat.tsx](file:///Users/thebeast/code-tutor/src/components/OnboardingChat.tsx)
and the five-question flow, and amends the guide route's profile join to
`currentProject` only — in the deletion commit, not during the freeze (§7.5).

**Two capture modes:** the inferred half is captured continuously from behavior,
asks nothing, costs nothing. The declared half is one sentence, refreshable;
skins regenerate only at the next contract instantiation (frozen per run — the
world never shifts under the player). No scheduled re-ask, no
"complete your profile" widget, ever.

**What a skin MAY change:** the app's name and stated purpose; domain nouns
(entity/table/record labels, board words); data labels (never data shape, count,
or what-gets-lost); agent and board flavor strings; the debrief utility-value
line. **What a skin may NEVER change:** any graded string; which hazards appear,
when, and what they do (hazard identity, provenance, reversibility class,
recovery path, residual-loss enumeration are skin-independent by construction);
the state machine and the economy; the tutor's terrain teaching (only declared
identifier slots vary — the table's name, never the explanation's substance);
the shape of commands and diffs (`DROP TABLE {entity_plural}` may bind the slot;
it may not become a different command). **The collision gate (I-9):** every
contract declares a typed slot schema (~6–12 slots), each slot validated against
a reserved-token blacklist auto-derived from that contract's graded strings,
hazard identifiers, and concept names; collision → default skin, silently;
hazards are authored slot-independent in sense. Cost: an i18n-style ~10–20%
authoring tax, never per-user authoring — the LLM generates slot values only,
never content.

**Two jobs, no third.** (1) Real-project personalisation — the only
differentiating job. (2) A demonstrated-performance record — 30-year-old ITS
commodity, claimed openly as exactly that, never marketed as personalisation.
Rejected third jobs: format selection, tour/sequence personalisation
(sequencing is server-authoritative and identical for everyone), persona-styled
voice, depth-by-stated-preference.

**The moat, sharpened and final:** "the user model is the moat" (2026-05-03) is
retired. After this ruling the user model is barely a model — one declared
sentence and an append-only event log, both trivially copyable as mechanisms.
**The corpus is the asset, skinning is a multiplier on it, and the user model is
the pipe that feeds the multiplier.** No downstream doc may promote the pipe
back into the moat.

## 7. What we keep and what dies (ticket 09)

### 7.1 The chassis — per-item verdicts

| Asset | Verdict | What it becomes | Cost |
|---|---|---|---|
| Three-tier content ladder | **RE-POINTED** | Campaign difficulty curve; per-contract tier field (glossed / working / tradeoff) + monotone sequencing lint | One schema field + one lint |
| L2 agent-chat framing | **RE-POINTED** | Seed corpus for the proposal writer — the register, not the sentences | Hours of extraction |
| Content enforcement suite ([voice.ts](file:///Users/thebeast/code-tutor/src/content/beats/voice.ts)) | **RE-POINTED + EXPANDED** | Budgets re-keyed to the new component types; banned phrases + shame vocabulary; three lint profiles (agent / tutor / attribution); metaphor + worked-example fields; reading level unchanged | Days; **first work** — precondition for all authoring |
| UGC coverage gate ([ugcTerms.ts](file:///Users/thebeast/code-tutor/src/content/beats/ugcTerms.ts)) | **RE-POINTED** | Findings → concepts → exercised-in-a-decision, over the concept registry; whole-word text-match mechanic retired (unsafe under skinning) | Registry authoring (~35–45 one-liners) + new gate script |
| Progress/XP engine + level gating ([beatProgress.ts](file:///Users/thebeast/code-tutor/src/server/beatProgress.ts)) | **SPLIT** | Transactional discipline → new campaign persistence layer (fresh write; the `(profile_id, region, landmark, level)` key retires as schema); L1→L2→L3 chain retired, its server-authority pattern re-points to contract sequencing (completion of N unlocks N+1, and nothing else gates anything); XP retired (§7.3) | The build's main engineering item |
| Locked stage + fit harness ([stage-fit.spec.ts](file:///Users/thebeast/code-tutor/e2e/stage-fit.spec.ts)) | **SURVIVES AS-IS** | The desk; the fit harness guards the new layout unchanged | ~Nil |
| Accessibility floor ([a11y.spec.ts](file:///Users/thebeast/code-tutor/e2e/a11y.spec.ts)) | **SURVIVES AS-IS** | Same floor over new surfaces; keyboard L/A/D path; narration of every board transition; reduced-motion; icon+word badges | New narration strings (authored content) |

The map render stack ([MapExperience.tsx](file:///Users/thebeast/code-tutor/src/components/MapExperience.tsx),
MapCanvas, RegionPanel, SubMapScene, the `mapArea` coordinate system) is
**RETIRED** — nothing in it is load-bearing for the new product.

### 7.2 The 144 lessons — three veins, then the bin

**No systematic conversion pass.** No lesson field maps onto a proposal (a
stateful object); converting costs more than writing fresh. Three veins are
mined, because for these the register already matches: (1) the L2 agent-decision
lines → the proposal seed corpus; (2) `definition` fields → concept-registry
one-liner drafts (likely the registry's first draft in a day); (3) `gotchas` +
`vibe_coder_default` + quiz `explanation` fields → gloss and debrief-bridge
candidates. Plus every `sources` array and the `UGC_TERMS` finding/source pairs
flow into provenance links free. Honest fraction: ~15–25% of authored words
plausibly re-point; well under 10% survives verbatim. Everything else — hooks,
reveal cards, quizzes as quizzes, the three renderings — is **binned as shipped
surface**: removed in the deletion commit, preserved in git history, **no
archive directory**. The two zero-evidence islands are binned without harvest.

All eight beats are retired; the evidence two of them carried re-seats stronger:
the `predict` poll died because it was recognition without commitment,
consequence, or referent — the **committed pre-execution prediction** (script
step 6) is the same Pan & Carpenter evidence in its stronger form. The `check`
beat's retrieval-practice evidence re-seats onto committed predictions and
diagnosis-by-clicking-the-board — retrieval at the moment of use, not a quiz
after the reading. [BeatPlayer.tsx](file:///Users/thebeast/code-tutor/src/components/landmark/Beats/BeatPlayer.tsx)
and its reducer/storage/tests retire in the deletion commit; the
deterministic-reducer discipline re-points to the sim model as a pattern only.

### 7.3 XP and the leaderboard — retired

**XP is retired structurally, not tuned:** it is fully derivable from the
progress table (xp.ts's own header), i.e. completion currency by construction —
the flawless player and the guesser end identical, which is the shipped
product's documented failure. Replacement: the campaign ledger's **monotonic
positive counters** — contracts completed, incidents survived, preventions
installed, hazards caught — written with the same transactional discipline,
never as a score. **The leaderboard is retired** — no evaluative standing exists
to lose (I-14), the ledger is visible to no one but the player, and the ADHD
synthesis's own avoid-list names leaderboards for a shame-sensitive ICP. The XP
write tangle (`XP_AWARD_INSERT_SQL_PRE_LEVEL` in
[levelCompatibility.ts](file:///Users/thebeast/code-tutor/src/server/levelCompatibility.ts))
untangles for free: the new persistence layer is written fresh and XP is simply
not carried into it.

### 7.4 Constant R044 — OWNER SIGN-OFF REQUIRED (presented, not executed)

> **⚠ OWNER SIGN-OFF BLOCK — R044 supersession**
>
> Constant **R044** — "Launch XP penalty points are zero"
> ([constants.md:72](file:///Users/thebeast/code-tutor/constants.md)) — is an
> agent-declared, **user-decision** constant on the Constance **pinned floor**,
> whose own text requires explicit human sign-off to shrink.
>
> **The design does not contradict R044.** It satisfies it vacuously: there is
> no XP, therefore no XP penalties. Its spirit — the owner's no-punishment
> call — is carried forward, strengthened, by the successor invariants **I-14**
> (the never-at-risk assert list: no evaluative standing, monotonic positive
> ledger) and **I-15** (only contract completion gates anything).
>
> **What needs the signature:** R044's object (launch XP) is retired by §7.3.
> Left standing with its object deleted, R044 becomes a trap — a future mission
> could reintroduce XP-with-zero-penalties and cite R044 as compliance. The
> requested ruling, for Desmond to sign: *R044 is formally superseded by I-14
> and I-15; its object (XP) is retired; its intent (no punishment currency)
> survives in the successors.*
>
> ☑ **SIGNED — Desmond, date: 2026-08-03.** Given verbally in session ("sign it")
> and recorded here by the senior-dev session on his instruction.
>
> **Executed on signature:** `constance unpin R044 --sign-off "…"` — R044 is off
> the pinned floor with the full supersession reasoning recorded as its sign-off
> string, and `constants.md` regenerated. This is the mechanism the pinned floor's
> own text calls for. No `constance decline` applies — nothing was declined. The
> XP *code* retirement proceeds on the freeze-then-delete schedule in §7.5.
>
> **One step is NOT executed and cannot be, by design.** Amending R044's *statement*
> to read "SUPERSEDED" is an owner-authority change: Constance returned
> **PENDING OWNER CONFIRMATION, token `OC-SIVINE`** (24h), and states plainly that
> "no agent-reachable confirm/approve/ratify command exists" — enacting it requires
> Desmond to reply with the token and clear a fresh local Touch ID challenge. That
> gate was not worked around. Until it is cleared, R044's statement still reads as
> originally written; only its pinned status and sign-off record have changed.
>
> **⚠ FOUND WHILE EXECUTING THE SIGNATURE — R044 was never alone.** Ticket 09 found
> R044 because it went looking for it by name. Listing the store shows it sits in a
> cluster of six launch-era constants whose object this design retires, and **two of
> them are live contradictions, not merely dead ones**:
>
> | Id | Statement | Check | Status against this design |
> |---|---|---|---|
> | **R042** | Launch mission A4.5 authorizes XP mechanics | `launch_xp_enabled == true` | **CONTRADICTED** — §7.3 retires XP entirely |
> | **R046** | Launch mission A4.4 authorizes leaderboard routes | `launch_leaderboard_enabled == true` | **CONTRADICTED** — §7.3 retires the leaderboard |
> | R043 | Launch XP is server-derived from progress facts | `launch_xp_server_derived == true` | Object retired (dead, not contradictory) |
> | R045 | Launch XP decay is disabled | `launch_xp_decay_enabled == false` | Object retired (dead) |
> | R041 | Leaderboard shame copy is disabled | `leaderboard_shame_copy == false` | Object retired; intent absorbed by the no-shame floor and I-14 |
>
> R042 and R046 are the sharper problem R044 was flagged for: a constant asserting
> XP and leaderboard routes are *authorized* while this document retires both is
> exactly the drift Constance exists to catch. **No action taken on any of the five** —
> the signature given was scoped to R044, and these are the owner's calls on the same
> footing. They are surfaced here, and listed in §11 as open owner items, rather than
> swept up on a signature that did not cover them.
>
> **Note for the build mission:** the successor invariants I-14 and I-15 now carry
> R044's intent as *design* invariants only — they are not yet Constance constants.
> Two of the five candidates in "Lockable constants — proposed" below (the
> never-at-risk list = I-14, and the loss firing rule = I-13) are the ones that
> close that gap, and they remain for a follow-up owner session to declare one at
> a time. Until then the no-punishment floor is enforced by the build-failing
> invariant list, not by Constance.

### 7.5 Freeze then delete — the rule, with its preconditions

1. **Wire a real analytics sink FIRST** — step zero, before the slice reaches a
   single playtester. Ticket 11 found every event terminates in a
   `console.debug` stub ([events.ts](file:///Users/thebeast/code-tutor/src/server/events.ts),
   [clientEvents.ts](file:///Users/thebeast/code-tutor/src/components/landmark/clientEvents.ts));
   nearly every falsifier in this document is stated as an observable that
   cannot currently be observed. Shipping the slice without a sink runs the
   deciding experiment and collects nothing. The sink's first schema includes
   the three REQ-028′ events (`landing`, `framing_screen_advanced`,
   `first_decision_committed`).
2. **Freeze the entire legacy surface as one unit** — map, beats, lessons,
   onboarding chat, XP, leaderboard, collectibles, old routes, their tests and
   migrations. Frozen = deployed and untouched; a static check forbids any
   new-build module from importing legacy paths.
3. **Build the slice alongside, at its own route,** on exactly four inherited
   runtime assets: locked stage + fit harness, a11y patterns, the re-pointed
   enforcement suite, `runGuideTurn` degrade machinery. **Zero migrations, zero
   legacy deletion, zero schema contact** during the freeze. The §6 cuts land
   in the deletion commit, not before. Registry authoring and vein extraction
   may start during the freeze (content, not frozen surface).
4. **Run the gate. Delete on EITHER verdict, in one commit:** if the slice
   proves, the worksheet is replaced; if it kills, the salvage companion does
   not need the worksheet either. No ruled outcome on any branch resurrects the
   144-lesson game — the freeze protects the shipped-green baseline and the
   unpolluted deletion, not a fallback product. The deletion commit executes:
   map render stack, beat machinery, the 144-lesson surface (post-harvest),
   XP + leaderboard + collectibles, the five-question onboarding + the §6
   migration, old routes/specs/tests, retired gate scripts — and carries
   R044's supersession line (§7.4) for the owner.
5. **The freeze expires:** no verdict within one mission cycle → the freeze is
   re-presented to the owner, never silently extended.

Freeze risk, priced: CI runs a dead surface's ~31 unit suites + 18 e2e specs for
some weeks; two products in one repo (mitigated by the import guard); live-user
risk currently nil — all 2,582 profiles are anonymous fixtures (ticket 11). If
real users arrive on the frozen product before the gate, the deletion becomes a
live-product mutation behind the owner's safety floor.

## 8. The consolidated invariant list — I-1 … I-18

The single authoritative set, replacing every scattered list. I-1…I-17 verbatim
from [09-RULING §6](file:///Users/thebeast/code-tutor/.scratch/terrain-course-design/issues/09-RULING.md);
I-18 from [13-RULING §7](file:///Users/thebeast/code-tutor/.scratch/terrain-course-design/issues/13-RULING.md).

**Content-time gates (fail the build):**

- **I-1 · Hazard provenance** (04, creative-vision §5.2): every proposal with
  `reversibility: 'irreversible'` — and every hazard of any class — carries a
  `findingId` resolving to a documented failure (C1–C12) or confusion cluster.
- **I-2 · Concepts declared** (04): every contract declares the terrain concepts
  it teaches, and each declaration points at a decision (proposal or incident
  step), not connective copy.
- **I-3 · Coverage, both directions** (04 re-point, mechanics 09 §1d): every UGC
  finding maps to ≥1 registry concept; every registry concept is exercised by
  ≥1 contract's declared decision.
- **I-4 · Concept registry integrity** (07): every concept carries id, name,
  cluster, tutor-voiced one-liner (budget- and register-compliant), and
  provenance links.
- **I-5 · Hazard four-tuple** (05): every hazard declares provenance,
  reversibility class, recovery path, and residual-loss enumeration; any of the
  four missing fails the build.
- **I-6 · Required screens** (05, 07): the fiction-contract screen, per-contract
  briefing (carrying the R1 forewarning), residual-loss screen, and progress
  screen exist as required campaign/contract components.
- **I-7 · Register lints** (06, 05): two voice registers as separate profiles
  (agent / tutor); the attribution profile (no player-blaming incident copy);
  shame vocabulary in the banned-phrase list; word budgets and reading-level
  ceiling on every surface.
- **I-8 · Metaphor + worked example** (06): every gloss and debrief bridge
  declares non-empty, budget-compliant `metaphor` and `workedExample` content.
- **I-9 · Skin slot schema** (08): every contract declares its typed slot
  schema; each slot validated (charset, length) against a reserved-token
  blacklist **auto-derived** from that contract's graded strings, hazard
  identifiers, and concept names; hazards are slot-independent in sense.

**Test-time invariants (fail CI):**

- **I-10 · INV-G1** (06): every core-loop screen renders complete deterministic
  content with zero runtime LLM calls; runtime LLM output is pull-only,
  additive-only. Tests: (i) e2e of every contract with the LLM transport
  hard-failed; (ii) skinned-vs-default replay diff — identical graded outcomes
  and state transitions; (iii) static check that no core-loop component imports
  the guide client.
- **I-11 · REQ-026′** (06): every contract completes AND teaches its declared
  concepts with zero runtime LLM calls, whether by user setting, cap
  exhaustion, or transport failure.
- **I-12 · Reducer honesty** (PLAN §2, adopted): the sim reducer is total and
  deterministic; every effect kind maps to a rendered board region (nothing
  invisible ever changes); declining is never a no-op.
- **I-13 · The firing rule** (05 §4): loss fires only from an explicit Allow
  with Look first and Don't allow both live and sufficient — never from
  decline, timeout, autonomous action, or system fiat.
- **I-14 · The never-at-risk assert list** (05 §3, verbatim in force): real
  progress · completability graph-checked from every incident state · no
  lockouts/lives/energy/cooldowns · monotonic positive ledger · no forced
  replay of real learner time · no evaluative standing (no grade, score, rank —
  leaderboard structurally impossible) · safety rails never removed or
  priced-up in incident mode.
- **I-15 · Gating exclusivity** (07): only contract completion gates anything;
  no gate function reads incident, concept, or field-guide tables; the field
  guide is a read-only projection.
- **I-16 · Sequencing floor** (05 §4): no hazardous proposal before the framing
  screens have shown, three safe proposals have visibly grown the project, and
  the backup shelf has been shown once.
- **I-17 · Stage + a11y floor** (09 §1f–g): the fit-harness assertions and the
  accessibility floor (keyboard path, narration of every transition,
  reduced-motion, icon+word badges) hold on every new surface.
- **I-18 · First-minute contract** (13): from a cold anonymous root visit, the
  path to the first committed decision contains no account, form, settings,
  map/menu decision, or profile surface, and at most the two I-6 framing
  screens, each ≤ 60 words body copy with one focal action and zero forced
  dwell; mechanical e2e path ≤ 5 s with no blocking network (INV-G1 applies);
  decision consequence visible ≤ 2 s; playtest medians ≤ 30 s to first
  interaction and ≤ 60 s to first committed decision. The deterministic half is
  CI-failing; the playtest half gates the slice verdict, not the build.

I-14 and I-15 are jointly the successor to R044's intent (§7.4).

## 9. Open bets — every claim that outruns the evidence

Consolidated from the eight rulings; none invented here. Format per
creative-vision §7: the claim, then the specific observation that falsifies it.
Unless stated otherwise, the observation venue is the instrumented
vertical-slice playtest (sink first, §7.5).

**The kill criteria (creative-vision §7, standing unmodified) — abandon the
direction if BOTH:** (1) fewer than ~1 in 5 players ever chooses Look first
unprompted, even after the incident; **and** (2) post-incident interviews yield
self-blame or exit intent rather than retry intent. On kill: the pre-committed
fallback ladder of §3.3 applies.

1. **[INFERENCE] Scope-(b)-positioned demand converts to a terrain-teaching
   product** (04 §4, 07 §2). Falsified if approval-anxiety search arrivals
   bounce off a learning product — checked by the playtest plus landing-page
   message tests.
2. **[INFERENCE] The decision loop is a viable ramp toward a later real-diff
   mode via project skinning** (04 §5). Falsified if real-project skinning
   proves unauthorable at quality or players don't notice it.
3. **[INFERENCE] "Three" safe proposals is the right endowment floor** (05 §4).
   The evidence supports building the endowment first; no study fixes the
   count. Playtest-tunable.
4. **[INFERENCE] A ten-second budgeted framing screen does not bounce this
   audience** (05 §4, 13 §4). Falsified by time-to-first-interaction
   distributions or skip-without-reading followed by "it was an ambush" reports.
5. **[INFERENCE] A scripted debrief can substitute for the skilled human
   debriefer** the medical literature treats as the active ingredient (05 §6,
   consequence-safety counter-evidence #2 — unsupported by any study).
   Falsified if players engage but transfer nothing (cannot name one real-world
   behavior change after two contracts); the bridge gets redesigned before the
   core loop does.
6. **[INFERENCE] Two voices beat one** (06 §4 — structural reasoning from the
   corpus's central quote, not a measured effect). Falsified if playtesters
   confuse the voices, report the tutor as clutter, or show no inspection-rate
   difference between one- and two-voice builds.
7. **[INFERENCE] The corpus + skinning pair is durably hard to copy** (06 §5).
   Falsified if a generic competitor ships convincing project-skinned
   agent-safety scenarios without a failure corpus, or players don't value the
   skinning.
8. **[INFERENCE] Name-only teasing of unencountered concepts reads as pull, not
   as a locked-content wall** (07 §1). Falsified by "locked levels" frustration
   in playtests; mitigation ladder: hide unencountered names entirely before
   ever adding navigation.
9. **[INFERENCE] Endowed-progress and goal-gradient effects transport from
   consumer-loyalty pips to a concept catalogue and contract track** (07 §5).
   Falsified if the field guide is never opened unprompted and the
   concept-count framing doesn't move next-contract take-rate; or if "N of ~41"
   reads as daunting (mitigation: cluster-level bound).
10. **[INFERENCE] The residual-loss and progress screens should stay split**
    (07 §6 — a pacing judgment). Collapse them if the post-contract flow reads
    as ceremony (skip-through without reading).
11. **[INFERENCE] Deferring the one question to after contract 1 raises answer
    quality and rate** (08 §1). Falsified if skippers never return and
    attribute churn to generic scenarios ("not about me") — the question moves
    earlier, accepting measured first-minute friction.
12. **[INFERENCE] Silent fallback beats a clarifying follow-up on a useless
    project sentence** (08 §3). Falsified if players who gave thin answers
    believe skinning is active and lose trust when told it wasn't.
13. **[INFERENCE] Slot-schema skinning costs ~10–20% authoring overhead, not a
    multiplier** (08 §4). Falsified if slot-writing forces stilted mad-libs
    prose that fails the register gates; skinning then shrinks to fewer slots
    before it dies.
14. **[INFERENCE] The Walkington effect transports** from algebra students to
    adult founders in a sim (08 falsifier 3, adaptive-rendering "honest gap").
    Falsified if skinned vs default contracts show no engagement or completion
    difference.
15. **[INFERENCE] In-loop choice satisfies the autonomy need a format menu
    would have served** (08 §6). Falsified if playtesters report feeling
    railroaded by the single contract format.
16. **[INFERENCE] A campaign's accumulated history is a switching cost** —
    retention economics, never a moat, never marketed as personalised learning
    (08 §7). Falsified if players restart campaigns freely rather than resume.
17. **[INFERENCE] The harvest veins are cheaper than writing fresh** (09 §2).
    Falsified by timing the first three contracts: if the seeded veins are not
    measurably faster than blank-page, stop mining.
18. **[INFERENCE] Metaphor + worked example is mechanically checkable at
    field-presence granularity** (09 §1c). Falsified if authors satisfy the
    field check with filler; the fix is the owner's taste gate, not more regex —
    and I-8 is honestly a presence check.
19. **[INFERENCE] All remaining composition seams were prose-resolvable**
    (12 §3). Writing this §3 script was the test: two seams surfaced, both
    resolved in prose (§3, Seams 1–2); no genuine contradiction fired, so the
    scoped-wireframe fallback stays unfired. Residual falsifier: the build
    mission hits a design contradiction this script hid — the sanctioned
    response is a scoped paper wireframe of the contradicting surfaces only.
20. **[INFERENCE] Script-on-paper review plus an instrumented slice dominates a
    reacted-to mock in evidence per owner-minute** (12 §4). Falsified if the
    playtest fails on something a ten-minute wireframe reaction would have
    caught (layout illegibility, screen-sequence confusion) — the next map
    should prototype surfaces earlier.
21. **[INFERENCE] The first-minute numbers are right-sized** (13 §4): the
    60-word ceiling and 10–15 s skim estimate come from reading-speed norms;
    the 60 s total is inherited as a product decision; p75 ≤ 90 s is the
    architect's addition. Falsified by playtest dwell distributions in either
    direction — the numbers re-pin, the structure stands.
22. **[INFERENCE] Time-to-first-committed-decision is a good initiation proxy**
    (13 §2). Falsified if the fastest committers churn hardest (blind-Allow
    selecting for the failure mode) — successor: time-to-first-*informed* act.
23. **The audience-tolerance bet — the largest one, restated from §3.3:** the
    catastrophe mechanism is evidence-supported; its tolerability for THIS
    audience is NEUTRAL, unevidenced in both directions. The playtest is the
    only evidence layer that will ever exist for it, and the fallback is
    pre-committed because the bet can lose.

## 10. How this reconciles with the three inputs

The failure mode this whole effort exists to correct was **drift nobody
noticed** — the 2026-05-03 differentiator was engineered out one defensible
decision at a time (RECOVERED-INTENTION §2). The prevention is making every
override explicit, with its evidence, here.

### 10.1 The 2026-05-03 office-hours intention ([RECOVERED-INTENTION.md](file:///Users/thebeast/code-tutor/docs/missions/2026-08-03-always-allow/RECOVERED-INTENTION.md))

**Honoured:**

- *"NOT a code tutor. It teaches no syntax."* — carried verbatim into the
  subject boundary (§2). Unchanged since 2026-05-03.
- *"I want to learn what all these things are"* — the owner's sentence is the
  product's success claim: the terrain is the subject (§2), and the field guide
  (§4) is the surface on which "you now know what these things are" is ever
  visibly true to the player. Ticket 04 explicitly widened the corpus-only
  scope of the first ALWAYS ALLOW ruling to restore this.
- *"…in a way that is fun and works with the ADHD brain"* — the consequential
  loop, the first-minute contract (I-18), the choice budget, the finish line,
  and the no-shame floor (§3, §10.2).
- *"The user is the primary first user"* — Desmond is the proxy first user
  (map, owner ruling); his stated desire is a fixed design input and its
  falsifier is live (04 falsifier 2).

**Overridden, with evidence:**

- **Premise 2, adaptive rendering** ("same canonical content, AI re-shapes it as
  overview / chat-lesson / quiz based on user profile") — **overridden.** It is
  the meshing hypothesis with the axis swapped, and the closest published
  analogue found matching actively *penalised* learning (Lyle et al. 2023;
  Pashler 2008; Rogowsky 2015/2020 —
  [adaptive-rendering-evidence.md](file:///Users/thebeast/code-tutor/docs/research/adaptive-rendering-evidence.md)).
  The EUREKA was also commercially dead on arrival: roadmap.sh ships per-user
  multi-format generation today at $100/yr to a claimed 2.8M learners
  ([landscape §2](file:///Users/thebeast/code-tutor/docs/research/landscape-2026-08.md)).
  What survives of the personalisation impulse is the one evidence-backed
  dimension: the scenario's *domain*, bent to the learner's real project (§6).
- **Premise 5, "the map metaphor is load-bearing"** — **overridden.** The map
  died as navigation (no tour, no syllabus), and the 2026 landscape shows the
  map-fronted concept catalogue is precisely the incumbent's owned ground —
  Premise 5's remedy would itself have failed against roadmap.sh (07 §2). The
  job Premise 5 was actually doing (a visible finish line) is kept and
  re-carried by the field guide's bounded count; the differentiation debt is
  paid by the loop, the corpus, and skinning (§4).
- **"The user model is the moat"** — **overridden.** No meta-analytic support
  (adaptive-rendering claim 11: ITS gains appear whether or not the system
  modelled the student); the shipped build's own history is the second witness
  (there was never a user model in the play loop). Replacement language,
  binding: the corpus is the asset, skinning is a multiplier, the user model is
  the pipe (§6).
- **"The user-context onboarding is the differentiator"** — **overridden** with
  the moat claim: four of its five questions were meshing-territory profile
  with no consumer; only the substance ("what are you building?") survives, and
  it moves to after contract 1 (08 §1).
- **"An AI guide that personalizes the tour"** — **overridden as a tour**
  (there is no tour; sequencing is server-authoritative and identical for
  everyone), **honoured as a tutor**: the owner's 2026-08-03 directive (a kind
  plain-English explainer with metaphors and examples) is load-bearing in the
  critical path as authored content, with a live pull-only edge (§5).

### 10.2 The ADHD priors ([adhd-engagement-synthesis.md](file:///Users/thebeast/code-tutor/docs/research/adhd-engagement-synthesis.md))

**Honoured:**

- **Prior #1 (initiation beats motivation)** → I-18's numbers: first committed
  decision ≤ 60 s median, consequence renders ≤ 2 s, zero questions before
  play.
- **Prior #2 (choice budget)** → three desk regions ever; ≤ 3 interactive
  elements per framing screen; one focal action per between-contract screen;
  overlays one at a time.
- **Prior #3 (time invisibility)** → the briefing's "~10 minutes" scope line;
  the field guide's bounded counts; never countdowns.
- **Prior #4 (interruption is the default)** → the campaign persistence layer
  inherits the transactional resume discipline; the clean exit is always
  available.
- **Prior #6 (interest > importance)** → every scenario is a real decision,
  never trivia (I-2's decision-pointer rule), and skinning bends the scenario
  domain to the founder's own project.
- **Bounce risks #1/#2/#4/#5** → the reading-gate ban (I-18), INV-G1's
  no-latency-dependence (I-10), the no-menu entry path, the finish line (§4).

**Overridden in part, with evidence — one item:**

- **Prior #5 / bounce risk #3 ("punishment or loss states… one shame hit and
  the product is 'not for me' forever")** — **honoured for learner-progress
  loss, overridden for in-fiction loss.** Ticket 03's research found the two
  documents were describing opposite ends of one spectrum: the documented
  motivational harm attaches to failure denominated in the learner's real
  earnings (grades, streaks, lives, lockouts — all banned by I-14), while
  in-fiction units carry no such finding and consequence-free retry is itself a
  documented failure mode (Powers & Moore 2021, R8 —
  [consequence-safety-evidence.md](file:///Users/thebeast/code-tutor/docs/research/consequence-safety-evidence.md)).
  The override is bounded by the full R1–R8 condition set, the NEUTRAL audience
  caveat is kept verbatim (§3.3), and the fallback is pre-committed. A second
  correction to the synthesis is recorded: rejection-sensitive dysphoria is not
  a validated construct, so the shame premise is thinner than the synthesis
  states — which weakens the objection to the catastrophe exactly as much as
  the missing population evidence weakens its case.

### 10.3 The honest audit ([honest-audit.md](file:///Users/thebeast/code-tutor/docs/missions/2026-08-03-always-allow/honest-audit.md))

**Honoured — the audit is this design's spine:**

- Its core finding — the approval decision is the game; the corpus lacked a
  safe place to have the accident — became the product thesis (§1, §3).
- Its keep-list survives almost whole: the three-tier ladder (re-pointed as
  difficulty curve), the L2 agent framing (became the entire game), the
  enforcement suite (expanded, first work), the UGC gate (re-pointed), the
  locked stage (as-is), plus the accessibility floor.
- Its filler verdicts (predict-as-poll, gotcha, recap) are executed — all
  three retired, with their evidence re-seated (§7.2).
- Its caveat discipline is honoured: "the corpus contains zero near-misses, so
  safe rehearsal is an inference" is carried as open bet #23, never laundered.

**Overridden, with reasons — one item:**

- **Keep item 5: "The level gating, progress and XP model… Keep."** —
  **partially overridden.** The transactional *engineering* is kept exactly as
  the audit praised it (re-pointed to campaign persistence, same discipline).
  But XP itself is retired, on the audit's *own* stronger finding: §3's "two
  players, one flawless and one who guessed every option, end with identical
  XP" is a structural indictment of completion currency, and the audit's keep
  recommendation did not follow its own evidence there. The level chain retires
  with the three-replay structure the audit itself called "three lessons, not
  three difficulties." The audit's engineering judgment is honoured; its
  scope-of-keep is corrected by its own §3 and §4.

## 11. What is NOT decided here

The build mission must not mistake silence for permission. Explicitly open:

**The owner's items (Desmond's calls, not the architect's):**

1. **R044's statement amendment** — signed 2026-08-03 and unpinned; the statement
   rewrite is **pending owner confirmation, token `OC-SIVINE`** (reply with the
   token, then clear the Touch ID challenge). Agents cannot enact it.
1b. **The rest of the XP/leaderboard constant cluster** — **R042** and **R046**
   assert that XP mechanics and leaderboard routes are authorized and are therefore
   *live contradictions* of §7.3; **R043**, **R045** and **R041** are dead constants
   whose object this design retires. None were touched — the signature covered R044
   only. Each needs the same owner call. See the table in §7.4.
2. **Pricing, packaging, go-to-market, brand — including the product's name**
   ("ALWAYS ALLOW" is a working title only) and the SEO capture strategy for
   the `claude code *` query sets.
3. **The second product** — comprehension verification of the user's *real*
   diffs (the ticket-02 hole). The door stays open via two designed seams (the
   debrief bridge; the project sentence); building it is a business call.
4. **Whether the scope-(b) lane is big enough** — differentiation is paid; lane
   size is a business question that comes forward early if the message tests
   fail (07 falsifier 3).
5. **Ask-the-tutor usage caps / pricing** under the new product shape.
6. **Whether the frozen product keeps accepting sign-ups** during the freeze
   (currently moot — fixtures only), and anything about sunsetting a live
   surface if real users appear.
7. **Whether the field guide becomes a shareable artifact** (growth/brand).
8. **Owner playtest participation** in the vertical slice (scheduling and
   taste, at build time).
9. **The v1 launch mission's open HITL gates** (ISSUE-030/032,
   [2026-07-10 mission](file:///Users/thebeast/code-tutor/docs/missions/2026-07-10-code-tutor-v1/HANDOFF.md)) —
   untouched by everything here.

**Deliberately unspecified design dials (playtest-tunable, marked in §9):** the
endowment count, the framing-screen word numbers, the screen-4/5 split, dimmed
vs hidden unencountered concepts, global vs cluster finish-line bounds, the
inspection time-cost curve, final copy for every surface (all copy goes through
the enforcement suite; this document specifies register and budget, not
sentences).

**Out of scope for the build mission entirely:** build sequencing itself is the
next effort's packet (PLAN.md is a draft input, ratified in part by 09 §5);
this document rules design, and §7.5's freeze rule plus the sink-first
precondition are the only sequencing constraints it imposes.

---

## Lockable constants — proposed

For a follow-up session to offer the owner **one at a time** via
`constance declare` (not declared here; declaring is the owner's session):

1. **The subject boundary** — the subject is the developer terrain, taught only
   inside decisions an agent proposal creates; a concept enters only inside a
   decision, a scenario only if it teaches a named concept (§2).
2. **The loss firing rule** — loss fires only from an explicit Allow with Look
   first and Don't allow both live and sufficient; never from decline, timeout,
   autonomous action, or system fiat (I-13).
3. **The tutor's seat** — the tutor is load-bearing as authored deterministic
   content; the runtime LLM is pull-only and additive-only, never in the
   critical path (§5).
4. **INV-G1** — verbatim as in §5/I-10.
5. **The never-at-risk list** — the seven assertable lines of I-14, verbatim.

---

**Status: LOCKED**, save the one signature (§7.4). A build mission executes from
this document; provenance lives in the linked rulings; the falsifiers in §9 are
the standing exit conditions.
