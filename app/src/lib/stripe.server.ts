/**
 * Stripe client (server only). Uses TEST keys while the site is in test mode.
 * Get keys at https://dashboard.stripe.com/test/apikeys and put them in .env.local.
 */
import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

/** Returns the Stripe client, or throws a readable error if the key is missing. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new StripeNotConfiguredError(
      "STRIPE_SECRET_KEY is missing. Copy .env.example to .env.local and add your Stripe TEST secret key (sk_test_...).",
    );
  }
  if (!key.startsWith("sk_test_") && process.env.ALLOW_LIVE_PAYMENTS !== "true") {
    // Safety net: live keys only work when someone deliberately sets ALLOW_LIVE_PAYMENTS=true.
    throw new StripeNotConfiguredError(
      "A live Stripe key was found but ALLOW_LIVE_PAYMENTS is not 'true'. Use a sk_test_ key while in test mode.",
    );
  }
  client ??= new Stripe(key);
  return client;
}

export function isStripeTestMode(): boolean {
  return (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_");
}

export class StripeNotConfiguredError extends Error {}
