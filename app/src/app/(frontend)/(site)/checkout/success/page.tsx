/**
 * /checkout/success?session_id=cs_test_...
 * Stripe sends the buyer here after paying. We look the session up to show what was bought.
 * (The order itself is recorded by the webhook, not by this page.)
 */
import Link from "next/link";
import { getProgram, whatsappLink } from "@/lib/content";
import { getStripe } from "@/lib/stripe.server";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Payment received", path: "/checkout/success", noIndex: true });

type PageProps = { searchParams: Promise<{ session_id?: string }> };

async function loadSession(sessionId: string | undefined) {
  if (!sessionId) return null;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    return {
      paid: session.payment_status === "paid",
      email: session.customer_details?.email ?? null,
      program: (await getProgram(session.metadata?.programSlug ?? ""))?.name ?? null,
      months: session.metadata?.months ?? null,
    };
  } catch (error) {
    console.error("[checkout-success] Could not load session", sessionId, error);
    return null;
  }
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const whatsappHref = await whatsappLink("Hi, I just joined a program!");
  const { session_id } = await searchParams;
  const session = await loadSession(session_id);

  return (
    <section className="section bg-gradient-to-b from-blush to-bg text-center">
      <div className="container-site max-w-[680px]">
        <p className="kicker">Payment received</p>
        <h1 className="mt-3 text-[clamp(34px,5vw,54px)]">
          Welcome to <span className="script">Fat To Fit With Z</span>
        </h1>
        {session?.program ? (
          <p className="lead mx-auto mt-5">
            You&apos;ve joined the <b className="text-ink">{session.program}</b>
            {session.months ? ` for ${session.months} month${session.months === "1" ? "" : "s"}` : ""}.
            {session.email ? ` A confirmation is on its way to ${session.email}.` : ""}
          </p>
        ) : (
          <p className="lead mx-auto mt-5">Thank you for joining. A confirmation email is on its way.</p>
        )}
        <ol className="mx-auto mt-8 max-w-[520px] space-y-3 text-left text-muted">
          <li>1. Your coach will contact you on WhatsApp within 24 hours.</li>
          <li>2. Share your goals, routine, food preferences and any health conditions.</li>
          <li>3. Your personalized plan appears in your member dashboard.</li>
        </ol>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="btn">
            Go to my dashboard
          </Link>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            Message us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
