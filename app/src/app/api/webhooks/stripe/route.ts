/**
 * POST /api/webhooks/stripe
 * Stripe calls this after a payment. We verify the signature, then act on the event.
 * The real work happens in src/lib/orders.server.ts.
 *
 * Local testing:
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 *   (copy the printed whsec_... into STRIPE_WEBHOOK_SECRET in .env.local)
 *
 * If we answer with an error (status 500), Stripe retries the event later - useful when
 * the database is briefly unreachable. Handling the same event twice is safe.
 */
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe.server";
import { fulfilCheckout, markRefunded } from "@/lib/orders.server";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is missing - cannot verify events.");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // The signature is checked against the RAW body, so read it as text (not JSON).
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    console.error("[stripe-webhook] Signature check failed:", error);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      // Card payments complete immediately; some methods (bank debits) confirm later.
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        const result = await fulfilCheckout(session);
        console.info(`[stripe-webhook] ${event.type} ${session.id}:`, result);
        break;
      }
      case "checkout.session.expired":
        console.info("[stripe-webhook] Checkout abandoned:", event.data.object.id);
        break;
      case "charge.refunded": {
        const charge = event.data.object;
        const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (paymentIntentId) console.info("[stripe-webhook] Refund:", paymentIntentId, await markRefunded(paymentIntentId));
        break;
      }
      default:
        // Other events are ignored on purpose.
        break;
    }
  } catch (error) {
    console.error(`[stripe-webhook] Failed to handle ${event.type} (${event.id}) - Stripe will retry:`, error);
    return new Response("Handler failed", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
