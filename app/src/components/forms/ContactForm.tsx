"use client";

/**
 * Contact form -> POST /api/contact.
 * Shows a clear success message, or the server's error next to the form.
 * (The old Shopify page had two forms and no feedback at all.)
 */
import { useState } from "react";

type Props = { subjects: string[] };
type Status = { kind: "idle" | "sending" | "sent" | "error"; message?: string };

export function ContactForm({ subjects }: Props) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      form.reset();
      setStatus({ kind: "sent", message: "Thank you! Your message has been sent. We usually reply within one working day." });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Couldn't send your message." });
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" aria-describedby="contact-status">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="field-label">Name</label>
          <input id="contact-name" name="name" required minLength={2} autoComplete="name" className="field-input" />
        </div>
        <div>
          <label htmlFor="contact-email" className="field-label">Email</label>
          <input id="contact-email" name="email" type="email" required autoComplete="email" className="field-input" />
        </div>
      </div>
      <div>
        <label htmlFor="contact-phone" className="field-label">
          Phone / WhatsApp <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="contact-phone" name="phone" type="tel" autoComplete="tel" className="field-input" />
      </div>
      <div>
        <label htmlFor="contact-subject" className="field-label">Subject</label>
        <select id="contact-subject" name="subject" className="field-input" defaultValue={subjects[0]}>
          {subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="contact-message" className="field-label">Message</label>
        <textarea id="contact-message" name="message" required minLength={10} rows={6} className="field-input" />
      </div>
      {/* Honeypot: hidden from people, bots fill it in. Must stay empty. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" className="btn self-start" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? "Sending…" : "Send message"}
      </button>
      <p
        id="contact-status"
        role="status"
        className={`min-h-6 text-sm ${status.kind === "error" ? "text-[#8a5300]" : "text-[#1f6b45]"}`}
      >
        {status.message}
      </p>
    </form>
  );
}
