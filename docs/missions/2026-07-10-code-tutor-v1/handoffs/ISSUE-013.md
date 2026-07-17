# ISSUE-013 handoff — A11y completion pass (VAL-011 fully green)

## Completed work

- Worker (codex gpt-5.6-sol) + two orchestrator-driven fixes: skip link, SR linearized region list (sr-only section with region links + landmark counts), aria-live polite announcements (zoom level, region selection), ≥44px touch targets, visible focus rings on all interactives, focus restoration verified, 200%/400% zoom proxy layouts (no clipped controls, scrollable), e2e/a11y.spec.ts (keyboard-only loop activating ALL 8 regions, live-region assertions, axe on 3 routes, reduced motion, nocanvas fallback, zoom proxies), manual VoiceOver script.
- Axe findings fixed (real defects, not suppressed): `aria-prohibited-attr` — aria-label on role-less divs → `role="group"` on the map renderer wrapper + format switcher; `color-contrast` — brown kicker text (#8a6d4a, 3.26:1) → ink token on both the top-map panel and sub-map banner. One test-methodology fix: axe scans now run under reduced-motion emulation + settle wait so contrast is judged at rest state, not mid-fade (blended-color false positives).

## Evidence

- `evidence/ISSUE-013/VAL-011-gate.txt` — gate green + 16/16 e2e.
- `evidence/ISSUE-013/axe-report.json` — full axe output for /, /map/databases, /map/databases/sql (0 serious/critical).
- `evidence/ISSUE-013/SR-manual-script.md` — VoiceOver walkthrough script with expected announcements.
- Fresh-context validation: covered by the e2e suite itself this slice (a11y criteria are machine-checked); orchestrator reviewed the axe fixes by direct read.

## Next Context Slice

ISSUE-014 — performance budget pass (bundle ≤300KB gz initial, lazy Pixi/Stripe/AI boundaries, LCP/INP/CLS traces, deployed-preview screenshots at both viewports; also carry the deferred sea-dither/banner polish if budget allows).
