/** /about - the coach, mission, qualifications, expertise and recognition. */
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPagePhotos, getSettings } from "@/lib/content";
import { breadcrumbSchema, buildMetadata, founderSchema } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About Zaineb Danish",
  path: "/about",
  description:
    "Meet Zaineb Danish, nutritionist and certified fitness coach with a Master's in Dietetics, helping women get healthier without extreme restrictions.",
});

const APPROACH = ["Balanced nutrition", "Regular movement", "Consistency", "Healthy lifestyle habits", "Personalized support"];

export default async function AboutPage() {
  // Photos are changed in admin > Site photos
  const [s, photos] = await Promise.all([getSettings(), getPagePhotos()]);
  return (
    <>
      <JsonLd data={[await founderSchema(), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])]} />

      <section className="section bg-gradient-to-b from-blush to-bg">
        <div className="container-site grid items-center gap-[clamp(28px,6vw,80px)] md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="gold-rule gold-rule-left">
              <span className="kicker">About Fat To Fit With Z</span>
            </div>
            <h1 className="mt-4 text-[clamp(36px,5vw,58px)]">
              Meet <span className="script">Zaineb Danish</span>
            </h1>
            <p className="mt-2 text-brand-dark">Nutritionist &amp; Certified Fitness Coach</p>
            <p className="lead mt-5">
              Fat To Fit With Z is an online women&apos;s health and fitness platform. We help women reach their health, weight
              management, fitness and lifestyle goals through practical, personalized guidance they can follow in everyday life.
            </p>
            <p className="lead mt-4">
              We focus on nutrition, clinical health, hormonal wellness, weight management and fitness, supporting women with
              different health conditions and lifestyle needs.
            </p>
            <Link href="/programs" className="btn mt-7">
              Explore our programs
            </Link>
          </div>
          <div className="arch-frame w-full max-w-[440px] justify-self-center">
            <Image
              src={photos.aboutPhoto.src}
              alt={photos.aboutPhoto.alt}
              width={720}
              height={900}
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 768px) 440px, 90vw"
              className="arch aspect-[4/5] w-full"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-site grid gap-8 md:grid-cols-2">
          <Reveal className="card p-7">
            <h2 className="text-[28px]">
              Our <span className="script">mission</span>
            </h2>
            <p className="mt-3 text-muted">
              To help women achieve their health and fitness goals without extreme restrictions. Sustainable results come from
              the right balance of nutrition, movement, consistency and a healthy lifestyle.
            </p>
          </Reveal>
          <Reveal className="card p-7">
            <h2 className="text-[28px]">
              Our <span className="script">approach</span>
            </h2>
            <p className="mt-3 text-muted">
              Every woman has different goals, routines, food preferences, health needs and fitness levels, so guidance is
              personalized rather than one-size-fits-all. We help you build routines that combine:
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {APPROACH.map((a) => (
                <li key={a} className="chip">{a}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section bg-blush">
        <div className="container-site grid gap-10 md:grid-cols-2">
          <div>
            <SectionHeading kicker="Qualifications" title="Trained in" highlight="nutrition & fitness" align="left" />
            <ul className="flex flex-col gap-3">
              {s.qualifications.map((q) => (
                <li key={q} className="card flex items-center gap-3 px-4 py-3">
                  <span aria-hidden="true" className="h-2 w-2 flex-none rounded-full bg-gold" />
                  {q}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading kicker="Areas of expertise" title="Support for" highlight="every goal" align="left" />
            <ul className="grid gap-3 sm:grid-cols-2">
              {s.expertise.map((e) => (
                <li key={e} className="card px-4 py-3 text-[15px]">
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section bg-blush text-center">
        <div className="container-site">
          <h2 className="text-[clamp(28px,4vw,42px)]">
            A healthier lifestyle starts with the <span className="script">right guidance</span>
          </h2>
          <p className="lead mx-auto mt-4">
            Choose the program that fits your goals and take the first step toward a healthier, stronger and more sustainable
            lifestyle.
          </p>
          <Link href="/programs" className="btn mt-7">
            Explore our programs
          </Link>
        </div>
      </section>
    </>
  );
}
