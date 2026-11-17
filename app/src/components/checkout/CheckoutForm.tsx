"use client";

/**
 * The /checkout form: order summary on one side, her details on the other.
 * Kept SHORT on purpose (payment first): name, email and WhatsApp only, no password.
 * checkoutAction (src/app/(frontend)/(site)/checkout/actions.ts) saves the order and shows how to pay
 * (or opens Stripe when card payments are on). She sets a password later, from her welcome email.
 */
import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { checkoutAction, type CheckoutFormState } from "@/app/(frontend)/(site)/checkout/actions";
import { useRegion } from "@/components/pricing/RegionProvider";
import { PaymentMethodBadges, type PayMethods } from "@/components/checkout/PaymentMethodBadges";
import type { EbookOffer, OwnPrices } from "@/lib/types";

type Props = {
  program: { slug: string; name: string; focus: string; ownPrices: OwnPrices };
  months: number;
  durationLabel: string;
  /** E-books on sale (each can be added at the lower "with a program" price) */
  ebooks: Pick<EbookOffer, "slug" | "title" | "cover">[];
  /** slugs ticked when the page opens (from the e-book offer on the program page) */
  startWithEbooks: string[];
  member: { email: string; fullName: string; phone: string } | null;
  cancelled: boolean;
  /** "manual": bank / JazzCash / Easypaisa (Pakistan) or WhatsApp; "stripe": card payment page */
  paymentMode: "stripe" | "manual";
  /** Ways to pay in Pakistan with their logos (admin > Website > Payment details) */
  payMethods: PayMethods;
  testMode: boolean;
};

const START: CheckoutFormState = {};

export function CheckoutForm({ program, months, durationLabel, ebooks, startWithEbooks, member, cancelled, paymentMode, payMethods, testMode }: Props) {
  const [state, formAction, pending] = useActionState(checkoutAction, START);
  const [chosen, setChosen] = useState<string[]>(startWithEbooks.filter((slug) => ebooks.some((e) => e.slug === slug)));
  const toggle = (slug: string, on: boolean) => setChosen((prev) => (on ? [...new Set([...prev, slug])] : prev.filter((s) => s !== slug)));
  const { market, ready, price: priceFor, ebook: ebookPrices, money } = useRegion();

  const programPrice = priceFor(months, program.ownPrices).amount;
  const ebookPrice = ebookPrices.withPlan;
  const total = programPrice + chosen.length * ebookPrice;
  const price = (amount: number) => (ready ? money(amount) : "…");
  const value = (name: string, fallback = "") => state.values?.[name] ?? fallback;
  const manual = paymentMode === "manual";
  const inPakistan = market.country === "PK";
  const buttonText = !manual ? "Continue to payment" : inPakistan ? "Place order" : "Continue on WhatsApp";

  return (
    <form action={formAction} noValidate className="grid items-start gap-6 md:grid-cols-[1fr_1.1fr]">
      <input type="hidden" name="program" value={program.slug} />
      <input type="hidden" name="months" value={months} />
      {chosen.map((slug) => (
        <input key={slug} type="hidden" name="ebooks" value={slug} />
      ))}
      <input type="hidden" name="country" value={market.country} />

      {/* Order summary */}
      <div className="card p-6 md:sticky md:top-24">
        <h2 className="text-2xl">Your order</h2>
        <div className="mt-4 flex justify-between gap-4 border-b border-line pb-4">
          <div>
            <p className="font-medium">{program.name}</p>
            <p className="text-sm text-muted">{durationLabel}</p>
          </div>
          <p className="font-medium tabular-nums">{price(programPrice)}</p>
        </div>

        {ebooks.map((ebook) => (
          <label key={ebook.slug} className="mt-3 flex cursor-pointer gap-3 rounded-[12px] border border-brand/30 bg-blush p-3.5 transition hover:border-brand">
            <input
              type="checkbox"
              checked={chosen.includes(ebook.slug)}
              onChange={(e) => toggle(ebook.slug, e.target.checked)}
              className="mt-1 h-4.5 w-4.5 flex-none accent-[var(--color-brand-dark)]"
            />
            {ebook.cover ? <Image src={ebook.cover.src} alt="" width={48} height={64} className="h-16 w-12 flex-none rounded object-cover" /> : null}
            <span className="text-sm">
              <b className="block text-[15px]">Add the e-book: {ebook.title}</b>
              <span className="text-muted">
                {price(ebookPrice)} with your program <s>{price(ebookPrices.alone)}</s>
              </span>
            </span>
          </label>
        ))}

        <div className="mt-5 flex items-baseline justify-between">
          <span className="font-medium">Total</span>
          <span className="font-display text-3xl tabular-nums">{price(total)}</span>
        </div>
        <p className="mt-1 text-xs text-muted">One-time payment in {market.currency}. No subscription.</p>
      </div>

      {/* Her details */}
      <div className="card p-6">
        {cancelled ? (
          <p role="status" className="mb-4 rounded-lg bg-[#fcefd8] px-3 py-2 text-sm text-[#8a5300]">
            Payment was cancelled. No money was taken. You can try again whenever you&apos;re ready.
          </p>
        ) : null}

        {member ? (
          <>
            <h2 className="text-2xl">Your details</h2>
            <p className="mt-2 text-sm text-muted">
              Logged in as <b className="text-ink">{member.email}</b>
            </p>
            <label htmlFor="co-phone" className="field-label mt-5">WhatsApp number (your coach will message you here)</label>
            <input id="co-phone" name="phone" type="tel" autoComplete="tel" required defaultValue={value("phone", member.phone)} placeholder="+92 300 1234567" className="field-input" />
          </>
        ) : (
          <>
            <h2 className="text-2xl">Your details</h2>
            <p className="mt-1 text-sm text-muted">
              Just three things. Already a member?{" "}
              <Link href={`/login?next=${encodeURIComponent(`/checkout?program=${program.slug}&months=${months}&ebooks=${chosen.join(",")}`)}`} className="text-brand-dark underline">
                Log in
              </Link>
            </p>
            <label htmlFor="co-name" className="field-label mt-5">Full name</label>
            <input id="co-name" name="fullName" autoComplete="name" required defaultValue={value("fullName")} className="field-input" />
            <label htmlFor="co-phone" className="field-label mt-4">WhatsApp number (your coach will message you here)</label>
            <input id="co-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required defaultValue={value("phone")} placeholder="+92 300 1234567" className="field-input" />
            <label htmlFor="co-email" className="field-label mt-4">Email address</label>
            <input id="co-email" name="email" type="email" autoComplete="email" inputMode="email" required defaultValue={value("email")} className="field-input" />
            <p className="mt-2 text-xs text-muted">No password needed now: after your payment we email you a link to open your member area.</p>
          </>
        )}

        {state.error ? (
          <p role="alert" className="mt-4 text-sm text-brand-dark">
            {state.error}{" "}
            {state.loginLink ? (
              <Link href={state.loginLink} className="font-medium underline">
                Log in
              </Link>
            ) : null}
          </p>
        ) : null}

        <button type="submit" className="btn mt-6 w-full" disabled={pending || !ready}>
          {pending ? (manual ? "Saving your order…" : "Opening secure payment…") : `${buttonText}${ready ? ` · ${price(total)}` : ""}`}
        </button>

        {manual && inPakistan ? <PaymentMethodBadges methods={payMethods} className="mt-4" /> : null}
        {manual ? (
          <p className="mt-3 rounded-lg bg-blush px-3 py-2 text-sm text-muted">
            {inPakistan
              ? "Next you'll see our bank and JazzCash / Easypaisa details. Your program starts as soon as the payment is confirmed."
              : "Next, WhatsApp opens so we can arrange your payment. Your program starts as soon as the payment is confirmed."}
          </p>
        ) : null}
        {!manual && testMode ? (
          <p className="mt-4 rounded-lg bg-blush px-3 py-2 text-xs text-muted">
            <b className="text-ink">Test mode:</b> no real money is taken. Test card 4242 4242 4242 4242, any future date, any CVC.
          </p>
        ) : null}
        <p className="mt-3 text-xs text-muted">
          {manual ? "By ordering" : "Secure payment by Stripe. By paying"} you agree to our <Link href="/terms" className="underline">Terms</Link> and{" "}
          <Link href="/refund-policy" className="underline">Refund Policy</Link>.
        </p>
      </div>
    </form>
  );
}
