"use client";

/**
 * Buttons at the top of a client's page in admin: message her on WhatsApp, email her,
 * or write her a reminder (shown on her dashboard). Reads her number and email from the form.
 */
import Link from "next/link";
import { useFormFields } from "@payloadcms/ui";

/** "+92 300 1234567" -> "923001234567" for wa.me links */
const digitsOnly = (phone: string) => phone.replace(/\D/g, "");

export function ClientActions() {
  const phone = useFormFields(([fields]) => String(fields.phone?.value ?? ""));
  const email = useFormFields(([fields]) => String(fields.email?.value ?? ""));

  return (
    <div className="ftf-client-actions">
      {phone ? (
        <a className="ftf-btn ftf-btn--whatsapp" href={`https://wa.me/${digitsOnly(phone)}`} target="_blank" rel="noopener noreferrer">
          WhatsApp {phone}
        </a>
      ) : (
        <span className="ftf-muted">No WhatsApp number yet</span>
      )}
      {email ? (
        <a className="ftf-btn" href={`mailto:${email}`}>
          Email
        </a>
      ) : null}
      <Link className="ftf-btn" href="/admin/collections/announcements/create">
        Write a reminder
      </Link>
    </div>
  );
}
