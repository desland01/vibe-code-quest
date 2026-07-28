import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { getLandmark } from '@/lib/content';
import { queryAsUser } from '@/lib/db';
import { DRILL_HEADER_NAME, drillForUser } from '@/server/aiDrill';
import { GUIDE_OFFLINE_BANNER, runGuideTurn } from '@/server/guide';
import { checkAccess } from '@/server/access';
import { recordEvent } from '@/server/events';
import { isHostedMode } from '@/server/hosting';

export const dynamic = 'force-dynamic';
const schema = z.object({
  regionId: z.string().min(1).max(100),
  landmarkId: z.string().min(1).max(100),
  message: z.string().trim().min(1).max(1_000),
});

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  // L-006: guide is free within caps. Anonymous visitors are allowed; authenticated
  // callers still get the cap-aware preflight for observability, never a paywall.
  if (!session) return NextResponse.json({ allowed: true });
  const access = await checkAccess({ userId: session.userId }, 'guide');
  return NextResponse.json({ allowed: access.allowed, reason: access.reason, banner: access.banner });
}

export async function POST(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: z.infer<typeof schema>;
  try { body = schema.parse(await request.json()); } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }
  const landmark = getLandmark(body.regionId, body.landmarkId);
  if (!landmark) return NextResponse.json({ error: 'Landmark not found' }, { status: 404 });
  // L-006: no subscription 402. Usage caps are enforced atomically inside runGuideTurn
  // via reserveUsage; exhaustion degrades to the canonical offline path.
  if (!isHostedMode()) {
    return NextResponse.json({
      kind: 'offline',
      canonical: landmark.definition,
      message: landmark.definition,
      banner: GUIDE_OFFLINE_BANNER,
      escalated: false,
      reason: null,
      escalations: 0,
    });
  }

  const result = await queryAsUser<{
    escalations: number;
    persona: string | null;
    interests: unknown;
    intent: string | null;
    depth_preference: string | null;
    current_project: string | null;
  }>(session.userId, `WITH inserted AS (
      INSERT INTO guide_sessions (profile_id, region, landmark) VALUES ($1, $2, $3)
      ON CONFLICT (profile_id, region, landmark) DO NOTHING
    )
    SELECT gs.escalations, p.persona, p.interests, p.intent, p.depth_preference, p.current_project
      FROM guide_sessions gs JOIN profiles p ON p.id = gs.profile_id
      WHERE gs.profile_id = $1 AND gs.region = $2 AND gs.landmark = $3`,
  [session.userId, body.regionId, body.landmarkId]);
  const row = result.rows[0];
  if (!row) return NextResponse.json({ error: 'Guide unavailable' }, { status: 503 });
  const drill = drillForUser(request.headers.get(DRILL_HEADER_NAME), process.env.AI_DRILL_SECRET ?? '', session.userId);
  const turn = await runGuideTurn({
    userId: session.userId,
    regionId: body.regionId,
    landmarkId: body.landmarkId,
    message: body.message,
    priorEscalations: row.escalations,
    drill,
    deps: { profile: { persona: row.persona, interests: row.interests, intent: row.intent, depthPreference: row.depth_preference, currentProject: row.current_project } },
  });
  let escalations = row.escalations;
  if (turn.kind === 'ok' && turn.escalated && turn.decision) {
    const updated = await queryAsUser<{ escalations: number }>(session.userId, `UPDATE guide_sessions
      SET escalations = escalations + 1,
          decisions = decisions || jsonb_build_array($1::jsonb)
      WHERE profile_id = $2 AND region = $3 AND landmark = $4 AND escalations < 3
      RETURNING escalations`, [JSON.stringify(turn.decision), session.userId, body.regionId, body.landmarkId]);
    escalations = updated.rows[0]?.escalations ?? row.escalations;
  }
  recordEvent('guide_chat_message', {
    region: body.regionId,
    landmark: body.landmarkId,
    role: 'assistant',
    model: turn.kind === 'offline' ? 'offline' : turn.escalated ? 'advisor' : 'executor',
    fallbackReason: turn.kind === 'offline' ? 'gateway_down' : null,
  });
  if (turn.kind === 'offline') recordEvent('guide_unavailable_shown', {
    region: body.regionId,
    landmark: body.landmarkId,
    fallbackReason: 'gateway_down',
  });
  return NextResponse.json({ ...turn, escalations });
}
