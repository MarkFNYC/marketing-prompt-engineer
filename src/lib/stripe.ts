import Stripe from 'stripe';

// Lazy-loaded Stripe client
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }

    _stripe = new Stripe(secretKey, {
      apiVersion: '2025-01-27.acacia',
      typescript: true,
    });
  }
  return _stripe;
}

// Price IDs from environment
export function getStripePrices() {
  return {
    monthly: process.env.STRIPE_PRICE_ID_MONTHLY,
    yearly: process.env.STRIPE_PRICE_ID_YEARLY,
  };
}
