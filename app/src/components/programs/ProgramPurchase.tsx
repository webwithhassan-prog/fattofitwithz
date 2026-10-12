"use client";

/**
 * Purchase box on a program page: duration choice, price in the visitor's region and "Join now".
 * "Join now" first offers the e-book at the lower "with a program" price (a native <dialog> popup),
 * then opens /checkout. If the e-book is switched off in admin, it goes straight to /checkout.
 */
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useClientValue } from "@/components/ui/hooks";
import { PriceTag } from "@/components/pricing/PriceTag";
import { RegionSelect } from "@/components/pricing/RegionSelect";
import { useRegion } from "@/components/pricing/RegionProvider";
import { Close } from "@/components/ui/Icons";
import { durationLabel } from "@/lib/pricing";
import type { EbookOffer, Program } from "@/lib/types";

type Props = {
  program: Program;
  ebook: EbookOffer;
  testMode: boolean;
};

export function ProgramPurchase({ program, ebook, testMode }: Props) {
  const router = useRouter();
  const { ready, ebook: ebookPrices, money } = useRegion();
  const dialogRef = useRef<HTMLDialogElement>(null);
  // A program card can link here with ?months=4 to pre-select that duration.
  const monthsInUrl = useClientValue(() => Number(new URLSearchParams(window.location.search).get("months")), 0);
  const startMonths = program.durations.some((d) => d.months === monthsInUrl) ? monthsInUrl : program.durations[0].months;
  const [chosenMonths, setMonths] = useState<number | null>(null); // null until she clicks a duration
  const months = chosenMonths ?? startMonths;
  const duration = program.durations.find((d) => d.months === months) ?? program.durations[0];

  function goToCheckout(withEbook: boolean) {
    dialogRef.current?.close();
    router.push(`/checkout?program=${program.slug}&months=${months}&ebook=${withEbook ? 1 : 0}`);
  }

  function onJoin() {
    if (ebook.enabled) dialogRef.current?.showModal();
    else goToCheckout(false);
  }

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

      {testMode ? (
        <p className="rounded-lg bg-blush px-3 py-2 text-xs text-muted">
          <b className="text-ink">Test mode:</b> payments use Stripe&apos;s test environment, so no real money is taken.
        </p>
      ) : null}
      <p className="text-xs text-muted">Secure payment by Stripe. You&apos;ll create your account on the next page.</p>

      {/* E-book offer popup */}
      {ebook.enabled ? (
        <dialog
          ref={dialogRef}
          aria-labelledby="ebook-offer-title"
          className="ebook-dialog m-auto w-[min(92vw,440px)] rounded-[18px] border border-line bg-card p-0 text-ink shadow-[0_30px_60px_-20px_rgba(43,26,36,0.45)] backdrop:bg-ink/45"
          onClick={(e) => {
            if (e.target === e.currentTarget) dialogRef.current?.close(); // click outside the box closes it
          }}
        >
          <div className="relative p-6 text-center sm:p-7">
            <button type="button" className="absolute top-3 right-3 rounded-full p-1.5 text-muted hover:text-ink" onClick={() => dialogRef.current?.close()} aria-label="Close">
              <Close className="h-5 w-5" />
            </button>
            {ebook.cover ? (
              <Image src={ebook.cover.src} alt={ebook.cover.alt} width={150} height={200} className="mx-auto h-[170px] w-auto rounded-lg shadow-[0_16px_30px_-14px_rgba(43,26,36,0.5)]" />
            ) : null}
            <p className="kicker mt-5">Special offer</p>
            <h2 id="ebook-offer-title" className="mt-2 text-[26px]">
              Add the e-book for <span className="script">{ready ? money(ebookPrices.withPlan) : "less"}</span>?
            </h2>
            <p className="mt-2 text-[15px] text-muted">
              {ebook.title}: normally {ready ? money(ebookPrices.alone) : "more"}. This price is only for program members.
            </p>
            <div className="mt-6 grid gap-2.5">
              <button type="button" className="btn w-full" onClick={() => goToCheckout(true)}>
                Yes, add it
              </button>
              <button type="button" className="btn btn-ghost w-full" onClick={() => goToCheckout(false)}>
                No thanks
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
    </div>
  );
}
