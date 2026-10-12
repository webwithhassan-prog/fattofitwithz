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
import { getEbook, getExchangeRates, getPriceTable, getRegions } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const ebook = await getEbook();
  return buildMetadata({ title: ebook.title, path: "/ebook", description: ebook.description.slice(0, 155) });
}

const POINTS = ["68 desi recipes: roti, dal, sabzi, chai", "1200 kcal a day, budget friendly", "Thyroid, PCOS and diabetes friendly", "Instant Google Drive link after payment"];

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
                <li key={point} className="flex gap-3 leading-snug">
                  <CheckBullet />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <EbookBuy />
          </div>
        </div>
      </section>
    </RegionProvider>
  );
}
