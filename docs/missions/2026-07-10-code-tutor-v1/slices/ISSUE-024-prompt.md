You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor. Make no commits. No npm install. Build fails on fonts in your sandbox — run typecheck/lint/test only; orchestrator runs build + e2e.

# ISSUE-024 — Adaptive renderer + deterministic quiz (REQ-010; VAL-033)

Bound: src/components/landmark/** (new — LandmarkView, OverviewFormat, LessonFormat, QuizFormat, FormatSwitcher), src/server/lesson.ts (new — lesson chat via seam) + app/api/lesson/route.ts (new) + app/api/quiz/route.ts (new — deterministic grading), wire into app/map/[region]/[landmark]/page.tsx + SubMapScene, src/__tests__/quiz.test.ts + src/__tests__/lesson.test.ts (new), e2e/landmark-formats.spec.ts (new). Do NOT touch content modules or the manifest.

Context (zero chat context assumed):
- REQ-010: THREE formats for a landmark:
  - overview (~80 words, rendered PURELY from canonical manifest fields — NO LLM): compose from hook/definition/when_to_use/vibe_coder_default. Deterministic.
  - lesson (3-5 turn chat via the LLM seam, anchored to the landmark + the user's profile; a calibration question first). Uses src/server/ai.ts through the access seam.
  - quiz: DETERMINISTICALLY graded against the landmark's canonical quiz.answer (server-side compare, no LLM needed to grade); an LLM explanation is OPTIONAL and only after grading.
  - Default format from the user's profile depth_preference ('quick'→overview, 'thorough'→lesson, 'expert_refresh'→quiz — pick a sensible mapping); manual format switcher always available. Emit stub events landmark_open / format_switched / quiz_completed via recordEvent (extend the event union).
- Existing: manifest via src/lib/content.ts getLandmark(regionId, landmarkId) with fields id,title,hook,definition,when_to_use[],tradeoffs,example,gotchas[],vibe_coder_default,quiz{question,options[],answer,explanation},sources[]. Landmark detail currently renders in SubMapScene (ISSUE-012) with a UI-only format switcher reading ?format=. Profile: profiles.depth_preference (nullable) from ISSUE-023; read via queryAsUser. Access seam src/server/access.ts (surface 'renderer'); ai seam src/server/ai.ts (injectable transport, returns gateway_down fast when no key). Session via ct_session.
- The ?format query contract from ISSUE-012 stays the source of truth for which format shows; this issue makes each format REAL.

Tasks:
1. Overview format: pure function/component building ~80 words from canonical fields — deterministic, no network. Snapshot-testable.
2. Quiz format + app/api/quiz/route.ts (401-gated): POST { regionId, landmarkId, choice } → server loads the landmark from the manifest, compares choice to canonical quiz.answer, returns { correct: boolean, answer, explanation } (explanation = canonical field; optional LLM elaboration ONLY if a flag + gateway available, never required, never blocks). Grading is 100% deterministic and server-side (never trust a client 'correct'). Emit quiz_completed.
3. Lesson format + app/api/lesson/route.ts (401-gated): src/server/lesson.ts runs a bounded 3-5 turn chat via reserve→generateWithGateway→reconcile, system-anchored to the landmark canonical fields + the user's profile; first turn is a calibration question. On gateway_down/denied → a graceful deterministic fallback message pointing to the overview (never a hang, never a blank). Turn cap enforced server-side.
4. LandmarkView composes the three formats + FormatSwitcher (writes ?format= via router, keyboard accessible, aria-current on active); default format derives from depth_preference when ?format absent. Wire into the landmark route/SubMapScene, replacing the ISSUE-012 placeholder format UI. Canonical content (overview) is ALWAYS available even if AI is down.
5. Tests:
   - src/__tests__/quiz.test.ts: correct + incorrect grading deterministic; server ignores a forged client 'correct'; explanation returned; a real landmark's answer is one of its options (guard).
   - src/__tests__/lesson.test.ts (inject fake transport + access): calibration-first; turn cap 3-5 enforced; gateway_down → deterministic fallback (no throw); access-denied → fallback, no model call.
   - e2e/landmark-formats.spec.ts: visit /map/databases/sql?format=overview → ~80w overview visible; switch to quiz → answer correctly → correct feedback; switch to lesson → calibration prompt or graceful fallback shows (gateway down in dev is fine); format switcher keyboard-operable; keep all existing e2e green.
6. VAL-033 snapshot for the overview format.

Validation: VAL-033 (snapshot + e2e), all mock/deterministic — no live key. VAL-001/003 gate. VAL-002 no secrets.

Stop conditions: existing seams/manifest don't match, or a command fails twice → STOP.

Print EXACTLY this structured handoff: Completed work / Unresolved work / Files touched / Commands run (with exit codes) / Issues surprises discovered / Next Context Slice.
