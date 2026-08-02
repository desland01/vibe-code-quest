import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { withUserTransaction } from '@/lib/db';
import { LEVEL_IDS, type LevelId } from '@/content/beats/schema';
import { availableLevels } from '@/content/beats';
import {
  BEAT_PROGRESS_UPSERT_SQL,
  LANDMARK_PROGRESS_FOR_SHARE_SQL,
  gateLevelWrite,
  resolveProgressWrite,
  type LevelProgressRow,
} from '@/server/beatProgress';
import { isHostedMode } from '@/server/hosting';
import { applyXpAwards, getXpTotal } from '@/server/xp';
import {
  BEAT_PROGRESS_UPSERT_SQL_PRE_LEVEL,
  IMPLICIT_LEVEL,
  LANDMARK_PROGRESS_FOR_SHARE_SQL_PRE_LEVEL,
  canWriteLevel,
  hasLevelColumn,
} from '@/server/levelCompatibility';

export const dynamic = 'force-dynamic';

type ProgressRow = {
  region: string;
  landmark: string;
  level: LevelId;
  state: Record<string, unknown>;
  updated_at: Date;
};

// Compatibility window (DATA_MODEL §6 step 1): a client that predates level
// identity sends no `level` and means L3 — the same thing the column DEFAULT
// says. A level that IS present must be a valid LevelId; anything else is a 400
// at the HTTP boundary rather than a silent coercion.
function readLevel(body: Record<string, unknown>): LevelId | null {
  const { level } = body;
  if (level === undefined) return 'l3';
  if (typeof level !== 'string') return null;
  return (LEVEL_IDS as readonly string[]).includes(level) ? (level as LevelId) : null;
}

async function authenticatedUserId(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return (await verifySessionToken(token))?.userId ?? null;
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function isValidBody(body: unknown): body is Pick<ProgressRow, 'region' | 'landmark' | 'state'> &
  { level?: unknown } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
  const { region, landmark, state } = body as Record<string, unknown>;
  if (
    typeof region !== 'string' ||
    region.length === 0 ||
    region.length > 64 ||
    typeof landmark !== 'string' ||
    landmark.length === 0 ||
    landmark.length > 64 ||
    !state ||
    typeof state !== 'object' ||
    Array.isArray(state)
  ) {
    return false;
  }

  try {
    return Buffer.byteLength(JSON.stringify(state), 'utf8') <= 2048;
  } catch {
    return false;
  }
}

export async function GET() {
  const userId = await authenticatedUserId();
  if (!userId) return unauthorized();

  if (!isHostedMode()) {
    return NextResponse.json({ items: [], xp: { total: 0 }, hosted: false });
  }

  const payload = await withUserTransaction(userId, async (client) => {
    // Compatibility window: before 0011 lands there is no `level` column, and
    // every existing row is the L3 run by definition.
    const levelled = await hasLevelColumn(client);
    const result = await client.query<Omit<ProgressRow, 'level'> & { level?: LevelId }>(
      levelled
        ? `SELECT region, landmark, level, state, updated_at
           FROM progress
           WHERE profile_id = $1
           ORDER BY updated_at DESC`
        : `SELECT region, landmark, state, updated_at
           FROM progress
           WHERE profile_id = $1
           ORDER BY updated_at DESC`,
      [userId],
    );
    const items = result.rows.map((row) => ({ ...row, level: row.level ?? IMPLICIT_LEVEL }));
    const total = await getXpTotal(client, userId);
    return { items, xp: { total } };
  });

  return NextResponse.json(payload);
}

export async function PUT(request: Request) {
  const userId = await authenticatedUserId();
  if (!userId) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Engagement-v2: the server registry decides the write path — never client state.kind.
  // Beat-enabled landmarks are validated + atomically merged; everything else keeps the
  // legacy whole-object upsert. A forged/omitted kind cannot bypass beat validation.
  // Step 1 (DATA_MODEL §4): reject an invalid LevelId at the HTTP boundary,
  // before any transaction is opened.
  const level = readLevel(body as Record<string, unknown>);
  if (!level) {
    return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
  }
  const ref = { regionId: body.region, landmarkId: body.landmark, level };

  if (!isHostedMode()) {
    // Self-host: the server owns sequence existence, identity, level, terminal
    // bounds and beat kinds, but cannot see browser-held prerequisites and does
    // not pretend to. Nothing durable is written.
    const localPlan = resolveProgressWrite(ref, body.state);
    if (localPlan.path === 'reject') {
      return NextResponse.json({ error: localPlan.error }, { status: localPlan.status });
    }
    return NextResponse.json({
      region: body.region,
      landmark: body.landmark,
      level,
      state: localPlan.path === 'beat' ? localPlan.state : body.state,
      updated_at: new Date().toISOString(),
      xp: { total: 0, awarded: [], newPoints: 0 },
      hosted: false,
    });
  }

  // Hosted: resolution, the prerequisite read and the write are ONE transaction.
  // Resolving before opening it — as this route used to — lets a concurrent write
  // land between the unlock check and the upsert.
  const gated = await withUserTransaction(userId, async (client) => {
    // Steps 3-4: resolve the registry entry, then read every level row for this
    // landmark with FOR SHARE so the unlock decision cannot be overtaken.
    const levelled = await hasLevelColumn(client);
    if (!canWriteLevel(level, levelled)) {
      // Pre-migration there is one row per landmark, so an L1/L2 write would
      // silently overwrite the player's L3 progress. Refuse rather than destroy.
      return {
        locked: {
          status: 423 as const,
          body: { error: 'Level locked', requestedLevel: level, highestUnlockedLevel: IMPLICIT_LEVEL },
        },
        rejected: undefined,
        payload: undefined,
      } as const;
    }

    const existing = levelled
      ? await client.query<LevelProgressRow>(LANDMARK_PROGRESS_FOR_SHARE_SQL, [
          userId,
          body.region,
          body.landmark,
        ])
      : {
          rows: (
            await client.query<{ state: unknown }>(LANDMARK_PROGRESS_FOR_SHARE_SQL_PRE_LEVEL, [
              userId,
              body.region,
              body.landmark,
            ])
          ).rows.map((row) => ({ level: IMPLICIT_LEVEL, state: row.state })),
        };

    // Steps 5-6: compute highest unlock and reject a write above it with 423.
    const gate = gateLevelWrite(level, existing.rows, availableLevels(body.region, body.landmark));
    if (!gate.ok) return { locked: gate, rejected: undefined, payload: undefined } as const;

    // Step 7: validate the state against the SELECTED sequence's bounds.
    const plan = resolveProgressWrite(ref, body.state);
    if (plan.path === 'reject') return { locked: undefined, rejected: plan, payload: undefined } as const;

    // Step 8: the four-part atomic upsert, then XP from the merged state.
    if (plan.path === 'beat') {
      const result = levelled
        ? await client.query<ProgressRow>(BEAT_PROGRESS_UPSERT_SQL, [
            userId,
            body.region,
            body.landmark,
            level,
            JSON.stringify(plan.state),
          ])
        : await client.query<Omit<ProgressRow, 'level'>>(BEAT_PROGRESS_UPSERT_SQL_PRE_LEVEL, [
            userId,
            body.region,
            body.landmark,
            JSON.stringify(plan.state),
          ]);
      const row = { level, ...result.rows[0]! };
      // Awards from server-merged RETURNING state, never the incoming client payload.
      const xp = await applyXpAwards(client, userId, body.region, body.landmark, level, row.state, levelled);
      return { locked: undefined, rejected: undefined, payload: { ...row, xp } } as const;
    }

    const result = await client.query<Omit<ProgressRow, 'level'>>(
      levelled
        ? `INSERT INTO progress (profile_id, region, landmark, level, state)
           VALUES ($1, $2, $3, $4, $5::jsonb)
           ON CONFLICT (profile_id, region, landmark, level)
           DO UPDATE SET state = EXCLUDED.state, updated_at = now()
           RETURNING region, landmark, level, state, updated_at`
        : `INSERT INTO progress (profile_id, region, landmark, state)
           VALUES ($1, $2, $3, $4::jsonb)
           ON CONFLICT (profile_id, region, landmark)
           DO UPDATE SET state = EXCLUDED.state, updated_at = now()
           RETURNING region, landmark, state, updated_at`,
      levelled
        ? [userId, body.region, body.landmark, level, JSON.stringify(body.state)]
        : [userId, body.region, body.landmark, JSON.stringify(body.state)],
    );
    const row = { level, ...result.rows[0]! };
    // Legacy/non-beat path: no awards, still return current total for HUD.
    const total = await getXpTotal(client, userId);
    return {
      locked: undefined,
      rejected: undefined,
      payload: {
        ...row,
        xp: { total, awarded: [] as Array<{ awardKey: string; points: number }>, newPoints: 0 },
      },
    } as const;
  });

  if (gated.locked) {
    return NextResponse.json(gated.locked.body, { status: gated.locked.status });
  }
  if (gated.rejected) {
    return NextResponse.json({ error: gated.rejected.error }, { status: gated.rejected.status });
  }
  return NextResponse.json(gated.payload);
}
