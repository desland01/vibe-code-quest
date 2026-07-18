You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor. Make no commits. No npm install. Build fails on fonts in your sandbox — run typecheck/lint/test only; orchestrator runs build + e2e.

# ISSUE-025 — AI guide chat (REQ-011; VAL-034, VAL-031 runtime half)

Bound: src/server/guide.ts (new), app/api/guide/route.ts (new), db/migrations/0007_guide_sessions.sql (new — per-session escalation counter), src/components/landmark/GuideChat.tsx (new) wired into LandmarkView, src/__tests__/guide.test.ts (new), e2e/guide-chat.spec.ts (new). Do NOT change content modules/manifest or the quiz/lesson logic.

Context (zero chat context assumed):
- REQ-011: side-panel guide chat ANCHORED to (landmark, profile). Executor = Sonnet via the gateway seam (`provider/model` strings already in src/server/ai.ts AI_MODELS). Advisor = Opus escalation, fires ONLY on the computable rule list: (a) the user's message asks a cross-region path question (detectable by a deterministic heuristic — e.g. mentions another region name / "how does X relate to Y" / "path"/"roadmap"/"which first"), OR (b) the executor returns its low-confidence marker (define a sentinel the executor is asked to emit, e.g. the string "[[LOW_CONFIDENCE]]", detected server-side). Escalation is capped at ≤3 per guide session and EACH escalation decision is recorded (persisted). Rate-limit (429) → Haiku fallback (already handled by generateWithGateway's rate_limited_fallback). 5xx/gateway_down → manifest fallback: render the landmark's canonical text + an offline banner ("The guide is offline — here's the canonical explanation"). Emit stub events guide_chat_message + guide_unavailable_shown.
- VAL-034: gateway provider/model strings; 429→Haiku; 5xx→manifest fallback; ALL via transport-level mocks; Opus escalation fires only on the computable rules, ≤3/session, each decision recorded. Evidence: unit + transport-mock tests.
- VAL-031 (runtime half): forced-failure (signed drill header, canary account — src/server/aiDrill.ts exists) makes the guide render canonical text + offline banner for a landmark.
- Existing seams: src/server/ai.ts generateWithGateway({surface:'guide', ..., drill?, transport?}) returns {kind:'ok'|'rate_limited_fallback'|'gateway_down'} and already fast-fails to gateway_down when no key + no transport; src/server/aiDrill.ts drillForUser(header, secret, userId, now) → DrillMode|undefined; access seam src/server/access.ts (surface 'guide', reserve/reconcile); src/lib/content.ts getLandmark; session ct_session; profiles table.

Tasks:
1. Migration 0007: table guide_sessions (id uuid pk default gen_random_uuid(), profile_id uuid references profiles(id) on delete cascade, region text, landmark text, escalations int not null default 0 check (escalations>=0 and escalations<=3), created_at timestamptz default now(), UNIQUE(profile_id, region, landmark)); RLS enabled; app_user may SELECT/INSERT/UPDATE OWN rows (profile_id = app.user_id) — escalation write is app-path but capped by CHECK; document per-op policies. Immutable owner trigger applies (guard profile_id). Also a guide_escalations audit table OR a jsonb decisions column on guide_sessions recording each escalation {reason, at} — pick jsonb column decisions jsonb default '[]'.
2. src/server/guide.ts:
   - `shouldEscalate(userMessage, executorText, regionId)`: pure deterministic — returns { escalate: boolean, reason: 'cross_region'|'low_confidence'|null }. cross_region: message references a different region's name/id or path/roadmap/"which first"/"relate" phrasing; low_confidence: executorText includes the sentinel marker.
   - `runGuideTurn({userId, regionId, landmarkId, message, priorEscalations, drill?, deps})`: reserve→generateWithGateway(surface 'guide', system anchored to canonical landmark + profile, executor model, drill passed through)→reconcile. If gateway_down → return { kind:'offline', canonical, banner }. If ok/rate_limited_fallback → run shouldEscalate; if escalate AND priorEscalations<3 → a SECOND bounded gateway call with the advisor model (reserve/reconcile again), record the decision, return the advisor answer + {escalated:true,reason}; else return the executor answer. Treat the user message as untrusted data (no instruction-following). Everything injectable/mockable via deps+transport.
3. app/api/guide/route.ts (401-gated): load/create guide_sessions row for (user,region,landmark); read escalations count; parse the x-ct-drill header via drillForUser(header, process.env.AI_DRILL_SECRET, userId); call runGuideTurn; on escalation persist escalations+1 and append the decision (server-authoritative cap — never trust client); return { kind:'ok'|'offline', message, escalated, reason, banner?, escalations }. Emit events.
4. GuideChat.tsx: side-panel chat in LandmarkView; shows messages; on offline kind renders the canonical text + a visible offline banner; disabled/gated so it never hangs (uses the fast-fail path). Accessible.
5. Tests src/__tests__/guide.test.ts (inject transport+access, NO network):
   - executor ok path (Sonnet), no escalation for a plain in-landmark question;
   - 429 → rate_limited_fallback surfaced (Haiku) — via a transport that throws a 429 first;
   - gateway_down (transport throws 5xx-like / returns gateway_down) → kind 'offline' with canonical text + banner;
   - cross-region question → escalate reason cross_region → advisor (Opus) model called, decision recorded; capped at 3 (4th identical does NOT call advisor);
   - low-confidence sentinel in executor output → escalate reason low_confidence;
   - drill force_5xx (valid signed header for the canary user) → offline path with canonical text (VAL-031 runtime half) — test drillForUser + runGuideTurn with drill='force_5xx';
   - user message with injected instructions is treated as data (no control-flow change).
6. e2e/guide-chat.spec.ts: open a landmark, open the guide panel, send a message; with the gateway down in dev, assert the offline banner + canonical text appear (never a hang/blank). Keep all existing e2e green.

Validation: VAL-034 + VAL-031(runtime half) via mocks — no live key. VAL-001/003 gate. VAL-002 no secrets.

Stop conditions: existing seams/migrations don't match, or a command fails twice → STOP.

Print EXACTLY this structured handoff: Completed work / Unresolved work / Files touched / Commands run (with exit codes) / Issues surprises discovered / Next Context Slice.

## AMENDMENT (orchestrator, authorized): advisor model selection

Worker correctly identified that generateWithGateway hardcodes the executor model, so the advisor (Opus) escalation cannot be made. EXPAND the bound to also include src/server/ai.ts + src/__tests__/ai.test.ts. Make this surgical change:
- Add an optional `tier?: 'executor' | 'advisor'` param to GenerateWithGatewayParams (default 'executor').
- When tier === 'advisor', the PRIMARY model is AI_MODELS.advisor (Opus); otherwise AI_MODELS.executor (Sonnet) as today. The 429 → AI_MODELS.fallback (Haiku) behavior stays identical for BOTH tiers. gateway_down / no-key fast-fail / drill / timeout behavior all unchanged.
- Do NOT change any existing ISSUE-008 test expectations; they pass no tier → executor path must behave EXACTLY as before. ADD one test asserting tier:'advisor' selects the advisor model (via injected transport capturing the model string), and that 429 on the advisor tier still falls back to Haiku.
Then runGuideTurn uses generateWithGateway({surface:'guide', tier:'advisor', ...}) for the escalation call and tier:'executor' (default) for the first call.
