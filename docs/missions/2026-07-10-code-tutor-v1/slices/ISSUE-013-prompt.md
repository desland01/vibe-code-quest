You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor (you are already in it). Implement only this issue; make no commits. Do not run npm install (orchestrator will install @axe-core/playwright — write tests assuming it exists). `next build` fails in your sandbox on Google Fonts (environmental) — run typecheck/lint/test only.

# ISSUE-013 — A11y completion pass (REQ-003; VAL-011 fully green)

Bound: src/components/map/** and src/components/MapExperience.tsx (a11y refinements only — no visual redesign), app/map/** pages (aria attributes only), e2e/a11y.spec.ts (new), package.json devDeps (@axe-core/playwright only), docs/missions/2026-07-10-code-tutor-v1/evidence/ISSUE-013/SR-manual-script.md (new — manual screen-reader walkthrough script + expected announcements).

Context: top map = MapExperience (reducer, RegionControls 8 buttons, aria-hidden MapCanvas, RegionPanel side panel); sub-maps = app/map/** + SubMapScene; cozy-pixel styling with CSS tokens; existing e2e in e2e/*.spec.ts (keep green).

VAL-011 contract: keyboard-only Playwright e2e traverses and ACTIVATES all 8 regions; reduced-motion emulation disables ambient animation; SR linearized list present; canvas/WebGL-failure renders DOM layer alone; 200%/400% zoom usable. Evidence: Playwright test names + axe report + manual SR script notes.

Tasks:
1. Focus management audit + fixes: logical focus order on / and /map/<region>; visible focus ring (≥2px, token ink/banner contrast) on ALL interactive elements incl. landmark cards and format switcher; focus restoration when RegionPanel closes (exists — verify) AND when navigating back from sub-map (document behavior; Next handles scroll, ensure a skip-link + main landmark focus target). Add a "Skip to regions" skip link on the top map.
2. aria-live: polite live region announcing zoom level changes ("Zoom 2x") and region selection ("Databases selected — panel open"); Escape/back behaviors announced implicitly by focus moves (no over-announcing).
3. Touch targets: every interactive element ≥44x44 CSS px (region focus overlays, cards, switcher buttons, close buttons) — adjust padding/hit-area CSS only.
4. SR linearized path: a visually-hidden (sr-only) but SR-reachable section on the top map listing all 8 regions as links with their labels + landmark counts (this is the linearized map alternative), placed after the skip link.
5. Zoom usability: ensure layouts function at 200% and 400% browser zoom (CSS: no fixed-height clipping of panel/cards; allow scroll). Emulate in e2e via viewport 720x450 (≈200% of 1440x900) and 360x225-equivalent check that content scrolls and region controls remain operable (Playwright can set viewport + check no horizontal clip of the controls list).
6. e2e/a11y.spec.ts:
   - keyboard-only: Tab from page top → skip link → 8 region buttons; Enter activates EACH of the 8 (loop), panel opens, Escape closes, focus returns.
   - aria-live assertions: zoom via keyboard +/- updates the live region text; selecting a region updates it.
   - axe: run AxeBuilder on /, /map/databases, /map/databases/sql — assert NO violations of impact serious/critical (report full results to console); write the JSON results to docs/missions/2026-07-10-code-tutor-v1/evidence/ISSUE-013/axe-report.json from within the test (fs write).
   - reduced-motion: emulate and assert the deterministic hook + no ambient animation class.
   - nocanvas fallback: interactions on DOM layer alone (extend/keep existing).
   - 200%/400% zoom proxies per task 5.
7. SR-manual-script.md: step-by-step VoiceOver walkthrough (what to press, expected announcements for top map → region → panel → sub-map → landmark) — honest expected values based on the implemented aria.

Validation: VAL-011 fully green (orchestrator runs e2e + installs axe dep); VAL-001/003 gate; all existing tests stay green.

Stop conditions: command fails twice (other than build/fonts) → STOP.

Print EXACTLY this structured handoff as your final message:
- Completed work:
- Unresolved work:
- Files touched:
- Commands run (with exit codes):
- Issues / surprises discovered:
- Next Context Slice:
