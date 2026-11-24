"use server";

/**
 * Server actions for buying. PAYMENT FIRST: she only types her name, email and WhatsApp number;
 * no password. Her password comes later, from the link in her welcome email (or her dashboard).
 *   checkoutAction  /checkout  program (+ optional e-book).
 *                   New email -> an account without a password is made and she's logged in on this device.
 *                   Email that already has an account -> the order is linked to it (she isn't logged in;
 *                   only that account's owner can log in to it).
 *   buyEbookAction  /ebook     e-book only (no account needed).
 *
 * Then, depending on paymentMode() (src/lib/checkout.server.ts):
 *   manual  the order is saved as "Waiting for payment" and she goes to her order page
 *           (/checkout/pay/FTF-...): bank / JazzCash / Easypaisa in Pakistan, WhatsApp elsewhere.
 *   stripe  she goes to Stripe's secure card payment page.
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createCheckoutSession, memberHasProgram, paymentMode, priceBasket, type Basket } from "@/lib/checkout.server";
import { createPendingOrder } from "@/lib/orders.server";
import { getPayloadClient } from "@/lib/payload.server";
import { getCurrentMember, startSession } from "@/lib/auth/session.server";
import { normalizeEmail } from "@/lib/auth/passwords.server";
import { clientIp, LIMITS, rateLimit } from "@/lib/rate-limit.server";
import { countEvent } from "@/lib/stats.server";
import { withCountryCode } from "@/lib/phone";

export type CheckoutFormState = { error?: string; loginLink?: string; values?: Record<string, string> };

/** The site's address as the visitor sees it (works on localhost, Netlify and the real domain). */
async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const phoneRule = z.string().trim().min(7, "Please enter your WhatsApp number").max(30);
const Buyer = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.email("Please enter a valid email address"),
  phone: phoneRule,
});

type Buyer = { memberId?: number; buyerName: string; email: string; phone: string };

/** Saves the order as "Waiting for payment" and returns her order page address. */
async function placePendingOrder(basket: Basket, buyer: Buyer): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  try {
    const order = await createPendingOrder({
      ...buyer,
      programId: basket.program?.id,
      months: basket.months,
      ebookIds: basket.ebooks.map((e) => e.id),
      amount: basket.total,
      currency: basket.market.currency,
      region: basket.market.region.code,
      country: basket.market.country,
    });
    countEvent("checkout-started"); // "Checkouts started" on the admin dashboard
    return { ok: true, path: `/checkout/pay/${order.reference}?key=${encodeURIComponent(order.accessKey ?? "")}` };
  } catch (error) {
    console.error("[checkout] Could not save the order:", error);
    return { ok: false, error: "We couldn't save your order. Please try again, or message us on WhatsApp." };
  }
}

export async function checkoutAction(_previous: CheckoutFormState, formData: FormData): Promise<CheckoutFormState> {
  const get = (name: string) => String(formData.get(name) ?? "").trim();
  const programSlug = get("program");
  const months = Number(get("months"));
  // The e-books she ticked (checkboxes named "ebooks", one per e-book)
  const ebooks = formData.getAll("ebooks").map(String).filter(Boolean);
  const checkoutPath = `/checkout?program=${encodeURIComponent(programSlug)}&months=${months}&ebooks=${encodeURIComponent(ebooks.join(","))}`;
  // Typed values are sent back on an error, so she doesn't have to type them again (never the password).
  const values = { fullName: get("fullName"), email: get("email"), phone: get("phone") };

  const limited = await rateLimit(LIMITS.checkout, await clientIp());
  if (!limited.ok) return { error: limited.message, values };

  // Price first: nothing is saved if the basket isn't valid.
  const priced = await priceBasket({ programSlug, months, ebooks, country: get("country") });
  if (!priced.ok) return { error: priced.error, values };

  // Her WhatsApp number with the country code added (from her country), so the coach's WhatsApp button works
  const phoneWithCode = withCountryCode(values.phone, priced.basket.market.country);
  let member = await getCurrentMember();
  let buyerName = member?.fullName || values.fullName;
  try {
    const payload = await getPayloadClient();
    if (member) {
      // Logged in: only the WhatsApp number can change here.
      const phone = phoneRule.safeParse(phoneWithCode);
      if (!phone.success) return { error: phone.error.issues[0].message, values };
      if (phone.data !== member.phone) member = await payload.update({ collection: "members", id: member.id, data: { phone: phone.data } });
    } else {
      const parsed = Buyer.safeParse(values);
      if (!parsed.success) return { error: parsed.error.issues[0].message, values };
      const email = normalizeEmail(parsed.data.email);
      buyerName = parsed.data.fullName;
      const existing = (await payload.find({ collection: "members", where: { email: { equals: email } }, limit: 1, depth: 0 })).docs[0];
      if (existing) {
        // She already has an account: the order goes to it. (Not logged in: that needs her password.)
        member = existing.phone ? existing : await payload.update({ collection: "members", id: existing.id, data: { phone: phoneWithCode } });
      } else {
        // New: an account without a password, and she's logged in on this device straight away.
        member = await payload.create({ collection: "members", data: { email, fullName: parsed.data.fullName, phone: phoneWithCode } });
        await startSession(member.id);
      }
    }
  } catch (error) {
    console.error("[checkout] Could not prepare the account:", error);
    return { error: "Something went wrong. Please try again in a minute.", values };
  }

  if ((await paymentMode()) === "stripe") {
    const result = await createCheckoutSession({
      basket: priced.basket,
      email: member.email,
      memberId: member.id,
      origin: await siteOrigin(),
      cancelPath: `${checkoutPath}&cancelled=1`,
    });
    if (!result.ok) return { error: result.error, values };
    redirect(result.url); // outside try/catch: redirect() works by throwing
  }

  const placed = await placePendingOrder(priced.basket, {
    memberId: member.id,
    buyerName,
    email: member.email,
    phone: phoneWithCode || member.phone || "",
  });
  if (!placed.ok) return { error: placed.error, values };
  redirect(placed.path);
}

export async function buyEbookAction(_previous: CheckoutFormState, formData: FormData): Promise<CheckoutFormState> {
  const get = (name: string) => String(formData.get(name) ?? "").trim();
  const values = { fullName: get("fullName"), email: get("email"), phone: get("phone") };
  const limited = await rateLimit(LIMITS.checkout, await clientIp());
  if (!limited.ok) return { error: limited.message, values };

  const ebooks = formData.getAll("ebooks").map(String).filter(Boolean);
  if (!ebooks.length) return { error: "Please choose at least one e-book.", values };
  const member = await getCurrentMember(); // optional: logged-in buyers are linked to their account

  if ((await paymentMode()) === "stripe") {
    // Clients who already have a program pay the lower e-book price
    const priced = await priceBasket({ ebooks, country: get("country"), memberPrice: await memberHasProgram(member?.id) });
    if (!priced.ok) return { error: priced.error, values };
    const result = await createCheckoutSession({ basket: priced.basket, email: member?.email, memberId: member?.id, origin: await siteOrigin(), cancelPath: "/ebook?cancelled=1" });
    if (!result.ok) return { error: result.error, values };
    redirect(result.url);
  }

  // No account needed: name, email and WhatsApp number are enough to send her the e-book later.
  const parsed = Buyer.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0].message, values };
  const email = normalizeEmail(parsed.data.email);
  let memberId = member?.id;
  if (!memberId) {
    const payload = await getPayloadClient();
    memberId = (await payload.find({ collection: "members", where: { email: { equals: email } }, limit: 1, depth: 0 })).docs[0]?.id;
  }
  // Clients who already have a program pay the lower e-book price
  const priced = await priceBasket({ ebooks, country: get("country"), memberPrice: await memberHasProgram(memberId) });
  if (!priced.ok) return { error: priced.error, values };
  const placed = await placePendingOrder(priced.basket, { memberId, buyerName: parsed.data.fullName, email, phone: withCountryCode(parsed.data.phone, priced.basket.market.country) });
  if (!placed.ok) return { error: placed.error, values };
  redirect(placed.path);
}
