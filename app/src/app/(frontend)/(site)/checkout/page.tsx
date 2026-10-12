/**
 * /checkout?program=fat-loss&months=2&ebook=1
 * Order summary + the few details we need before payment (name, email, WhatsApp, password).
 * Everything else (health, food, measurements) she fills in later in the first day form.
 * Logged-in members only confirm their WhatsApp number.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { RegionProvider } from "@/components/pricing/RegionProvider";
import { getEbook, getExchangeRates, getPriceTable, getProgram, getRegions } from "@/lib/content";
import { getCurrentMember } from "@/lib/auth/session.server";
import { buildMetadata } from "@/lib/seo";
import { isStripeTestMode } from "@/lib/stripe.server";

export const metadata = buildMetadata({ title: "Checkout", path: "/checkout", noIndex: true });

type PageProps = { searchParams: Promise<{ program?: string; months?: string; ebook?: string; cancelled?: string }> };

export default async function CheckoutPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const program = await getProgram(query.program ?? "");
  if (!program) notFound();

  const requested = Number(query.months);
  const duration = program.durations.find((d) => d.months === requested) ?? program.durations[0];
  const [ebook, regions, table, rates, member] = await Promise.all([getEbook(), getRegions(), getPriceTable(), getExchangeRates(), getCurrentMember()]);

  return (
    <RegionProvider regions={regions} table={table} rates={rates}>
      <section className="section bg-gradient-to-b from-blush to-bg">
        <div className="container-site max-w-[960px]">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
            <Link href="/programs" className="hover:text-brand-dark">Programs</Link> /{" "}
            <Link href={`/programs/${program.slug}`} className="hover:text-brand-dark">{program.name}</Link> /{" "}
            <span aria-current="page" className="text-ink">Checkout</span>
          </nav>
          <h1 className="mb-8 text-[clamp(32px,5vw,48px)]">
            Almost <span className="script">there</span>
          </h1>
          <CheckoutForm
            program={{ slug: program.slug, name: program.name, focus: program.focus }}
            months={duration.months}
            durationLabel={duration.label}
            ebook={ebook.enabled ? { title: ebook.title, cover: ebook.cover } : null}
            startWithEbook={query.ebook === "1"}
            member={member ? { email: member.email, fullName: member.fullName ?? "", phone: member.phone ?? "" } : null}
            cancelled={query.cancelled === "1"}
            testMode={isStripeTestMode() || !process.env.STRIPE_SECRET_KEY}
          />
        </div>
      </section>
    </RegionProvider>
  );
}
