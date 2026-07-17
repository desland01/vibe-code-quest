You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor (you are already in it). Implement only this issue; make no commits. Do not run npm install. Note: `next build` will fail in your sandbox on Google Fonts fetch — that is environmental; run typecheck/lint/test and let the orchestrator run build/e2e.

# ISSUE-012 — Sub-map scenes + URL contract (REQ-004; VAL-012)

Bound: app/map/** (new routes), src/lib/mapState.ts (extend reducer minimally if needed), src/components/map/** (sub-scene components), e2e/map-sub.spec.ts (new). Nothing else.

Context (zero chat context assumed):
- Existing top map (ISSUE-011): src/lib/mapState.ts reducer; src/components/map/{MapCanvas,RegionControls,RegionPanel}.tsx; MapExperience composes them on the home page. Manifest data via src/lib/content.ts: regions (8, each id/title/label/description/mapArea/landmarks[6]); getRegion(id); getLandmark(regionId, landmarkId); landmark fields: id, title, hook, definition, when_to_use[], tradeoffs, example, gotchas[], vibe_coder_default, quiz, sources[], draft.
- Style: cozy-pixel tokens are :root CSS vars (--sea, --land, --banner, --ink etc.), Pixelify Sans for headings/labels; sub-scenes may be DOM-first (no new Pixi scene required this slice — a styled DOM sub-map is acceptable and keeps the a11y story simple; reuse palette + pixel banners via CSS).
- REQ-004: URL is the source of truth. Routes: /map (top map — same experience as the home page; home may redirect or render the same component), /map/<region> (sub-map scene: the region's 6 landmarks as an island-detail view), /map/<region>/<landmark> (landmark detail panel open; supports ?format=overview|lesson|quiz query param — for THIS slice, format only needs to be reflected in UI state/labels, the adaptive renderer is ISSUE-024; show the landmark's canonical fields: hook, definition, when_to_use, tradeoffs, example, gotchas, vibe_coder_default; mark draft content with a small "draft" chip).

Tasks:
1. Routes (App Router, server components where possible):
   - app/map/page.tsx → renders MapExperience (top map). Root / keeps rendering it too.
   - app/map/[region]/page.tsx → SubMapScene; invalid region id → notFound() (Next 404).
   - app/map/[region]/[landmark]/page.tsx → SubMapScene with the landmark detail open; invalid landmark id within a valid region → notFound(); ?format validated to the 3 values, invalid/missing → overview.
   - generateStaticParams from the manifest for both dynamic segments.
2. SubMapScene (client where interactivity needs it): region header (banner style, accent tint), 6 landmark cards/markers laid out as an island detail (DOM grid with pixel-styled cards: sand border, grass tint, chunky outline, hover bounce via steps() CSS); each landmark links to /map/<region>/<landmark>; a "Back to map" link to /map (browser Back must also work — use real <Link> navigation, no state-only transitions).
3. Landmark detail: renders canonical fields (typed sections with headings), format switcher UI (three buttons writing ?format= via router.replace with scroll preservation) — content identical for now except a per-format placeholder note; quiz format shows the question + options (no grading this slice).
4. Zoom transition: navigating top-map region → sub-map plays a brief zoom-style transition (CSS transform scale on the scene container, steps() easing, disabled under prefers-reduced-motion). Keep it simple and deterministic.
5. Top-map wiring: RegionPanel's landmark names become links to /map/<region>/<landmark>; region "Explore" action navigates to /map/<region>.
6. e2e/map-sub.spec.ts (VAL-012):
   - Deep link cold-load: goto /map/databases/sql?format=quiz → landmark detail visible with quiz format active.
   - Refresh: reload the same URL → same state.
   - Back/forward: /map → /map/databases → /map/databases/sql → back → back → forward chain lands where expected.
   - Invalid ids: /map/nope → 404; /map/databases/nope → 404; /map/databases/sql?format=bogus → overview active.
   - Back-navigation returns to top map: from sub-map, "Back to map" and browser Back both reach /map with 8 region buttons.
7. Keep all existing e2e + unit tests passing (typecheck/lint/test in your sandbox).

Validation: VAL-012 Playwright green (orchestrator runs e2e); VAL-001/003 gate green; no secrets.

Stop conditions: command fails twice (excluding the known build/font sandbox failure) → STOP and report.

Print EXACTLY this structured handoff as your final message:
- Completed work:
- Unresolved work:
- Files touched:
- Commands run (with exit codes):
- Issues / surprises discovered:
- Next Context Slice:
