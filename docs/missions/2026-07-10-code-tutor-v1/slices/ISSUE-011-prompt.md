You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor (you are already in it). Implement only this issue; make no commits. Do not run npm install.

# ISSUE-011 — DOM interaction layer + top map render (REQ-003; VAL-010, VAL-011 partial, VAL-014 implementation half)

Bound: src/components/map/** (new), src/components/MapExperience.tsx (rewrite), src/lib/mapState.ts (new reducer), app/globals.css or component styles, e2e/map-top.spec.ts (new), unit tests for the reducer. NO routing changes (sub-maps are ISSUE-012). NO package.json changes (pixi.js already installed).

Context (zero chat context assumed):
- Style artifact designs/map-style.md is LOCKED: cozy 16-bit RPG overworld. Renderer: Pixi.js, presentation ONLY — semantic DOM controls are canonical. Palette tokens (CSS variables): --sea #7ec8c9, --sea-deep #5aa8ad, --land #a8d17a, --land-shore #e8d8a0, --banner #f4e9d0, --banner-border #8a6d4a, --ink #3b3245. Region accent tints: databases #d98f6c, infra #8f9fd9, ai-types #c98fd9, git #d96c6c, languages #6cd9a8, security #d9c96c, design #ed9ec4, pm-tools #9ad0ed. Labels: pixel font "Pixelify Sans" (Google Fonts via next/font, swap) min 12px; body UI Inter/system sans. 16px virtual pixel grid, integer scaling only, nearest-neighbor (Pixi: texture scaleMode nearest / roundPixels true), steps() easing, hover = 2px bounce 150ms steps(2) + #fff3c4 40% glow. Islands: chunky 2px ink outlines, dithered shore band, procedural signature structure per region is OPTIONAL for this slice (simple stacked shapes fine — e.g. databases = 3 stacked cylinders as layered rects). NO anti-aliased rotation, no blur shadows, no sub-pixel movement.
- Region data: src/lib/content.ts exports regions (8, each with id, title, label, description, mapArea {x,y,width,height} in percent 0-100, landmarks[6]).
- REQ-003 architecture (non-negotiable): semantic DOM controls — 8 <button> elements (one per region, accessible names, in a <nav aria-label="Learning regions"> or list) — drive ONE reducer (src/lib/mapState.ts: state = { hoveredRegion, selectedRegion, camera {x,y,scale} }, actions hover/unhover/select/deselect/panBy/zoomTo/reset). The Pixi canvas SUBSCRIBES to reducer state and renders it; pointer events on the canvas dispatch the same actions. The canvas is aria-hidden; the DOM layer alone must be fully functional.
- Selecting a region opens a side panel (DOM) with the region title/label/description + its 6 landmark names (from manifest) — plain list, links come in ISSUE-012.
- Pan/zoom: wheel/trackpad zoom (integer scale steps 1x/2x/3x, zoomTo snaps), pointer-drag pan, clamped to map bounds; keyboard: arrow keys pan when canvas focused wrapper has focus, +/- zoom. Reduced motion (prefers-reduced-motion): no ambient animation (sea shimmer etc.), transitions become instant/crossfade.
- WebGL failure fallback: if Pixi Application init throws (or WEBGL unavailable), render a pure-DOM/CSS grid of region tiles using the same palette tokens (absolutely positioned percent boxes per mapArea) — the DOM controls/panel behavior identical. Detect via try/catch around Pixi init; also honor env/query flag ?nocanvas=1 for testing the fallback deterministically.
- Pixi must be lazy-loaded (dynamic import in a client component, ssr-safe) so the initial route stays lean (perf budget lands in ISSUE-014).
- Ambient: subtle sea shimmer (2-frame dither toggle, ~800ms steps(1)) unless reduced motion.

Tasks:
1. src/lib/mapState.ts reducer + unit tests (hover/select/pan clamp/zoom snap/reset; reduced-motion has no reducer impact).
2. src/components/map/MapCanvas.tsx (client, lazy Pixi): draws sea background, 8 islands from mapArea percent geometry on the 16px grid (rounded to grid), shore dither band, ink outlines, region accent structures, banner labels (Pixi BitmapText or Text with Pixelify Sans, roundPixels), hover glow/bounce, selection highlight; subscribes to reducer state via props/context; dispatches hover/select from pointer events; pan/zoom via camera state applied to the stage container (integer scale).
3. src/components/map/RegionControls.tsx: the semantic DOM layer (visually-hidden-but-focusable list overlaying the map for keyboard/SR; visible focus outline ring rendered as a DOM overlay box matching the region's mapArea).
4. src/components/map/RegionPanel.tsx: side panel (DOM, closes with Escape, focus moves into panel on open and restores on close).
5. MapExperience.tsx composes: header (h1 + tagline), map viewport (canvas + DOM overlay), panel. Keep the "Save progress via email" UpgradeAccountModal button.
6. e2e/map-top.spec.ts (Playwright): 8 region buttons present with accessible names; click region → panel shows 6 landmark names; Escape closes; keyboard-only: Tab to regions, Enter activates; ?nocanvas=1 renders fallback and interactions still work; prefers-reduced-motion emulation: page functions (assert body has data-reduced-motion or equivalent hook). Keep existing anon-session spec passing.
7. CSS: palette tokens as :root CSS variables; Pixelify Sans via next/font/google (subset, display swap) applied to map labels + h1 only.

Validation to satisfy:
- VAL-010 (partial here): 8 regions render, hover + click → side panel (perf trace is captured by the orchestrator after).
- VAL-011 (partial): keyboard traversal e2e, reduced-motion, DOM-alone fallback.
- VAL-014 (implementation half): implementation follows designs/map-style.md tokens (orchestrator does the side-by-side screenshot + Gemini judge after).
- VAL-001/003 gate green (build must pass; Pixi lazy import must not break SSR).

Stop conditions: a command fails twice; pixi.js API mismatch you cannot resolve from the installed version's types — STOP and report.

Print EXACTLY this structured handoff as your final message:
- Completed work:
- Unresolved work:
- Files touched:
- Commands run (with exit codes):
- Issues / surprises discovered:
- Next Context Slice:
