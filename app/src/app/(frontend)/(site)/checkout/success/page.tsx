/**
 * /checkout/success?session_id=cs_test_...
 * Stripe sends the buyer here after paying. We look the session up to show what was bought
 * and what to do next. (The order itself is recorded by the Stripe webhook, not by this page.)
 */
import Link from "next/link";
import { getEbook, getProgram, whatsappLink } from "@/lib/content";
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
      months: Number(session.metadata?.months ?? 0),
      ebook: session.metadata?.ebook === "1",
    };
  } catch (error) {
    console.error("[checkout-success] Could not load session", sessionId, error);
    return null;
  }
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams;
  const [session, ebook, whatsappHref] = await Promise.all([loadSession(session_id), getEbook(), whatsappLink("Hi, I just joined!")]);
  const boughtProgram = Boolean(session?.program);
  const boughtEbook = Boolean(session?.ebook);

  return (
    <section className="section bg-gradient-to-b from-blush to-bg text-center">
      <div className="container-site max-w-[680px]">
        <p className="kicker">Payment received</p>
        <h1 className="mt-3 text-[clamp(34px,5vw,54px)]">
          Thank you, <span className="script">welcome!</span>
        </h1>
        <p className="lead mx-auto mt-5">
          {boughtProgram ? (
            <>
              You&apos;ve joined the <b className="text-ink">{session?.program}</b>
              {session?.months ? ` for ${session.months} month${session.months === 1 ? "" : "s"}` : ""}
              {boughtEbook ? " with the e-book" : ""}.
            </>
          ) : boughtEbook ? (
            <>Your e-book is ready.</>
          ) : (
            <>Thank you for your payment.</>
          )}
          {session?.email ? ` A confirmation is on its way to ${session.email}.` : ""}
        </p>

        {boughtEbook ? (
          <div className="card mx-auto mt-8 max-w-[520px] p-5">
            <p className="font-display text-xl">{ebook.title}</p>
            {ebook.driveLink ? (
              <a href={ebook.driveLink} target="_blank" rel="noopener noreferrer" className="btn mt-4">
                Open the e-book
              </a>
            ) : (
              <p className="mt-2 text-sm text-muted">We&apos;ll send you the e-book link on WhatsApp and by email shortly.</p>
            )}
          </div>
        ) : null}

        {boughtProgram ? (
          <>
            <ol className="mx-auto mt-8 max-w-[520px] space-y-3 text-left text-muted">
              <li>1. Fill in your first day form: your goals, routine, food and health.</li>
              <li>2. Your coach prepares your personalized diet plan and sends it on WhatsApp.</li>
              <li>3. Your recorded workouts are ready in your member area.</li>
            </ol>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/dashboard/first-day" className="btn">
                Next: fill in your first day form
              </Link>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                Message us on WhatsApp
              </a>
            </div>
          </>
        ) : (
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/programs" className="btn btn-ghost">
              See our programs
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
