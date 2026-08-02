# AMENDMENT A4 — to `docs/missions/2026-07-19-code-tutor-engagement-v2/DESIGN_CONTRACT.md` (FROZEN v1.3)

**Raised by:** adversarial review finding F-001, 2026-08-02.
**Status:** DRAFTED during planning. **Not yet applied.** Application to the frozen contract's amendment log is ISSUE-001 of this mission and happens only after packet approval.

---

## Why this exists

`CLAUDE.md` names the frozen 2026-07-19 design contract as the active source of truth for engagement and UI work. That contract states "Rules locked; changes only via amendment" (§Status) and maintains an amendment log (A1, A3 precedent).

This mission's packet initially claimed it "inherits" the frozen contract. **That claim was wrong**, and the adversarial review caught it. The packet directly contradicts named non-goals and exclusions in the frozen contract. A prose note in a creative bible saying a clause is "superseded" is not the repository's amendment mechanism.

Without this amendment, one of two bad outcomes follows: an implementation agent correctly reads the frozen contract, refuses the work, and the mission stalls after issue-writing; or an agent ignores the contract and ships behaviour the repository's own governance says is unauthorized.

## Authorization

Same Lane B pattern that authorized the frozen contract itself, which records "authorization: the user's 2026-07-19 directive … interpreted as standing implementation authorization."

**This amendment's authorization is the owner's 2026-08-02 directive**, verbatim in [`INTERVIEW.md`](./INTERVIEW.md), which explicitly commissions each superseded clause — one locked viewport, "old school catchy nintendo like music," three levels per landmark, improved copy, gamification with movement and effects and sound effects, game boards that change as the game is played, and reactive on-screen characters.

The grill closed with owner confirmation on 2026-08-02. The authorization is not inferred; it is the assignment.

## Clauses superseded

| Frozen contract clause | Location | Disposition under A4 |
|---|---|---|
| "sound (v2)" listed under *Deliberately excluded* | §Deliberately excluded (line 93) | **Superseded.** Synthesized Web Audio music and SFX are commissioned. The exclusion's intent — no autoplaying sound — is **retained and strengthened**: audio starts muted behind a user gesture with a persistent mute control (REQ-015). |
| "No autoplaying sound" | §Accessibility (line 147) | **Retained, unchanged.** A4 does not weaken this. |
| "canonical content or VOICE.md changes" listed under *Non-goals* | §Non-goals (line 199) | **Superseded.** Re-voicing the canonical corpus is the mission's central purpose. The copy-loyalty *mechanism* protecting against invented facts is retained (CREATIVE_BIBLE §6.4). |
| "global map redesign" listed under *Non-goals* | §Non-goals (line 199) | **Partially superseded.** Board evolution states are added. The Pixi map architecture, its DOM fallback, and its accessibility path are **retained unchanged** (MISSION_CONTEXT A1). |
| "beat factory for all 48" listed under *Non-goals* | §Non-goals (line 199) | **Superseded and inverted.** The factory is *removed*, not extended. Tier-aware authored content replaces it. |
| "XP/collectibles" and "streaks of any kind (default: still no)" listed as post-pilot candidates requiring a separate amendment | §Post-pilot candidates (line 91) | **Superseded for XP** (per-level awards, REQ-020). **Streaks:** the mission adds streak *feedback* (juice + music layers), and the frozen contract's actual concern is preserved verbatim below. |
| "Punitive streak loss / streak-shame copy" listed as a banned pattern | §Banned patterns row 1 (line 24) | **Retained, unchanged, and binding on all new content.** Streak feedback is additive only: building a streak is celebrated, breaking one is never punished, shamed, or scored down. This is a hard constraint on CREATIVE_BIBLE §4. |
| "Onboarding wall before first map interaction" listed as a banned pattern | §Banned patterns row 7 (line 30) | **Retained in spirit, mechanism changed.** CREATIVE_BIBLE §7 routes a new player to a title screen and directly into their first run, withholding `/map` until after the first stamp. This is *not* an onboarding wall — there is no form, no account, and no reading gate before the first interaction. The banned pattern's purpose (protect time-to-first-reward) is the explicit design target: first correct answer inside 60 seconds. |
| "onboarding behavior changes" listed under *Non-goals* | §Non-goals (line 199) | **Superseded** to the extent of the title-screen landing route above. `OnboardingChat` mounting behaviour in `MapExperience` is otherwise unchanged. |
| "Stripe/deploy/launch anything" listed under *Non-goals* | §Non-goals (line 199) | **Retained, unchanged.** This mission takes no payment, makes no deploy, and spends nothing. |
| "Framer Motion" listed under *Non-goals* | §Non-goals (line 199) | **Retained, unchanged.** Motion stays CSS-only with `steps()` timing and no animation dependency. Audio adds no runtime dependency either (REQ-013). |
| "lives, leagues, timers, daily quests, fake urgency" | §Deliberately excluded (line 93) | **Retained, unchanged.** None are added. Level gating is a difficulty ramp, not a timer or a life system. |
| "personalized AI openings" | §Deliberately excluded (line 93) | **Retained, unchanged.** |

## Clauses explicitly reaffirmed

A4 does not touch these, and this mission is bound by them:

- Server-side atomic monotonic merge in SQL, never JS read-then-write (§Persistence, line 130). This mission *extends* the merge with a level dimension; it does not replace the algebra.
- Touch targets ≥ 44px; colour never the only signal (§Accessibility, line 147).
- The typed analytics seam is four files; new events must be added to the `ClientAnalyticsEvent` allowlist or they silently cannot fire (§Analytics, line 152).
- The `format_switched` union stays `'overview' | 'lesson' | 'quiz'`; "Play" is display-only.
- No clinical, diagnostic, or neurochemical claims in UI copy (§Claims discipline, line 6).
- v1 mission HITL items remain untouched.

## Amendment log entry to be appended

To be added to the frozen contract's `## Amendment log` as ISSUE-001 of this mission, not before:

> **A4 (2026-08-02, mission `2026-08-02-vibe-code-quest-arcade`):** arcade rebuild authorized by the owner's 2026-08-02 directive (Lane B, same pattern as the original freeze). Supersedes the *sound* exclusion (audio remains muted-by-default behind a user gesture — the no-autoplay rule is retained and strengthened), the *canonical content / VOICE.md* non-goal, the *beat factory for all 48* non-goal (the factory is removed, not extended), the *XP* post-pilot gate, and the *onboarding behavior* non-goal to the extent of a title-screen landing route. Partially supersedes *global map redesign* (board evolution states added; Pixi architecture, DOM fallback and a11y path unchanged). **Retained and binding:** no punitive streak loss or streak-shame copy, no autoplaying sound, no lives/leagues/timers/daily quests/fake urgency, no Framer Motion, no Stripe/deploy/launch, atomic SQL monotonic merge, ≥44px touch targets, colour never the only signal, the four-file typed analytics seam. Full rationale: `docs/missions/2026-08-02-vibe-code-quest-arcade/AMENDMENT-A4.md`.

## Note on prior drift

The 2026-07-20 launch mission shipped an XP HUD, leaderboard and collectible props — all of which the frozen v1.3 contract lists as post-pilot candidates requiring a separate amendment, and none of which appear in its amendment log (A1, A3 only).

This is recorded as an observation, not a finding of this mission, and A4 does not retroactively authorize it. It is noted because it explains why the frozen contract reads as more restrictive than the shipped product, and because the same drift is what F-001 caught this mission attempting. **The lesson taken: write the amendment, do not let a mission's prose quietly outrank the governance file.**
