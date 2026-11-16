"use client";

/**
 * Purchase box on a program page: duration choice, price in the visitor's region and "Join now".
 * "Join now" goes straight to /checkout (kept short on purpose); the e-books are offered there as
 * optional tick boxes at the lower "with a program" price.
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useClientValue } from "@/components/ui/hooks";
import { PriceTag } from "@/components/pricing/PriceTag";
import { RegionSelect } from "@/components/pricing/RegionSelect";
import { useRegion } from "@/components/pricing/RegionProvider";
import { durationLabel } from "@/lib/pricing";
import type { Program } from "@/lib/types";

type Props = {
  program: Program;
  /** "manual": bank / JazzCash / Easypaisa (Pakistan) or WhatsApp; "stripe": card payment page */
  paymentMode: "stripe" | "manual";
  /** Stripe test keys: shows the "no real money" note */
  testMode: boolean;
};

export function ProgramPurchase({ program, paymentMode, testMode }: Props) {
  const router = useRouter();
  const { market } = useRegion();
  const howToPay =
    paymentMode === "stripe"
      ? "Secure card payment by Stripe."
      : market.country === "PK"
        ? "Pay by bank transfer or JazzCash / Easypaisa."
        : "We'll arrange your payment on WhatsApp.";
  // A program card can link here with ?months=4 to pre-select that duration.
  const monthsInUrl = useClientValue(() => Number(new URLSearchParams(window.location.search).get("months")), 0);
  const startMonths = program.durations.some((d) => d.months === monthsInUrl) ? monthsInUrl : program.durations[0].months;
  const [chosenMonths, setMonths] = useState<number | null>(null); // null until she clicks a duration
  const months = chosenMonths ?? startMonths;
  const duration = program.durations.find((d) => d.months === months) ?? program.durations[0];

  const onJoin = () => router.push(`/checkout?program=${program.slug}&months=${months}`);

  return (
    <div className="card flex flex-col gap-4 p-6 md:sticky md:top-24">
      <RegionSelect />

      {program.durations.length > 1 ? (
        <div role="group" aria-label="Duration" className="inline-flex w-max gap-1 rounded-full bg-blush p-[3px]">
          {program.durations.map((d) => (
            <button
              key={d.months}
              type="button"
              aria-pressed={d.months === months}
              onClick={() => setMonths(d.months)}
              className="rounded-full px-4 py-1.5 text-sm text-muted aria-pressed:bg-brand aria-pressed:text-ink"
            >
              {durationLabel(d.months)}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-brand-dark">{durationLabel(duration.months, duration.isMinimum)}</p>
      )}

      <PriceTag months={months} />
      <p className="-mt-2 text-sm text-muted">One-time payment for {durationLabel(duration.months).toLowerCase()} of coaching.</p>

      <button type="button" className="btn w-full" onClick={onJoin}>
        Join now
      </button>

      {paymentMode === "stripe" && testMode ? (
        <p className="rounded-lg bg-blush px-3 py-2 text-xs text-muted">
          <b className="text-ink">Test mode:</b> payments use Stripe&apos;s test environment, so no real money is taken.
        </p>
      ) : null}
      <p className="text-xs text-muted">{howToPay} Next: one short page (name, WhatsApp, email).</p>
    </div>
  );
}
