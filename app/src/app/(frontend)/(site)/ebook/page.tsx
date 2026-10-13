/**
 * /ebook - the recipe e-book on its own (no account needed to buy).
 * Title, description, cover and the Google Drive link are edited in admin > Website > E-book.
 * Prices per country: admin > Prices ("E-book price").
 */
import Image from "next/image";
import { notFound } from "next/navigation";
import { EbookBuy } from "@/components/checkout/EbookBuy";
import { RegionProvider } from "@/components/pricing/RegionProvider";
import { CheckBullet } from "@/components/ui/CheckBullet";
import { Droplet, Heart, Leaf, Sparkle, Star, Sun, Utensils } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EBOOK_CHAPTERS, EBOOK_GUIDES } from "@/lib/ebook-contents";
import { getEbook, getExchangeRates, getPriceTable, getRegions } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const ebook = await getEbook();
  return buildMetadata({ title: ebook.title, path: "/ebook", description: ebook.description.slice(0, 155) });
}

const POINTS = ["Everyday desi recipes: roti, dal, sabzi, chai", "1200 kcal a day, budget friendly", "Thyroid, PCOS and diabetes friendly", "Instant Google Drive link after payment"];

const CHAPTER_ICONS = { sun: Sun, utensils: Utensils, sparkle: Sparkle, leaf: Leaf, heart: Heart, star: Star, droplet: Droplet };

export default async function EbookPage() {
  const [ebook, regions, table, rates] = await Promise.all([getEbook(), getRegions(), getPriceTable(), getExchangeRates()]);
  if (!ebook.enabled) notFound();

  return (
    <RegionProvider regions={regions} table={table} rates={rates}>
      <section className="section bg-gradient-to-b from-blush to-bg">
        <div className="container-site grid items-center gap-10 md:grid-cols-[0.9fr_1.1fr]">
          {ebook.cover ? (
            <div className="relative isolate justify-self-center">
              <div aria-hidden="true" className="absolute inset-[10%] -z-10 rounded-full bg-brand/30 blur-3xl" />
              <Image
                src={ebook.cover.src}
                alt={ebook.cover.alt}
                width={ebook.cover.width}
                height={ebook.cover.height}
                sizes="(min-width: 768px) 360px, 52vw"
                loading="eager"
                fetchPriority="high"
                className="float-soft w-[min(52vw,360px)] rounded-xl shadow-[0_30px_60px_-24px_rgba(43,26,36,0.55)]"
              />
            </div>
          ) : null}
          <div>
            <p className="kicker">E-book</p>
            <h1 className="mt-3 text-[clamp(34px,5vw,54px)]">{ebook.title}</h1>
            <p className="lead mt-4 whitespace-pre-line">{ebook.description}</p>
            <ul className="mt-6 flex flex-col gap-2.5">
              {POINTS.map((point) => (
                <li key={point} className="flex gap-3 leading-snug font-medium">
                  <CheckBullet />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <EbookBuy />
          </div>
        </div>
      </section>

      {/* Index: what's inside the book */}
      <section className="section" id="inside">
        <div className="container-site">
          <SectionHeading kicker="What's inside" title="Every chapter," highlight="at a glance" lead="Measured portions and calories on every recipe, plus guides that make the plan easy to follow." />
          <Reveal as="ol" className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EBOOK_CHAPTERS.map((chapter, i) => {
              const Icon = CHAPTER_ICONS[chapter.icon];
              return (
                <li key={chapter.title} className="card card-hover flex flex-col gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-brand/15 text-brand-dark"><Icon className="h-5.5 w-5.5" /></span>
                    <div>
                      <p className="text-xs font-semibold tracking-[0.14em] text-brand-dark uppercase">Chapter {String(i + 1).padStart(2, "0")}</p>
                      <h3 className="text-[22px] font-semibold">{chapter.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-muted">{chapter.note}</p>
                  <ul className="flex flex-col gap-1.5 text-[15px] font-medium text-ink/85">
                    {chapter.highlights.map((recipe) => (
                      <li key={recipe} className="flex gap-2.5 leading-snug"><CheckBullet /><span>{recipe}</span></li>
                    ))}
                    <li className="pl-7 text-sm text-muted italic">and more…</li>
                  </ul>
                </li>
              );
            })}
          </Reveal>
          <div className="mx-auto mt-8 max-w-[860px] rounded-[18px] bg-blush p-5 text-center">
            <p className="font-display text-xl font-semibold">Also inside</p>
            <ul className="mt-3 flex flex-wrap justify-center gap-2">
              {EBOOK_GUIDES.map((guide) => (
                <li key={guide} className="rounded-full border border-brand/30 bg-card px-3.5 py-1.5 text-sm font-semibold text-brand-dark">{guide}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </RegionProvider>
  );
}
