import { NextResponse } from 'next/server';
import { postgresBillingDb, processWebhookEvent, WebhookSignatureError } from '@/server/billing';
import { getStripe } from '@/server/stripe';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  try {
    await processWebhookEvent(await request.text(), signature, { stripe: getStripe(), db: postgresBillingDb() });
    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof WebhookSignatureError) return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
