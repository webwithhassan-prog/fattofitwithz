/**
 * HOMEPAGE - approved Blossom design (docs/13-approved-design-decisions.md).
 * Sections, top to bottom:
 *   Hero carousel -> Trust strip -> Programs carousel -> Recommended carousel ->
 *   How it works -> Before/after -> Founder carousel (12 photos) -> FAQ
 */
import Link from "next/link";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { TrustStrip } from "@/components/home/TrustStrip";
import { StepsSection } from "@/components/home/StepsSection";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { FounderCarousel } from "@/components/home/FounderCarousel";
import { FaqList } from "@/components/home/FaqList";
import { ProgramsCarousel } from "@/components/programs/ProgramsCarousel";
import { RecommendedCarousel } from "@/components/programs/RecommendedCarousel";
import { RegionProvider } from "@/components/pricing/RegionProvider";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getFaqs,
  getFounderSlides,
  getGoals,
  getHeroBanners,
  getHomeFaqs,
  getPriceTable,
  getPrograms,
  getRegions,
  whatsappLink,
} from "@/lib/content";
import { getInitialRegion } from "@/lib/region.server";
import { buildMetadata, faqSchema, founderSchema } from "@/lib/seo";

export const metadata = buildMetadata({
  path: "/",
  description:
    "Online nutrition and fitness coaching for women by nutritionist Zaineb Danish. Programs for fat loss, PCOS, thyroid and diabetes, built around desi food.",
});

export default async function HomePage() {
  const initialRegion = await getInitialRegion();
  const [hero, founder, homeFaqs, allFaqs, programs, goals, regions, table, whatsappHref] = await Promise.all([
    getHeroBanners(),
    getFounderSlides(),
    getHomeFaqs(),
    getFaqs(),
    getPrograms(),
    getGoals(),
    getRegions(),
    getPriceTable(),
    whatsappLink(),
  ]);

  return (
    <>
      <JsonLd data={[await founderSchema(), faqSchema(homeFaqs)]} />

      <HeroCarousel banners={hero.banners} autoplayMs={hero.autoplayMs} whatsappHref={whatsappHref} />
      <TrustStrip />

      <RegionProvider initialRegion={initialRegion} regions={regions} table={table}>
        <section className="section" id="programs">
          <div className="container-site">
            <SectionHeading
              kicker="Programs"
              title="Choose your"
              highlight="program"
              lead="Every program includes a personalized diet plan, recorded home workouts and regular follow-ups."
            />
            <ProgramsCarousel programs={programs} />
          </div>
        </section>

        <section className="section bg-blush" id="recommended">
          <div className="container-site">
            <SectionHeading
              kicker="Recommended for you"
              title="What's your"
              highlight="main goal?"
              lead="Pick one and we'll line up the programs that fit best."
            />
            <RecommendedCarousel goals={goals} programs={programs} />
          </div>
        </section>
      </RegionProvider>

      <StepsSection />

      <section className="section bg-blush" id="results">
        <div className="container-site grid items-center gap-[clamp(24px,5vw,64px)] md:grid-cols-2">
          <BeforeAfter
            before="/images/results/before-71kg.jpg"
            after="/images/results/after-61kg.jpg"
            beforeAlt="Client before the program, 71 kg"
            afterAlt="The same client after the program, 61 kg"
          />
          <Reveal>
            <div className="gold-rule gold-rule-left">
              <span className="kicker">Real people. Real results.</span>
            </div>
            <h2 className="mt-3 text-[clamp(30px,4.4vw,46px)]">
              Transformations that <span className="script">inspire</span>
            </h2>
            <p className="lead mt-3.5">
              Drag the handle to compare. Every story on our testimonials page comes with the result and the program used.
            </p>
            <p className="mt-5 font-display text-[26px]">
              71 kg → 61 kg <span className="text-brand">· −10 kg</span>
            </p>
            <p className="tracking-[3px] text-gold" aria-label="Rated 5 out of 5">
              ★★★★★
            </p>
            <p className="mt-2 text-xs text-muted">Individual results vary.</p>
            <Link href="/testimonials" className="btn btn-ghost mt-5">
              See all transformations
            </Link>
          </Reveal>
        </div>
      </section>

      <FounderCarousel slides={founder.slides} author={founder.author} authorTitle={founder.authorTitle} />

      <section className="section bg-blush" id="faq">
        <div className="container-site">
          <SectionHeading kicker="FAQ" title="Questions," highlight="answered" />
          <FaqList items={homeFaqs} />
          <p className="mt-8 text-center">
            <Link href="/faq" className="btn btn-ghost">
              Read all {allFaqs.length} FAQs
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
