/**
 * Sends email through Resend (https://resend.com) using its HTTP API - no SDK needed.
 *
 * If RESEND_API_KEY is not set (typical while developing), the email is printed to the
 * terminal instead of being sent, so forms still work and you can see what would go out.
 */
import "server-only";

type Email = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export async function sendEmail(email: Email): Promise<{ sent: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Fat To Fit With Z <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[email] RESEND_API_KEY not set - printing instead of sending:\n", {
      from,
      ...email,
    });
    return { sent: false };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: email.to, subject: email.subject, text: email.text, reply_to: email.replyTo }),
  });

  if (!response.ok) {
    // Log the provider's message so the cause is visible in the server logs.
    console.error("[email] Resend rejected the email:", response.status, await response.text());
    throw new Error("Email provider rejected the message");
  }
  return { sent: true };
}
