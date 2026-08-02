import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { withUserTransaction } from '@/lib/db';
import { LEVEL_IDS, type LevelId } from '@/content/beats/schema';
import { BEAT_PROGRESS_UPSERT_SQL, resolveProgressWrite } from '@/server/beatProgress';
import { isHostedMode } from '@/server/hosting';
import { applyXpAwards, getXpTotal } from '@/server/xp';

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
    const result = await client.query<ProgressRow>(
      `SELECT region, landmark, level, state, updated_at
       FROM progress
       WHERE profile_id = $1
       ORDER BY updated_at DESC`,
      [userId],
    );
    const total = await getXpTotal(client, userId);
    return { items: result.rows, xp: { total } };
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
  const level = readLevel(body as Record<string, unknown>);
  if (!level) {
    return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
  }

  const plan = resolveProgressWrite(
    { regionId: body.region, landmarkId: body.landmark, level },
    body.state,
  );
  if (plan.path === 'reject') {
    return NextResponse.json({ error: plan.error }, { status: plan.status });
  }

  if (!isHostedMode()) {
    return NextResponse.json({
      region: body.region,
      landmark: body.landmark,
      level,
      state: plan.path === 'beat' ? plan.state : body.state,
      updated_at: new Date().toISOString(),
      xp: { total: 0, awarded: [], newPoints: 0 },
      hosted: false,
    });
  }

  // One transaction: progress upsert + XP awards from the *merged* returned state.
  const payload = await withUserTransaction(userId, async (client) => {
    if (plan.path === 'beat') {
      const result = await client.query<ProgressRow>(BEAT_PROGRESS_UPSERT_SQL, [
        userId,
        body.region,
        body.landmark,
        level,
        JSON.stringify(plan.state),
      ]);
      const row = result.rows[0]!;
      // Awards from server-merged RETURNING state, never the incoming client payload.
      const xp = await applyXpAwards(client, userId, body.region, body.landmark, level, row.state);
      return { ...row, xp };
    }

    const result = await client.query<ProgressRow>(
      `INSERT INTO progress (profile_id, region, landmark, level, state)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       ON CONFLICT (profile_id, region, landmark, level)
       DO UPDATE SET state = EXCLUDED.state, updated_at = now()
       RETURNING region, landmark, level, state, updated_at`,
      [userId, body.region, body.landmark, level, JSON.stringify(body.state)],
    );
    const row = result.rows[0]!;
    // Legacy/non-beat path: no awards, still return current total for HUD.
    const total = await getXpTotal(client, userId);
    return {
      ...row,
      xp: { total, awarded: [] as Array<{ awardKey: string; points: number }>, newPoints: 0 },
    };
  });

  return NextResponse.json(payload);
}
