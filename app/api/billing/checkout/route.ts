import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { pool } from '@/lib/db';
import { createCheckout, postgresBillingDb, reconcileAfterCheckout, startTrial } from '@/server/billing';
import { getStripe } from '@/server/stripe';
import { recordEvent } from '@/server/events';

export const dynamic = 'force-dynamic';
const checkoutBody = z.object({ action: z.enum(['trial', 'subscribe']).default('subscribe') });

export async function GET(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await reconcileAfterCheckout({ userId: session.userId, deps: { stripe: getStripe(), db: postgresBillingDb() } });
    return NextResponse.redirect(new URL('/map?checkout=success', request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Billing request failed';
    return NextResponse.json({ error: message === 'Stripe not configured' ? 'billing not configured' : message }, { status: message === 'Stripe not configured' ? 503 : 409 });
  }
}

export async function POST(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const profile = (await pool.query<{ email: string | null }>('SELECT email FROM profiles WHERE id=$1', [session.userId])).rows[0];
  if (!profile?.email) return NextResponse.json({ error: 'Verify your email before starting billing' }, { status: 403 });
  let action = 'subscribe';
  const rawBody = await request.text();
  if (rawBody.trim()) {
    try { action = checkoutBody.parse(JSON.parse(rawBody)).action; }
    catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }
  }
  let stripe;
  try { stripe = getStripe(); } catch { return NextResponse.json({ error: 'billing not configured' }, { status: 503 }); }
  const db = postgresBillingDb();
  try {
    const entitlement = (await db.query<{ stripe_customer_id: string | null }>('SELECT stripe_customer_id FROM entitlements WHERE profile_id=$1', [session.userId])).rows[0];
    if (!entitlement?.stripe_customer_id) await startTrial({ userId: session.userId, email: profile.email, deps: { stripe, db } });
    if (action === 'trial') return NextResponse.json({ status: 'trialing' });
    recordEvent('subscribe_clicked', { source: 'paywall' });
    return NextResponse.json({ url: await createCheckout({ userId: session.userId, deps: { stripe, db, origin: new URL(request.url).origin } }) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Billing request failed';
    return NextResponse.json({ error: message }, { status: message.includes('configured') ? 503 : 409 });
  }
}
