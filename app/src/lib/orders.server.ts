/**
 * What happens after a successful Stripe payment (called by the Stripe webhook).
 *
 * PROGRAM order (may include the e-book):
 *   1. find the member (memberId from checkout, else by email), or create her
 *   2. save the order          (admin > Shop > Orders)
 *   3. create the membership   (admin > Members > Memberships), start today or right after
 *      her current membership ends (renewals don't overlap)
 *   4. email her a welcome message (+ the e-book link if she bought it)
 *
 * E-BOOK ONLY order:
 *   save the order (linked to a member only if that email has an account) and email the link.
 *
 * Stripe may deliver the same event more than once, even at the same moment. The order's
 * stripeSessionId is unique in the database, so a repeat is detected and nothing is duplicated.
 */
import "server-only";
import type Stripe from "stripe";
import { getPayloadClient } from "./payload.server";
import { sendEmail } from "./email.server";
import { absoluteUrl } from "./site";
import { fromStripeAmount, isRegionCode } from "./pricing";
import { getEbook } from "./content";

type FulfilResult =
  | { status: "created"; memberId: number | null; orderId: number }
  | { status: "already-done" }
  | { status: "skipped"; reason: string };

const DAY = 24 * 60 * 60 * 1000;
const isoDay = (date: Date) => date.toISOString().slice(0, 10);
/** Dates are stored at midday UTC so they show as the same calendar day in every time zone. */
const middayUtc = (day: string) => `${day}T12:00:00.000Z`;

function addMonths(day: string, months: number): string {
  const date = new Date(middayUtc(day));
  date.setUTCMonth(date.getUTCMonth() + months);
  return isoDay(date);
}

/** Lines about the e-book for the emails. */
async function ebookLines(): Promise<string[]> {
  const ebook = await getEbook();
  return ebook.driveLink
    ? [`Your e-book "${ebook.title}": ${ebook.driveLink}`]
    : [`Your e-book "${ebook.title}": we'll send you the link on WhatsApp shortly.`];
}

export async function fulfilCheckout(session: Stripe.Checkout.Session): Promise<FulfilResult> {
  if (session.payment_status !== "paid") {
    return { status: "skipped", reason: `payment_status is "${session.payment_status}"` };
  }
  const email = session.customer_details?.email?.trim().toLowerCase();
  const { programSlug, months: monthsText, region, ebook: ebookFlag, memberId: memberIdText } = session.metadata ?? {};
  const months = Number(monthsText);
  const boughtEbook = ebookFlag === "1";
  const isProgramOrder = Boolean(programSlug);
  if (!email) return { status: "skipped", reason: "no email in the session" };
  if (isProgramOrder && !months) return { status: "skipped", reason: "program order without months" };
  if (!isProgramOrder && !boughtEbook) return { status: "skipped", reason: "nothing was bought (no program, no e-book)" };

  const payload = await getPayloadClient();

  // Already handled? (Stripe retry or duplicate delivery)
  const existingOrder = await payload.find({ collection: "orders", where: { stripeSessionId: { equals: session.id } }, limit: 1, depth: 0 });
  if (existingOrder.docs[0]) return { status: "already-done" };

  let program = null;
  if (isProgramOrder) {
    const programs = await payload.find({ collection: "programs", where: { slug: { equals: programSlug } }, limit: 1, depth: 0 });
    program = programs.docs[0];
    if (!program) throw new Error(`[orders] Paid session ${session.id} is for unknown program "${programSlug}"`);
  }

  // 1. Member: the account made at checkout (memberId), else the one with this email.
  //    Program buyers always get an account; e-book buyers only if they already have one.
  let member = null;
  if (Number(memberIdText)) {
    member = await payload.findByID({ collection: "members", id: Number(memberIdText), depth: 0 }).catch(() => null);
  }
  if (!member) {
    const found = await payload.find({ collection: "members", where: { email: { equals: email } }, limit: 1, depth: 0 });
    member = found.docs[0] ?? null;
  }
  if (!member && isProgramOrder) {
    member = await payload.create({
      collection: "members",
      data: { email, fullName: session.customer_details?.name ?? "", phone: session.customer_details?.phone ?? "" },
    });
  }

  // 2. Order (the unique stripeSessionId stops a duplicate if two deliveries race each other)
  let order;
  try {
    order = await payload.create({
      collection: "orders",
      data: {
        email,
        member: member?.id,
        program: program?.id,
        months: isProgramOrder ? months : undefined,
        ebook: boughtEbook,
        amount: fromStripeAmount(session.amount_total ?? 0, session.currency ?? "usd"),
        currency: (session.currency ?? "").toUpperCase(),
        region: isRegionCode(region) ? region : undefined,
        status: "paid",
        paymentMethod: "stripe",
        stripeSessionId: session.id,
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
      },
    });
  } catch (error) {
    const raced = await payload.find({ collection: "orders", where: { stripeSessionId: { equals: session.id } }, limit: 1, depth: 0 });
    if (raced.docs[0]) return { status: "already-done" };
    throw error;
  }

  // 3. Membership (program orders only): starts today, or the day after her latest membership ends.
  if (program && member) {
    const today = isoDay(new Date());
    const latest = await payload.find({
      collection: "memberships",
      where: { and: [{ member: { equals: member.id } }, { status: { not_equals: "cancelled" } }] },
      sort: "-endDate",
      limit: 1,
      depth: 0,
    });
    const latestEnd = latest.docs[0] ? latest.docs[0].endDate.slice(0, 10) : null;
    const startDate = latestEnd && latestEnd >= today ? isoDay(new Date(Date.parse(middayUtc(latestEnd)) + DAY)) : today;
    await payload.create({
      collection: "memberships",
      data: {
        member: member.id,
        program: program.id,
        order: order.id,
        startDate: middayUtc(startDate),
        endDate: middayUtc(addMonths(startDate, months)),
        status: "active",
      },
    });
  }

  // 4. Email (a failure here must not undo the order, so it's only logged)
  try {
    if (program) {
      await sendEmail({
        to: email,
        subject: "Welcome to Fat To Fit With Z",
        text: [
          `Thank you for joining the ${program.name} (${months} month${months > 1 ? "s" : ""})!`,
          "",
          "What happens next:",
          `1. Log in to your member area: ${absoluteUrl("/login")}`,
          '   (Forgot your password? Use "Forgot password" on the login page.)',
          `2. Fill in your first day form: ${absoluteUrl("/dashboard/first-day")}`,
          "3. Your coach prepares your personalized diet plan and sends it to you on WhatsApp.",
          ...(boughtEbook ? ["", ...(await ebookLines())] : []),
          "",
          "Questions? Reply to this email or message us on WhatsApp.",
        ].join("\n"),
      });
    } else {
      await sendEmail({
        to: email,
        subject: "Your e-book from Fat To Fit With Z",
        text: ["Thank you for your purchase!", "", ...(await ebookLines()), "", "Questions? Reply to this email or message us on WhatsApp."].join("\n"),
      });
    }
  } catch (error) {
    console.error("[orders] Order saved, but the email failed:", error);
  }

  return { status: "created", memberId: member?.id ?? null, orderId: order.id };
}

/** A payment was refunded in Stripe: mark the order refunded and cancel its membership. */
export async function markRefunded(paymentIntentId: string): Promise<{ updated: number }> {
  const payload = await getPayloadClient();
  const orders = await payload.find({ collection: "orders", where: { stripePaymentIntentId: { equals: paymentIntentId } }, limit: 5, depth: 0 });
  for (const order of orders.docs) {
    await payload.update({ collection: "orders", id: order.id, data: { status: "refunded" } });
    await payload.update({
      collection: "memberships",
      where: { order: { equals: order.id } },
      data: { status: "cancelled", notes: `Cancelled automatically: payment refunded in Stripe on ${isoDay(new Date())}.` },
    });
  }
  return { updated: orders.docs.length };
}
