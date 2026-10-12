/** /programs - all six programs with region prices and a comparison table. */
import Link from "next/link";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { RegionProvider } from "@/components/pricing/RegionProvider";
import { RegionSelect } from "@/components/pricing/RegionSelect";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { getExchangeRates, getPriceTable, getPrograms, getRegions, whatsappLink } from "@/lib/content";
import { durationLabel } from "@/lib/pricing";
import { breadcrumbSchema, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Programs & Prices",
  path: "/programs",
  description:
    "Compare six online coaching programs for women: Kickstart, Fat Loss, Diabetes Control, Health Concerns, Total Transformation and Premium Signature.",
});

export default async function ProgramsPage() {
  const [programs, regions, table, helpHref, rates] = await Promise.all([
    getPrograms(),
    getRegions(),
    getPriceTable(),
    whatsappLink("Hi, I need help choosing a program."),
    getExchangeRates(),
  ]);

  return (
    <RegionProvider regions={regions} table={table} rates={rates}>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Programs", path: "/programs" }])} />

      <section className="section bg-gradient-to-b from-blush to-bg">
        <div className="container-site">
          <SectionHeading
            as="h1"
            kicker="Programs"
            title="Find the program that"
            highlight="fits your goals"
            lead="Every program includes a personalized diet plan built around desi food (sent on WhatsApp), recorded home workouts and regular follow-ups with your coach."
          />
          <div className="mb-6 flex justify-center">
            <RegionSelect />
          </div>
          {/* "stagger": the cards fade up one after another when scrolled into view */}
          <Reveal className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <ProgramCard key={program.slug} program={program} />
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container-site">
          <SectionHeading kicker="Compare" title="Programs" highlight="side by side" />
          <div className="overflow-x-auto rounded-[12px] border border-line">
            <table className="w-full min-w-[720px] border-collapse bg-card text-left text-[15px]">
              <caption className="sr-only">Comparison of Fat To Fit With Z programs</caption>
              <thead className="bg-blush">
                <tr>
                  <th scope="col" className="p-4 font-display text-lg font-medium">Program</th>
                  <th scope="col" className="p-4 font-display text-lg font-medium">Best for</th>
                  <th scope="col" className="p-4 font-display text-lg font-medium">Duration</th>
                  <th scope="col" className="p-4 font-display text-lg font-medium">Includes</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => (
                  <tr key={p.slug} className="border-t border-line align-top">
                    <th scope="row" className="p-4 font-medium">
                      <Link href={`/programs/${p.slug}`} className="text-brand-dark hover:underline">
                        {p.name}
                      </Link>
                    </th>
                    <td className="p-4 text-muted">{p.focus}</td>
                    <td className="p-4 text-muted">
                      {p.durations.map((d) => durationLabel(d.months, d.isMinimum)).join(" or ")}
                    </td>
                    <td className="p-4 text-muted">
                      Diet plan, recorded workouts, follow-ups
                      {p.includes.length ? ", e-book" : ""}
                      {p.slug === "premium-signature" ? ", one-to-one follow-ups" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-8 text-center text-muted">
            Not sure which one fits?{" "}
            <a href={helpHref} className="text-brand-dark underline" target="_blank" rel="noopener noreferrer">
              Ask us on WhatsApp
            </a>{" "}
            or{" "}
            <Link href="/#recommended" className="text-brand-dark underline">
              pick your goal
            </Link>
            .
          </p>
        </div>
      </section>
    </RegionProvider>
  );
}
