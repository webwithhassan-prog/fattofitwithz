/**
 * Orders: everything that happens around a purchase (server only).
 *
 *   createPendingOrder()      checkout while card payments are off: saves the order as "Waiting for payment"
 *                             and emails her how to pay (and tells the coach a new order came in).
 *   fulfilCheckout()          Stripe webhook: saves the order as "Paid".
 *   markRefunded()            Stripe webhook: marks the order "Refunded".
 *
 * Called by the Orders hook (src/payload/collections/Orders.ts) when an order's status changes:
 *   activatePaidOrder()       PAID: starts her program (a membership; renewals start after the current one
 *                             ends) and emails her a welcome message (+ the e-book link if she bought it).
 *   cancelOrderMemberships()  REFUNDED / CANCELLED: stops the program that came from this order.
 *
 * So the same thing happens whether Stripe confirms a payment or the coach sets an order to "Paid".
 * Stripe may deliver the same event twice: the order's stripeSessionId is unique, so nothing is duplicated.
 */
import "server-only";
import { timingSafeEqual } from "node:crypto";
import type Stripe from "stripe";
import type { PayloadRequest } from "payload";
import type { Order } from "@/payload-types";
import { getPayloadClient } from "./payload.server";
import { sendEmail } from "./email.server";
import { absoluteUrl } from "./site";
import { formatOrderAmount, fromStripeAmount, isRegionCode } from "./pricing";
import type { RegionCode } from "./types";
import { getAllEbooks, getPaymentSettings, getSettings, whatsappLink } from "./content";
import type { EbookOffer } from "./types";
import { addDays, dayOf, todayIso } from "./freeze";
import { ACCOUNT_SETUP_LINK_HOURS, createPasswordLink } from "./auth/passwords.server";

const idOf = (ref: number | { id: number } | null | undefined) => (ref && typeof ref === "object" ? ref.id : (ref ?? null));

function addMonths(day: string, months: number): string {
  const date = new Date(`${day}T12:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString();
}

/** Lines about the e-book for the emails. */
async function ebookLines(order: Order): Promise<string[]> {
  return (await orderEbooks(order)).map((ebook) =>
    ebook.driveLink ? `Your e-book "${ebook.title}": ${ebook.driveLink}` : `Your e-book "${ebook.title}": we'll send you the link on WhatsApp shortly.`,
  );
}

/** The e-books in an order. Older orders only have the "Includes e-books" tick: that was the first e-book. */
export async function orderEbooks(order: Pick<Order, "ebook" | "ebooks">): Promise<EbookOffer[]> {
  const all = await getAllEbooks();
  const ids = (order.ebooks ?? []).map((e) => (typeof e === "object" ? e.id : e));
  if (ids.length) return all.filter((e) => ids.includes(e.id));
  return order.ebook && all[0] ? [all[0]] : [];
}

/** Her order page (payment details / status), e.g. https://fattofitwithz.com/checkout/pay/FTF-7K2Q9M?key=... */
export const orderPageUrl = (order: Pick<Order, "reference" | "accessKey">) =>
  absoluteUrl(`/checkout/pay/${order.reference}?key=${encodeURIComponent(order.accessKey ?? "")}`);

// ---------- status changes (called by the Orders hook) ----------

export async function activatePaidOrder(order: Order, req: PayloadRequest): Promise<void> {
  const { payload } = req;
  let memberId = idOf(order.member);
  const programId = idOf(order.program);

  // 0. A program needs an account: find hers by email, or make one (no password yet), e.g. for an order added by hand.
  if (programId && !memberId) {
    const found = (await payload.find({ collection: "members", where: { email: { equals: order.email } }, limit: 1, depth: 0, req })).docs[0];
    const member = found ?? (await payload.create({ collection: "members", data: { email: order.email, fullName: order.buyerName ?? "", phone: order.phone ?? "" }, req }));
    memberId = member.id;
    await payload.update({ collection: "orders", id: order.id, data: { member: memberId }, req });
  }

  // 1. Her program (only once per order)
  if (programId && memberId && order.months) {
    const already = await payload.count({ collection: "memberships", where: { order: { equals: order.id } }, req });
    if (already.totalDocs === 0) {
      const today = todayIso();
      const latest = await payload.find({
        collection: "memberships",
        where: { and: [{ member: { equals: memberId } }, { status: { not_equals: "cancelled" } }] },
        sort: "-endDate",
        limit: 1,
        depth: 0,
        req,
      });
      const latestEnd = latest.docs[0] ? dayOf(latest.docs[0].endDate) : null;
      // Renewal: starts the day after her current program ends, so the two don't overlap.
      const startDay = latestEnd && latestEnd >= today ? dayOf(addDays(latestEnd, 1)) : today;
      await payload.create({
        collection: "memberships",
        data: { member: memberId, program: programId, order: order.id, startDate: addDays(startDay, 0), endDate: addMonths(startDay, order.months), status: "active" },
        req,
      });
      console.log(`[orders] ${order.reference ?? order.id}: program started for member ${memberId}`);
    }
  }

  // 2. Welcome email (a failure here must not undo the payment, so it's only logged)
  try {
    const greeting = order.buyerName ? `Hi ${order.buyerName.split(" ")[0]},` : "Hi,";
    if (programId && memberId) {
      // Paid first, so she may not have a password yet: then step 1 is a link to create one.
      const member = await payload.findByID({ collection: "members", id: memberId, depth: 0, req });
      const firstStep = member.passwordHash
        ? [`1. Log in to your member area: ${absoluteUrl("/login")}`, '   (Forgot your password? Use "Forgot password" on the login page.)']
        : [
            `1. Create your password to open your member area (the link works for ${ACCOUNT_SETUP_LINK_HOURS / 24} days):`,
            `   ${await createPasswordLink(memberId, member.email, ACCOUNT_SETUP_LINK_HOURS, { welcome: true, req })}`,
          ];
      await sendEmail({
        to: order.email,
        subject: "Welcome to Fat To Fit With Z: your program has started",
        text: [
          greeting,
          "",
          `Thank you! Your payment for ${order.orderLabel ?? "your program"} is confirmed${order.reference ? ` (order ${order.reference})` : ""}.`,
          "",
          "What happens next:",
          ...firstStep,
          `2. Fill in your Personal Wellness Profile: ${absoluteUrl("/dashboard/first-day")}`,
          "3. Your coach prepares your personalized diet plan and sends it to you on WhatsApp.",
          ...(order.ebook ? ["", ...(await ebookLines(order))] : []),
          "",
          "Questions? Reply to this email or message us on WhatsApp.",
        ].join("\n"),
      });
    } else if (order.ebook) {
      await sendEmail({
        to: order.email,
        subject: "Your e-book from Fat To Fit With Z",
        text: [greeting, "", "Thank you for your purchase!", "", ...(await ebookLines(order)), "", "Questions? Reply to this email or message us on WhatsApp."].join("\n"),
      });
    }
  } catch (error) {
    console.error(`[orders] ${order.reference ?? order.id} is paid, but the welcome email failed:`, error);
  }
}

export async function cancelOrderMemberships(order: Order, req: PayloadRequest): Promise<void> {
  const { docs } = await req.payload.find({ collection: "memberships", where: { order: { equals: order.id } }, limit: 10, depth: 0, req });
  for (const m of docs) {
    if (m.status === "cancelled") continue;
    const note = `Cancelled automatically: order ${order.reference ?? order.id} was marked ${order.status} on ${todayIso()}.`;
    await req.payload.update({ collection: "memberships", id: m.id, data: { status: "cancelled", notes: m.notes ? `${m.notes}\n${note}` : note }, req });
  }
  console.log(`[orders] ${order.reference ?? order.id}: ${docs.length} membership(s) cancelled (${order.status})`);
}

// ---------- checkout without card payments ----------

export type PendingOrderInput = {
  memberId?: number;
  buyerName: string;
  email: string;
  phone: string;
  programId?: number;
  months?: number;
  /** ids of the e-books bought (admin > Website > E-books) */
  ebookIds: number[];
  amount: number;
  currency: string;
  region: RegionCode;
  country: string;
};

/**
 * Saves the order as "Waiting for payment" and emails her the payment steps.
 * If she already has the same unpaid order from the last 7 days, that one is reused (no duplicates
 * when she presses the button twice or comes back later).
 */
export async function createPendingOrder(input: PendingOrderInput): Promise<Order> {
  const payload = await getPayloadClient();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const same = await payload.find({
    collection: "orders",
    where: {
      and: [
        { status: { equals: "pending" } },
        { email: { equals: input.email } },
        { createdAt: { greater_than_equal: since } },
        input.programId ? { program: { equals: input.programId } } : { program: { exists: false } },
      ],
    },
    sort: "-createdAt",
    limit: 10,
    depth: 0,
  });
  const sameEbooks = (o: Order) =>
    (o.ebooks ?? []).map((e) => (typeof e === "object" ? e.id : e)).sort().join(",") === [...input.ebookIds].sort().join(",");

  const data = {
    status: "pending" as const,
    paymentMethod: input.country === "PK" ? ("bank-transfer" as const) : ("whatsapp" as const),
    member: input.memberId,
    buyerName: input.buyerName,
    email: input.email,
    phone: input.phone,
    program: input.programId,
    months: input.programId ? input.months : undefined,
    ebook: input.ebookIds.length > 0,
    ebooks: input.ebookIds,
    amount: input.amount,
    currency: input.currency,
    region: input.region,
    country: input.country,
  };
  const existing = same.docs.find((o) => sameEbooks(o) && (o.months ?? null) === (data.months ?? null));
  if (existing) {
    // Same order again: keep its number, refresh the price (exchange rates change) and her details.
    return payload.update({ collection: "orders", id: existing.id, data });
  }
  const order = await payload.create({ collection: "orders", data });
  console.log(`[orders] ${order.reference}: new order waiting for payment (${order.orderLabel}, ${order.currency} ${order.amount})`);
  await emailPaymentSteps(order).catch((error) => console.error(`[orders] ${order.reference}: payment email failed:`, error));
  return order;
}

/** "Hi! I've placed order FTF-7K2Q9M ..." - the WhatsApp message she sends with her payment screenshot. */
export function paymentWhatsappMessage(order: Order, inPakistan: boolean): string {
  const total = formatOrderAmount(order.amount, order.currency);
  return inPakistan
    ? `Hi! I've paid for order ${order.reference} (${order.orderLabel}, ${total}). Name: ${order.buyerName}. Here is my payment screenshot:`
    : `Hi! I'd like to pay for order ${order.reference} (${order.orderLabel}, ${total}). Name: ${order.buyerName}. How can I pay?`;
}

async function emailPaymentSteps(order: Order): Promise<void> {
  const [payments, settings] = await Promise.all([getPaymentSettings(), getSettings()]);
  const inPakistan = order.country === "PK";
  const total = formatOrderAmount(order.amount, order.currency);
  const chat = await whatsappLink(paymentWhatsappMessage(order, inPakistan));
  const { bank, wallet } = payments;

  const howToPay = inPakistan
    ? [
        ...(bank.enabled
          ? ["Bank transfer:", `  Bank: ${bank.bankName}`, `  Account title: ${bank.accountTitle}`, `  Account number: ${bank.accountNumber}`, `  IBAN: ${bank.iban}`, ...(bank.branch ? [`  Branch code: ${bank.branch}`] : []), ""]
          : []),
        ...(wallet.enabled ? [`JazzCash / Easypaisa: ${wallet.number}${wallet.accountName ? ` (${wallet.accountName})` : ""}`, ""] : []),
        payments.instructions,
        "",
        `Send your payment screenshot on WhatsApp: ${chat}`,
      ]
    : [payments.otherCountriesText, "", `Continue on WhatsApp: ${chat}`];

  await sendEmail({
    to: order.email,
    subject: `Your order ${order.reference}: how to pay`,
    text: [
      `Hi ${order.buyerName?.split(" ")[0] || "there"},`,
      "",
      `Thank you for your order: ${order.orderLabel}.`,
      `Total: ${total}`,
      `Order number: ${order.reference}${inPakistan ? " (write it in the payment reference)" : ""}`,
      "",
      ...howToPay,
      "",
      `Your order page: ${orderPageUrl(order)}`,
    ].join("\n"),
  });

  // Let the coach know a payment is coming
  await sendEmail({
    to: settings.contact.publicEmail,
    subject: `New order ${order.reference} waiting for payment: ${order.buyerName}`,
    text: [
      `${order.buyerName} placed an order on the website.`,
      "",
      `Order: ${order.orderLabel}`,
      `Total: ${total}`,
      `Order number: ${order.reference}`,
      `Email: ${order.email}`,
      `WhatsApp: ${order.phone}`,
      `Country: ${order.country}`,
      "",
      `When the money arrives, set the order to "Paid": ${absoluteUrl(`/admin/collections/orders/${order.id}`)}`,
    ].join("\n"),
    replyTo: order.email,
  });
}

// ---------- Stripe (used when card payments are on) ----------

type FulfilResult = { status: "created"; memberId: number | null; orderId: number } | { status: "already-done" } | { status: "skipped"; reason: string };

/** A paid Stripe Checkout session -> a "Paid" order (the Orders hook then starts her program and emails her). */
export async function fulfilCheckout(session: Stripe.Checkout.Session): Promise<FulfilResult> {
  if (session.payment_status !== "paid") return { status: "skipped", reason: `payment_status is "${session.payment_status}"` };
  const email = session.customer_details?.email?.trim().toLowerCase();
  const { programSlug, months: monthsText, region, country, ebooks: ebookSlugs, memberId: memberIdText } = session.metadata ?? {};
  const months = Number(monthsText);
  const slugs = (ebookSlugs ?? "").split(",").filter(Boolean);
  const ebookIds = (await getAllEbooks()).filter((e) => slugs.includes(e.slug)).map((e) => e.id);
  const boughtEbook = ebookIds.length > 0;
  const isProgramOrder = Boolean(programSlug);
  if (!email) return { status: "skipped", reason: "no email in the session" };
  if (isProgramOrder && !months) return { status: "skipped", reason: "program order without months" };
  if (!isProgramOrder && !boughtEbook) return { status: "skipped", reason: "nothing was bought (no program, no e-book)" };

  const payload = await getPayloadClient();
  const existingOrder = await payload.find({ collection: "orders", where: { stripeSessionId: { equals: session.id } }, limit: 1, depth: 0 });
  if (existingOrder.docs[0]) return { status: "already-done" };

  let program = null;
  if (isProgramOrder) {
    program = (await payload.find({ collection: "programs", where: { slug: { equals: programSlug } }, limit: 1, depth: 0 })).docs[0];
    if (!program) throw new Error(`[orders] Paid session ${session.id} is for unknown program "${programSlug}"`);
  }

  // Member: the account made at checkout (memberId), else the one with this email.
  // Program buyers always get an account; e-book buyers only if they already have one.
  let member = null;
  if (Number(memberIdText)) member = await payload.findByID({ collection: "members", id: Number(memberIdText), depth: 0 }).catch(() => null);
  member ??= (await payload.find({ collection: "members", where: { email: { equals: email } }, limit: 1, depth: 0 })).docs[0] ?? null;
  if (!member && isProgramOrder) {
    member = await payload.create({ collection: "members", data: { email, fullName: session.customer_details?.name ?? "", phone: session.customer_details?.phone ?? "" } });
  }

  try {
    const order = await payload.create({
      collection: "orders",
      data: {
        status: "paid",
        paymentMethod: "stripe",
        email,
        buyerName: session.customer_details?.name ?? member?.fullName ?? "",
        phone: member?.phone ?? session.customer_details?.phone ?? "",
        member: member?.id,
        program: program?.id,
        months: isProgramOrder ? months : undefined,
        ebook: boughtEbook,
        ebooks: ebookIds,
        amount: fromStripeAmount(session.amount_total ?? 0, session.currency ?? "usd"),
        currency: (session.currency ?? "").toUpperCase(),
        region: isRegionCode(region) ? region : undefined,
        country: country || undefined,
        stripeSessionId: session.id,
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
      },
    });
    return { status: "created", memberId: member?.id ?? null, orderId: order.id };
  } catch (error) {
    // Two deliveries at the same moment: the unique stripeSessionId stopped the second one.
    const raced = await payload.find({ collection: "orders", where: { stripeSessionId: { equals: session.id } }, limit: 1, depth: 0 });
    if (raced.docs[0]) return { status: "already-done" };
    throw error;
  }
}

/** A payment was refunded in Stripe: mark the order refunded (the Orders hook stops her program). */
export async function markRefunded(paymentIntentId: string): Promise<{ updated: number }> {
  const payload = await getPayloadClient();
  const orders = await payload.find({ collection: "orders", where: { stripePaymentIntentId: { equals: paymentIntentId } }, limit: 5, depth: 0 });
  for (const order of orders.docs) await payload.update({ collection: "orders", id: order.id, data: { status: "refunded" } });
  return { updated: orders.docs.length };
}

// ---------- her order page ----------

/**
 * The order for /checkout/pay/[reference]: only with the secret key from her link,
 * or when she is logged in to the account that placed it. Otherwise null (the page shows a 404).
 */
export async function getOrderForPage(reference: string, key: string | undefined, viewerMemberId: number | null): Promise<Order | null> {
  if (!/^FTF-[A-Z0-9]{6}$/.test(reference)) return null;
  const payload = await getPayloadClient();
  const order = (await payload.find({ collection: "orders", where: { reference: { equals: reference } }, limit: 1, depth: 0 })).docs[0];
  if (!order) return null;
  const keyOk = Boolean(key && order.accessKey && key.length === order.accessKey.length && timingSafeEqual(Buffer.from(key), Buffer.from(order.accessKey)));
  const ownerOk = viewerMemberId !== null && idOf(order.member) === viewerMemberId;
  return keyOk || ownerOk ? order : null;
}

/** Her newest unpaid order (last 30 days), for the reminder on her dashboard. */
export async function getPendingOrderForMember(memberId: number): Promise<Order | null> {
  const payload = await getPayloadClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { docs } = await payload.find({
    collection: "orders",
    where: { and: [{ member: { equals: memberId } }, { status: { equals: "pending" } }, { createdAt: { greater_than_equal: since } }] },
    sort: "-createdAt",
    limit: 1,
    depth: 0,
  });
  return docs[0] ?? null;
}
