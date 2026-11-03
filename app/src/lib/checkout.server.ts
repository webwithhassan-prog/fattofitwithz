/**
 * Checkout (server only): works out the price of a basket and starts the payment.
 * Used by the /checkout page (program, optionally with the e-book) and the /ebook page (e-book only).
 *
 * Two ways to pay (paymentMode):
 *   "manual"  (now)   the order is saved as "Waiting for payment" and she sees how to pay:
 *                     bank / JazzCash / Easypaisa in Pakistan, WhatsApp everywhere else (src/lib/orders.server.ts).
 *   "stripe"  (later) Stripe's card payment page. Needs BOTH: "Card payments with Stripe" ticked in
 *                     admin > Website > Payment details, and STRIPE_SECRET_KEY in Netlify.
 *
 * PRICES ARE CALCULATED HERE from admin > Prices and the visitor's country (src/lib/pricing.ts:
 * her own price list, or the default list converted into her currency). Never trust an amount sent
 * by the browser. The page showed the same numbers because it uses the same rules and rates.
 * E-book price: "with a program" price when bought together with a program, otherwise the normal price.
 */
import "server-only";
import type Stripe from "stripe";
import { getEbook, getExchangeRates, getPaymentSettings, getPriceTable, getProgram, getRegions } from "./content";
import { isCountryCode } from "./countries";
import { getMarket, marketEbook, marketPrice, toStripeAmount, type Market } from "./pricing";
import { getStripe, StripeNotConfiguredError } from "./stripe.server";
import { countEvent } from "./stats.server";
import type { Program } from "./types";

export type PaymentMode = "stripe" | "manual";

/** Card payments only when switched on in admin AND the Stripe key is there. */
export async function paymentMode(): Promise<PaymentMode> {
  const { cardPayments } = await getPaymentSettings();
  return cardPayments && process.env.STRIPE_SECRET_KEY ? "stripe" : "manual";
}

export type BasketInput = {
  programSlug?: string;
  months?: number;
  ebook: boolean;
  /** Visitor's country, e.g. "GB" (decides the currency and price list) */
  country: string;
};

export type Basket = {
  market: Market;
  program: Program | null;
  months: number;
  ebook: boolean;
  items: { name: string; amount: number; description?: string }[];
  total: number;
};

/** The price of what she is buying, in her currency. */
export async function priceBasket(input: BasketInput): Promise<{ ok: true; basket: Basket } | { ok: false; error: string }> {
  if (!isCountryCode(input.country)) return { ok: false, error: "Please choose your country again." };
  const [regions, table, rates] = await Promise.all([getRegions(), getPriceTable(), getExchangeRates()]);
  const market = getMarket(input.country, regions, rates);
  const items: Basket["items"] = [];

  // 1. The program (optional)
  let program: Program | null = null;
  let months = 0;
  if (input.programSlug) {
    program = (await getProgram(input.programSlug)) ?? null;
    if (!program) return { ok: false, error: "This program doesn't exist any more. Please choose another one." };
    const duration = program.durations.find((d) => d.months === input.months);
    if (!duration) return { ok: false, error: `${program.name} is not offered for ${input.months} month(s).` };
    try {
      items.push({ name: `${program.name} (${duration.label})`, amount: marketPrice(market, table, duration.months).amount, description: program.focus });
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
    items.push(program ? { name: `${ebook.title} (e-book, program price)`, amount: prices.withPlan } : { name: `${ebook.title} (e-book)`, amount: prices.alone });
  }

  if (!items.length) return { ok: false, error: "Your basket is empty. Please choose a program or the e-book." };
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return { ok: true, basket: { market, program, months, ebook: input.ebook, items, total: Math.round(total * 100) / 100 } };
}

export type StripeCheckoutInput = {
  basket: Basket;
  /** Pre-fills the email on Stripe's page */
  email?: string;
  memberId?: number;
  /** e.g. https://fattofitwithz.com (used for the return links) */
  origin: string;
  /** Where Stripe's "back" link goes */
  cancelPath: string;
};

/** Opens Stripe's payment page. Everything the webhook needs later is stored in the session metadata. */
export async function createCheckoutSession(input: StripeCheckoutInput): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const { basket } = input;
  const currency = basket.market.currency;
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = basket.items.map((item) => ({
    quantity: 1,
    price_data: {
      currency: currency.toLowerCase(),
      // Stripe wants the smallest currency unit (cents, paisa...; yen has none, dinar has 3 decimals)
      unit_amount: toStripeAmount(item.amount, currency),
      product_data: { name: item.name, ...(item.description ? { description: item.description } : {}) },
    },
  }));

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: input.email,
      customer_creation: "always",
      billing_address_collection: "auto",
      metadata: {
        programSlug: basket.program?.slug ?? "",
        months: String(basket.months),
        region: basket.market.region.code,
        country: basket.market.country,
        ebook: basket.ebook ? "1" : "0",
        memberId: input.memberId ? String(input.memberId) : "",
      },
      custom_text: {
        submit: { message: "By paying you agree to the Fat To Fit With Z Terms of Service and the Refund, Cancellation & Freeze Policy." },
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
      return { ok: false, error: "Card payments are not available right now. Please message us on WhatsApp." };
    }
    console.error("[checkout] Stripe error:", error);
    return { ok: false, error: "Couldn't open the payment page. Please try again." };
  }
}
