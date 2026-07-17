You are a bounded worker agent executing exactly ONE issue in the repo at /Users/thebeast/code-tutor (you are already in it). Implement only this issue; make no commits. Do not run npm install.

# ISSUE-010 — Content pipeline: schema → manifest → routes (REQ-007; VAL-030, VAL-031 build half)

Bound: src/content/** (schema.ts rewrite + regions meta + 48 landmark modules), scripts/build-manifest.ts (new), src/lib/content.ts (new loader/resolver), src/data/regions.ts (may become a thin re-export or be retired — update its importers: src/components/MapExperience.tsx, src/lib/regionStats.ts, src/__tests__/*), package.json scripts only, public/ manifest output (generated, committed).

Context (zero chat context assumed):
- REQ-007: Zod schema per landmark: hook, definition, when_to_use[], tradeoffs {pros[], cons[]}, example, gotchas[], vibe_coder_default, quiz {question, options[], answer (canonical, must be one of options), explanation}, sources[] of {url, checked (ISO date)} — sources REQUIRED (nonempty) whenever the content makes named-product claims, plus fields: id, title, draft (boolean). TS content modules in src/content/<region>/<landmark>.ts exporting a schema-typed const. Build script emits a versioned JSON manifest public/content-manifest.v<N>.json consumed by routes, runtime, AND the future Gateway-down fallback. Build asserts: exactly 8 regions × 6 landmarks, unique stable ids, serializable, manifest fresh. Full build passes with network disabled. Removed-landmark rule: progress rows for landmarks absent from the current manifest are still renderable from the newest prior manifest version containing them.
- docs/content/TAXONOMY.md is LOCKED and signed off — the 48 landmark ids/titles MUST come from it exactly (region ids: languages, databases, infra, ai-types, pm-tools, git, security, design).
- Existing: src/content/schema.ts (old minimal version — rewrite, keep exported names landmarkSchema/regionSchema/... compatible or update all importers), src/data/regions.ts (8 regions with mapArea geometry + 4 authored sample landmarks: sql, vector [databases], serverless→id 'serverless-functions'?, containers [infra] — the OLD sample landmark ids may not match TAXONOMY ids; TAXONOMY wins: map/rename the sample content onto the taxonomy ids and keep their content as the seed for those 4 modules, marked draft: true still (full authoring happens in M4)).
- The homepage (src/components/MapExperience.tsx) currently lists regions from src/data/regions.ts.

Tasks:
1. Rewrite src/content/schema.ts: landmark schema per REQ-007 (snake_case fields exactly as listed: when_to_use, vibe_coder_default, sources[] {url, checked}, draft; quiz.answer must be one of quiz.options via refine), region meta schema (id, title, label, description, mapArea, landmarkIds[6]), manifest schema (version, generatedAt, regions[] with embedded full landmarks). Export TS types.
2. src/content/regions.ts: the 8 region metas (copy titles/labels/descriptions/mapArea from src/data/regions.ts; landmarkIds from TAXONOMY.md order).
3. 48 modules src/content/<region>/<landmark-id>.ts (file name = landmark id): schema-valid content. For the 4 landmarks with existing sample content (databases/sql, databases/vector, infra/serverless-functions, infra/containers): port the existing content into the new schema (add sources[] with real primary-source URLs + checked: today where they make product claims; convert camelCase fields). All 48 modules draft: true (authoring quality happens in M4; these are schema-valid placeholders — placeholder text must be honest short stubs derived from the TAXONOMY rationale, not lorem ipsum).
4. scripts/build-manifest.ts (run via node --experimental-strip-types): imports all modules via a static registry file src/content/index.ts (no dynamic fs-based import at runtime; the build script may use fs to VERIFY the registry matches the directory contents), validates every module against the schema, asserts 8×6 + unique ids + JSON-serializable round-trip, writes public/content-manifest.v1.json ({ version: 1, generatedAt, regions }) deterministically (stable key order; generatedAt from SOURCE_DATE_EPOCH env if set else current time). npm script "build:manifest". Also a vitest test that runs the same validation logic (so `npm run test` catches violations without running the script).
5. Draft gate: build:manifest accepts --forbid-drafts flag → exits nonzero listing any draft:true landmark (this is the M4-exit gate; do NOT enable it in the default build yet).
6. src/lib/content.ts: loadManifest() (imports the committed JSON), getRegion(regionId), getLandmark(regionId, landmarkId), resolveLandmarkAnyVersion(regionId, landmarkId) implementing the removed-landmark rule: check current manifest first, else scan older public/content-manifest.v*.json (static imports via a small registry; v1 only today — structure the code so v2+ is additive).
7. Rewire src/components/MapExperience.tsx + src/lib/regionStats.ts + affected tests to consume src/lib/content.ts (region list + landmark counts from the manifest). Keep the existing invariant tests meaningful: 8 regions, 6 landmarks each, ids unique — now sourced from the manifest.
8. Wire "build:manifest" into "build" (prebuild or && chain) so next build always has a fresh manifest; commit the generated manifest file (offline build requirement: next build must NOT need network).

Validation to satisfy:
- VAL-030: schema + invariants asserted at build; violations fail the build. Evidence: build output.
- VAL-031 (build half): full `npm run build` passes offline (no network fetches in the pipeline).
- VAL-001/003 gate green.
- VAL-002: nothing secret; sources[] URLs are public docs.

Stop conditions: if TAXONOMY.md ids conflict with something irreconcilable in existing code, or a command fails twice, STOP and report.

Print EXACTLY this structured handoff as your final message:
- Completed work:
- Unresolved work:
- Files touched:
- Commands run (with exit codes):
- Issues / surprises discovered:
- Next Context Slice:
