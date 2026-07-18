import { NextResponse } from 'next/server';
import { postgresBillingDb, processWebhookEvent } from '@/server/billing';
import { getStripe } from '@/server/stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  try {
    await processWebhookEvent(await request.text(), signature, { stripe: getStripe(), db: postgresBillingDb() });
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 });
  }
}
