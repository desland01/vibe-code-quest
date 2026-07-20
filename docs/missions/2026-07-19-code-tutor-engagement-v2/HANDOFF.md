# HANDOFF — code-tutor engagement-v2

**Status:** E-002 → E-005 COMPLETE (2026-07-20) · **Stopped after E-005 per kickoff**

| Slice | Commit | What landed |
|---|---|---|
| E-002 + E-003 + E-004 | `32ce7b9` | BeatPlayer React player, Play tab, progress write-through, pilot Playwright loop, stamp + 6 pips + next-offer |
| E-005 | `135d377` | `security/trust-boundaries` transfer (same grammar), QA matrix, usability protocol draft |

**Gate evidence at close:** typecheck clean · lint 0 errors / 1 pre-existing OnboardingChat warning · 146 unit / 21 skipped · build validates 2 beat sequences · full Playwright **35/35** on `:3100` (includes a11y/share/onboarding/map; beats suite 9/9). Forbidden surfaces clean: neither commit touches `app/api/onboarding/route.ts`, `OnboardingChat.tsx`, or `.claude/worktrees/`.

**Open (not in-mission blockers):**
- Live SQL concurrent-write proof still unit-only — needs disposable `TEST_DATABASE_URL` (E-001 carryover). Marked honestly in [QA-MATRIX.md](QA-MATRIX.md).
- Founder usability study ([USABILITY-PROTOCOL.md](USABILITY-PROTOCOL.md)) gates any 48-landmark factory. Do not open the factory before that study + founder sign-off.
- Pre-existing `landmark-formats.spec.ts` parallel-load flake (Lesson tab waiting on `/api/lesson`) — passes solo; not introduced by engagement-v2; do not timeout-bump here.

**Foreign dirt left untouched this session:** `.agents/skills/code-tutor-agent-lessons/SKILL.md`, Constance self-writes (`CLAUDE.md` rule 6, `constants.md`, `.claude/commands/*`, `.claude/settings.json`), untracked `.claude/commands/constance-report.md`. Owner session decides Constance/AGENTS.md R014 sync.

**Next session:** run the 5–8 founder usability study before any further landmark factory work. Kickoff packet below is historical.

---

## Historical archive (pre-completion state)

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
