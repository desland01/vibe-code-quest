# ISSUE-024 handoff — Adaptive renderer + deterministic quiz (VAL-033)

## Completed work

- Worker (codex gpt-5.6-sol) + orchestrator-directed fixes: three real landmark formats replacing the ISSUE-012 placeholder — overview (pure from canonical fields, ~77 words, no LLM), quiz (server-side deterministic grading via `/api/quiz` against canonical `quiz.answer`, `role="status"` feedback), lesson (bounded 3-5 turn chat via the access+ai seams, calibration-first, graceful deterministic fallback when gateway down). FormatSwitcher (keyboard-operable, `aria-current`, writes `?format=`); default format from `depth_preference`; overview always available even with AI down. Stub events landmark_open/format_switched/quiz_completed.
- **Fixes during orchestrator validation:**
  1. Spec reconciliation: ISSUE-012 map-sub tests asserted the placeholder's `aria-pressed`; updated to the real switcher's `aria-current`.
  2. New-spec robustness: quiz interaction selects the correct radio by value + waits for the session bootstrap (quiz POST was racing the anon cookie — same pattern as onboarding).
  3. **Server-authority fix (validator-found, real):** the lesson turn count derived from the client-supplied `messages` array — a forged history could skip calibration or bypass the 3-5 cap. Now the count is server-authoritative, persisted in `profiles.lesson_progress` jsonb (migration 0006); client messages are model context only. Added a forged-history test proving neither calibration nor the cap can be bypassed.

## Evidence
- `evidence/ISSUE-024/VAL-033-e2e.txt` (18/18 e2e) · `VAL-001-gate.txt` (green, 51 unit) · `quiz-format.png` (full-page: switcher + deterministic quiz).
- Fresh-context validator (codex sol): all 6 criteria PASS after the lesson server-authority fix.

## Flags
- HITL-AI-KEY: lesson chat currently returns the deterministic fallback (gateway_down) without `AI_GATEWAY_API_KEY`; overview + quiz are fully functional without AI. Live lesson phrasing needs the key/OIDC (ISSUE-030/032).
- Minor: quiz/lesson POST can 401 if a user acts before the anon session cookie is set (rare — requires navigating + clicking within the bootstrap window). Onboarding gates on useSession; quiz/lesson rely on the cookie existing by interaction time. Non-blocking; could gate similarly if it ever surfaces.

## Next Context Slice
ISSUE-025 — AI guide chat (VAL-034, VAL-031 runtime half): side-panel chat anchored to (landmark, profile), escalation rules (≤3/session, recorded), Haiku fallback, manifest fallback + offline banner.
