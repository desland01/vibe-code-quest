# DESIGN CONTRACT — code-tutor engagement v2

**Status:** FROZEN v1.3 — authorization: the original 2026-07-19 user directive ("way better visual design, all modules interactive, animated sequential steps, gamification to keep ADHD founders engaged — research and build") taken as standing build authorization (Lane B, logged in HANDOFF/WORK_LEDGER). Rules locked; changes only via amendment. Evidence base: `docs/research/adhd-engagement-synthesis.md` (orchestrator-verified primary sources, 2026-07-19). E-001 plumbing may touch src/ now. Visual comps are the first work item of E-002 and hard-gate the BeatPlayer build.
**Scope:** engagement layer only. For engagement/UI work THIS contract is the active mission source of truth (per AGENTS.md/CLAUDE.md pointer). The v1 mission (`docs/missions/2026-07-10-code-tutor-v1/`) remains the source of truth for production/launch work; its ISSUE-030/032 stay HITL-blocked, untouched. This work never touches Stripe, deploy, launch assets, canonical landmark content, or VOICE.md.
**North star:** every landmark becomes a ~3 minute local beat sequence (predict → reveal → decide → stamp) with instant feedback, AI demoted to the help rail, and a shame-free progress economy. Measured by stamp completion, resume success, next-landmark acceptance, and voluntary return — never raw clicks.
**Claims discipline:** no clinical, diagnostic, or neurochemical claims in UI copy or artifacts as fact. Adult-ADHD-specific product evidence is thin (synthesis headline finding); ADHD-labeled rules below are explicit hypotheses; time targets are performance budgets to measure. The 5-8 founder usability study post-pilot is the decisive evidence layer.

---

## 1. ICP and job-to-be-done

- **ICP:** founders with ADHD traits who cannot code, directing AI agents to build software. They fear getting scammed by contractors and shipping things they can't inspect.
- **JTBD:** "When my AI agent proposes or changes something, help me make the safe call in under 5 minutes — and let me feel like I won something, not sat through a course."
- **Implication:** learning is a side effect of a tight interaction loop. Every scenario is a business decision (invoice reminders, customer data, deploys), never computer-science trivia or interview prep (VOICE.md banned patterns hold).

## 2. Ethical engagement rules

We borrow the pull of games, not their coercion. The user can always leave without loss, always resume without penalty, and every reward maps to demonstrated competence.

**FORBIDDEN patterns (code review must reject):**

| # | Pattern | Why forbidden |
|---|---|---|
| 1 | Punitive streak loss / streak-shame copy | Loss aversion churns; shame kills return (hypothesis 5, synthesis) |
| 2 | Fake scarcity / countdown pressure | Manipulation; also false (content is static) |
| 3 | Random loot decoupled from competence | Rewards must index competence (synthesis claim 6) |
| 4 | Infinite-scroll lesson content | No stopping cue; binge-then-abandon |
| 5 | Leaderboards / forced social comparison in v2 | Shame vector; no social graph exists |
| 6 | High-motion confetti on every action | Reward inflation; vestibular noise (synthesis claim 10) |
| 7 | Onboarding wall before first map interaction | Blocks time-to-first-reward |
| 8 | Wrong-answer penalties (lives, score loss, lockout, shake/red-flash) | Fail-soft retry only |
| 9 | Mandatory free-text input before value | Task-initiation friction |
| 10 | Blocking "thinking…" states in the core path | Latency + no agency = bounce |

## 3. Core session loop

```
Map → region → landmark → BeatSequence (local, 8 beats) → stamp
  → offer "Next: <sibling>" (one tap) OR clean stop → map progress update
```

- **Time-to-first-interaction (budget):** beat 1 interactive within ~2 seconds of render. No spinner-first.
- **Time-to-first-reward (budget):** target < 5 seconds from landmark open; first tap visibly changes something.
- **Session target:** one landmark ≈ 3 minutes; soft ending with two exits: "Next: <sibling>" (primary) and "Back to map" (always visible).
- **Open loop on exit:** progress framed as pull ("Git River — 4 of 6 stamped"), never debt (synthesis claims 4-5).
- **Onboarding (route fact, no change):** `OnboardingChat` mounts in `MapExperience` (map page) and is untouched. Landmark routes (`SubMapScene`) do not mount it — nothing to change for the pilot; do not add it there.

## 4. Beat grammar (data-driven)

Beats are a typed projection of existing canonical landmark fields — not new freeform content, not LLM output. Derived from `hook`, `definition`, `example`, `when_to_use`, `tradeoffs`, `gotchas`, `vibe_coder_default`, `quiz`.

| Beat type | Source fields | Interaction | Grading |
|---|---|---|---|
| `hook` | hook, title | stamp-in card; tap to continue | n/a |
| `predict` | derived from definition | forced choice BEFORE teaching (2-3 options) | recorded, never penalized; reveal follows (synthesis claim 2) |
| `reveal` | definition (chunked ≤3 cards) | progressive disclosure, one card per tap | worked example (synthesis claim 3) |
| `scenario` | example, when_to_use | "what do you do?" — 3 plausible moves | deterministic correct + per-option feedback |
| `tradeoff` | tradeoffs.pros/cons | sort or swipe pro/con (≤4 items) | deterministic set match |
| `gotcha` | gotchas | "spot the trap" | deterministic single pick |
| `default` | vibe_coder_default | commit-the-default confirmation card | n/a |
| `check` | quiz | existing MCQ + instant grade + explanation | existing deterministic quiz (synthesis claim 1) |
| `recap` | 3 bullets from prior beats | one-tap finish → stamp | n/a |

**Beat rules:**
- One focal action per screen. ≤ 4 visible choices per beat (3 preferred). 5-8 beats per landmark; pilot uses 8.
- Every beat resolves in a physical affordance (flip, stamp, check, slide, sort) — not a "Continue" text link.
- Every beat carries: `id` (stable, unique within the landmark, e.g. `reveal-definition-1` — types repeat and are NOT identifiers), `type`, `prompt`, interaction payload, deterministic grade or null, per-option feedback, `hint`, estimated seconds.
- Every wrong response is useful: option-specific feedback + hint + immediate retry. No score/life loss, no lockout, no shake or red-flash.
- No beat waits on network or LLM. The whole sequence plays offline after page load.

**Storage shape:** parallel registry, not a schema migration: `src/content/<region>/beats/<landmark-id>.ts` exporting typed `Beat[]`, surfaced via a static registry `src/content/beats/index.ts` (explicit imports only), validated by a `Beat` zod schema at manifest build. `landmarkSchema` unchanged. Landmarks without beats render the current overview-first experience.

**Format information architecture (locked on approval):**
- Beat-enabled landmarks: `format=lesson` renders `BeatPlayer`; tab label changes from "Lesson" to **"Play"** (display-only; URL value and analytics union stay `lesson`). Default format for beat-enabled landmarks = Play, with explicit `?format=` always winning and `expert_refresh` profile default still preferring `quiz`.
- `format=overview` remains the calm canonical reference/trust surface.
- `format=quiz` remains the direct assessment route.
- **Quiz/check dedup:** completing the `check` beat emits `quiz_completed` exactly once (same semantics as direct quiz). Direct quiz completion never stamps the sequence and never writes beat progress.
- Browser back/forward and existing `?format=` deep links keep working.

## 5. Reward economy

**Pilot tier (ships with pilot) — stamp + pips + next-offer only:**

| Mechanic | Trigger | Cadence | Guardrail |
|---|---|---|---|
| Beat press feedback | any correct interaction | every beat | ≤150ms; reduced-motion = instant |
| Landmark stamp | completing final beat | per landmark | one 400-600ms animation, skippable, once |
| Region progress pips (n of 6) | stamp | per stamp | "4 of 6 stamped", never "2 missing" |
| Next-landmark offer | stamp moment | per landmark | always paired with visible clean-stop option |

**Post-pilot candidates (require pilot metrics + separate amendment):** XP counter, collectible pixel props, `dueAt` resurface shimmer (synthesis claim 9: FSRS is an engineering artifact; date math first), map-canvas glow, streaks of any kind (default: still no). Cut map glow before ever cutting resume/monotonicity work.

Deliberately excluded: lives, leagues, timers, daily quests, fake urgency, sound (v2), personalized AI openings.

## 6. Motion vocabulary

Existing CSS `steps()` pixel motion + `prefers-reduced-motion` pattern stands. CSS/Web Animations only — no new motion dependency without documented justification. WCAG constraints: SC 2.2.2 (auto content >5s must be pausable/stoppable), SC 2.3.3 (interaction-triggered non-essential animation disable-able) — synthesis claim 10.

| Verb | Duration | Easing | Used for | Reduced-motion fallback |
|---|---|---|---|---|
| press | 80-120ms | steps(2) | choice acknowledge | instant state change |
| flip | 200-260ms | steps(4) | card reveal | crossfade |
| stamp | 400-600ms, once | steps(6) + 2px squash | completion | instant badge |
| pop | 150-200ms | steps(3) | correct confirm | color change only |
| slide | 220-280ms | steps(4) | beat advance | instant swap |
| glow | 1200ms ×3 loops, then still | ease-in-out | region pip update | single static highlight |

Wrong answers: border color + icon + hint copy only — no shake, no red flash, motion ≤100ms or none.
Celebration budget: one stamp + one glow per landmark. Stillness after.

## 7. Visual tokens and comps gate

Cozy-pixel direction (`designs/map-style.md`) stands; engagement v2 extends it into landmark panels: paper cards (`--banner`), `--ink` outlines, hard offset shadows, `--region-accent` tinting. New: sticker/stamp completion badge (2-4deg rotation, `--banner-border` ink); 6-pip pixel checklist per region. Typography unchanged. No glassmorphism, blur shadows, neon.

**Comps gate (E-002, before BeatPlayer build):** three pilot state comps — (1) prediction card, (2) scenario/mock-diff decision, (3) completion stamp + next-landmark choice — via the repo's Gemini imagegen pattern (ISSUE-003 precedent), judged on desktop AND mobile crops against: one obvious focal action; readability/hierarchy; warmth without childishness; founder relevance; reduced-motion equivalent; correct/wrong legible without color-only meaning; no collision with onboarding or guide UI. Judge record committed as evidence with concrete CSS/token rules extracted.

## 8. Learner model and persistence

- **Store:** existing `progress` table via existing `PUT /api/progress` (extended, not duplicated). Never `profiles.lesson_progress` (lesson turn-count authority, ISSUE-024).
- **State shape (minimal, versioned):**

```json
{ "v": 1, "kind": "beat-sequence", "furthestBeatIndex": 3, "checked": false, "completed": false, "stampedAt": null }
```

- **Model:** `furthestBeatIndex` is the server-authoritative monotonic value. The *displayed* beat is local UI state only — users can page back to review earlier beats without any write or conflict. Completed beats derive from the linear index (no per-beat arrays to lose-update). `completed: true` is written exactly once at the terminal beat (stamp) and never unset — `src/server/share.ts` and region totals count only `state.completed === true`.
- **Write semantics (server is authority):**
  1. Immediate local transition (React state); localStorage write-through for same-device resume.
  2. Writes fire only when `furthestBeatIndex` advances, on `checked`, and at stamp — not on back-navigation.
  3. Server enforces monotonicity **atomically in SQL** (one `INSERT ... ON CONFLICT ... DO UPDATE ... WHERE`, never JS read-then-write): validate against the content registry (region exists; landmark ∈ region; registered beat sequence; index in bounds; `completed` only at terminal index), then upsert only when the incoming `furthestBeatIndex` ≥ stored value and never unset `completed`. Losing writes → 409 + current row. Cross-tab/cross-device races resolve in the database.
  4. Load: server state wins by recency (`updated_at`); localStorage is a cache.
- **Connectivity (precise):** after initial page load, sequence + grading + stamp work without network. Server persistence and cross-device resume require connectivity; offline writes sync on next successful request.
- **Mastery:** per-landmark states only — `seen → in-progress → checked → stamped`. No BKT/DKT/FSRS in pilot (synthesis claim 9).

## 9. AI tutor role

- AI lives only in the existing collapsed "Ask the guide" rail (`GuideChat` + `/api/guide`). Never gates, never blocks, never in the beat path.
- For beat-enabled landmarks, `BeatPlayer` is the `lesson` surface; `/api/lesson` stays for landmarks without beats during transition.
- No AI-generated opening line in the pilot (cost/latency, zero proven value; synthesis claim 8 licenses AI as designed help rail, not primary teacher).
- Completion NEVER depends on the gateway: full sequence + grading + stamp work with `/api/guide` and `/api/lesson` network-blocked.

## 10. Accessibility and sensory safety

- Keyboard: every beat completable with Tab/Enter/arrows; focus moves to the new beat container on advance.
- Screen reader: prompt + result announced via `aria-live="polite"`, once per transition.
- `prefers-reduced-motion`: all verbs fall back per §6; state changes remain fully legible.
- Touch targets ≥ 44px. No autoplaying sound. Color never the only signal.
- WCAG 2.2: no flashing; no vestibular full-screen motion; SC 2.2.2/2.3.3 per §6.

## 11. Analytics

Extend the existing typed seam — no parallel sink. All five touch points change together: `src/lib/analytics.ts` (union + props) · `src/components/landmark/clientEvents.ts` (`ClientAnalyticsEvent` is an `Extract<>` allowlist — new events MUST be added there or they silently cannot fire) · `src/server/events.ts` · `src/__tests__/analytics.test.ts` · `e2e/analytics.spec.ts`. The typed `format_switched` union stays `'overview' | 'lesson' | 'quiz'` ("Play" is display-only).

Pilot events only: `beat_started {landmark, beat_id, type}` · `beat_completed {landmark, beat_id, type, ms}` · `landmark_stamped {landmark, region, ms_total}` · `next_landmark_accepted {from, to}` · `resume_succeeded {landmark, furthest_beat_index}`. No answer content (PII rule stands).

**Health metrics:** time-to-first-action · start→stamp rate · next-landmark acceptance · resume success · voluntary return. **Anti-metric:** raw click count.

## 12. Pilot implementation contract

**Pilot:** `git/commits-as-checkpoints` only. Proves the grammar end-to-end before any factory.

**Beat script (8 beats, derived strictly from the canonical landmark file — copy loyalty: no new git/security facts):**

1. `hook` — "A commit makes agent work inspectable and reversible." Stamp-in. (~10s)
2. `predict` — "Your agent just changed invoice reminders across a route, a queue, and tests. What belongs in the checkpoint?" (a) one reviewed change that passes checks, (b) everything it touched so far, (c) wait to batch more. Recorded, never penalized. (~20s)
3. `reveal` — definition in 2 cards: what a commit records; why it matters with an AI agent. (~25s)
4. `scenario` — staged-diff simulation (mock diff panel: route + queue + tests), pick the safe move: commit all now / stage, review the diff, split unrelated edits, commit one outcome / keep working uncommitted. Correct = review+split; per-option feedback from `gotchas`. (~45s)
5. `gotcha` — "spot the trap": which sneaks into agent commits? staged diff you reviewed / `.env.local` with keys / test files for the change. Correct = `.env.local`. (~25s)
6. `default` — "Commit one reviewed, tested task at a time with a message that states the outcome." (~15s)
7. `check` — existing canonical quiz, instant grade, explanation. (~20s)
8. `recap` — 3 bullets → stamp → offer "Next: Branches as isolation" + "Back to map". (~20s)

Total ≈ 3:00. Zero typing. All grading local.

**Files:**
- NEW `src/content/beats/schema.ts` · NEW `src/content/beats/index.ts` (static registry) · NEW `src/content/git/beats/commits-as-checkpoints.ts`
- NEW `src/components/landmark/Beats/BeatPlayer.tsx` + per-beat renderers + `BeatProgress.tsx` (pips) · NEW `src/components/landmark/Beats/beats.module.css`
- EDIT `src/components/landmark/LandmarkView.tsx` (format IA per §4) · EDIT `app/map/[region]/[landmark]/page.tsx` (registry load)
- EDIT `app/api/progress/route.ts` (versioned beat-state validation + atomic monotonic upsert; non-beat states unchanged)
- EDIT `src/lib/analytics.ts`, `src/components/landmark/clientEvents.ts`, `src/server/events.ts` + analytics tests
- Tests: beat reducer unit (advance/wrong/retry/review-back-no-write/monotonicity), manifest validation for beats + registry, Playwright per acceptance list.

**Acceptance:**
- Cold anonymous visitor finishes in ≈ 3 minutes, zero typing, stamp moment visible.
- Refresh resumes at the furthest reached beat; cross-device resume works via server state.
- Reviewing earlier beats writes nothing; progress cannot regress under delayed/out-of-order writes (server 409 proven).
- Share card `landmarksCompleted` increments on stamp (`state.completed === true` predicate intact).
- `quiz_completed` fires exactly once whether graded via check beat or direct quiz.
- Full sequence + stamp works with `/api/guide` and `/api/lesson` network-blocked.
- Reduced-motion: no animated verbs; all state changes legible. Keyboard-only path to stamp; SR announcements once per transition.
- Existing overview, quiz, onboarding, paywall, and non-beat landmarks remain functional; `?format=` deep links and back/forward work.
- Gate green: typecheck, lint, unit, build, targeted Playwright, plus VISUAL inspection at desktop + mobile widths (build ≠ visual proof).
- Three comps (§7) judged before BeatPlayer build.

**Transfer gate (before any 48-landmark rollout):** author `security/trust-boundaries` beats (structurally different from git) and render without landmark-specific component branches. Bespoke interaction code or >20% schema change = revise grammar before scaling.

**Post-pilot usability protocol (decisive evidence):** 5-8 non-coding founders with ADHD traits; measure time-to-first-action, start→stamp, wrong→corrected recovery, interruption/resume, voluntary next-landmark choice, perceived clarity/control. Rollout decision uses this, not literature.

**Non-goals:** global map redesign · beat factory for all 48 · XP/collectibles · streaks · sound · Framer Motion · personalized AI openings · Stripe/deploy/launch anything · canonical content or VOICE.md changes · onboarding behavior changes.

## 13. Issue spine

- **E-000** — freeze (this contract + synthesis + user approval). No UI before this closes.
- **E-001** — Beat schema + static registry + progress route atomic upsert + analytics seams (5 files) — includes concrete upsert SQL/pseudocode in the issue text (max furthestBeatIndex wins; never unset completed).
- **E-002** — comps (3 states, desktop+mobile, judged) → then BeatPlayer + motion CSS.
- **E-003** — pilot beat content + acceptance tests.
- **E-004** — reward wiring (stamp, pips, next-offer).
- **E-005** — transfer landmark (`security/trust-boundaries`) + QA matrix + usability protocol prep.

Governance: v2 is a draft folder until user approval; then `AGENTS.md`/`CLAUDE.md` pointer switches deliberately. v1 HITL items untouched. No further research waves; late fleet output becomes a corroboration appendix unless it contradicts a claim with equal-or-better grade.

---

*Contract v1.3 — freeze candidate. Author: Greg (orchestrator). Pilot landmark confirmed against `src/content/git/commits-as-checkpoints.ts`. Persistence model reviewed against `src/server/share.ts`, `app/api/progress/route.ts`, ISSUE-024 notes.*
