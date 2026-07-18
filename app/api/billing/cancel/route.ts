import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/session';
import { cancelSubscription, postgresBillingDb } from '@/server/billing';
import { getStripe } from '@/server/stripe';

export async function POST() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    await cancelSubscription({ userId: session.userId, deps: { stripe: getStripe(), db: postgresBillingDb() } });
    return NextResponse.json({ cancelAtPeriodEnd: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Billing request failed';
    return NextResponse.json({ error: message === 'Stripe not configured' ? 'billing not configured' : message }, { status: message === 'Stripe not configured' ? 503 : 409 });
  }
}
