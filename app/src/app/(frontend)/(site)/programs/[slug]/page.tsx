/**
 * /programs/[slug] - one program: what's included, who it's for, how it works,
 * and the purchase box ("Join now" -> e-book offer -> /checkout).
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgramPurchase } from "@/components/programs/ProgramPurchase";
import { RegionProvider } from "@/components/pricing/RegionProvider";
import { FaqList } from "@/components/home/FaqList";
import { JsonLd } from "@/components/seo/JsonLd";
import { CheckBullet } from "@/components/ui/CheckBullet";
import { Sparkle, Target } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { getEbook, getExchangeRates, getFaqs, getPriceTable, getProgram, getPrograms, getRegions } from "@/lib/content";
import { getPrice } from "@/lib/pricing";
import { breadcrumbSchema, buildMetadata, programSchema } from "@/lib/seo";
import { isStripeTestMode } from "@/lib/stripe.server";

type PageProps = { params: Promise<{ slug: string }> };

/** Pre-build a page for every program. */
export async function generateStaticParams() {
  return (await getPrograms()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) return {};
  return buildMetadata({
    title: `${program.name}: Online Coaching for Women`,
    path: `/programs/${program.slug}`,
    description: `${program.summary.slice(0, 150).trimEnd()}…`,
  });
}

const AFTER_PAYMENT = [
  "You get a welcome email straight away, and your member area opens.",
  "Fill in your first day form: your goals, routine, food preferences and health.",
  "Your coach prepares your personalized diet plan and sends it to you on WhatsApp.",
  "Send a follow-up form when your coach asks. Your plan is adjusted as you progress.",
];

export default async function ProgramPage({ params }: PageProps) {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) notFound();

  const [regions, table, ebook, rates] = await Promise.all([getRegions(), getPriceTable(), getEbook(), getExchangeRates()]);
  // Prices in the structured data (for Google) use the default region (USD).
  const region = regions.find((r) => r.isDefault) ?? regions[0];
  const offerPrices = program.durations.map((d) => ({ months: d.months, cell: getPrice(table, region.code, d.months) }));

  const faqs = (await getFaqs()).filter((f) => [3, 4, 5, 9, 21].includes(f.order));
  const others = (await getPrograms()).filter((p) => p.slug !== program.slug);

  return (
    <RegionProvider regions={regions} table={table} rates={rates}>
      <JsonLd
        data={[
          programSchema(program, region, offerPrices),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Programs", path: "/programs" },
            { name: program.name, path: `/programs/${program.slug}` },
          ]),
        ]}
      />

      <section className="section bg-gradient-to-b from-blush to-bg">
        <div className="container-site">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
            <Link href="/" className="hover:text-brand-dark">Home</Link> / <Link href="/programs" className="hover:text-brand-dark">Programs</Link> /{" "}
            <span aria-current="page" className="text-ink">{program.name}</span>
          </nav>

          <div className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
            <div>
              <span className="rounded-full bg-brand px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-ink uppercase">{program.tag}</span>
              <h1 className="mt-4 text-[clamp(36px,5vw,56px)] font-semibold">{program.name}</h1>
              <p className="mt-2 text-lg font-semibold text-brand-dark">{program.focus}</p>
              <p className="mt-5 text-[17px] leading-relaxed font-medium text-ink/85">{program.summary}</p>

              {program.covers.length ? (
                <>
                  <h2 className="mt-10 text-2xl font-semibold">Covers</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {program.covers.map((c) => (
                      <li key={c} className="rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-sm font-semibold text-brand-dark">{c}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              <h2 className="mt-10 text-2xl font-semibold">Main benefits</h2>
              <Reveal as="ul" className="stagger mt-4 grid gap-3 sm:grid-cols-2">
                {program.fullBenefits.map((b) => (
                  <li key={b} className="card card-hover flex gap-3 p-4 leading-snug font-medium text-ink">
                    <CheckBullet />
                    <span>{b}</span>
                  </li>
                ))}
              </Reveal>

              <div className="mt-10 grid gap-4">
                <div className="card p-5">
                  <h2 className="flex items-center gap-3 text-2xl font-semibold">
                    <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-brand/15 text-brand-dark"><Target className="h-5 w-5" /></span>
                    Who is this program for?
                  </h2>
                  <p className="mt-3 leading-relaxed font-medium text-ink/80">{program.whoIsItFor}</p>
                </div>
                <div className="card p-5">
                  <h2 className="flex items-center gap-3 text-2xl font-semibold">
                    <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-brand/15 text-brand-dark"><Sparkle className="h-5 w-5" /></span>
                    How the program works
                  </h2>
                  <p className="mt-3 leading-relaxed font-medium text-ink/80">{program.howItWorks}</p>
                </div>
              </div>

              <h2 className="mt-10 text-2xl font-semibold">What happens after you pay</h2>
              <ol className="mt-4 flex flex-col gap-3">
                {AFTER_PAYMENT.map((step, i) => (
                  <li key={step} className="flex items-start gap-3.5 rounded-[14px] bg-blush/70 p-3.5">
                    <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-brand font-display text-base font-semibold text-ink">{i + 1}</span>
                    <span className="pt-1 font-medium text-ink/85">{step}</span>
                  </li>
                ))}
              </ol>

              <p className="mt-8 rounded-lg bg-blush px-4 py-3 text-sm text-muted">
                This is a wellness and nutrition program, not a medical service. If you take medication or have a medical
                condition, keep working with your doctor. Results vary from person to person.
              </p>
            </div>

            <div>
              <ProgramPurchase program={program} ebook={ebook} testMode={isStripeTestMode() || !process.env.STRIPE_SECRET_KEY} />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-site">
          <h2 className="mb-6 text-center text-[clamp(28px,4vw,40px)]">
            Common <span className="script">questions</span>
          </h2>
          <FaqList items={faqs} />
        </div>
      </section>

      <section className="section bg-blush">
        <div className="container-site">
          <h2 className="mb-6 text-center text-[clamp(28px,4vw,40px)]">
            Other <span className="script">programs</span>
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {others.map((p) => (
              <li key={p.slug}>
                <Link href={`/programs/${p.slug}`} className="card card-hover block h-full p-5">
                  <span className="font-display text-lg">{p.name}</span>
                  <span className="mt-1 block text-sm text-muted">{p.focus}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </RegionProvider>
  );
}
