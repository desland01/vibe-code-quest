import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { queryAsUser } from '@/lib/db';
import { BEAT_PROGRESS_UPSERT_SQL, resolveProgressWrite } from '@/server/beatProgress';

export const dynamic = 'force-dynamic';

type ProgressRow = {
  region: string;
  landmark: string;
  state: Record<string, unknown>;
  updated_at: Date;
};

async function authenticatedUserId(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return (await verifySessionToken(token))?.userId ?? null;
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function isValidBody(body: unknown): body is Pick<ProgressRow, 'region' | 'landmark' | 'state'> {
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

  const result = await queryAsUser<ProgressRow>(
    userId,
    `SELECT region, landmark, state, updated_at
     FROM progress
     WHERE profile_id = $1
     ORDER BY updated_at DESC`,
    [userId]
  );
  return NextResponse.json({ items: result.rows });
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
  const plan = resolveProgressWrite(body.region, body.landmark, body.state);
  if (plan.path === 'reject') {
    return NextResponse.json({ error: plan.error }, { status: plan.status });
  }
  if (plan.path === 'beat') {
    const result = await queryAsUser<ProgressRow>(
      userId,
      BEAT_PROGRESS_UPSERT_SQL,
      [userId, body.region, body.landmark, JSON.stringify(plan.state)]
    );
    return NextResponse.json(result.rows[0]);
  }

  const result = await queryAsUser<ProgressRow>(
    userId,
    `INSERT INTO progress (profile_id, region, landmark, state)
     VALUES ($1, $2, $3, $4::jsonb)
     ON CONFLICT (profile_id, region, landmark)
     DO UPDATE SET state = EXCLUDED.state, updated_at = now()
     RETURNING region, landmark, state, updated_at`,
    [userId, body.region, body.landmark, JSON.stringify(body.state)]
  );
  return NextResponse.json(result.rows[0]);
}
