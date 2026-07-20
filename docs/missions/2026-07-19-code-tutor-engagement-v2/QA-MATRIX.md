# QA MATRIX — engagement-v2 (E-005)

**Date:** 2026-07-20 · **Scope:** VALIDATION_CONTRACT E-005 evidence rows  
**Player:** `src/components/landmark/Beats/BeatPlayer.tsx`  
**Pilot:** `git/commits-as-checkpoints` · **Transfer:** `security/trust-boundaries`

| Row | Requirement | Evidence | Status |
|---|---|---|---|
| Keyboard path | Every beat completable with Tab/Enter/arrows; focus moves on advance | `e2e/beats.spec.ts` → `keyboard path reaches stamp (focus + Enter/Space)` | ✅ PASS |
| Resume mid-lesson | Refresh at beat k restores furthest beat (localStorage) | `e2e/beats.spec.ts` → `resume mid-lesson restores furthest beat from localStorage` (`resume_succeeded`) | ✅ PASS |
| Reduced motion | Beat enter animation disabled under `prefers-reduced-motion` | `e2e/beats.spec.ts` → `reduced-motion disables beat enter animation` (`animation-name: none`) | ✅ PASS |
| Mobile width | Full playthrough at 390×844 reaches stamp | `e2e/beats.spec.ts` → `mobile viewport playthrough reaches stamp` + `evidence/E-003/stamp-mobile.png` | ✅ PASS |
| Share snapshot | `landmarksCompleted` increments when `state.completed === true` | `e2e/beats.spec.ts` → `share snapshot counts stamped landmark after progress write` | ✅ PASS |
| Analytics (no PII) | `beat_started` / `beat_completed` / `quiz_completed` / `landmark_stamped` fire; no email/token/userId | Console-sink assertions in full pilot + transfer specs | ✅ PASS |
| Stamp once | `landmark_stamped` fires on gesture only; resume does not re-fire | Full pilot + transfer specs: count stays 1 across reload | ✅ PASS |
| Network-blocked completion | Full sequence + stamp with `/api/guide` + `/api/lesson` aborted | Full pilot loop + transfer loop both block those routes | ✅ PASS |
| Transfer grammar | `security/trust-boundaries` renders 8 beat types in order via same player | `e2e/beats.spec.ts` → E-005 transfer gate (`assertTypes` locks type order) + `evidence/E-005/` | ✅ PASS |
| Concurrent-write merge | Atomic monotonic merge under race | Pure merge + routing unit-proven (`beatProgress.server.test.ts`, `beats.test.ts`). **Live SQL integration still pending `TEST_DATABASE_URL` (E-001 carryover) — not marked proven here.** | ⚠️ UNIT ONLY |

## Known pre-existing flake (not introduced by engagement-v2)

- `e2e/landmark-formats.spec.ts` — Lesson tab can time out waiting for `/api/lesson` (`Guide is thinking…`) under parallel full-suite load. Passes solo. Network-latency dependent; not caused by BeatPlayer work. Do not timeout-bump in this mission.

## Gate snapshot (E-005 close)

- `npm run typecheck` clean
- `npm run lint` 0 errors / 1 pre-existing `OnboardingChat` exhaustive-deps warning
- `npm run test` 146 passed / 21 skipped
- `npm run build` green (2 beat sequences validated)
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test e2e/beats.spec.ts` green
