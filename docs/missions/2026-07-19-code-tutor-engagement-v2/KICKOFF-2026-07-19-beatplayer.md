# KICKOFF — finish the code-tutor engagement-v2 build (BeatPlayer → rewards → transfer)

**Written:** 2026-07-19 ~12:45 · **Author:** Claude (PM review session) · **For:** fresh Hermes session, "Kimi Crew" MoA selected (K3 strategy advisor → gpt-5.6-sol acting aggregator)
**Supersedes:** the in-chat plan from session `20260719_005103_f0b670` (died mid-handoff on an OpenRouter 402; its state summary is folded in here and verified against the repo).

## Verified starting state (do not re-derive)

- Repo: `/Users/thebeast/code-tutor`, branch `main`, local-only (no remote — do not `git push`).
- Committed: `12fe978` (E-000 freeze: DESIGN_CONTRACT v1.3 + research synthesis + validation contract), `b8d0213` (E-001 backend: beat schema, registry, atomic monotonic `PUT /api/progress` merge, analytics seam), `035b22f` (E-002 comps gate PASS — 3 screens × desktop/mobile, judged), `b75f85d` (E-002 partial: `beatReducer.ts` state machine + `beats.module.css` ported from judged comps + 13/13 reducer tests), `2a21845` (docs: verified mid-flight state + review-navigation spec).
- Gate at `2a21845`: typecheck clean · lint 0 errors (1 pre-existing warning in `src/content/manifest.ts`) · 135 tests passed / 21 skipped · build green.
- Read order for context: `DESIGN_CONTRACT.md` (FROZEN v1.3 — do not re-argue), `VALIDATION_CONTRACT.md` (per-issue evidence), `HANDOFF.md` (status + material-rules table + review-navigation spec), then the code: `src/components/landmark/Beats/beatReducer.ts`, `src/components/landmark/Beats/beats.module.css`, `src/content/git/beats/commits-as-checkpoints.ts`, `src/__tests__/beatReducer.test.ts`.

## Parallel session in flight — hard boundary

A separate session is fixing a read/modify/write race in `app/api/onboarding/route.ts` (atomic transaction or CAS + possible client handling in `src/components/OnboardingChat.tsx` + a route regression test). Therefore:

- **Fast-forward `main` before your first edit** and re-run the gate if new commits landed.
- **Never touch** `app/api/onboarding/route.ts`, `src/components/OnboardingChat.tsx`, or onboarding tests. If they're dirty in the worktree, work around them — do not revert, do not bag them into your commits.
- The frozen contract already says onboarding is out of scope (`OnboardingChat` mounts in `MapExperience` only — no change).

## Work plan (in order; each item lands with its evidence per VALIDATION_CONTRACT)

1. **Reducer review-navigation fix** (spec in HANDOFF.md "Mid-flight state"): forward navigation below the progress frontier is unconditional (`displayIndex < furthestBeatIndex` never re-gates on `canAdvance`), and `back` onto a reveal beat sets `revealCount: 1` (parity with `advance`/`resume`). Back-review still writes nothing. Extend the reducer tests for both behaviors first (TDD).
2. **BeatPlayer component** (`src/components/landmark/Beats/`): renders all beat types from the registry-served sequence; uses the existing `beats.module.css`; CSS `steps()` motion only, reduced-motion fallbacks; zero typing, instant feedback, no shake/red-flash; predict never marked wrong; scenario/gotcha fail-soft retry; recap is stamp-only.
3. **Wiring + progress**: `lesson` URL → tab label "Play"; resume from server state via the monotonic merge (`resume` action); client writes fire only when `shouldPersist` says so → localStorage + `PUT /api/progress`; one `quiz_completed` per explicit graded attempt; stamp sets `completed` (share contract: `state.completed === true` only at stamp). Overview and direct quiz surfaces unchanged. `GuideChat` stays an optional side rail — completion must work with guide/lesson APIs blocked.
4. **E-003 verification**: network-blocked Playwright run of the full pilot loop (predict → reveal → decide → stamp) on `git/commits-as-checkpoints`; resume-mid-lesson case; reduced-motion case.
5. **E-004 rewards**: stamp moment, 6-pip region progress, next-landmark offer. Nothing else — no XP/streaks/glow.
6. **E-005**: `security/trust-boundaries` transfer landmark + full QA matrix + usability protocol draft. **Stop after E-005** — no 48-landmark factory before the founder usability test (user gate).

## Boundaries (unchanged from the freeze — hold all of these)

- v1 mission gates stay parked: no Stripe, no deploy, no launch posts, no ISSUE-030/032 movement, no spend, no new dependencies, no new API routes, no canonical content or VOICE.md changes.
- Persistence: `progress` table only, never `profiles.lesson_progress`. Registry stays server-side; client gets only the selected landmark's beats.
- Foreign dirty file `.agents/skills/code-tutor-agent-lessons/SKILL.md`: leave alone, never commit.
- Full gate before every commit: `npm run typecheck && npm run lint && npm run test && npm run build`, plus a real browser render of the player at desktop + mobile viewports (a green build is not visual proof). Update `WORK_LEDGER.md` per session.

## Infrastructure notes (learned the hard way this morning)

- Do **not** dispatch research/worker fan-outs to OpenRouter: the key is at its monthly 402 cap and the free qwen slugs are dead (404). Both 5-leaf fleets died on this. Use kimi-coding, zai (GLM), or openai-codex paths only.
- K3 (advisor) runs direct via `kimi-coding` — healthy. Delegation's `openrouter:x-ai/grok-4.5` leaf is dead until credits; skip that rung.

---

## Kickoff prompt (paste verbatim into the fresh Kimi Crew session)

```text
Finish the code-tutor engagement-v2 build in /Users/thebeast/code-tutor. Read
/Users/thebeast/code-tutor/docs/missions/2026-07-19-code-tutor-engagement-v2/KICKOFF-2026-07-19-beatplayer.md
first (it is the plan — verified starting state, ordered work items, boundaries), then DESIGN_CONTRACT.md and
HANDOFF.md in the same folder. Treat this message as go.
First action: git fetch/fast-forward main, run the full gate (typecheck/lint/test/build) to confirm the
b75f85d/2a21845 baseline, then start work item 1 (reducer review-navigation fix, tests first).
Hard constraints: never touch app/api/onboarding/route.ts or src/components/OnboardingChat.tsx (parallel
session owns them); no OpenRouter dispatches (key dead); no push (no remote); stop after E-005.
```
