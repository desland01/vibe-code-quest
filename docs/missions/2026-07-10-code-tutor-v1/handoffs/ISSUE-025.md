# ISSUE-025 handoff — AI guide chat (VAL-034, VAL-031 runtime half) — M5 COMPLETE

## Completed work

- Worker (codex gpt-5.6-sol, stopped once correctly for a seam gap, then completed after authorization) + 2 orchestrator fixes: side-panel guide chat anchored to (landmark, profile). Executor (Sonnet) via the gateway seam; deterministic `shouldEscalate` (cross_region heuristic OR `[[LOW_CONFIDENCE]]` sentinel) → advisor (Opus) escalation, capped ≤3/session, each decision persisted; 429→Haiku (seam); gateway_down/5xx→offline manifest fallback (canonical text + offline banner). Events guide_chat_message/guide_unavailable_shown. Migration 0007 (guide_sessions, RLS, escalations CHECK≤3, decisions jsonb).
- **Authorized seam change:** the gateway client hardcoded the executor model, so the advisor call was impossible. Added a surgical `tier: 'executor'|'advisor'` param to `generateWithGateway` (default executor; advisor→Opus primary; 429→Haiku for both; all ISSUE-008 behavior unchanged, new test added). Worker's stop-and-report was the correct call.
- **Fixes during orchestrator validation:**
  1. Migration 0007 used invented `app.user_id()` + `guard_owner_immutable('profile_id')` → corrected to the established `current_setting('app.user_id', true)::uuid` + `reject_owner_change()` (matches 0002); applied clean to both branches.
  2. guide-chat e2e `getByRole('alert')` collided with Next.js `#__next-route-announcer__` → scoped to the guide panel testid.

## Evidence
- `evidence/ISSUE-025/VAL-034-e2e.txt` (19/19 e2e) · `VAL-001-gate.txt` (green) · `guide-offline.png` (banner + canonical SQL text as the Guide response).
- Fresh-context validator (codex sol): 5/5 PASS.
- Guide unit tests (guide.test.ts) run in the normal `npm run test` gate; migration 0007 RLS confirmed by the rls integration suite passing individually.

## Notes / flags
- **Integration-suite parallelism:** running rls + access + upgrade + (guide) integration suites together in ONE vitest invocation against the shared Neon branch causes cross-suite TRUNCATE interference (10 spurious failures). Each suite passes individually (rls 4/4, access 8/8, upgrade 7/7). The normal `npm run test` gate skips all integration suites (TEST_DATABASE_URL-guarded), so this never affects CI — but future DB-suite runs must be serial (`--no-file-parallelism` or one suite at a time). Not a product defect.
- HITL-AI-KEY: guide serves the offline fallback without `AI_GATEWAY_API_KEY`; live executor/advisor answers + the real drill (needs AI_DRILL_SECRET) require the keys — ISSUE-030 live drill / ISSUE-032.

## Next Context Slice
M5 COMPLETE. Next: M6 — ISSUE-026 legal pages (AFK draft, HITL-LEGAL review), then 027 Stripe trial+webhooks (test mode), 028 share snapshots, 029 analytics audit, 030 production deploy+drill, 031 launch assets (held), 032 HITL closeout.
