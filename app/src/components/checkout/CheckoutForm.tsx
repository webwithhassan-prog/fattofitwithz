"use client";

/**
 * The /checkout form: order summary on one side, her details on the other.
 * Sends everything to checkoutAction (src/app/(frontend)/(site)/checkout/actions.ts),
 * which creates her account if needed and opens Stripe's payment page.
 */
import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { checkoutAction, type CheckoutFormState } from "@/app/(frontend)/(site)/checkout/actions";
import { useRegion } from "@/components/pricing/RegionProvider";
import type { EbookOffer } from "@/lib/types";

type Props = {
  program: { slug: string; name: string; focus: string };
  months: number;
  durationLabel: string;
  ebook: { title: string; cover: EbookOffer["cover"] } | null;
  startWithEbook: boolean;
  member: { email: string; fullName: string; phone: string } | null;
  cancelled: boolean;
  testMode: boolean;
};

const START: CheckoutFormState = {};

export function CheckoutForm({ program, months, durationLabel, ebook, startWithEbook, member, cancelled, testMode }: Props) {
  const [state, formAction, pending] = useActionState(checkoutAction, START);
  const [addEbook, setAddEbook] = useState(startWithEbook && Boolean(ebook));
  const { market, ready, price: priceFor, ebook: ebookPrices, money } = useRegion();

  const programPrice = priceFor(months).amount;
  const ebookPrice = ebookPrices.withPlan;
  const total = programPrice + (addEbook ? ebookPrice : 0);
  const price = (amount: number) => (ready ? money(amount) : "…");
  const value = (name: string, fallback = "") => state.values?.[name] ?? fallback;

  return (
    <form action={formAction} noValidate className="grid items-start gap-6 md:grid-cols-[1fr_1.1fr]">
      <input type="hidden" name="program" value={program.slug} />
      <input type="hidden" name="months" value={months} />
      <input type="hidden" name="ebook" value={addEbook ? "1" : "0"} />
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

        {ebook ? (
          <label className="mt-4 flex cursor-pointer gap-3 rounded-[12px] border border-brand/30 bg-blush p-3.5 transition hover:border-brand">
            <input type="checkbox" checked={addEbook} onChange={(e) => setAddEbook(e.target.checked)} className="mt-1 h-4.5 w-4.5 flex-none accent-[var(--color-brand-dark)]" />
            {ebook.cover ? <Image src={ebook.cover.src} alt="" width={48} height={64} className="h-16 w-12 flex-none rounded object-cover" /> : null}
            <span className="text-sm">
              <b className="block text-[15px]">Add the e-book: {ebook.title}</b>
              <span className="text-muted">
                {price(ebookPrice)} with your program <s>{price(ebookPrices.alone)}</s>
              </span>
            </span>
          </label>
        ) : null}

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
            <h2 className="text-2xl">Create your account</h2>
            <p className="mt-1 text-sm text-muted">
              Already have one?{" "}
              <Link href={`/login?next=${encodeURIComponent(`/checkout?program=${program.slug}&months=${months}&ebook=${addEbook ? 1 : 0}`)}`} className="text-brand-dark underline">
                Log in
              </Link>
            </p>
            <label htmlFor="co-name" className="field-label mt-5">Full name</label>
            <input id="co-name" name="fullName" autoComplete="name" required defaultValue={value("fullName")} className="field-input" />
            <label htmlFor="co-email" className="field-label mt-4">Email address</label>
            <input id="co-email" name="email" type="email" autoComplete="email" required defaultValue={value("email")} className="field-input" />
            <label htmlFor="co-phone" className="field-label mt-4">WhatsApp number</label>
            <input id="co-phone" name="phone" type="tel" autoComplete="tel" required defaultValue={value("phone")} placeholder="+92 300 1234567" className="field-input" />
            <label htmlFor="co-password" className="field-label mt-4">Create a password (8+ characters)</label>
            <input id="co-password" name="password" type="password" autoComplete="new-password" required minLength={8} className="field-input" />
            <p className="mt-2 text-xs text-muted">You&apos;ll use this to open your member area. Health and food details come later, in your first day form.</p>
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
          {pending ? "Opening secure payment…" : `Continue to payment${ready ? ` · ${price(total)}` : ""}`}
        </button>

        {testMode ? (
          <p className="mt-4 rounded-lg bg-blush px-3 py-2 text-xs text-muted">
            <b className="text-ink">Test mode:</b> no real money is taken. Test card 4242 4242 4242 4242, any future date, any CVC.
          </p>
        ) : null}
        <p className="mt-3 text-xs text-muted">
          Secure payment by Stripe. By paying you agree to our <Link href="/terms" className="underline">Terms</Link> and{" "}
          <Link href="/refund-policy" className="underline">Refund Policy</Link>.
        </p>
      </div>
    </form>
  );
}
