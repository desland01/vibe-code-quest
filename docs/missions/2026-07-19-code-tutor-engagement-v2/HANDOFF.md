# HANDOFF — code-tutor engagement-v2 (FROZEN; E-001 backend + E-002 comps gate PASS)

**Date:** 2026-07-19 · **Author:** Greg (orchestrator, in-session) · **PM review pass:** 2026-07-19 ~12:20 (Claude, post-session — corrected stale status, verified claims against repo)

> **Next session starts from [KICKOFF-2026-07-19-beatplayer.md](KICKOFF-2026-07-19-beatplayer.md)** — rewritten execution plan (BeatPlayer → rewards → transfer) with the paste-ready Kimi Crew kickoff prompt. The section below is the verified state that plan builds on.

## Mid-flight state (verified 2026-07-19 12:19 — start here next session)

Committed: `12fe978` (E-000 freeze), `b8d0213` (E-001 backend), `035b22f` (E-002 comps gate PASS). The comps gate has PASSED — the BeatPlayer build is unblocked.

Uncommitted but verified green (typecheck clean; **135 passed / 21 skipped**):

- `src/components/landmark/Beats/beatReducer.ts` — pure BeatPlayer state machine per contract §4/§8.
- `src/components/landmark/Beats/beats.module.css` — styles ported from the judged comps.
- `src/__tests__/beatReducer.test.ts` — 13/13 green. The contradictory `canAdvance` assertion pair (old lines 66–67) is FIXED: the reveal beat has 2 cards and `revealCount` is 2 at that point, so `toBe(true)` was kept and the `toBe(false)` line deleted.

Not yet built (E-002 remainder → E-004): the React `BeatPlayer` component itself, lesson-page wiring, "Play" tab label, client progress writes (`shouldPersist` → localStorage + `PUT /api/progress`), network-blocked Playwright coverage, full gate, commit.

**Review-navigation spec (was missing from this plan — required):** `back` resets `revealCount`/`classifications`/`feedback`, so a learner reviewing an earlier beat would be forced to re-answer already-solved beats to get forward (`canAdvance` gates on transient state), and a reveal beat re-entered via `back` shows 0 cards (every other entry path shows 1). Fix in the reducer before building the player: when `displayIndex < furthestBeatIndex`, forward navigation is unconditional (already-resolved beats never re-gate) — e.g. a `forward`/`return_to_furthest` action that ignores `canAdvance` below the frontier — and `back` onto a reveal beat sets `revealCount: 1` to match `advance`/`resume`. Back-review still writes nothing (contract rule unchanged).

## Status

- `DESIGN_CONTRACT.md` — **v1.3 FROZEN.** Authorization: original 2026-07-19 user directive treated as standing build authorization (Lane B). The interim "reply to freeze" ask was process friction; user directive took precedence. Recorded here and in WORK_LEDGER.
- `VALIDATION_CONTRACT.md` — per-issue evidence requirements, aligned to v1.3.
- `docs/research/adhd-engagement-synthesis.md` — orchestrator-verified primary sources (searched + extracted in-session 2026-07-19). Honest headline: adult-ADHD-specific product evidence is thin; target-founder usability testing post-pilot is the decisive evidence layer.
- Two five-leaf research fleets were dispatched this session; both failed on infrastructure, not content. Fleet 1 (deleg_4b102524) returned 2026-07-19 with 5/5 leaves dead on OpenRouter HTTP 429. Fleet 2 (deleg_f8bfe6ac) returned same day, same result (5/5 HTTP 429; free model caps at 8 req/min and five parallel lanes guaranteed the collision). `docs/research/adhd-engagement/raw/` has zero bytes from either fleet. No third fan-out on that model. Evidence base: `docs/research/adhd-engagement-synthesis.md` (orchestrator-verified primary sources) + product/motion lanes filled directly by the orchestrator.

## Freeze record

**Frozen 2026-07-19 (Lane B: original directive = authorization).** `AGENTS.md`/`CLAUDE.md` source-of-truth pointer switches to v2 for engagement work (v1 production/HITL gates preserved separately). E-001 begins now. Comps are E-002's first work item and hard-gate the BeatPlayer build.

## Issue spine (do not reorder)

1. **E-001** — Beat zod schema + static registry + `PUT /api/progress` atomic monotonic merge (implemented): `furthestBeatIndex = GREATEST(old, incoming)`; `checked = old OR incoming`; `completed = old OR incoming`; first non-null `stampedAt` wins (`NULLIF(..., 'null'::jsonb)` both sides — bare COALESCE locks JSON null forever); terminal state never regresses; always-200 total merge, strictly stale writes absorbed (no 409 path). Quiz analytics: one `quiz_completed` per explicit graded attempt (Amendment A3 — no durable dedup store, none promised). Registry server-side; client receives only the selected landmark's beats. Analytics seam = 4 files (`src/server/events.ts` is generic pass-through, no edit needed) + `ClientAnalyticsEvent` Extract.
2. **E-002** — 3 comps (predict / scenario-diff / stamp+next, desktop+mobile, judge record committed) → then BeatPlayer CSS-only motion
3. **E-003** — pilot beats (`git/commits-as-checkpoints`, 8 beats) + local grading + network-blocked Playwright
4. **E-004** — reward wiring: stamp, 6-pip region progress, next-landmark offer
5. **E-005** — `security/trust-boundaries` transfer landmark + full QA matrix + usability protocol draft

No E-002 UI before comps pass. No 48-landmark factory before transfer + usability study.

## Boundaries (hold these)

- v1 mission stays active source of truth until freeze commit; ISSUE-030 (prod deploy + AI_DRILL_SECRET) and ISSUE-032 (price/name/legal/live-mode) remain blocked and untouched.
- No spend, no posting, no deploy, no canonical content or VOICE.md changes, no new dependencies, no new API routes.
- Foreign dirty file `.agents/skills/code-tutor-agent-lessons/SKILL.md` (54-line lessons addition, provenance: parallel ISSUE-02x session) — classified, left alone, never bagged into engagement commits.

## Material rules (locked; do not re-argue)

| Topic | Rule |
|---|---|
| Persistence | `progress` table only; never `profiles.lesson_progress` |
| Monotonic field | `furthestBeatIndex`; UI index is local; back-review writes nothing |
| Share contract | `state.completed === true` only at stamp |
| Format IA | `lesson` URL → label "Play"; overview = trust surface; quiz = direct assess |
| Quiz dedup | `quiz_completed` once; direct quiz never stamps |
| Reward pilot | stamp + pips + next-offer only (no XP/streaks/glow) |
| Motion | CSS `steps()` only; no shake/red-flash; reduced-motion fallbacks |
| AI | `GuideChat` only; completion works with guide/lesson APIs blocked |
| Onboarding | no change — `OnboardingChat` mounts in `MapExperience` only |
