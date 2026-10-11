/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session for one program and returns its URL.
 *
 * Body: { programSlug: "fat-loss", months: 4, region: "pakistan" }
 * The PRICE IS CALCULATED HERE on the server from admin > Pricing -
 * never trust an amount sent by the browser.
 */
import { z } from "zod";
import { getPriceTable, getProgram, getRegions } from "@/lib/content";
import { getPrice, isRegionCode } from "@/lib/pricing";
import { getStripe, StripeNotConfiguredError } from "@/lib/stripe.server";
import { countEvent } from "@/lib/stats.server";

const CheckoutRequest = z.object({
  programSlug: z.string().min(1),
  months: z.number().int().positive(),
  region: z.string().refine(isRegionCode, "Unknown region"),
});

export async function POST(request: Request) {
  // 1. Validate the request body
  const parsed = CheckoutRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid checkout request", details: parsed.error.issues }, { status: 400 });
  }
  const { programSlug, months, region: regionCode } = parsed.data;

  // 2. Look up the program, duration and price
  const program = await getProgram(programSlug);
  if (!program) return Response.json({ error: `Unknown program "${programSlug}"` }, { status: 404 });

  const duration = program.durations.find((d) => d.months === months);
  if (!duration) {
    return Response.json({ error: `${program.name} is not offered for ${months} month(s)` }, { status: 400 });
  }

  const region = (await getRegions()).find((r) => r.code === regionCode);
  if (!region) return Response.json({ error: `Prices for "${regionCode}" are not available` }, { status: 400 });

  let price;
  try {
    price = getPrice(await getPriceTable(), region.code, months);
  } catch (error) {
    // A duration without a price for this country: fix it in admin > Pricing.
    console.error("[checkout]", error instanceof Error ? error.message : error);
    return Response.json({ error: "This option can't be bought online right now. Please contact us on WhatsApp." }, { status: 400 });
  }

  // 3. Create the Stripe Checkout Session
  try {
    const stripe = getStripe();
    const origin = new URL(request.url).origin; // works on localhost and in production

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: region.currency.toLowerCase(),
            // Stripe wants the smallest currency unit (cents, paisa...). All 8 currencies use 2 decimals.
            unit_amount: Math.round(price.amount * 100),
            product_data: {
              name: `${program.name} (${duration.label})`,
              description: program.focus,
            },
          },
        },
      ],
      customer_creation: "always",
      billing_address_collection: "auto",
      // Everything we need later to create the membership from the webhook:
      metadata: { programSlug, months: String(months), region: region.code },
      custom_text: {
        submit: {
          message:
            "By paying you agree to the Fat To Fit With Z Terms of Service and the Refund, Cancellation & Freeze Policy.",
        },
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/programs/${programSlug}?checkout=cancelled`,
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    countEvent("checkout-started"); // for "Checkouts started" on the admin dashboard
    return Response.json({ url: session.url });
  } catch (error) {
    if (error instanceof StripeNotConfiguredError) {
      console.error("[checkout]", error.message);
      return Response.json({ error: "Payments are not set up yet. Please try again later." }, { status: 503 });
    }
    console.error("[checkout] Stripe error:", error);
    return Response.json({ error: "Couldn't start checkout. Please try again." }, { status: 502 });
  }
}
