/**
 * POST /api/newsletter - footer sign-up.
 * Saves the email in the database (admin > Newsletter subscribers) and tells the team.
 * Signing up twice is fine: the second time is simply ignored.
 */
import { z } from "zod";
import { getSettings } from "@/lib/content";
import { getPayloadClient } from "@/lib/payload.server";
import { sendEmail } from "@/lib/email.server";

const NewsletterRequest = z.object({ email: z.email("Please enter a valid email address") });

export async function POST(request: Request) {
  const parsed = NewsletterRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid email" }, { status: 400 });
  }
  const email = parsed.data.email.trim().toLowerCase();

  try {
    const payload = await getPayloadClient();
    const existing = await payload.find({ collection: "subscribers", where: { email: { equals: email } }, limit: 1 });
    if (existing.docs.length === 0) {
      await payload.create({ collection: "subscribers", data: { email } });
      await sendEmail({
        to: (await getSettings()).contact.publicEmail,
        subject: "New newsletter subscriber",
        text: `${email} subscribed from the website footer.`,
      });
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[newsletter] Could not save subscriber:", error);
    return Response.json({ error: "Couldn't subscribe right now. Please try again later." }, { status: 502 });
  }
}
