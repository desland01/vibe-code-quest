# HANDOFF — code-tutor engagement-v2 (freeze candidate, awaiting user approval)

**Date:** 2026-07-19 · **Author:** Greg (orchestrator, in-session)

## Status

- `DESIGN_CONTRACT.md` — **v1.3 FROZEN.** Authorization: original 2026-07-19 user directive treated as standing build authorization (Lane B). The interim "reply to freeze" ask was process friction; user directive took precedence. Recorded here and in WORK_LEDGER.
- `VALIDATION_CONTRACT.md` — per-issue evidence requirements, aligned to v1.3.
- `docs/research/adhd-engagement-synthesis.md` — orchestrator-verified primary sources (searched + extracted in-session 2026-07-19). Honest headline: adult-ADHD-specific product evidence is thin; target-founder usability testing post-pilot is the decisive evidence layer.
- Two five-leaf research fleets were dispatched this session; both failed on infrastructure, not content. Fleet 1 (deleg_4b102524) returned 2026-07-19 with 5/5 leaves dead on OpenRouter HTTP 429. Fleet 2 (deleg_f8bfe6ac) returned same day, same result (5/5 HTTP 429; free model caps at 8 req/min and five parallel lanes guaranteed the collision). `docs/research/adhd-engagement/raw/` has zero bytes from either fleet. No third fan-out on that model. Evidence base: `docs/research/adhd-engagement-synthesis.md` (orchestrator-verified primary sources) + product/motion lanes filled directly by the orchestrator.

## Freeze record

**Frozen 2026-07-19 (Lane B: original directive = authorization).** `AGENTS.md`/`CLAUDE.md` source-of-truth pointer switches to v2 for engagement work (v1 production/HITL gates preserved separately). E-001 begins now. Comps are E-002's first work item and hard-gate the BeatPlayer build.

## Issue spine (do not reorder)

- **E-001** — Beat zod schema + static registry + `PUT /api/progress` atomic monotonic merge (NOT a plain `incoming >= stored` guard — equal-index writes can clobber flags): `furthestBeatIndex = GREATEST(old, incoming)`; `checked = old OR incoming`; `completed = old OR incoming`; `stampedAt = COALESCE(old, incoming)`; terminal state never regresses; 409 + current row on strictly-stale writes. Also defined in E-001 issue text: durable quiz-assessment dedup identity (landmark-scoped, server-side — "emit once" cannot rely on client state across refreshes/tabs); beat analytics event boundaries (no emit on mere render/resume); registry stays server-side, client receives only the selected landmark's beats (no full-registry browser bundle); offline queue + reconciliation semantics. + analytics 5-file seam incl. `ClientAnalyticsEvent` Extract allowlist + unit tests
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
