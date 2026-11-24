"use client";

/**
 * Buy box on /ebook: tick the e-books she wants (each at the e-book price), then "Buy". Calls buyEbookAction (src/app/(frontend)/(site)/checkout/actions.ts).
 *   manual (card payments off): asks name, email and WhatsApp, saves the order and shows how to pay.
 *   stripe: opens Stripe's payment page (Stripe asks for the email).
 */
import Image from "next/image";
import { useActionState, useState } from "react";
import type { EbookOffer } from "@/lib/types";
import { useClientValue } from "@/components/ui/hooks";
import { buyEbookAction, type CheckoutFormState } from "@/app/(frontend)/(site)/checkout/actions";
import { RegionSelect } from "@/components/pricing/RegionSelect";
import { useRegion } from "@/components/pricing/RegionProvider";
import { PhoneInput } from "@/components/forms/PhoneInput";

const START: CheckoutFormState = {};

type Props = {
  paymentMode: "stripe" | "manual";
  /** She is logged in and already has a program: the lower "with a program" price */
  memberPrice?: boolean;
  ebooks: Pick<EbookOffer, "slug" | "title" | "cover">[];
};

export function EbookBuy({ paymentMode, memberPrice = false, ebooks }: Props) {
  const [state, formAction, pending] = useActionState(buyEbookAction, START);
  const { market, ready, ebook, money } = useRegion();
  const [chosen, setChosen] = useState<string[]>(ebooks.map((e) => e.slug)); // all ticked to start
  const toggle = (slug: string) => setChosen((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  const each = memberPrice ? ebook.withPlan : ebook.alone;
  const total = chosen.length * each;
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
      {ebooks.length > 1 ? (
        <fieldset className="grid gap-2 sm:grid-cols-2">
          <legend className="field-label">Choose your e-books</legend>
          {ebooks.map((e) => (
            <label key={e.slug} className={`flex cursor-pointer items-center gap-3 rounded-[12px] border-2 p-2.5 transition ${chosen.includes(e.slug) ? "border-brand bg-blush" : "border-line"}`}>
              <input type="checkbox" name="ebooks" value={e.slug} checked={chosen.includes(e.slug)} onChange={() => toggle(e.slug)} className="h-4.5 w-4.5 flex-none accent-[var(--color-brand-dark)]" />
              {e.cover ? <Image src={e.cover.src} alt="" width={40} height={56} className="h-14 w-10 flex-none rounded object-cover" /> : null}
              <span className="text-sm leading-tight font-semibold">{e.title}</span>
            </label>
          ))}
        </fieldset>
      ) : (
        ebooks.map((e) => <input key={e.slug} type="hidden" name="ebooks" value={e.slug} />)
      )}
      <p className={`font-display text-4xl tabular-nums transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}>
        {money(total)}
        <span className="ml-3 align-middle font-body text-sm text-muted">
          {memberPrice ? (
            <>
              {money(ebook.withPlan)} each with your program <s>{money(ebook.alone)}</s>
            </>
          ) : (
            <>
              {money(ebook.alone)} each, or {money(ebook.withPlan)} each with any program
            </>
          )}
        </span>
      </p>
      <p className="-mt-2 text-xs text-muted">One-time payment, yours to keep. No subscription, nothing to pay monthly.</p>

      {manual ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="eb-name" className="field-label">Full name</label>
            <input id="eb-name" name="fullName" autoComplete="name" required defaultValue={value("fullName")} className="field-input" />
          </div>
          <div>
            <label htmlFor="eb-email" className="field-label">Email</label>
            <input id="eb-email" name="email" type="email" autoComplete="email" required defaultValue={value("email")} className="field-input" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="eb-phone" className="field-label">WhatsApp number</label>
            <PhoneInput id="eb-phone" required defaultValue={value("phone")} />
          </div>
        </div>
      ) : null}

      {state.error ? (
        <p role="alert" className="text-sm text-brand-dark">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="btn w-full sm:w-max" disabled={pending || !ready || chosen.length === 0}>
        {pending ? (manual ? "Saving your order…" : "Opening secure payment…") : manual && !inPakistan ? "Continue on WhatsApp" : chosen.length > 1 ? `Buy ${chosen.length} e-books` : "Buy the e-book"}
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
