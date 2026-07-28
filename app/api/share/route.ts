import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { createSnapshot, revokeSnapshot } from '@/server/share';
import { isHostedMode } from '@/server/hosting';

export const dynamic = 'force-dynamic';

function validToken(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{22,128}$/.test(value);
}

export async function POST(request: Request) {
  if (!isHostedMode()) {
    return NextResponse.json({ error: 'Share links need a hosted database.' }, { status: 503 });
  }
  const sessionToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = sessionToken ? await verifySessionToken(sessionToken) : null;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  if (input.action === 'create') {
    const { token } = await createSnapshot(session.userId);
    return NextResponse.json({ token, url: new URL(`/s/${token}`, request.url).toString() });
  }
  if (input.action === 'revoke' && validToken(input.token)) {
    const revoked = await revokeSnapshot(session.userId, input.token);
    return revoked
      ? NextResponse.json({ revoked: true })
      : NextResponse.json({ error: 'Share not found' }, { status: 404 });
  }
  return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
}
