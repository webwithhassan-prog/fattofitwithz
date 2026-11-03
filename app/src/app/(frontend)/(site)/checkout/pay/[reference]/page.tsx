/**
 * /checkout/pay/FTF-7K2Q9M?key=...  -  her order page after checkout (card payments off).
 *
 *   Waiting for payment, Pakistan:  bank + JazzCash / Easypaisa details (admin > Website > Payment details),
 *                                   then "Send payment screenshot on WhatsApp".
 *   Waiting for payment, elsewhere: opens WhatsApp, where the coach arranges the payment.
 *   Paid / cancelled:               the order's status.
 *
 * Only opens with the secret key from her link (also in her email) or when she's logged in to the
 * account that placed the order (src/lib/orders.server.ts > getOrderForPage).
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/checkout/CopyButton";
import { WhatsAppRedirect } from "@/components/checkout/WhatsAppRedirect";
import { Check, WhatsAppIcon } from "@/components/ui/Icons";
import { getCurrentMember } from "@/lib/auth/session.server";
import { getEbook, getPaymentSettings, whatsappLink } from "@/lib/content";
import { getOrderForPage, paymentWhatsappMessage } from "@/lib/orders.server";
import { formatOrderAmount } from "@/lib/pricing";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Your order", path: "/checkout/pay", noIndex: true });

type PageProps = { params: Promise<{ reference: string }>; searchParams: Promise<{ key?: string }> };

/** One line of payment details with a Copy button. */
function Detail({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0">
      <div className="min-w-0">
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="font-medium break-all text-ink">{value}</dd>
      </div>
      {copy ? <CopyButton text={value.replace(/\s/g, "")} label={label} /> : null}
    </div>
  );
}

export default async function OrderPayPage({ params, searchParams }: PageProps) {
  const [{ reference }, { key }, member] = await Promise.all([params, searchParams, getCurrentMember()]);
  const order = await getOrderForPage(reference, key, member?.id ?? null);
  if (!order) notFound();

  const [payments, ebook] = await Promise.all([getPaymentSettings(), getEbook()]);
  const inPakistan = order.country === "PK";
  const total = formatOrderAmount(order.amount, order.currency);
  const chatHref = await whatsappLink(paymentWhatsappMessage(order, inPakistan));
  const firstName = order.buyerName?.split(" ")[0] ?? "";
  const { bank, wallet } = payments;

  const summary = (
    <div className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted">Your order</p>
          <p className="font-medium">{order.orderLabel}</p>
        </div>
        <p className="font-display text-3xl tabular-nums">{total}</p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-[12px] bg-blush px-3.5 py-2.5">
        <p className="text-sm">
          Order number <b className="font-semibold tracking-wide">{order.reference}</b>
        </p>
        <CopyButton text={order.reference ?? ""} label="order number" />
      </div>
    </div>
  );

  // ---- Paid ----
  if (order.status === "paid") {
    return (
      <section className="section bg-gradient-to-b from-blush to-bg">
        <div className="container-site flex max-w-[720px] flex-col gap-6">
          <div>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-brand text-ink">
              <Check className="h-6 w-6" />
            </span>
            <h1 className="mt-4 text-[clamp(30px,5vw,46px)]">
              Payment <span className="script">confirmed</span>
            </h1>
            <p className="lead mt-3">Thank you{firstName ? `, ${firstName}` : ""}! {order.program ? "Your program has started." : "Your e-book is ready."}</p>
          </div>
          {summary}
          <div className="flex flex-wrap gap-3">
            {order.program ? <Link href="/dashboard/first-day" className="btn">Fill in your Personal Wellness Profile</Link> : null}
            {order.ebook && ebook.driveLink ? (
              <a href={ebook.driveLink} target="_blank" rel="noopener noreferrer" className={order.program ? "btn btn-ghost" : "btn"}>Open the e-book</a>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  // ---- Refunded / cancelled ----
  if (order.status !== "pending") {
    const questionHref = await whatsappLink(`Hi! A question about order ${order.reference}.`);
    return (
      <section className="section bg-gradient-to-b from-blush to-bg">
        <div className="container-site flex max-w-[720px] flex-col gap-6">
          <h1 className="text-[clamp(30px,5vw,46px)]">This order is {order.status === "refunded" ? "refunded" : "cancelled"}</h1>
          {summary}
          <div className="flex flex-wrap gap-3">
            <Link href="/programs" className="btn">See our programs</Link>
            <a href={questionHref} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Message us on WhatsApp</a>
          </div>
        </div>
      </section>
    );
  }

  // ---- Waiting for payment ----
  return (
    <section className="section bg-gradient-to-b from-blush to-bg">
      <div className="container-site flex max-w-[720px] flex-col gap-6">
        <div>
          <p className="kicker">Order placed</p>
          <h1 className="mt-2 text-[clamp(30px,5vw,46px)]">
            Almost done{firstName ? `, ${firstName}` : ""}<span className="script">!</span>
          </h1>
          <p className="lead mt-3">
            {inPakistan
              ? `Pay ${total} with one of the options below, then send us the screenshot on WhatsApp.`
              : payments.otherCountriesText}
          </p>
        </div>

        {summary}

        {inPakistan ? (
          <>
            <div>
              <h2 className="text-2xl">
                <span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-full bg-brand align-middle font-sans text-sm font-semibold text-ink">1</span>
                Pay {total}
              </h2>
              <div className={`mt-4 grid gap-4 ${bank.enabled && wallet.enabled ? "md:grid-cols-2" : ""}`}>
                {bank.enabled ? (
                  <div className="card p-5">
                    <p className="font-display text-xl">Bank transfer</p>
                    <p className="text-sm text-muted">{bank.bankName}</p>
                    <dl className="mt-2">
                      <Detail label="Account title" value={bank.accountTitle} />
                      <Detail label="Account number" value={bank.accountNumber} copy />
                      <Detail label="IBAN" value={bank.iban} copy />
                      <Detail label="Branch code" value={bank.branch} />
                    </dl>
                  </div>
                ) : null}
                {wallet.enabled ? (
                  <div className="card p-5">
                    <p className="font-display text-xl">JazzCash / Easypaisa</p>
                    <p className="text-sm text-muted">Send to this mobile account</p>
                    <dl className="mt-2">
                      <Detail label="Mobile number" value={wallet.number} copy />
                      <Detail label="Account name" value={wallet.accountName} />
                    </dl>
                  </div>
                ) : null}
              </div>
              {payments.instructions ? <p className="mt-4 text-[15px] text-muted">{payments.instructions}</p> : null}
            </div>

            <div>
              <h2 className="text-2xl">
                <span className="mr-2 inline-grid h-7 w-7 place-items-center rounded-full bg-brand align-middle font-sans text-sm font-semibold text-ink">2</span>
                Send the screenshot
              </h2>
              <a href={chatHref} target="_blank" rel="noopener noreferrer" className="btn mt-4 bg-whatsapp hover:bg-[#178a47]">
                <WhatsAppIcon className="h-5 w-5" /> Send payment screenshot on WhatsApp
              </a>
            </div>
          </>
        ) : (
          <WhatsAppRedirect href={chatHref} reference={order.reference ?? ""} />
        )}

        <p className="text-sm text-muted">
          We&apos;ve also emailed these details to <b className="text-ink">{order.email}</b>.{" "}
          {order.program ? "Your program starts as soon as the payment is confirmed. " : ""}
          {member ? (
            <>
              You can find this order on <Link href="/dashboard" className="text-brand-dark underline">your dashboard</Link>.
            </>
          ) : (
            "Keep this page or the email to come back to your order."
          )}
        </p>
      </div>
    </section>
  );
}
