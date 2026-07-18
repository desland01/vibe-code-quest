import 'server-only';

import Stripe from 'stripe';

let client: Stripe | undefined;

export function getStripe(): Stripe {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error('Stripe not configured');
  client ??= new Stripe(secret);
  return client;
}
