"use client";

/**
 * Order page outside Pakistan: opens WhatsApp by itself (once per order, so the back button
 * doesn't loop), and keeps a button in case the browser didn't open it.
 */
import { useEffect } from "react";
import { WhatsAppIcon } from "@/components/ui/Icons";

export function WhatsAppRedirect({ href, reference }: { href: string; reference: string }) {
  useEffect(() => {
    const key = `ftf-wa-opened-${reference}`;
    try {
      if (sessionStorage.getItem(key)) return; // already opened once in this tab
    } catch {
      return; // storage blocked: only the button is shown
    }
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(key, "1"); // remembered only when it really opens
      } catch {}
      window.location.assign(href);
    }, 1200);
    return () => clearTimeout(timer);
  }, [href, reference]);

  return (
    <div className="flex flex-col items-start gap-2">
      <a href={href} className="btn bg-whatsapp hover:bg-[#178a47]">
        <WhatsAppIcon className="h-5 w-5" /> Continue on WhatsApp
      </a>
      <p className="text-xs text-muted">WhatsApp should open by itself. If it didn&apos;t, tap the button.</p>
    </div>
  );
}
