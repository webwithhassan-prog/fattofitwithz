/**
 * POST /api/contact - receives the contact form, saves it (admin > Contact messages)
 * and emails it to the team.
 * Includes a hidden "website" field (honeypot): real people leave it empty, spam bots fill it.
 */
import { z } from "zod";
import { getSettings } from "@/lib/content";
import { getPayloadClient } from "@/lib/payload.server";
import { sendEmail } from "@/lib/email.server";
import { ipFromHeaders, LIMITS, rateLimit, tooManyRequests } from "@/lib/rate-limit.server";

const ContactRequest = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.email("Please enter a valid email address"),
  phone: z.string().trim().max(30).optional().default(""),
  subject: z.string().trim().min(1).max(60),
  message: z.string().trim().min(10, "Please write at least a short message").max(4000),
  website: z.string().optional().default(""), // honeypot
});

export async function POST(request: Request) {
  const parsed = ContactRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return Response.json({ error: first?.message ?? "Please check the form", field: first?.path[0] }, { status: 400 });
  }
  const data = parsed.data;

  // Bot filled the hidden field: pretend success, send nothing.
  if (data.website) return Response.json({ ok: true });
  const limited = await rateLimit(LIMITS.contact, ipFromHeaders(request.headers));
  if (!limited.ok) return tooManyRequests(limited);

  try {
    // Saved first, so the message is never lost even if the email fails.
    const payload = await getPayloadClient();
    await payload.create({
      collection: "contact-messages",
      data: { name: data.name, email: data.email, phone: data.phone, subject: data.subject, message: data.message },
    });
  } catch (error) {
    console.error("[contact] Could not save the message:", error);
    return Response.json({ error: "We couldn't send your message. Please use WhatsApp instead." }, { status: 502 });
  }

  const settings = await getSettings();
  try {
    await sendEmail({
      to: settings.contact.publicEmail,
      replyTo: data.email,
      subject: `Website message: ${data.subject} - ${data.name}`,
      text: [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Phone / WhatsApp: ${data.phone || "-"}`,
        `Subject: ${data.subject}`,
        "",
        data.message,
      ].join("\n"),
    });
  } catch (error) {
    // The message is already saved in the admin panel, so the visitor still gets a success message.
    console.error("[contact] Saved, but the notification email failed:", error);
  }
  return Response.json({ ok: true });
}
