"use client";

/** Footer newsletter sign-up. Posts to /api/newsletter. */
import { useState } from "react";

type Status = { kind: "idle" | "sending" | "done" | "error"; message?: string };

export function NewsletterForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email");
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      form.reset();
      setStatus({ kind: "done", message: "You're subscribed. Check your inbox for a welcome email." });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Couldn't subscribe. Try again." });
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-3" noValidate={false}>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex overflow-hidden rounded border border-[#6b5258]">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your email"
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-white placeholder:text-[#b8a6ac] focus:outline-none"
        />
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="bg-rose px-4 text-sm font-semibold tracking-wide text-ink uppercase disabled:opacity-60"
        >
          {status.kind === "sending" ? "Joining…" : "Join"}
        </button>
      </div>
      <p role="status" className={`mt-2 min-h-5 text-sm ${status.kind === "error" ? "text-[#ffc7dd]" : "text-[#d9f2e3]"}`}>
        {status.message}
      </p>
    </form>
  );
}
