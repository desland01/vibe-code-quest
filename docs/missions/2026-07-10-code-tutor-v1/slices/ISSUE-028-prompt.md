You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor. Make no commits. No npm install. Build fails on fonts in your sandbox — run typecheck/lint/test only; orchestrator runs build + e2e.

# ISSUE-028 — Share snapshot + OG image (REQ-014; VAL-050)

Bound: src/server/share.ts (new), app/api/share/route.ts (new — create + revoke), app/s/[token]/page.tsx (new — public share page), app/s/[token]/opengraph-image.tsx (new — OG image route, server-safe), a "Share my progress" control in MapExperience/LandmarkView, src/__tests__/share.test.ts (new), e2e/share.spec.ts (new). Do NOT touch billing/guide/content logic.

Context (zero chat context assumed):
- REQ-014: user EXPLICITLY creates a share card → server stores an IMMUTABLE snapshot of ONLY user-approved, non-identifying fields (region + landmark completion COUNTS derived from the user's progress; NO email, NO profile id, NO raw progress rows) keyed by an UNGUESSABLE token. `/s/<token>` renders a public page + an OG image (server-safe fonts, NO Pixi/canvas). Revoke supported. Defined cache headers. Emit share_card_created event.
- Existing: share_snapshots table (0001): id uuid, token text UNIQUE, profile_id uuid, payload jsonb, created_at, revoked_at. RLS (0002): app_user may SELECT/INSERT/UPDATE/DELETE OWN rows. BUT the public /s/<token> page must read a snapshot by token for an UNAUTHENTICATED visitor — so that read uses the PRIVILEGED pool (src/lib/db.ts `pool`) by token, returning only the snapshot payload (never owner identity). Create/revoke are owner actions under ct_session (queryAsUser or privileged with explicit profile scoping). Manifest via src/lib/content.ts (region titles for display). Session src/lib/auth/session.ts.
- Snapshot payload shape (immutable, approved fields ONLY): { version, createdAt, regions: [{ id, title, landmarksTotal, landmarksCompleted }], totals: { regionsStarted, landmarksCompleted, landmarksTotal } }. Derive completion from the user's progress rows (a landmark counts "completed" if it has a progress row with a completed marker in state — define a simple deterministic rule, e.g. state.completed === true; if progress schema differs, count any progress row as "started/completed" per a documented rule).

Tasks:
1. src/server/share.ts:
   - createSnapshot(userId): read the user's progress (queryAsUser), compute the approved-fields payload deterministically, generate an unguessable token (crypto.randomBytes → base64url, >=16 bytes), INSERT into share_snapshots, return { token }. Immutable: no update path changes payload. Emit share_card_created.
   - getSnapshotByToken(token): PRIVILEGED read by token; return the payload ONLY if not revoked, else null. Never returns profile_id/email.
   - revokeSnapshot(userId, token): owner-scoped UPDATE set revoked_at=now() where token + profile_id = user.
2. app/api/share/route.ts: POST { action:'create' } (401-gated → { token, url }) ; POST { action:'revoke', token } (401-gated, owner-only). Validate inputs.
3. app/s/[token]/page.tsx: PUBLIC (no session required); server component reads getSnapshotByToken; unknown/revoked → notFound() (404); renders a clean shareable summary (counts, region list) using server-safe fonts + palette tokens (NO Pixi, NO client-only deps); sets Cache-Control headers (e.g. public, max-age, s-maxage with revalidate) appropriate for an immutable-but-revocable resource (short-ish s-maxage so revoke propagates). Must render for an unauthenticated crawler UA.
4. app/s/[token]/opengraph-image.tsx: Next OG image (ImageResponse) rendering the snapshot totals with server-safe fonts (no external font fetch that would fail offline — use a system/edge-safe font or a bundled one); 1200x630; unknown/revoked token → a generic fallback image (not a crash).
5. "Share my progress" control (in MapExperience or LandmarkView): explicit button → POST create → shows the /s/<token> URL + a copy affordance + a revoke button. Accessible. Only appears for a session (any anonymous session is fine).
6. src/__tests__/share.test.ts (inject db, NO network): payload contains ONLY approved fields (assert NO email/profile_id/raw-progress leak); token is unguessable (length/charset); empty-progress case → zero counts (no crash); long-value + unicode region/landmark handling; getSnapshotByToken returns null for revoked/unknown; revoke is owner-scoped.
7. e2e/share.spec.ts: create a share (needs a session) → visit /s/<token> as a fresh context (no cookies, simulating a crawler) → summary renders; revoke → /s/<token> now 404; unknown token → 404. Keep all existing e2e green.

Validation: VAL-050 (tests + the OG debugger screenshot is orchestrator-captured). VAL-001/003 gate. VAL-002 no secrets; no PII in snapshots.

Stop conditions: existing schema/seams don't match, or a command fails twice → STOP.

Print EXACTLY this structured handoff: Completed work / Unresolved work / Files touched / Commands run (with exit codes) / Issues surprises discovered / Next Context Slice.

## CLARIFICATION (orchestrator): share_card_created is a stub event — NO schema conflict

The events layer is a pure console.debug STUB: src/server/events.ts recordEvent(name, props) just console.debugs; it does NOT write to any DB table. The region_clicks table's CHECK allowlist ('region_click','landmark_open') is UNRELATED and is not written by recordEvent (grep confirms no region_clicks writers). Do NOT route share_card_created through region_clicks. To emit share_card_created: add 'share_card_created' to the EventName union in src/server/events.ts and call recordEvent('share_card_created', {...}) from the create path. That is the whole event requirement for this slice (full analytics wiring is ISSUE-029). No schema change, no reordering — proceed with the full ISSUE-028 implementation now.
