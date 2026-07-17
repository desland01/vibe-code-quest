import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  issueSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  verifySessionToken
} from '@/lib/auth/session';
import { withUserTransaction } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const existingSession = existingToken ? await verifySessionToken(existingToken) : null;
  const userId = existingSession?.userId ?? crypto.randomUUID();

  await withUserTransaction(userId, (client) =>
    client.query('INSERT INTO profiles (id) VALUES ($1) ON CONFLICT (id) DO NOTHING', [userId])
  );

  const response = NextResponse.json({ userId });
  if (!existingSession) {
    response.cookies.set(SESSION_COOKIE_NAME, await issueSessionToken(userId), sessionCookieOptions);
  }

  return response;
}
