# ISSUE-028 handoff — Share snapshot + OG image (VAL-050)

## Completed work

- Worker (codex gpt-5.6-sol, stopped once on a misread event-constraint concern, resumed after clarification) + orchestrator spec fix: `src/server/share.ts` — createSnapshot (approved fields ONLY: region/landmark completion counts, NO email/profile_id/raw progress; unguessable crypto.randomBytes base64url token; immutable), getSnapshotByToken (privileged read by token, null on revoked/unknown, never returns owner identity), revokeSnapshot (owner-scoped). `/api/share` (create+revoke, 401-gated, owner-only revoke). `app/s/[token]/page.tsx` public (no session, notFound on unknown/revoked, cache headers, no Pixi). `app/s/[token]/opengraph-image.tsx` (ImageResponse 1200×630, server-safe fonts, fallback image). Explicit "Share my progress" control with copy + revoke. `share_card_created` added to the EventName stub union.
- **Worker stop-and-resume:** it initially read "emit share_card_created" as requiring a region_clicks insert (whose CHECK allows only region_click/landmark_open) and correctly stopped. Orchestrator clarified events are console.debug stubs (no DB writer) → resumed and completed.
- **Fix during validation:** share status `role="status"` collided with the map's sr-only aria-live region → added `data-testid="share-status"` and scoped the spec.

## Evidence
- `VAL-050-e2e.txt` (25/25 e2e: public crawler render, revoke→404, unknown→404) · `share-public-page.png` · `og-image.png` (1200×630, "0/48 landmarks explored", no PII — satisfies the OG-debugger requirement) · `VAL-001-gate.txt` (green, 74 unit tests).
- Fresh-context validator (codex sol): 5/5 PASS.

## Next Context Slice
ISSUE-029 — analytics instrumentation audit (VAL-051): all 13 events construction-tested (names/props/no-PII) + dispatch browser-tested; remove stray stub-era events. Deps: 023,024,025,027,028 (all done).
