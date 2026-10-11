/**
 * What happens after a successful Stripe payment (called by the Stripe webhook).
 *
 *   1. find the member by email, or create her
 *   2. save the order          (admin > Shop > Orders)
 *   3. create the membership   (admin > Members > Memberships), start today or right after
 *      her current membership ends (renewals don't overlap)
 *   4. email her a welcome message (with a "set your password" link if she has no password yet)
 *
 * Stripe may deliver the same event more than once, even at the same moment. The order's
 * stripeSessionId is unique in the database, so a repeat is detected and nothing is duplicated.
 */
import "server-only";
import type Stripe from "stripe";
import { getPayloadClient } from "./payload.server";
import { sendEmail } from "./email.server";
import { absoluteUrl } from "./site";
import { isRegionCode } from "./pricing";
import { createPasswordLink } from "./auth/passwords.server";

type FulfilResult =
  | { status: "created"; memberId: number; orderId: number }
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

export async function fulfilCheckout(session: Stripe.Checkout.Session): Promise<FulfilResult> {
  if (session.payment_status !== "paid") {
    return { status: "skipped", reason: `payment_status is "${session.payment_status}"` };
  }
  const email = session.customer_details?.email?.trim().toLowerCase();
  const { programSlug, months: monthsText, region } = session.metadata ?? {};
  const months = Number(monthsText);
  if (!email || !programSlug || !months) {
    return { status: "skipped", reason: "missing email, programSlug or months in the session" };
  }

  const payload = await getPayloadClient();

  // Already handled? (Stripe retry or duplicate delivery)
  const existingOrder = await payload.find({ collection: "orders", where: { stripeSessionId: { equals: session.id } }, limit: 1, depth: 0 });
  if (existingOrder.docs[0]) return { status: "already-done" };

  const programs = await payload.find({ collection: "programs", where: { slug: { equals: programSlug } }, limit: 1, depth: 0 });
  const program = programs.docs[0];
  if (!program) throw new Error(`[orders] Paid session ${session.id} is for unknown program "${programSlug}"`);

  // 1. Member
  const found = await payload.find({ collection: "members", where: { email: { equals: email } }, limit: 1, depth: 0 });
  const member =
    found.docs[0] ??
    (await payload.create({
      collection: "members",
      data: { email, fullName: session.customer_details?.name ?? "", phone: session.customer_details?.phone ?? "" },
    }));

  // 2. Order (the unique stripeSessionId stops a duplicate if two deliveries race each other)
  let order;
  try {
    order = await payload.create({
      collection: "orders",
      data: {
        email,
        member: member.id,
        program: program.id,
        months,
        amount: (session.amount_total ?? 0) / 100,
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

  // 3. Membership: starts today, or the day after her latest membership ends (renewal).
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

  // 4. Welcome email (a failure here must not undo the order, so it's only logged)
  try {
    const loginSteps = member.passwordHash
      ? [`2. Log in to your member dashboard with your email and password: ${absoluteUrl("/login")}`]
      : [
          "2. Create your password for the member dashboard (this link works for 7 days):",
          `   ${await createPasswordLink(member.id, email, 7 * 24)}`,
          `   After that, log in any time at ${absoluteUrl("/login")}`,
        ];
    await sendEmail({
      to: email,
      subject: "Welcome to Fat To Fit With Z",
      text: [
        `Thank you for joining the ${program.name} (${months} month${months > 1 ? "s" : ""})!`,
        "",
        "What happens next:",
        "1. Your coach will contact you on WhatsApp within 24 hours to learn about your goals, routine,",
        "   food preferences and any health conditions, so your personalized plan can be prepared.",
        ...loginSteps,
        "",
        "Questions? Reply to this email or message us on WhatsApp.",
      ].join("\n"),
    });
  } catch (error) {
    console.error("[orders] Order saved, but the welcome email failed:", error);
  }

  return { status: "created", memberId: member.id, orderId: order.id };
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
