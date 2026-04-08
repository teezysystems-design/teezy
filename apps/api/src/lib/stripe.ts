import Stripe from 'stripe';

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env var: ${key}`);
  return val;
}

export function getStripe(): Stripe {
  return new Stripe(getEnv('STRIPE_SECRET_KEY'), {
    apiVersion: '2024-04-10',
    // Edge runtime compatibility
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export function getWebhookSecret(): string {
  return getEnv('STRIPE_WEBHOOK_SECRET');
}
