import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  issueSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  verifySessionToken
} from '@/lib/auth/session';
import { pool } from '@/lib/db';
import { applyUpgrade, verifyOtpChallenge } from '@/server/upgrade';
import { isHostedMode } from '@/server/hosting';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isHostedMode()) {
    return NextResponse.json({ error: 'Saving progress by email needs a hosted database.' }, { status: 503 });
  }
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const code = body && typeof body === 'object' ? (body as { code?: unknown }).code : null;
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  }

  const verified = await verifyOtpChallenge(pool, session.userId, code);
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: 400 });
  }

  const result = await applyUpgrade(pool, session.userId, verified.email);
  const response = NextResponse.json(result);
  if (result.kind === 'merged') {
    response.cookies.set(
      SESSION_COOKIE_NAME,
      await issueSessionToken(result.userId),
      sessionCookieOptions
    );
  }
  return response;
}
