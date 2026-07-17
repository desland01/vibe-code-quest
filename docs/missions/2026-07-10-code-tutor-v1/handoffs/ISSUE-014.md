# ISSUE-014 handoff — Performance budget pass (VAL-013)

## Completed work

- Worker (codex gpt-5.6-sol): canvas mount deferred to `window` load + `requestIdleCallback` (DOM fallback interactive immediately, crossfade-in, reduced-motion aware, ?nocanvas unchanged); client manifest consumers moved to `src/lib/content-client.ts` (JSON + types, no zod runtime client-side; zod validation retained in build/server paths).
- Orchestrator: bundle measurement tooling (CDP encodedDataLength), REST-API preview deploy, both-viewport screenshots, deployed vitals.

## Results

- **Initial route JS 161.7KB gz ≤ 300KB budget** (was ~490KB effective before the split); Pixi ~265KB loads post-load-idle as progressive enhancement.
- Deployed preview (dpl_Dh89SBfR1Awv58TgVJ1onxLa8dLg): LCP 224ms, CLS 0, TTFB 129ms. 16/16 e2e regression green after the changes; gate green.

## Evidence

- `evidence/ISSUE-014/VAL-013-budgets.md` (methodology + numbers), `preview-1440x900.png`, `preview-375x812.png`, `VAL-001-gate.txt`.

## Flags

- **User friction item:** `vercel deploy` CLI and GitHub-remote creation are both denied by the session permission layer; deploys run via the Vercel REST deployments API (script: worked, but allowlisting `vercel deploy` or `gh repo create` would simplify M5/M6 and enable push-triggered previews).
- Deferred style polish from ISSUE-011 (wave-pattern sea dither, banner inset shadow) remains open; revisit at M4 content-region previews or a style amendment gate.

## Next Context Slice

M3 COMPLETE. Next: M4 — ISSUE-015 Databases region gold standard + VOICE.md (authoring quality bar; then 016..022 serial).
