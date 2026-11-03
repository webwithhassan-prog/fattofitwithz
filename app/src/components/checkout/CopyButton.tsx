"use client";

/** Small "Copy" button next to an account number, IBAN or order number. */
import { useState } from "react";
import { Check } from "@/components/ui/Icons";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.warn("[copy] Clipboard not available:", error);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className="inline-flex flex-none items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-xs font-semibold text-ink transition hover:border-brand"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-brand-dark" /> Copied
        </>
      ) : (
        "Copy"
      )}
    </button>
  );
}
