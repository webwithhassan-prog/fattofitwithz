"use client";

/**
 * Purchase box on a program page: duration choice, price in the visitor's region,
 * and the checkout button (Stripe Checkout, test mode for now).
 */
import { useState } from "react";
import { PriceTag } from "@/components/pricing/PriceTag";
import { RegionSelect } from "@/components/pricing/RegionSelect";
import { useRegion } from "@/components/pricing/RegionProvider";
import { durationLabel } from "@/lib/pricing";
import type { Program } from "@/lib/types";

type Props = {
  program: Program;
  initialMonths: number;
  testMode: boolean;
  cancelled: boolean;
};

export function ProgramPurchase({ program, initialMonths, testMode, cancelled }: Props) {
  const { region } = useRegion();
  const [months, setMonths] = useState(initialMonths);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const duration = program.durations.find((d) => d.months === months) ?? program.durations[0];

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programSlug: program.slug, months, region: region.code }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Couldn't start checkout");
      window.location.assign(data.url); // go to Stripe's secure checkout page
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="card flex flex-col gap-4 p-6 md:sticky md:top-24">
      {cancelled ? (
        <p role="status" className="rounded-lg bg-[#fcefd8] px-3 py-2 text-sm text-[#8a5300]">
          Checkout was cancelled. No payment was taken. You can try again whenever you&apos;re ready.
        </p>
      ) : null}

      <RegionSelect />

      {program.durations.length > 1 ? (
        <div role="group" aria-label="Duration" className="inline-flex w-max gap-1 rounded-full bg-blush p-[3px]">
          {program.durations.map((d) => (
            <button
              key={d.months}
              type="button"
              aria-pressed={d.months === months}
              onClick={() => setMonths(d.months)}
              className="rounded-full px-4 py-1.5 text-sm text-muted aria-pressed:bg-brand aria-pressed:text-white"
            >
              {durationLabel(d.months)}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-brand">{durationLabel(duration.months, duration.isMinimum)}</p>
      )}

      <PriceTag months={months} />
      <p className="-mt-2 text-sm text-muted">One-time payment for {durationLabel(duration.months).toLowerCase()} of coaching.</p>

      <button type="button" className="btn w-full" onClick={startCheckout} disabled={loading}>
        {loading ? "Opening secure checkout…" : "Join now"}
      </button>

      {error ? (
        <p role="alert" className="text-sm text-[#8a5300]">
          {error}
        </p>
      ) : null}

      {testMode ? (
        <p className="rounded-lg bg-blush px-3 py-2 text-xs text-muted">
          <b className="text-ink">Test mode:</b> payments use Stripe&apos;s test environment, so no real money is taken. Test
          card: 4242 4242 4242 4242, any future date, any CVC.
        </p>
      ) : null}

      <p className="text-xs text-muted">
        Secure payment by Stripe. By joining you agree to our Terms of Service and Refund, Cancellation &amp; Freeze Policy.
      </p>
    </div>
  );
}
