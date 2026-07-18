import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { getLandmark } from '@/lib/content';
import { queryAsUser } from '@/lib/db';
import { DRILL_HEADER_NAME, drillForUser } from '@/server/aiDrill';
import { runGuideTurn } from '@/server/guide';

export const dynamic = 'force-dynamic';
const schema = z.object({
  regionId: z.string().min(1).max(100),
  landmarkId: z.string().min(1).max(100),
  message: z.string().trim().min(1).max(1_000),
});

export async function POST(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body: z.infer<typeof schema>;
  try { body = schema.parse(await request.json()); } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }
  if (!getLandmark(body.regionId, body.landmarkId)) return NextResponse.json({ error: 'Landmark not found' }, { status: 404 });

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
  console.debug('[event] guide_chat_message', { userId: session.userId, regionId: body.regionId, landmarkId: body.landmarkId, escalated: turn.escalated });
  if (turn.kind === 'offline') console.debug('[event] guide_unavailable_shown', { userId: session.userId, regionId: body.regionId, landmarkId: body.landmarkId });
  return NextResponse.json({ ...turn, escalations });
}
