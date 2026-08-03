# Build plan — ALWAYS ALLOW, vertical slice "The Cleanup"

Written 2026-08-03 by the session (Opus, senior dev) on top of the architect's
ruling in `creative-vision.md`. The ruling decides WHAT. This decides HOW, in
what order, and what proves it.

Inputs: `honest-audit.md`, `research-distilled.md`, `mechanics-research.md`,
`creative-vision.md`. Every design claim below traces to one of them.

---

## 0. The one sequencing decision I am taking, and why it differs from the ruling

The ruling says the map, the islands, the 8-beat sequence, the avatar, the music,
XP and collectibles are **"removed, not parked."** I agree with all of it as a
design ruling. I am **not deleting them yet**, and the reason is the ruling's own
§7: it names a salvage path if the vertical slice fails its kill criteria. Deleting
the working product before running the test destroys the fallback that the test
exists to protect.

**Sequence: build the slice alongside, at its own route. Retire the old game the
day the slice passes its gate — in one deletion commit, not a slow rot.** If the
slice is killed, we still have a shipped, green, accessible product and we have
spent one contract's worth of work to learn something decisive.

Nothing about the old game gets *invested in* in the meantime. It is frozen, not
maintained.

---

## 1. What the slice actually is, in engineering terms

Strip the fiction away and "The Cleanup" is:

> A **deterministic reducer** over a small visible state object, driven by an
> ordered list of proposals, where each proposal has a declared effect, a
> reversibility class, and — if hazardous — provenance to a documented real-world
> failure. The UI is a pure render of that state plus a history of transitions.

That shape matters because it is exactly what the existing chassis is good at, and
because it makes the research's demand ("an executable model", mechanics-research
§2) into something with unit tests rather than something with vibes.

State is the product. Everything else renders it.

---

## 2. The model (slice 1 — pure logic, no UI)

### 2.1 Project state

```
ProjectState {
  app:      { running: boolean; brokenBy: ProposalId | null }
  database: { tables: { name, rows: Row[] }[] }
  secrets:  { key: string; location: 'env' | 'frontend' | 'absent' }[]
  deploy:   { liveVersion: VersionId | null; versions: VersionId[] }
  money:    { balanceCents: number; burnEvents: BurnEvent[] }
  backups:  { takenAt: TurnIndex; snapshot: DatabaseSnapshot }[]
  scars:    Scar[]        // persistent, honest, survives recovery
}
```

Two rules that are load-bearing and will be enforced by tests:

1. **Nothing invisible ever changes.** Every field above has a rendered
   representation on the board. A reducer that mutates state with no visible
   consequence is a bug, and a test asserts every effect kind maps to a board
   region. (mechanics-research §4 legibility.)
2. **The reducer is total and deterministic.** Same state + same action = same
   state, always. No randomness in outcomes — the danger is in the *proposal*, not
   in a dice roll. A player who inspects correctly is never punished by chance.

### 2.2 Proposal

```
Proposal {
  id
  agentLine:     string        // "I'll clean up the old customer records. OK?"
  command:       string        // the verbatim thing it would run
  glosses:       { token, plainEnglish }[]   // hover/focus explanations
  touches:       BoardRegion[] // what pulses on the board during inspection
  reversibility: 'undoable' | 'costs-money' | 'irreversible'
  effect:        Effect        // applied on Allow
  declineEffect: Effect        // applied on Don't allow — never a no-op
  hazard?:       { findingId: string; whatItCosts: string }   // REQUIRED if irreversible
  prediction?:   { question, options, correct }
}
```

### 2.3 The new enforcement gate

The existing content suite (provenance, word budgets, banned phrases, reading
level) is repointed rather than rebuilt. **One new invariant, and it is the one
that keeps this game honest:**

> Every proposal with `reversibility: 'irreversible'` MUST carry `hazard.findingId`
> resolving to a real finding in the UGC corpus. The build fails otherwise.

This is the direct descendant of the existing UGC coverage gate, and it stops the
game inventing dangers that sound good but nobody has ever actually suffered. It
also means the corpus's twelve catastrophes are the design budget: we ship hazards
we can cite.

**Shame language joins the banned-phrase list** (ruling §2 tone), enforced
mechanically on agent dialogue, inspection glosses, incident copy and debriefs.

### 2.4 Tests that define done for slice 1

- reducer determinism and totality
- every effect kind renders to a declared board region (no invisible state)
- taking a backup then suffering a destructive effect ⇒ recovery restores exactly
  the snapshot, and the scar is still recorded
- **no backup** ⇒ rows are genuinely gone, contract still completable in degraded
  state, campaign continues (ruling §2, mechanics-research §3 steps 4–7)
- an irreversible proposal without `hazard.findingId` fails the build
- declining is never a no-op

---

## 3. The desk (slice 2 — render only)

Reuse `[data-stage]` and its fit harness wholesale. Three regions replacing
hud/play/trail:

| Region | Content |
|---|---|
| `chat` (left) | agent dialogue, one live proposal, three buttons |
| `board` (right) | app preview, database table, secrets drawer, deploy slot, money, backup shelf |
| `ledger` (bottom) | scrubbable history of every decision this run |

The existing stage-fit harness already asserts no page scroll at 1024×640 and
1440×900, single-axis reflow at 200% text, and that every focusable control sits
inside the stage. **It transfers with zero changes and immediately guards the new
layout** — which is the clearest evidence that keeping the chassis was right.

Accessibility floor carries whole: L/A/D keyboard path, tab order through the
board, screen-reader narration of every state transition ("Customers table: 1,204
rows, was 12,847"), reduced-motion variant, and reversibility badges that are
icon + word, never colour alone.

---

## 4. The loop (slice 3)

`Look first` / `Allow` / `Don't allow`, the inspection panel, and animated state
transitions on the board.

Inspection is **free in this slice**. The ruling flags the time-cost economy as
`[INFERENCE]` with no evidence fixing the dial — so the slice ships without it and
we learn from playtests whether "always allow" is tempting enough on its own. Adding
pressure later is cheap; shipping an untuned pressure system into the one test that
decides the product is not.

---

## 5. Prediction (slice 4)

Two committed predictions in the ten proposals. One-tap, commit before execute,
then watch. This is the highest-evidence single mechanic in the whole plan — Pan &
Rickard put retrieval-practice transfer at d=.40, and it is specifically
generation rather than recognition, which is exactly what the old quiz was not.

---

## 6. Incident mode (slice 5) — the deepest part, built as its own thing

`diagnose → recover → install the prevention → debrief bridge`.

- **Diagnose** is clicking real candidate locations on the board and each answering
  truthfully. Not a quiz about where copies live — the actual board, actually
  queried.
- **Recover** consumes in-sim money or time. Never course progress. Hidden
  checkpoint protects the campaign (mechanics-research §3 step 5).
- **Install the prevention** — the incident does not close until the player
  *performs* the preventive act. Not reads about it. Does it.
- **Debrief bridge** — one screen connecting the sim to the real tool: "In your
  builder, this is the moment it asks X; here's what to look for." This is where
  the provenance-checked content pipeline pours in, and per the mechanics research
  it is not optional garnish — serious games work better with supplementary
  instruction.

---

## 7. Content for the slice (slice 6)

Ten proposals: seven safe and productive, one C1/C12-class destructive database
operation dressed as routine, one C5-class secret placement, one decline-bait where
the agent is right. All agent dialogue runs through the existing voice enforcement.

Seed corpus: the Git L2 agent-chat lines already written. They were built for
exactly this register and they are the one piece of content the audit found
touching the real situation.

---

## 8. The gate — how we know (slice 7)

This is the point of the whole exercise and it is **not** a green test suite.

Run 5+ playtests with people who use AI builders and don't read code.

**Prove:**
- a majority use *Look first* at least once unprompted
- players who hit the incident can state, unprompted, what would have prevented it
- players describe it in incident terms ("it deleted my stuff, but I'd taken the
  backup"), not lesson terms
- a majority want a second contract

**Kill:**
- fewer than ~1 in 5 ever inspect, even after the incident, **and** post-incident
  interviews yield self-blame or exit intent
- or players call it "a quiz with extra steps"

If killed, the salvage is honest and already named: the visible board, the
plain-language glosses and the debrief bridges survive as a reference companion,
and the consequential-failure bet is retired.

---

## 9. Order of work

| # | Slice | Depends on | Proves |
|---|---|---|---|
| 1 | Sim model + reducer + hazard-provenance gate | — | the executable model exists and is honest |
| 2 | Desk shell on the existing locked stage | 1 | state is visible; fit harness still green |
| 3 | Look/Allow/Decline + inspection | 2 | the core loop is playable |
| 4 | Prediction commit | 3 | generation, not recognition |
| 5 | Incident mode | 3 | failure teaches instead of punishing |
| 6 | The ten proposals | 1, 5 | content is research-grounded |
| 7 | Playtest gate | all | the thesis lives or dies |

Slices 1 and 2 are the ones I would build first regardless of the outcome — a
visible, testable state model is the salvage path as well as the product.

---

## 10. What this plan deliberately does not do

- No music, no avatar, no juice, no board evolution. On hold by owner directive and
  not in this plan at any point.
- No deletion of the current game until slice 7 returns a verdict (§0).
- No campaign, no persistence beyond one run, no second contract in this slice.
- No inspection time-economy, no spend caps, no multiple contracts — all named in
  the ruling as medium-confidence incarnation details, all deliberately deferred to
  after the gate.

The single most likely way this plan fails is scope: building the campaign before
proving the contract. The slice is ten proposals and one catastrophe. That is all.
