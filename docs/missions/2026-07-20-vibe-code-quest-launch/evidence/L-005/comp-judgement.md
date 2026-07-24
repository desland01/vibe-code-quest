# L-005 Comp Judgement — collectible + map-glow comps (cozy-pixel)

**Date:** 2026-07-24
**Base:** L-004 `b13717a`
**Judge:** Greg (orchestrator, in-session)
**Method:** browser-rendered HTML/CSS comps (Playwright, local `file://`, fonts asserted), 3 states × 2 viewports, mechanical contract checks in the renderer. Canonical tech = real CSS per frozen DESIGN_CONTRACT §6/§7/§10 (prose/AI-image comps cannot hold typography/spacing/motion truth).

## Captures

Directory: `designs/comps/vibe-launch-l005/captures/`

| File | Viewport | PNG size | Notes |
|---|---|---|---|
| `stamp-collectible-desktop.png` | 1280×800 | 1280×800 | Stamp + static collectible grant inside stamp moment |
| `stamp-collectible-mobile.png` | 390×844 | 390×844 | Same, narrow |
| `collection-shelf-desktop.png` | 1280×800 | 1280×800 | 3-column shelf, 1 earned / 5 open |
| `collection-shelf-mobile.png` | 390×844 | 390×1416 | Full-section capture taller than viewport (expected) |
| `map-glow-desktop.png` | 1280×800 | 1280×800 | Region landmark cards; stamped settled highlight |
| `map-glow-mobile.png` | 390×844 | 390×1409 | Full-section capture taller than viewport (expected) |

Source: `designs/comps/vibe-launch-l005/collectible-glow-comps.html`
Renderer: `docs/missions/2026-07-20-vibe-code-quest-launch/scripts/render-l005-comps.mjs`
Render result: exit 0 · 6 captures · reduced-motion checks PASS

## Objective assertions (all green on final render)

| Assertion | Result |
|---|---|
| Press Start 2P loaded (no fallback-font captures) | PASS |
| No page/section horizontal overflow | PASS |
| Hard shadow budget inside viewport (panel/map-shell) | PASS |
| Interactive targets (`.btn`, `.landmark-card`) ≥ 44×44 | PASS |
| Shelf grid cols: 3 desktop / 1 mobile | PASS |
| Map landmark grid cols: 3 desktop / 1 mobile | PASS |
| No `filter: blur` / backdrop blur / glass | PASS |
| Stamp motion: `stamp-in`, 480ms, `steps(6)`, iteration 1 | PASS |
| Glow motion: `landmark-glow`, 1200ms, `ease-in-out`, iteration 3 | PASS |
| Canonical map capture is **settled** highlight after the one glow budget | PASS |
| Reduced-motion: stamp + glow `animation-name: none`; stamped badge + collectible chip still visible | PASS |
| Stamped state legible without color alone (`Stamped` text + collectible name) | PASS |
| Open state legible without color alone (`Open` label) | PASS |
| Shame-term scan clean (incl. missing/debt/loss) on rendered text | PASS |

## Criterion verdicts

| Criterion | Desktop | Mobile | Verdict |
|---|---|---|---|
| One obvious focal action | PASS | PASS | Stamp moment: stamp + grant + Next/Back. Shelf: browse keepsakes. Map: stamped card is the lit focal path. |
| Readable hierarchy; pixel titles wrap cleanly | PASS | PASS | Title line-height 1.35; mobile title clamp; no glyph collision observed in geometry checks. |
| Warmth without childishness | PASS | PASS | Paper cards, hard ink outlines, offset shadows, rotated stamp; no confetti/neon/glass. |
| Celebration budget = one stamp + one glow | PASS | PASS | Collectible is a **static** badge inside the existing stamp moment (not a third animation). Glow is one event = 3×1200ms then still. |
| Collectible grant only from stamp ownership story | PASS | PASS | Comp shows grant only after STAMPED; shelf “Earned” only for stamped landmark. Implementation must wait on server `completed === true`. |
| Map glow surface is region landmark cards | PASS | PASS | Comps target SubMapScene DOM cards (not Pixi overworld). Matches real production surface. |
| Positive-only shelf / open framing | PASS | PASS | “Earned” / “Open” / “Still on the path” — no missing/debt/loss/shame. |
| Reduced-motion equivalent | PASS | PASS | Instant stamp badge + static settled glow; labels remain. |
| No collision with onboarding or guide UI | PASS | PASS | Comps contain neither surface. |
| Touch targets adequate | PASS | PASS | Buttons and landmark cards ≥44px. |

## Vision inspection

**Vision-analyze provider was credit-blocked (OpenRouter 402).** No alternate paid vision path; no spend.
This judgement is **mechanical + source + rendered geometry**, not a subjective vision-model PASS. Owner may eyeball the six captures under `designs/comps/vibe-launch-l005/captures/`.

## CSS / token extraction for implementation (design decisions, not contract amendment)

Port from comps into production (do not redesign):

1. **Collectible grant (BeatPlayer recap/stamp):**
   - Static tile + name inside stamp wrap after server-confirmed `completed`
   - No extra animation beyond existing `stamp-in` (or none under reduced-motion)
   - Resume of already-stamped landmark: show keepsake statically; do not replay grant motion

2. **Collection shelf (region sub-map):**
   - 3-col desktop / 1-col ≤760px
   - Earned vs open cards; open language stays neutral (“Open” / “Still on the path”)
   - Quiet-hide on no-DB / progress failure (same posture as `XpHud`)

3. **Stamped map glow (`SubMapScene` landmark cards):**
   - `is-stamped` warm region-accent fill + outline
   - Text badges: `Stamped` + collectible name (never color-only)
   - Glow: `1200ms ease-in-out` × **3**, then settled static highlight
   - Replay rule: animated glow **only** for a just-confirmed stamp this session; resume/load of prior stamps → settled only
   - Reduced-motion: settled highlight immediately; animation none

4. **Tokens:** existing `--ink`, `--banner`, `--banner-border`, `--region-accent`, `#fff3c4` night/hover highlight. No new motion libraries. No blur shadows.

5. **Data model preference:** derive ownership from existing server progress `completed === true` (no new Neon table unless derivation proves insufficient). Static registry of 48 landmark → keepsake id/name/sigil.

## Rejected directions

1. **Third celebration animation for collectible pop** — violates one stamp + one glow budget. Rejected.
2. **Glow on every region-page mount for all completed landmarks** — reward inflation; violates per-stamp glow budget. Rejected.
3. **Pixi overworld as primary glow surface for this slice** — landmarks are selected/stamped on SubMapScene DOM cards; start there. Rejected for L-005 v1.
4. **“Missing / 2 left / you fell behind” shelf copy** — shame/debt framing. Rejected.
5. **Client-only grant before server merge confirms completed** — forgeable ownership. Rejected.

## Verdict

**COMPS PASS — gate cleared on mechanical/source criteria.**
L-005 implementation (`feat(launch): L-005 collectibles and stamped map glow`) is unblocked.
Subjective owner visual taste on the six PNGs remains available; silence is not approval for production look, but the design-artifact gate required by KICKOFF L-005 / R007 is satisfied for build to proceed.
