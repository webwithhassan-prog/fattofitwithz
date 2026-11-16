"use server";

/**
 * "Create your password" on a PAID order page (payment first, account second).
 * The order's secret key (from her link / email) proves she is the buyer; then she goes straight
 * to the set-password page. Only for accounts that have no password yet.
 */
import { redirect } from "next/navigation";
import { getOrderForPage } from "@/lib/orders.server";
import { createPasswordLink } from "@/lib/auth/passwords.server";
import { getPayloadClient } from "@/lib/payload.server";
import { clientIp, LIMITS, rateLimit } from "@/lib/rate-limit.server";

export async function setUpAccountAction(formData: FormData): Promise<void> {
  const reference = String(formData.get("reference") ?? "");
  const key = String(formData.get("key") ?? "");
  const limited = await rateLimit(LIMITS.forgotPassword, await clientIp());
  if (!limited.ok) redirect("/forgot-password");

  const order = await getOrderForPage(reference, key, null);
  const memberRef = order?.member;
  const memberId = memberRef && typeof memberRef === "object" ? memberRef.id : memberRef;
  if (!order || order.status !== "paid" || !memberId) redirect("/login");

  const payload = await getPayloadClient();
  const member = await payload.findByID({ collection: "members", id: memberId, depth: 0 });
  if (member.passwordHash) redirect("/login"); // already has a password: normal login

  const link = new URL(await createPasswordLink(member.id, member.email, 1, { welcome: true }));
  console.log(`[orders] ${order.reference}: account setup link opened from the order page`);
  redirect(`${link.pathname}${link.search}`); // same site, whatever address she's on
}
