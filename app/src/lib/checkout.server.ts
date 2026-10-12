/**
 * Creates a Stripe Checkout payment page (server only).
 * Used by the /checkout page (program, optionally with the e-book) and the /ebook page (e-book only).
 *
 * PRICES ARE CALCULATED HERE from admin > Prices and the visitor's country (src/lib/pricing.ts:
 * her own price list, or the default list converted into her currency). Never trust an amount sent
 * by the browser. The page showed the same numbers because it uses the same rules and rates.
 * E-book price: "with a program" price when bought together with a program, otherwise the normal price.
 *
 * Everything the webhook needs later is stored in the session metadata:
 *   programSlug ("" for e-book only), months, region, country, ebook ("1"/"0"), memberId ("" if unknown)
 */
import "server-only";
import type Stripe from "stripe";
import { getEbook, getExchangeRates, getPriceTable, getProgram, getRegions } from "./content";
import { isCountryCode } from "./countries";
import { getMarket, marketEbook, marketPrice, toStripeAmount } from "./pricing";
import { getStripe, StripeNotConfiguredError } from "./stripe.server";
import { countEvent } from "./stats.server";

export type CheckoutInput = {
  programSlug?: string;
  months?: number;
  ebook: boolean;
  /** Visitor's country, e.g. "GB" (decides the currency and price list) */
  country: string;
  /** Pre-fills the email on Stripe's page */
  email?: string;
  memberId?: number;
  /** e.g. https://fattofitwithz.com (used for the return links) */
  origin: string;
  /** Where Stripe's "back" link goes */
  cancelPath: string;
};

export type CheckoutResult = { ok: true; url: string } | { ok: false; error: string };

export async function createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult> {
  if (!isCountryCode(input.country)) return { ok: false, error: "Please choose your country again." };
  const [regions, table, rates] = await Promise.all([getRegions(), getPriceTable(), getExchangeRates()]);
  const market = getMarket(input.country, regions, rates);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const item = (name: string, amount: number, description?: string) =>
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: market.currency.toLowerCase(),
        // Stripe wants the smallest currency unit (cents, paisa...; yen has none, dinar has 3 decimals)
        unit_amount: toStripeAmount(amount, market.currency),
        product_data: { name, ...(description ? { description } : {}) },
      },
    });

  // 1. The program (optional)
  let months = 0;
  if (input.programSlug) {
    const program = await getProgram(input.programSlug);
    if (!program) return { ok: false, error: "This program doesn't exist any more. Please choose another one." };
    const duration = program.durations.find((d) => d.months === input.months);
    if (!duration) return { ok: false, error: `${program.name} is not offered for ${input.months} month(s).` };
    try {
      item(`${program.name} (${duration.label})`, marketPrice(market, table, duration.months).amount, program.focus);
    } catch (error) {
      console.error("[checkout] Missing price:", error instanceof Error ? error.message : error);
      return { ok: false, error: "This option can't be bought online right now. Please contact us on WhatsApp." };
    }
    months = duration.months;
  }

  // 2. The e-book (optional)
  if (input.ebook) {
    const ebook = await getEbook();
    if (!ebook.enabled) return { ok: false, error: "The e-book is not available right now." };
    const prices = marketEbook(market);
    const price = input.programSlug ? prices.withPlan : prices.alone;
    item(input.programSlug ? `${ebook.title} (e-book, program price)` : `${ebook.title} (e-book)`, price);
  }

  if (!lineItems.length) return { ok: false, error: "Your basket is empty. Please choose a program or the e-book." };

  // 3. Stripe's payment page
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: input.email,
      customer_creation: "always",
      billing_address_collection: "auto",
      metadata: {
        programSlug: input.programSlug ?? "",
        months: String(months),
        region: market.region.code,
        country: market.country,
        ebook: input.ebook ? "1" : "0",
        memberId: input.memberId ? String(input.memberId) : "",
      },
      custom_text: {
        submit: {
          message: "By paying you agree to the Fat To Fit With Z Terms of Service and the Refund, Cancellation & Freeze Policy.",
        },
      },
      success_url: `${input.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${input.origin}${input.cancelPath}`,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    countEvent("checkout-started"); // "Checkouts started" on the admin dashboard
    return { ok: true, url: session.url };
  } catch (error) {
    if (error instanceof StripeNotConfiguredError) {
      console.error("[checkout]", error.message);
      return { ok: false, error: "Payments are not set up yet. Please try again later or message us on WhatsApp." };
    }
    console.error("[checkout] Stripe error:", error);
    return { ok: false, error: "Couldn't open the payment page. Please try again." };
  }
}
