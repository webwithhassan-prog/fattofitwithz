"use server";

/**
 * Server actions for buying:
 *   checkoutAction  /checkout  program (+ optional e-book). Creates her account first if she is not logged in.
 *   buyEbookAction  /ebook     e-book only (no account needed; Stripe asks for the email).
 * Both end by sending the buyer to Stripe's secure payment page.
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createCheckoutSession } from "@/lib/checkout.server";
import { getPayloadClient } from "@/lib/payload.server";
import { getCurrentMember, startSession } from "@/lib/auth/session.server";
import { hashPassword } from "@/lib/auth/crypto.server";
import { MIN_PASSWORD_LENGTH, normalizeEmail } from "@/lib/auth/passwords.server";

export type CheckoutFormState = { error?: string; loginLink?: string; values?: Record<string, string> };

/** The site's address as the visitor sees it (works on localhost, Netlify and the real domain). */
async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const NewAccount = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.email("Please enter a valid email address"),
  phone: z.string().trim().min(7, "Please enter your WhatsApp number").max(30),
  password: z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters for your password`).max(128),
});

export async function checkoutAction(_previous: CheckoutFormState, formData: FormData): Promise<CheckoutFormState> {
  const get = (name: string) => String(formData.get(name) ?? "").trim();
  const programSlug = get("program");
  const months = Number(get("months"));
  const ebook = get("ebook") === "1";
  const country = get("country");
  const checkoutPath = `/checkout?program=${encodeURIComponent(programSlug)}&months=${months}&ebook=${ebook ? 1 : 0}`;
  // Typed values are sent back on an error, so she doesn't have to type them again (never the password).
  const values = { fullName: get("fullName"), email: get("email"), phone: get("phone") };

  let member = await getCurrentMember();

  try {
    const payload = await getPayloadClient();
    if (member) {
      // Logged in: only the WhatsApp number can change here.
      const phone = get("phone");
      if (phone.length < 7) return { error: "Please enter your WhatsApp number", values };
      if (phone !== member.phone) await payload.update({ collection: "members", id: member.id, data: { phone } });
    } else {
      // New buyer: create her account, then log her in.
      const parsed = NewAccount.safeParse({ ...values, password: String(formData.get("password") ?? "") });
      if (!parsed.success) return { error: parsed.error.issues[0].message, values };
      const email = normalizeEmail(parsed.data.email);
      const existing = await payload.find({ collection: "members", where: { email: { equals: email } }, limit: 1, depth: 0 });
      if (existing.docs[0]) {
        return {
          error: "This email already has an account. Please log in and you'll come straight back here.",
          loginLink: `/login?next=${encodeURIComponent(checkoutPath)}`,
          values,
        };
      }
      member = await payload.create({
        collection: "members",
        data: {
          email,
          fullName: parsed.data.fullName,
          phone: parsed.data.phone,
          passwordHash: await hashPassword(parsed.data.password),
          passwordSetAt: new Date().toISOString(),
        },
      });
      await startSession(member.id);
    }
  } catch (error) {
    console.error("[checkout] Could not prepare the account:", error);
    return { error: "Something went wrong. Please try again in a minute.", values };
  }

  const result = await createCheckoutSession({
    programSlug,
    months,
    ebook,
    country,
    email: member.email,
    memberId: member.id,
    origin: await siteOrigin(),
    cancelPath: `${checkoutPath}&cancelled=1`,
  });
  if (!result.ok) return { error: result.error, values };
  redirect(result.url); // outside try/catch: redirect() works by throwing
}

export async function buyEbookAction(_previous: CheckoutFormState, formData: FormData): Promise<CheckoutFormState> {
  const member = await getCurrentMember(); // optional: logged-in buyers are linked to their account
  const result = await createCheckoutSession({
    ebook: true,
    country: String(formData.get("country") ?? ""),
    email: member?.email,
    memberId: member?.id,
    origin: await siteOrigin(),
    cancelPath: "/ebook?cancelled=1",
  });
  if (!result.ok) return { error: result.error };
  redirect(result.url);
}
