"use client";

/** Price + "Buy the e-book" button on /ebook. Calls buyEbookAction, which opens Stripe's payment page. */
import { useActionState } from "react";
import { useClientValue } from "@/components/ui/hooks";
import { buyEbookAction, type CheckoutFormState } from "@/app/(frontend)/(site)/checkout/actions";
import { RegionSelect } from "@/components/pricing/RegionSelect";
import { useRegion } from "@/components/pricing/RegionProvider";

const START: CheckoutFormState = {};

export function EbookBuy() {
  const [state, formAction, pending] = useActionState(buyEbookAction, START);
  const { market, ready, ebook, money } = useRegion();

  // Stripe sends her back here with ?cancelled=1 if she closes the payment page.
  const cancelled = useClientValue(() => new URLSearchParams(window.location.search).get("cancelled") === "1", false);

  return (
    <form action={formAction} className="card mt-8 flex flex-col gap-4 p-6">
      <input type="hidden" name="country" value={market.country} />
      {cancelled ? (
        <p role="status" className="rounded-lg bg-[#fcefd8] px-3 py-2 text-sm text-[#8a5300]">
          Payment was cancelled. No money was taken.
        </p>
      ) : null}
      <RegionSelect />
      <p className={`font-display text-4xl tabular-nums transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}>
        {money(ebook.alone)}
        <span className="ml-3 align-middle font-body text-sm text-muted">
          or {money(ebook.withPlan)} with any program
        </span>
      </p>
      {state.error ? (
        <p role="alert" className="text-sm text-brand-dark">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="btn w-full sm:w-max" disabled={pending || !ready}>
        {pending ? "Opening secure payment…" : "Buy the e-book"}
      </button>
      <p className="text-xs text-muted">Secure payment by Stripe. No account needed: the link is emailed to you after payment.</p>
    </form>
  );
}
