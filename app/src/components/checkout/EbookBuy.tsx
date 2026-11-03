"use client";

/**
 * Price + "Buy the e-book" on /ebook. Calls buyEbookAction (src/app/(frontend)/(site)/checkout/actions.ts).
 *   manual (card payments off): asks name, email and WhatsApp, saves the order and shows how to pay.
 *   stripe: opens Stripe's payment page (Stripe asks for the email).
 */
import { useActionState } from "react";
import { useClientValue } from "@/components/ui/hooks";
import { buyEbookAction, type CheckoutFormState } from "@/app/(frontend)/(site)/checkout/actions";
import { RegionSelect } from "@/components/pricing/RegionSelect";
import { useRegion } from "@/components/pricing/RegionProvider";

const START: CheckoutFormState = {};

export function EbookBuy({ paymentMode }: { paymentMode: "stripe" | "manual" }) {
  const [state, formAction, pending] = useActionState(buyEbookAction, START);
  const { market, ready, ebook, money } = useRegion();
  const manual = paymentMode === "manual";
  const inPakistan = market.country === "PK";
  const value = (name: string) => state.values?.[name] ?? "";

  // Stripe sends her back here with ?cancelled=1 if she closes the payment page.
  const cancelled = useClientValue(() => new URLSearchParams(window.location.search).get("cancelled") === "1", false);

  return (
    <form action={formAction} noValidate className="card mt-8 flex flex-col gap-4 p-6">
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

      {manual ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="eb-name" className="field-label">Full name</label>
            <input id="eb-name" name="fullName" autoComplete="name" required defaultValue={value("fullName")} className="field-input" />
          </div>
          <div>
            <label htmlFor="eb-email" className="field-label">Email</label>
            <input id="eb-email" name="email" type="email" autoComplete="email" required defaultValue={value("email")} className="field-input" />
          </div>
          <div>
            <label htmlFor="eb-phone" className="field-label">WhatsApp number</label>
            <input id="eb-phone" name="phone" type="tel" autoComplete="tel" required defaultValue={value("phone")} placeholder="+92 300 1234567" className="field-input" />
          </div>
        </div>
      ) : null}

      {state.error ? (
        <p role="alert" className="text-sm text-brand-dark">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="btn w-full sm:w-max" disabled={pending || !ready}>
        {pending ? (manual ? "Saving your order…" : "Opening secure payment…") : manual && !inPakistan ? "Continue on WhatsApp" : "Buy the e-book"}
      </button>
      <p className="text-xs text-muted">
        {!manual
          ? "Secure payment by Stripe. No account needed: the link is emailed to you after payment."
          : inPakistan
            ? "Pay by bank transfer or JazzCash / Easypaisa on the next page. The link is sent to you once the payment is confirmed."
            : "We'll arrange your payment on WhatsApp. The link is sent to you once the payment is confirmed."}
      </p>
    </form>
  );
}
