# VALIDATION CONTRACT — code-tutor engagement-v2

Evidence formats: command output + Playwright spec names + screenshots where visual. "Build passes" is never visual proof. Baseline gate for any src/ change: `npm run typecheck && npm run lint && npm run test && npm run build`.

## E-000 — Freeze
- Synthesis exists at `docs/research/adhd-engagement-synthesis.md` with a graded claims table (strong peer-reviewed / moderate-emerging / product-reported / industry hypothesis / product hypothesis) and ADHD-specific flagged separately; thin-evidence gap stated.
- DESIGN_CONTRACT.md v1.3 internally coherent (freeze = rules; comps = E-002 first work).
- AGENTS.md + CLAUDE.md still name v1 as source of truth; synchronized.
- Freeze commit touches docs/ledger/instruction files only — zero src/ diff.
- User approval recorded.

## E-001 — Schema + registry + persistence + analytics
- Beat zod schema + static registry compile; manifest build validates beat files; invalid beat IDs/indexes rejected (unit tests).
- `PUT /api/progress` atomic monotonicity proven: two concurrent writes (higher `furthestBeatIndex` wins), stale-index write → 409 + current row, stale `completed`/`checked`/`stampedAt` regression rejected, invalid region/landmark/beat references rejected, existing non-beat state upserts unchanged (route tests).
- Zero writes to `profiles.lesson_progress` (grep + test).
- Analytics: 5 files changed together; new events in `ClientAnalyticsEvent` extract; construction/no-PII/duplicate-dispatch unit tests green; dispatch e2e green.

## E-002 — Comps → BeatPlayer
- Three comps (prediction card · scenario/mock-diff · stamp+next) judged desktop + mobile against §7 criteria; judge record committed.
- BeatPlayer CSS-only motion; every verb has a reduced-motion fallback proven in browser; no new dependencies in package.json.
- Map onboarding e2e still green; landmark routes still do not mount `OnboardingChat` (no change).

## E-003 — Pilot beats
- 8 beats render from data; grading fully local — Playwright with `/api/guide` + `/api/lesson` network-blocked still reaches stamp.
- Keyboard-only path to stamp; SR announcements once per transition; refresh at beat k resumes at beat k.

## E-004 — Reward wiring
- Stamp fires exactly once (retry storm test); region pips update; next-landmark offer + clean stop both present and functional.
- Share card `landmarksCompleted` increments on stamp.

## E-005 — Transfer + QA gate
- `security/trust-boundaries` beat file renders through the same grammar with zero landmark-specific component branches.
- QA matrix evidence: keyboard, resume, reduced-motion, mobile width, concurrent-write, share-snapshot, analytics e2e.
- Usability protocol (5-8 founders) drafted; rollout decision gated on it.
