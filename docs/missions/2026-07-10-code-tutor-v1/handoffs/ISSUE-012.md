# ISSUE-012 handoff — Sub-map scenes + URL contract (VAL-012)

## Completed work

- Worker (codex gpt-5.6-sol + one terra micro-fix): URL-as-source-of-truth routes `/map`, `/map/[region]`, `/map/[region]/[landmark]` (generateStaticParams from the manifest, notFound() on invalid ids, `?format` validated → overview fallback); DOM-first SubMapScene (pixel-styled landmark cards on an island silhouette, accent-tinted region banner, Back link, reduced-motion-aware zoom transition); landmark detail rendering all canonical fields + draft chip + format switcher (router.replace, UI-only until ISSUE-024); RegionPanel landmark links + Explore wired.
- Micro-fix (terra): ambiguous e2e selector → href-based locator.

## Evidence

- `evidence/ISSUE-012/VAL-012-gate.txt` — gate green + 9/9 e2e (4 sub-map: deep-link cold load w/ quiz format, refresh, back/forward chain, invalid ids/format, back-to-top-map; plus map-top 4 + anon-session).
- `evidence/ISSUE-012/submap-databases-1440.png` — Databases sub-map screenshot (on-token styling, draft chips).
- Fresh-context validator (codex sol): 5/5 PASS.

## Next Context Slice

ISSUE-013 — a11y completion pass (VAL-011 fully green: focus order/restoration, aria-live zoom announcements, touch targets, SR linearized list, 200/400% zoom, keyboard-only e2e, axe run, manual SR script notes).
