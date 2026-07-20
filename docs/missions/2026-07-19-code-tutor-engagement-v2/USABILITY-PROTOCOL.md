# USABILITY PROTOCOL — engagement-v2 post-pilot study

**Status:** DRAFT for founder run · **Date:** 2026-07-20  
**Authority:** DESIGN_CONTRACT §12 post-pilot usability protocol  
**Gate:** Rollout decision and any 48-landmark factory are blocked until this study completes and the founder signs off.

## Purpose

Literature and comps are not enough. Adult-ADHD-specific product evidence is thin (synthesis headline). This protocol is the decisive evidence layer for whether BeatPlayer earns scale.

## Participants

- **N:** 5–8 non-coding founders with ADHD traits (self-identified; no clinical screening).
- **Exclusion:** professional engineers, current code-tutor contributors, people who wrote the pilot content.
- **Incentive:** optional product credit / founder thank-you — no dark-pattern retention hooks during the session.

## Session shape (~25 minutes)

1. **Cold start (8 min)** — open `git/commits-as-checkpoints` Play surface with no coaching. Task: finish the landmark and stamp it.
2. **Interruption / resume (5 min)** — close the tab mid-sequence (or after stamp), wait ≥2 minutes (lab proxy for 24h), reopen. Task: resume without losing progress.
3. **Next-offer choice (4 min)** — at stamp, choose either “Next: …” or “Back to map.” No pressure copy.
4. **Transfer spot-check (5 min)** — open `security/trust-boundaries`. Task: complete at least through scenario. Confirms grammar transfers without git-specific coaching.
5. **Debrief (3 min)** — three questions only (below).

## Tasks (exact wording)

1. “Finish this short lesson and stamp it when you’re done. You can leave whenever you want.”
2. “Close the tab, wait a bit, then come back and pick up where you left off.”
3. “When you finish, choose either the next landmark or back to the map — whichever you want.”
4. “Try this second topic the same way. Stop when you’ve made one decision on the scenario.”

## Metrics (north star only)

| Metric | How collected | Success signal (directional, not a hard pass/fail cutoff) |
|---|---|---|
| Time-to-first-action | Stopwatch from landmark open → first meaningful tap | Most participants < 5s |
| Start → stamp | Binary + wall clock | Majority stamp the pilot in one sitting |
| Wrong → corrected recovery | Observer notes on scenario/gotcha retry | Retry without shame language / abandonment |
| Interruption / resume | Binary resume success | Progress restored without re-doing finished beats |
| Next-landmark acceptance | Binary at stamp | Voluntary, not pressured |
| Voluntary return intent | Debrief Q3 | “Would try another landmark this week” ≥ half |
| Perceived clarity / control | Debrief Q1–Q2 (1–5) | Median ≥ 4 on control; no “I got punished” reports |

**Anti-metric:** raw click count. Do not optimize for it.

## Debrief questions

1. “How clear was what to do next?” (1–5 + free text)
2. “How in control did you feel when you got something wrong?” (1–5 + free text)
3. “Would you open another landmark this week? Why / why not?”

## What this study does **not** decide

- Pricing, Stripe, deploy, launch posts (v1 HITL gates stay parked).
- XP, streaks, glow, sound, confetti (still excluded).
- Canonical content or VOICE.md changes.
- Clinical claims about ADHD.

## Decision rule

- **Scale (open factory for more landmarks):** majority stamp + successful resume + no punitive-feel reports + transfer landmark completable without coaching.
- **Revise grammar first:** any landmark-specific UI branch required, >20% schema change needed, or widespread “I don’t know what to tap” / shame feedback.
- **Hold:** mixed results — fix the named friction, re-run with ≥5 participants before factory work.

## Operator checklist

- [ ] Recruit 5–8 founders
- [ ] Record sessions only with consent; no answer content in analytics
- [ ] Use production-like build on a clean anonymous session
- [ ] Fill results table (one row per participant)
- [ ] Write one-page findings → founder decision gate before any 48-landmark work

## Results table (fill during study)

| # | Stamp? | Resume? | Next offer? | Transfer scenario? | Clarity 1–5 | Control 1–5 | Notes |
|---|---|---|---|---|---|---|---|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |
| 4 | | | | | | | |
| 5 | | | | | | | |
| 6 | | | | | | | |
| 7 | | | | | | | |
| 8 | | | | | | | |

**Rollout / factory authorization:** _pending study + founder sign-off_
