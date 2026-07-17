# ISSUE-010 handoff — Content pipeline: schema → manifest → routes (VAL-030, VAL-031 build half)

## Completed work

- Worker (codex gpt-5.6-sol, 2 slices — stopped once per two-failure rule on a missing `public/` dir, diagnosed correctly, resumed): REQ-007 Zod schema (snake_case fields, quiz.answer∈options, sources[] {url, checked}, draft flag), 8 region metas, **48 landmark modules named exactly by the locked TAXONOMY ids** (all `draft: true`; honest stubs from taxonomy rationale; the 4 pre-existing sample landmarks ported with real dated primary sources), static-registry build script (`npm run build:manifest`) asserting 8×6 / unique / serializable and writing deterministic `public/content-manifest.v1.json`, `--forbid-drafts` M4-exit gate (proven: exit 1 listing 48 drafts), vitest invariant tests, `src/lib/content.ts` loader with `resolveLandmarkAnyVersion` (removed-landmark rule, additive for v2+), MapExperience/regionStats/tests rewired to the manifest, manifest generation chained into `npm run build` (offline-safe: JSON committed + statically imported).
- tsconfig gained `allowImportingTsExtensions` (Node type-stripping needs explicit .ts imports; Next accepts it).

## Evidence

- `evidence/ISSUE-010/VAL-030-031-build.txt` — build:manifest 0, forbid-drafts 1 (48 drafts listed — correct pre-M4), full gate green.
- Fresh-context validator (codex sol): criteria 1-3, 5 PASS; criterion 4 flagged only "manifest JSON untracked" — resolved by this issue's closeout commit which includes `public/content-manifest.v1.json` (verified staged).

## Notes / flags

- M4 exit MUST flip the draft gate on (run `build:manifest -- --forbid-drafts` in the ISSUE-022 closeout and wire it into the default build from then on).
- `src/data/regions.ts` is now a thin re-export; retire fully when M3 map work replaces remaining importers.

## Next Context Slice

M2 COMPLETE. Next: M3 — ISSUE-011 DOM interaction layer + top map render (inputs: designs/map-style.md [cozy-pixel, Pixi.js], manifest). Vision QA via Gemini.
