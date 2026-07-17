import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { pool } from '@/lib/db';
import { sendOtpEmail } from '@/server/email';
import {
  createOtpChallenge,
  InvalidEmailError,
  wasOtpRequestedRecently
} from '@/server/upgrade';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || typeof (body as { email?: unknown }).email !== 'string') {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  if (await wasOtpRequestedRecently(pool, session.userId)) {
    return NextResponse.json({ error: 'Please wait before requesting another code' }, { status: 429 });
  }

  try {
    const { code } = await createOtpChallenge(pool, session.userId, (body as { email: string }).email);
    await sendOtpEmail({ to: (body as { email: string }).email.trim().toLowerCase(), code });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof InvalidEmailError) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    throw error;
  }
}
