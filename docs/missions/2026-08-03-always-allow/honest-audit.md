# Honest audit: what this game actually is

Written 2026-08-03 by the session (Opus), from the running build, not from the packet.
Owner prompt: "audit the game and be honest about what it is, keep the mechanics
that work."

---

## 1. Every verb the player has

I played a full run and listed every interaction available:

| Verb | What it does |
|---|---|
| Click **Begin / Next / Continue** | advance one beat |
| Click an **option** in a list | reveal feedback for that option |
| Click **Show next card** | reveal the next sentence of a definition |
| Select a **radio**, click **Check answer** | grade the quiz |
| Click **Stamp this lesson** | mark complete |
| Click **Back** | re-read an earlier beat |

That is the complete list. Every verb is *read, then click*. **There is no verb that
changes anything in a simulated world.** Nothing the player does has an effect that
outlives the click.

## 2. The structure, stated plainly

All 144 runs are the identical eight-step sequence:

```
hook (read) → predict (pick, ungraded) → reveal (read 1–3 cards)
→ scenario (pick, graded) → gotcha (pick, graded) → default (read)
→ check (pick, graded) → recap (read) → stamp
```

So one run = **read four screens, answer three multiple-choice questions, press a
button.** Roughly 3 minutes. The arcade stage, the pixel dog and the chiptune sit
around that, and do not change it.

## 3. Failure does not exist

A wrong answer shows feedback and lets you pick again. The beat will not advance
until you pick correctly. There is no lives system, no score threshold, no time
pressure, no cost to being wrong, and no way to finish a run in a worse state than
anyone else who finished it.

XP is awarded for *completion*, not performance — two players, one flawless and one
who guessed every option in turn, end with identical XP and identical progress. The
streak counter resets on a wrong answer, but nothing depends on the streak except a
hi-hat pattern.

**The game cannot be lost, and cannot be played badly.**

## 4. "Three levels" is three lessons, not three difficulties

L1 / L2 / L3 use the *identical mechanic*. What changes is the vocabulary of the
copy: L1 names things, L2 poses one agent decision, L3 discusses tradeoffs. That is a
sound content ladder — but calling them levels implies escalating challenge, and
there is none. A player who cleared L1 faces exactly the same task at L3.

## 5. The dissonance with the research — this is the core finding

> **Correction, 2026-08-03.** My first draft of this section asserted that "the
> dominant emotion in the corpus is fear." The distillation
> (`research-distilled.md`) counted it and I was wrong. Fear is explicit in only
> 5 of 49 findings (~10%). The dominant state is **confusion / overwhelm, 20 of
> 49 (~41%)**; shock and outrage account for 11 (~22%) and arrive *after* the
> damage; **resignation — people who have stopped trying to understand and are
> just clicking through — is 6 (~12%)**. Embarrassment is almost absent (2).
> I had reasoned from the vividness of the disaster stories rather than from
> their frequency. The corrected reading changes the design brief materially,
> so it is recorded rather than quietly edited.

The corpus divides into two populations, and they need different things:

- **The lost (41%)** — "I'm completely lost about where to begin." They have not
  had the accident. They are overwhelmed *before* anything goes wrong.
- **The resigned (12%)** — "Just vibe. I couldn't read the code anyway." They have
  given up on understanding and are clicking through. This is the hardest and most
  important player to reach.
- **The burned (22%)** — shock and outrage, *after* an irreversible loss.

And the corpus is explicit that people arrive **having fun**, not frightened:
"vibe coding is fun until you realize you dont understand what you built." The
game's job is to reach them **before the "until"**.

The game we built has no consequence, no loss, no irreversibility, and nothing at
risk. It teaches by *telling you about* danger, in a place where danger cannot occur.

The research subjects were not short of people telling them things. What they lacked
was **a safe place to have the accident** — and that is precisely the thing this
design does not offer.

**Caveat, from the distillation:** every failure in the corpus *landed*. There is not
one reported near-miss — nobody wrote "I almost approved something destructive and
caught it." So "let them nearly lose everything, safely" is my inference, not an
evidenced finding, and must be labelled that way in any plan.

**The strongest evidenced direction.** Three habits would have prevented 8 of the 12
documented catastrophic failures:

1. Back up the database before letting an agent touch it — 4 of 12
2. Never put secrets in frontend code — 2 of 12
3. **Understand what you are approving before clicking "always allow"** — ~4 of 12

And the third has a verbatim player quote attached to it: *"I literally always say
always allow. I have no idea what the stuff they are asking means."*

That is the game. Not 48 topics of vocabulary — **the approval decision**, which is
the exact moment the player already stands in, already knows they are guessing at,
and already loses money and data to.

That gap is not a polish problem, a copy problem, or a mechanic-tuning problem. It is
the product thesis.

## 6. What genuinely works and must be kept

Not everything here is wrong. These earn their place and should survive any replan:

1. **The three-tier content ladder** (vocabulary → one agent decision → tradeoffs).
   It maps directly onto the research's own gap structure. Keep.
2. **The L2 agent-chat framing** — `AGENT: "I'm going to X. OK?"` and you answer.
   This is the ONE place the current game touches the real situation the research
   describes. It should probably become the whole game rather than one beat in eight.
3. **The content enforcement suite** — provenance (no claim that isn't canonical),
   word budgets, banned phrases, reading level. This is why the writing is good and
   consistent, and it will matter more, not less, in any redesign.
4. **The UGC term coverage gate** — adding a documented confusion to the term list
   fails the build until content teaches it. Research leads content, mechanically.
5. **The level gating, progress and XP model.** Server-authoritative, transactional,
   monotonic, migration-safe. Genuinely good engineering. Keep.
6. **The locked stage.** A fixed, non-scrolling play surface is the right frame for
   anything arcade-shaped.

## 7. What is dressing, and what is filler

- **On hold by owner directive:** music, avatar, juice, board evolution. Correct call.
  None of them make a mechanically inert product into a game.
- **Filler, and should be questioned in the replan:** the `predict` beat (an ungraded
  guess before the reveal), the `gotcha` beat (recognition, not judgment) and the
  `recap` beat (restates what was just read). Of the eight beats, roughly three carry
  the learning; the rest are pacing.

## 8. The honest one-line label

**A well-engineered, well-written, mechanically inert multiple-choice courseware
product wearing an arcade skin.**

The engineering is real: transactional gating, migration safety, enforced content
provenance, an accessibility floor, a measured audio path. The writing is real. The
*game* is not a game — it is a worksheet with a very good chassis under it.

The chassis is worth keeping. The worksheet is what needs replacing.
