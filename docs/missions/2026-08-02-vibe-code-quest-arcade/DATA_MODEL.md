# Vibe Code Quest Arcade: Decided Data Model

Status: DECIDED. This document closes the persistence, identity, gating, migration, rollback, and payload questions for the arcade cutover. The eight orchestrator decisions below are implementation requirements.

## 1. Type definitions

The current landmark has one top level quiz (`src/content/schema.ts:19`) and a `check` beat has no assessment payload (`src/content/beats/schema.ts:42`). The player therefore grades every check from `landmark.quiz` (`src/components/landmark/Beats/BeatPlayer.tsx:552`). The replacement is one required canonical source per level, with the selected level assessment projected into the selected sequence.

```ts
import { z } from 'zod';

export const LEVEL_IDS = ['l1', 'l2', 'l3'] as const;
export const levelIdSchema = z.enum(LEVEL_IDS);
export type LevelId = z.infer<typeof levelIdSchema>;

const nonEmpty = z.string().trim().min(1);

export const assessmentSchema = z.object({
  question: nonEmpty,
  options: z.array(nonEmpty).min(2).max(4),
  answer: nonEmpty,
  explanation: nonEmpty,
}).strict().refine((assessment) => assessment.options.includes(assessment.answer), {
  message: 'assessment.answer must exactly match one assessment.options entry',
  path: ['answer'],
});

export const levelContentSchema = z.object({
  hook: nonEmpty,
  definition: nonEmpty,
  when_to_use: z.array(nonEmpty).min(1),
  tradeoffs: z.object({
    pros: z.array(nonEmpty).min(1),
    cons: z.array(nonEmpty).min(1),
  }).strict(),
  example: nonEmpty,
  gotchas: z.array(nonEmpty).min(1),
  vibe_coder_default: nonEmpty,
  assessment: assessmentSchema,
}).strict();

export const landmarkLevelsSchema = z.object({
  l1: levelContentSchema,
  l2: levelContentSchema,
  l3: levelContentSchema,
}).strict();

export type LevelContent = z.infer<typeof levelContentSchema>;
export type LandmarkLevels = z.infer<typeof landmarkLevelsSchema>;

export const canonicalLandmarkSchema = z.object({
  id: nonEmpty.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: nonEmpty,
  draft: z.boolean(),
  levels: landmarkLevelsSchema,
  sources: z.array(z.object({ url: z.url(), checked: z.iso.date() }).strict()),
}).strict();
```

Each canonical landmark keeps shared identity, title, draft state, and sources, and adds `levels: landmarkLevelsSchema`. The current instructional fields and `quiz` move under each level. No level is optional. The public manifest uses a separate projection schema and never contains `levels` or `assessment`.

The L3 positional contract is the current derived eight beat contract: the factory emits eight beats with stable IDs and puts `check` at zero based index 6 (`src/content/beats/derive.ts:237`, `src/content/beats/derive.ts:285`). It is enforced in Zod, not by a test convention:

```ts
const L3_SHAPE = [
  ['hook', 'hook'],
  ['predict-core', 'predict'],
  ['reveal-definition', 'reveal'],
  ['scenario-default', 'scenario'],
  ['gotcha-trap', 'gotcha'],
  ['default-commit', 'default'],
  ['check-quiz', 'check'],
  ['recap', 'recap'],
] as const satisfies readonly (readonly [string, BeatType])[];

export const beatSequenceSchema = z.object({
  regionId: nonEmpty,
  landmarkId: beatId,
  level: levelIdSchema,
  assessment: assessmentSchema,
  beats: z.array(beatSchema).min(5).max(8),
}).strict().superRefine((sequence, ctx) => {
  const ids = sequence.beats.map((beat) => beat.id);
  if (new Set(ids).size !== ids.length) {
    ctx.addIssue({ code: 'custom', message: 'beat ids must be unique within the sequence' });
  }

  for (const beat of sequence.beats) {
    if (!('options' in beat)) continue;
    const optionIds = beat.options.map((option) => option.id);
    if (new Set(optionIds).size !== optionIds.length) {
      ctx.addIssue({ code: 'custom', message: `beat ${beat.id}: option ids must be unique` });
    }
    if (!beat.options.some((option) => option.id === beat.correctOptionId)) {
      ctx.addIssue({ code: 'custom', message: `beat ${beat.id}: correctOptionId must match an option id` });
    }
  }

  if (sequence.beats.at(-1)?.type !== 'recap') {
    ctx.addIssue({ code: 'custom', message: 'final beat must be recap' });
  }
  if (sequence.beats.filter((beat) => beat.type === 'check').length !== 1) {
    ctx.addIssue({ code: 'custom', message: 'sequence must contain exactly one check beat' });
  }

  if (sequence.level === 'l3') {
    const actual = sequence.beats.map((beat) => [beat.id, beat.type] as const);
    if (JSON.stringify(actual) !== JSON.stringify(L3_SHAPE)) {
      ctx.addIssue({
        code: 'custom',
        message: 'l3 must preserve the pinned eight beat id and type sequence',
      });
    }
  }
});

export type BeatSequence = z.infer<typeof beatSequenceSchema>;

export type SequenceRef = Readonly<{
  regionId: string;
  landmarkId: string;
  level: LevelId;
}>;

export type PlayerState = {
  readonly sequenceRef: SequenceRef;
  displayIndex: number;
  furthestBeatIndex: number;
  revealCount: number;
  classifications: Record<string, 'pro' | 'con'>;
  feedback: Feedback;
  checked: boolean;
  completed: boolean;
  stampedAt: string | null;
};
```

`sequenceRef` is immutable runtime identity. `persistentFacts` continues to select only `furthestBeatIndex`, `checked`, `completed`, and `stampedAt` (`src/components/landmark/Beats/beatReducer.ts:188`). The persisted JSON remains the strict version 1 beat state already defined at `src/content/beats/schema.ts:94`; `level` is never added to that JSON.

Registry keys are exactly `${regionId}/${landmarkId}/${level}`. Every registry API accepts all three fields. The current two part key is built and looked up at `src/content/beats/index.ts:20` and `src/content/beats/index.ts:34`; the replacement registry must contain exactly 144 distinct keys.

## 2. SQL migrations

Existing migration files are immutable. `progress` currently has one unique row per profile, region, and landmark (`db/migrations/0001_schema.sql:19`). `xp_awards` has the same omission in its award identity (`db/migrations/0009_xp.sql:5`). Add the following files after `0010_leaderboard.sql`.

### `db/migrations/0011_arcade_level_expand.sql`

```sql
BEGIN;

LOCK TABLE progress, xp_awards IN SHARE ROW EXCLUSIVE MODE;

ALTER TABLE progress ADD COLUMN level text;
UPDATE progress SET level = 'l3' WHERE level IS NULL;
ALTER TABLE progress ALTER COLUMN level SET DEFAULT 'l3';
ALTER TABLE progress ALTER COLUMN level SET NOT NULL;
ALTER TABLE progress
  ADD CONSTRAINT progress_level_check
  CHECK (level IN ('l1', 'l2', 'l3')) NOT VALID;
ALTER TABLE progress VALIDATE CONSTRAINT progress_level_check;
ALTER TABLE progress
  ADD CONSTRAINT progress_profile_region_landmark_level_key
  UNIQUE (profile_id, region, landmark, level);

ALTER TABLE xp_awards ADD COLUMN level text;
UPDATE xp_awards SET level = 'l3' WHERE level IS NULL;
ALTER TABLE xp_awards ALTER COLUMN level SET DEFAULT 'l3';
ALTER TABLE xp_awards ALTER COLUMN level SET NOT NULL;
ALTER TABLE xp_awards
  ADD CONSTRAINT xp_awards_level_check
  CHECK (level IN ('l1', 'l2', 'l3')) NOT VALID;
ALTER TABLE xp_awards VALIDATE CONSTRAINT xp_awards_level_check;
ALTER TABLE xp_awards
  ADD CONSTRAINT xp_awards_profile_region_landmark_level_award_key
  UNIQUE (profile_id, region, landmark, level, award_key);

CREATE FUNCTION reject_progress_identity_change() RETURNS trigger
LANGUAGE plpgsql AS $body$
BEGIN
  IF ROW(NEW.profile_id, NEW.region, NEW.landmark, NEW.level)
     IS DISTINCT FROM ROW(OLD.profile_id, OLD.region, OLD.landmark, OLD.level) THEN
    RAISE EXCEPTION 'progress identity is immutable' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$body$;

CREATE TRIGGER progress_identity_immutable
  BEFORE UPDATE ON progress
  FOR EACH ROW EXECUTE FUNCTION reject_progress_identity_change();

DROP POLICY progress_select ON progress;
DROP POLICY progress_insert ON progress;
DROP POLICY progress_update ON progress;
DROP POLICY progress_delete ON progress;

CREATE POLICY progress_select ON progress FOR SELECT TO app_user
  USING (
    profile_id = current_setting('app.user_id', true)::uuid
    AND level IN ('l1', 'l2', 'l3')
  );
CREATE POLICY progress_insert ON progress FOR INSERT TO app_user
  WITH CHECK (
    profile_id = current_setting('app.user_id', true)::uuid
    AND level IN ('l1', 'l2', 'l3')
  );
CREATE POLICY progress_update ON progress FOR UPDATE TO app_user
  USING (
    profile_id = current_setting('app.user_id', true)::uuid
    AND level IN ('l1', 'l2', 'l3')
  )
  WITH CHECK (
    profile_id = current_setting('app.user_id', true)::uuid
    AND level IN ('l1', 'l2', 'l3')
  );
CREATE POLICY progress_delete ON progress FOR DELETE TO app_user
  USING (
    profile_id = current_setting('app.user_id', true)::uuid
    AND level IN ('l1', 'l2', 'l3')
  );

DROP POLICY xp_awards_select ON xp_awards;
DROP POLICY xp_awards_insert ON xp_awards;

CREATE POLICY xp_awards_select ON xp_awards FOR SELECT TO app_user
  USING (
    profile_id = current_setting('app.user_id', true)::uuid
    AND level IN ('l1', 'l2', 'l3')
  );
CREATE POLICY xp_awards_insert ON xp_awards FOR INSERT TO app_user
  WITH CHECK (
    profile_id = current_setting('app.user_id', true)::uuid
    AND level IN ('l1', 'l2', 'l3')
  );

COMMIT;
```

This expand migration deliberately retains the old three part unique constraints. Old writers omit `level`, receive the `l3` default, and keep matching their old conflict targets. The application remains L3 only during this compatibility window.

The existing award validity check permits only the four unqualified keys and fixed points (`db/migrations/0009_xp.sql:14`). It remains unchanged. In particular, no `l1_`, `l2_`, or `l3_` award key is valid. Only the column, new unique identity, insert parameters, and conflict target change. The update touches neither `points` nor `awarded_at`, and the migration contains no insert into `xp_awards`.

### `db/migrations/0012_arcade_level_cutover.sql`

```sql
BEGIN;

LOCK TABLE progress, xp_awards IN ACCESS EXCLUSIVE MODE;

ALTER TABLE progress
  DROP CONSTRAINT progress_profile_id_region_landmark_key;
ALTER TABLE xp_awards
  DROP CONSTRAINT xp_awards_profile_id_region_landmark_award_key_key;

COMMIT;
```

`0012` runs only after the level aware binary is healthy against `0011`. It enables multiple level rows. The old binary is not a valid rollback target after this point because its conflict targets no longer exist.

## 3. Merge algebra

The current SQL atomically takes `GREATEST` for the frontier, OR for terminal facts, and the first non null stamp (`src/server/beatProgress.ts:94`). The algebra does not change. Its identity does:

```ts
export const BEAT_PROGRESS_UPSERT_SQL = `
INSERT INTO progress (profile_id, region, landmark, level, state)
VALUES ($1, $2, $3, $4, $5::jsonb)
ON CONFLICT (profile_id, region, landmark, level)
DO UPDATE SET
  state = CASE
    WHEN progress.state->>'kind' IS DISTINCT FROM 'beat-sequence'
      THEN EXCLUDED.state
    ELSE jsonb_build_object(
      'v', 1,
      'kind', 'beat-sequence',
      'furthestBeatIndex', GREATEST(
        COALESCE((progress.state->>'furthestBeatIndex')::int, 0),
        (EXCLUDED.state->>'furthestBeatIndex')::int
      ),
      'checked', COALESCE((progress.state->>'checked')::boolean, false)
                 OR COALESCE((EXCLUDED.state->>'checked')::boolean, false),
      'completed', COALESCE((progress.state->>'completed')::boolean, false)
                   OR COALESCE((EXCLUDED.state->>'completed')::boolean, false),
      'stampedAt', COALESCE(
        NULLIF(progress.state->'stampedAt', 'null'::jsonb),
        NULLIF(EXCLUDED.state->'stampedAt', 'null'::jsonb),
        'null'::jsonb
      )
    )
  END,
  updated_at = now()
RETURNING region, landmark, level, state, updated_at
`;
```

For a fixed `SequenceRef`, merge is a join semilattice: frontier uses `max`, booleans use logical OR, and `stampedAt` is first non null. The four part conflict identity means L1, L2, and L3 form three independent lattices. Interleaving writes across levels cannot compare frontiers or copy terminal facts.

GET returns `{ items: Array<{ region, landmark, level, state, updated_at }>, xp }`. PUT requires `{ region, landmark, level, state }` and returns `{ region, landmark, level, state, updated_at, xp }`. The current shapes omit level (`app/api/progress/route.ts:12`, `app/api/progress/route.ts:29`), so every select, insert, conflict target, response type, and client parser must add it.

XP insertion becomes:

```sql
INSERT INTO xp_awards (profile_id, region, landmark, level, award_key, points)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (profile_id, region, landmark, level, award_key) DO NOTHING
RETURNING level, award_key, points
```

The current insert conflicts without level (`src/server/xp.ts:83`). Award derivation continues to find scenario and gotcha positions by beat type in the exact selected sequence (`src/server/xp.ts:42`), then writes that sequence's `level` column.

## 4. Gating enforcement

### Hosted mode

The current route resolves the write before opening its transaction (`app/api/progress/route.ts:91`) and starts the transaction only at the upsert (`app/api/progress/route.ts:110`). Replace that order with:

1. Authenticate, parse `SequenceRef`, and reject an invalid `LevelId` at the HTTP boundary.
2. Enter `withUserTransaction`. It begins, assumes `app_user`, and sets `app.user_id` before the callback (`src/lib/db.ts:8`).
3. Inside that callback, resolve the exact server registry entry for `(regionId, landmarkId, level)`. Reject a missing sequence.
4. Read all progress rows for the same profile, region, and landmark with `FOR SHARE`. This read and the write are in the same transaction.
5. Compute highest unlock: L1 is open; completed L1 opens L2; completed L2 opens L3. An existing L3 row also sets highest unlock to L3 as the legacy grandfather rule defined below.
6. Reject a write above the highest unlock with `423` and `{ error: 'Level locked', requestedLevel, highestUnlockedLevel }`.
7. Validate the state against the selected sequence's terminal index, one check index, and beat kinds. The current validator already derives terminal and check indexes from the registry sequence (`src/server/beatProgress.ts:36`); it now receives `SequenceRef`.
8. Run the four part atomic upsert. Derive XP from the returned merged state and the same selected sequence, then insert awards with the same level. Commit.

The hosted page resolver uses the same transaction and unlock function. With no requested level it returns the highest unlocked level. With a requested locked level it returns the locked response and serializes no playable sequence. It never performs a prerequisite read before the transaction. Client controls are presentation only.

### Anonymous and self host mode

`DATABASE_URL` currently defines hosted mode, while no database means browser progress only (`src/server/hosting.ts:3`). In self host mode the server cannot read browser local storage. The mode boundary is therefore explicit:

1. The initial page sends no sequence. A client bootstrap reads versioned local progress, computes the highest unlocked level, and requests exactly one `SequenceRef`.
2. Local unlock uses the same order: L1 is open, completed L1 opens L2, completed L2 opens L3, and an existing valid L3 key grandfathers L3.
3. The server resolves sequence existence, identity, level, terminal bounds, one check position, and beat kinds for every request. It does not claim to verify the locally held prerequisite.
4. The client renders only a locally unlocked response. A forged local store can unlock local self host content; it cannot create a hosted row, XP award, or leaderboard result.

Anonymous players on a hosted deployment use the same local authority until authentication because the progress API currently rejects a missing session before either mode branch (`app/api/progress/route.ts:53`, `app/api/progress/route.ts:76`). On sign in, completed local L1 and L2 states may be submitted in prerequisite order through the hosted transaction. A migrated anonymous L3 state is retained locally but is not promoted into the hosted database until hosted L2 is complete. No untrusted browser value bypasses hosted gating.

## 5. Local storage migration

The current key is `ct-beat-progress:{regionId}/{landmarkId}` and malformed or unavailable storage already fails soft (`src/components/landmark/Beats/beatStorage.ts:8`, `src/components/landmark/Beats/beatStorage.ts:25`). The new key is:

```text
ct-beat-progress:v2:{regionId}/{landmarkId}/{level}
```

The `v2` names the key namespace. The value remains the strict `BeatProgressState` with `v: 1`; level remains outside JSON.

On an L3 read only, if the v2 key is absent:

1. Read the v1 key without deleting it.
2. Parse JSON and validate with the existing strict v1 schema.
3. If invalid, return empty progress, retain the original bytes, and emit no write.
4. If valid, write the same validated fields to the v2 L3 key.
5. Read the v2 key back, parse it, and require deep equality before treating migration as durable.
6. Retain the v1 key permanently through the rollback window.

If the v2 write or read back fails, use the valid v1 state in memory for that session, leave v2 absent, retain v1, and retry on the next mount. If a valid v2 key exists, it wins and migration does not run again. L1 and L2 never read v1 and start empty.

Tests cover every partial frontier 0 through 7, valid checked state, valid completed state, malformed JSON, schema invalid JSON, storage read failure, quota write failure, read back failure, repeated migration, an existing v2 key, and rollback to a client that only reads v1.

## 6. Migration plan and assertions

1. Land the level aware schemas, registry, API types, local migration, and hosted gate behind an L3 only compatibility flag.
2. Build a checked migration corpus with every frontier 0 through 7, checked and completed states, incomplete award ledgers, retry duplicates, anonymous v1 storage, and leaderboard ties.
3. Capture a read only preflight artifact from the approved target database. Do not claim production equivalence from fixtures alone.
4. Run `0011_arcade_level_expand.sql`. All existing progress and award rows become L3. No row ID, state JSON, points, or timestamp changes.
5. Run the assertion set below. Abort before cutover on any difference.
6. Run the level aware binary in L3 only mode. Old readers and rollback remain valid because the old unique constraints still exist.
7. With explicit release approval, drain old writers, run `0012_arcade_level_cutover.sql`, then enable L1 and L2 writes.
8. Re-run the assertion set and exercise independent writes at all three levels.

Required equality assertions before and after `0011`:

1. Progress row multiset excluding only the new constant `level` column is identical, including `id`, `profile_id`, `region`, `landmark`, `state`, and `updated_at`.
2. Every existing progress row has `level = 'l3'`; no L1 or L2 row exists.
3. XP award multiset is identical by `id`, `profile_id`, `region`, `landmark`, `award_key`, `points`, and `awarded_at`; the only new fact is `level = 'l3'`.
4. XP row count is identical. The migration inserts zero awards and deletes zero awards. A historical profile with missing awards remains missing them.
5. Per profile all time `SUM(points)` is identical.
6. Per profile weekly `SUM(points)` using the same UTC week boundary as `leaderboard_board` is identical. The board filters by `awarded_at` at `db/migrations/0010_leaderboard.sql:69`.
7. For every opted in profile, all time and weekly `(points, RANK())` are identical. The current board ranks on summed points (`db/migrations/0010_leaderboard.sql:81`, `db/migrations/0010_leaderboard.sql:95`).
8. Re-running each migration is rejected by migration history and never re-executes DDL or backfill.

New L1 and L2 awards exist only after future accepted progress writes. The migration never tops up an incomplete historical ledger. `awarded_at` is preserved in place, which is required to keep weekly totals and ranks fixed.

## 7. Rollback contract

The cutover is expand, verify, cut over, and retain. There is no destructive contract phase in this mission.

1. Failure inside `0011`: its transaction rolls back all columns, policies, constraints, and backfills together.
2. Failure after `0011` but before `0012`: disable the compatibility flag and roll back the application. Leave additive columns and new constraints in place. Old readers still write L3 through the defaults and old unique constraints.
3. Failure inside `0012`: its transaction restores both old unique constraints automatically.
4. Failure after `0012` but before the first L1 or L2 row or award: disable writes, re-add the two old unique constraints, then roll back the application.
5. Failure after the first L1 or L2 row or award: do not collapse or delete level data. Disable new level entry, keep the level aware data layer, and forward fix the UI or API. An old binary rollback is no longer safe.
6. Client rollback: the old client ignores v2 keys and resumes from the retained v1 L3 key. L1 and L2 v2 progress remains dormant and is available when the new client returns.

The first committed non L3 database row is the point of no return for a lossless old binary rollback. It requires the same explicit approval as the cutover. The DDL and data are not intrinsically irreversible; what becomes impossible is representing three independent rows in the old one row model without hiding or destroying facts.

## 8. Payload boundary and budgets

The current builder serializes parsed full landmark objects into the public manifest (`src/content/manifest.ts:5`, `src/content/manifest.ts:19`), and the client module exposes all regions from it (`src/lib/content-client.ts:1`). That boundary is replaced by:

1. Canonical `levels`, assessments, and the 144 sequence registry remain in server only modules.
2. Public manifest v2 contains region and map metadata plus a slim landmark overview projection. It contains no `levels`, assessments, beats, answer keys, or registry inventory.
3. A landmark response serializes exactly one selected `BeatSequence`, including only its one assessment. The current page already selects one sequence before creating props (`app/map/[region]/[landmark]/page.tsx:33`, `app/map/[region]/[landmark]/page.tsx:63`).
4. Build validation checks exactly 144 server registry keys, but that count is a build report, not a public manifest field. The current build already validates the registry separately from manifest generation (`scripts/build-manifest.ts:33`).

Enforced budgets:

1. Public manifest v2: at most 160,000 raw UTF 8 bytes and 40,000 gzip bytes.
2. Selected sequence JSON: at most 16,384 raw UTF 8 bytes and exactly one sequence per landmark response.
3. Arcade contribution to the landmark RSC payload: at most 24 KiB gzip.
4. Arcade first load client JavaScript: at most 20 KiB gzip, with no canonical registry or tier corpus chunk.
5. Audio runtime: at most 8 live audio nodes and 1 active scheduler timer while playing; zero live nodes and timers after pause or unmount.

The manifest builder, route payload test, bundle analyzer assertion, and fake audio lifecycle test fail the gate when a budget is exceeded.

## 9. Anonymous and self hosted proof

The proof matrix is mandatory:

1. Anonymous hosted: seed each valid v1 local state, load without a session, migrate to v2 L3, retain v1, reload, and prove no server XP or database mutation occurs.
2. Anonymous then sign in: submit L1 and L2 in hosted prerequisite order, prove migrated L3 is retained but rejected until hosted L2 completion, then prove L3 resumes and awards arise only from accepted post sign in writes.
3. Self host with no `DATABASE_URL`: prove L1 to L2 to L3 local gating, migrated L3 grandfathering, reload, malformed storage, quota failure, and zero dependency on the progress API. The current no database PUT path returns no durable XP (`app/api/progress/route.ts:99`).
4. Authenticated hosted legacy profile: backfill only L3, return L3 as highest unlocked through the grandfather rule, preserve the exact frontier and stamp, and create no L1 or L2 progress or awards.
5. Cross level isolation: race stale and fresh writes within one level while writing the other two levels; prove three rows and independent monotonic results.
6. RLS: prove each profile can select and mutate only its own level rows and can never move a progress row to another identity.

## ADDITIONAL CONSEQUENCES FOUND

### Legacy L3 is a grandfather token

Backfilling only L3 while requiring L2 for L3 would lock existing players out. Therefore an existing valid L3 database row or v2 local key sets the highest unlocked level to L3 without synthesizing L1 or L2 rows. This preserves identity only migration and prevents retroactive XP. All lower levels are selectable, but their progress starts empty.

### L3 beat types must be pinned with IDs

XP derives scenario and gotcha awards by beat type and frontier position (`src/server/xp.ts:53`). Pinning only the IDs and check position would still allow those award thresholds to drift. `L3_SHAPE` therefore pins the ordered `(id, type)` pairs. The two existing hand authored overrides use bespoke predict, scenario, and default IDs (`src/content/git/beats/commits-as-checkpoints.ts:17`, `src/content/security/beats/trust-boundaries.ts:17`); their L3 IDs must be normalized to the pinned derived IDs while their copy remains hand authored.

### Landmark aggregate facts must not triple count

The page currently increments the region stamp count once per completed progress row (`app/map/[region]/[landmark]/page.tsx:80`). Three level rows would allow a count of 18 in a six landmark region. Region completion and collectible ownership remain landmark level facts: count distinct landmark IDs for which any level is completed. The existing collectible helper also collapses completed rows to landmark IDs (`src/lib/collectibles.ts:394`), so it must explicitly OR across levels. XP remains level specific.

### Self host selection needs a two step resolver

The server cannot know local storage during initial rendering, while the payload contract forbids sending all three sequences. Self host and anonymous pages must bootstrap without a sequence, compute local unlock in the browser, then request one server resolved sequence. This is the only way to keep both local gating and one sequence serialization without pretending the server can inspect browser state.

### Progress identity must be immutable

Adding `level` to uniqueness is insufficient if an update can move a row between identities. The new trigger rejects changes to profile, region, landmark, or level. The existing owner trigger protects only the owner field (`db/migrations/0002_rls.sql:63`).

### Anonymous L3 cannot become an authenticated grandfather token

A browser v1 key is editable by its owner and has no server verifiable creation proof. Accepting it as a hosted L3 grandfather token would defeat the hosted prerequisite transaction. The safe contract is asymmetric: it preserves and unlocks L3 locally, but after sign in it remains local until hosted L1 and L2 are complete. The retained v2 L3 state then syncs and resumes without being rewritten. Database grandfathering applies only to L3 rows that already existed in the database at migration time.

## 10. Existing file consequences table

<table>
<thead><tr><th>Existing file or exhaustive group</th><th>Required change and source evidence</th></tr></thead>
<tbody>
<tr><td><code>src/content/schema.ts</code></td><td>Split canonical landmark and public projection schemas; replace the one quiz with required levels and per level assessment. Current single quiz begins at <code>src/content/schema.ts:19</code>.</td></tr>
<tr><td><code>src/content/{languages,databases,infra,ai-types,pm-tools,git,security,design}/*.ts</code>, excluding helper and beat directories</td><td>Migrate all 48 landmark authoring files to the required levels object. The registry imports exactly 48 landmark modules at <code>src/content/index.ts:1</code> and groups them at <code>src/content/index.ts:52</code>.</td></tr>
<tr><td><code>src/content/index.ts</code></td><td>Type the registry as canonical landmarks rather than public manifest landmarks. Current registry type is at <code>src/content/index.ts:50</code>.</td></tr>
<tr><td><code>src/content/beats/schema.ts</code></td><td>Add LevelId, assessment, three part identity, exact one check, and pinned L3 shape. Current sequence identity omits level at <code>src/content/beats/schema.ts:60</code>.</td></tr>
<tr><td><code>src/content/beats/derive.ts</code></td><td>Derive one sequence from one level source, carry level and assessment, and preserve the pinned L3 tuple. Current factory reads top level landmark fields at <code>src/content/beats/derive.ts:171</code>.</td></tr>
<tr><td><code>src/content/git/beats/commits-as-checkpoints.ts</code> and <code>src/content/security/beats/trust-boundaries.ts</code></td><td>Add level and assessment and normalize L3 IDs to the pinned factory tuple. Both currently omit level at <code>src/content/git/beats/commits-as-checkpoints.ts:6</code> and <code>src/content/security/beats/trust-boundaries.ts:6</code>.</td></tr>
<tr><td><code>src/content/beats/index.ts</code></td><td>Build 144 keys, accept SequenceRef in every lookup, and reject duplicate three part identities. Current map uses a two part key at <code>src/content/beats/index.ts:27</code>.</td></tr>
<tr><td><code>src/content/manifest.ts</code> and <code>scripts/build-manifest.ts</code></td><td>Project only public overview data, emit manifest v2, enforce byte budgets, and validate 144 server keys separately. Current builder returns full parsed landmarks at <code>src/content/manifest.ts:10</code>; build validation is at <code>scripts/build-manifest.ts:33</code>.</td></tr>
<tr><td><code>src/lib/content.ts</code> and <code>src/lib/content-client.ts</code></td><td>Load public manifest v2 with public projection types and keep canonical levels out of client imports. Current loaders expose the shared manifest type at <code>src/lib/content.ts:1</code> and <code>src/lib/content-client.ts:1</code>.</td></tr>
<tr><td><code>src/server/beatProgress.ts</code></td><td>Accept SequenceRef, validate the selected level, apply the four part merge SQL, and expose the hosted unlock helper. Current validation and lookup omit level at lines 19 to 36.</td></tr>
<tr><td><code>src/server/xp.ts</code></td><td>Thread level through lookup, derivation, insertion, and return rows. Keep the four unqualified award keys. Current insert identity is at lines 83 to 88.</td></tr>
<tr><td><code>app/api/progress/route.ts</code></td><td>Add level to body, GET, PUT, every query, hosted transaction gating, locked response, and self host response. Current GET select omits level at lines 61 to 70 and validation occurs before the transaction at lines 91 to 111.</td></tr>
<tr><td><code>app/map/[region]/[landmark]/page.tsx</code></td><td>Resolve requested or highest level, gate hosted reads transactionally, serialize one sequence, and count distinct completed landmarks. Current page selects a two part sequence and all region progress at lines 33 to 84.</td></tr>
<tr><td><code>src/components/landmark/LandmarkView.tsx</code></td><td>Carry SequenceRef and selected assessment in beat props and key the player by all three identity parts. Current key omits level at <code>src/components/landmark/LandmarkView.tsx:58</code>.</td></tr>
<tr><td><code>src/components/landmark/Beats/BeatPlayer.tsx</code></td><td>Use sequence assessment, level qualified storage, level in PUT, and local gating bootstrap. Current storage and PUT omit level at <code>src/components/landmark/Beats/BeatPlayer.tsx:173</code>; current grading reads landmark.quiz at <code>src/components/landmark/Beats/BeatPlayer.tsx:552</code>.</td></tr>
<tr><td><code>src/components/landmark/Beats/beatReducer.ts</code></td><td>Add immutable sequenceRef to PlayerState while leaving persistent facts level free. Current PlayerState begins at <code>src/components/landmark/Beats/beatReducer.ts:11</code> and persistence selection at <code>src/components/landmark/Beats/beatReducer.ts:188</code>.</td></tr>
<tr><td><code>src/components/landmark/Beats/beatStorage.ts</code></td><td>Add v2 key helpers, idempotent L3 migration, read back verification, and level qualified reads and writes. Current v1 key and fail soft behavior begin at <code>src/components/landmark/Beats/beatStorage.ts:8</code>.</td></tr>
<tr><td><code>src/server/quiz.ts</code>, <code>app/api/quiz/route.ts</code>, and <code>src/components/landmark/QuizFormat.tsx</code></td><td>Grade the selected level assessment and require LevelId in the quiz request. Current server grades top level quiz at <code>src/server/quiz.ts:3</code>; route body omits level at <code>app/api/quiz/route.ts:8</code>; client reads top level quiz at <code>src/components/landmark/QuizFormat.tsx:29</code>.</td></tr>
<tr><td><code>src/components/landmark/FormatSwitcher.tsx</code></td><td>Preserve the selected level when switching formats. Current replacement URL keeps only format at <code>src/components/landmark/FormatSwitcher.tsx:30</code>.</td></tr>
<tr><td><code>src/components/map/SubMapScene.tsx</code> and <code>src/lib/collectibles.ts</code></td><td>Parse level aware progress and deduplicate landmark completion across level rows. Current response item type omits level at <code>src/components/map/SubMapScene.tsx:23</code>; current ownership helper checks only region, landmark, and state at <code>src/lib/collectibles.ts:394</code>.</td></tr>
<tr><td><code>src/__tests__/beats.test.ts</code>, <code>src/__tests__/beatReducer.test.ts</code>, and <code>e2e/factory-spotcheck.spec.ts</code></td><td>Prove 144 identities, required per level assessment, pinned L3 tuples, level aware reducer identity, and one selected sequence. Existing registry expectations use two part lookups at <code>src/__tests__/beats.test.ts:111</code>.</td></tr>
<tr><td><code>src/__tests__/beatProgress.integration.test.ts</code> and <code>src/__tests__/rls.integration.test.ts</code></td><td>Apply new migrations and prove per level merge isolation, concurrency, RLS, and immutable identity. Current merge test sends four SQL parameters at <code>src/__tests__/beatProgress.integration.test.ts:32</code>.</td></tr>
<tr><td><code>src/__tests__/xp.test.ts</code>, <code>src/__tests__/xp.integration.test.ts</code>, and <code>src/__tests__/leaderboard.integration.test.ts</code></td><td>Prove same award key can exist once per level, identity only migration, timestamp preservation, unchanged pre and post ranks, and future 300 point landmark ceiling. Current XP integration assumes one 100 point identity at <code>src/__tests__/xp.integration.test.ts:103</code>.</td></tr>
<tr><td><code>src/__tests__/quiz.test.ts</code>, <code>e2e/beats.spec.ts</code>, <code>e2e/anon-session.spec.ts</code>, <code>e2e/collectibles.spec.ts</code>, and <code>e2e/xp.spec.ts</code></td><td>Add selected level grading, local v1 migration, anonymous and self host gating, deduplicated collectibles, and hosted XP flows. Current quiz test grades top level landmark.quiz at <code>src/__tests__/quiz.test.ts:9</code>.</td></tr>
</tbody>
</table>

New files required by this model are the two migrations above, a manifest v2 artifact, a server only self host sequence resolver, and focused local migration and cutover assertion tests. `db/migrations/0001_schema.sql`, `db/migrations/0009_xp.sql`, `db/migrations/0010_leaderboard.sql`, and public manifest v1 remain unchanged for history and rollback.
