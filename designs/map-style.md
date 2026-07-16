# code-tutor map style — Cozy Pixel (decided 2026-07-15, ISSUE-003)

**Direction:** cozy 16-bit RPG overworld. 8 island-like regions on a soft sea, tiny pixel buildings/trees per region, chunky banner labels. Reference frames: `designs/comps/03-cozy-pixel.png` (winner); runners-up kept for contrast (`05-retro-transit`, `02-cyberpunk-grid`, `01-hand-drawn-cartographic`, `04-abstract-gradient`).

## Renderer decision
**Pixi.js** (design-doc primary path confirmed): sprite-based pixel art is Pixi's native strength — texture atlases per region, integer-scaled zoom, game-like hover/selection states. DOM semantic controls remain canonical per REQ-003; Pixi is presentation only. Fallback (WebGL failure): pre-rendered PNG region sprites positioned with CSS + framer-motion.

## Palette tokens
- `--sea`: #7ec8c9 (soft teal water)
- `--sea-deep`: #5aa8ad
- `--land`: #a8d17a (grass), `--land-shore`: #e8d8a0 (sand edge)
- `--banner`: #f4e9d0 (label banners), `--banner-border`: #8a6d4a
- `--ink`: #3b3245 (label text, outlines)
- `--accent-region`: 8 hue tints, one per region: Databases #d98f6c · Infra #8f9fd9 · AI Types #c98fd9 · Git #d96c6c · Languages #6cd9a8 · Security #d9c96c · Design #ed9ec4 · PM Tools #9ad0ed
- Night/hover glow: #fff3c4 at 40% overlay.

## Typography
- Labels: pixel font ("Press Start 2P" or "Pixelify Sans", Google Fonts) on banner sprites; min rendered size 12px, letter-spacing 0.
- Body/UI panels (outside canvas): system sans (Inter), pixel font reserved for map labels + headings only.

## Region shape language
- Islands with 2px dark-ink outline, dithered shore transition, 1-2 signature pixel structures per region (e.g. Databases = stacked-cylinder silos; Git = branching river/tree; Security = walled keep). 6 landmark markers per region = small building sprites with hover bounce (2px, 150ms, steps(2)).
- Grid discipline: all art on a 16px virtual pixel grid; integer scaling only (1x/2x/3x); nearest-neighbor filtering (no smoothing).

## Do / Don't
- DO: limited palette (≤32 colors per region atlas), chunky outlines, steps() easing for pixel-authentic motion, reduced-motion = crossfade only.
- DO: generate sprite assets with Gemini imagegen at 16:10, then quantize/cleanup; keep sources in designs/comps/.
- DON'T: anti-aliased rotation, sub-pixel movement, drop shadows with blur, mixing pixel and vector art on the canvas, more than 2 label fonts.

## Judge record
Gemini 2.5 Pro vision, 2026-07-15. Scores (A distinctive / B readable / C shareable / D buildable): pixel 10/9/10/9 · transit 8/10/8/10 · cyberpunk 9/8/9/4 · cartographic 6/7/7/2 · gradient 4/7/5/10. Winner: cozy-pixel; Pixi.js recommended. Full transcript: docs/missions/2026-07-10-code-tutor-v1/evidence/ISSUE-003/gemini-judgement.md
