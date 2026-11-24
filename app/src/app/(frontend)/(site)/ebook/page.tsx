/**
 * /ebook - the recipe e-books on their own (no account needed to buy).
 * Each e-book (title, description, cover, key points, chapters, Drive link) is edited in
 * admin > Website > E-books. Prices per country: admin > Prices ("E-book price", same for every e-book).
 */
import Image from "next/image";
import { notFound } from "next/navigation";
import { EbookBuy } from "@/components/checkout/EbookBuy";
import { RegionProvider } from "@/components/pricing/RegionProvider";
import { CheckBullet } from "@/components/ui/CheckBullet";
import { Reveal } from "@/components/ui/Reveal";
import { getEbooks, getExchangeRates, getPriceTable, getRegions } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { memberHasProgram, paymentMode } from "@/lib/checkout.server";
import { getCurrentMember } from "@/lib/auth/session.server";

export async function generateMetadata() {
  const ebooks = await getEbooks();
  const title = ebooks.length > 1 ? "Recipe E-books: Healthy Desi Meals & Desserts" : (ebooks[0]?.title ?? "E-book");
  return buildMetadata({ title, path: "/ebook", description: (ebooks[0]?.description ?? "").slice(0, 155) });
}

export default async function EbookPage() {
  const [ebooks, regions, table, rates, mode, member] = await Promise.all([getEbooks(), getRegions(), getPriceTable(), getExchangeRates(), paymentMode(), getCurrentMember()]);
  // Logged-in clients who already have a program see (and pay) the lower e-book price
  const memberPrice = await memberHasProgram(member?.id);
  if (!ebooks.length) notFound();
  const many = ebooks.length > 1;

  return (
    <RegionProvider regions={regions} table={table} rates={rates}>
      {/* Top: the covers + the buy box */}
      <section className="section bg-gradient-to-b from-blush to-bg">
        <div className="container-site grid items-center gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative isolate flex justify-center">
            <div aria-hidden="true" className="absolute inset-[10%] -z-10 rounded-full bg-brand/30 blur-3xl" />
            {ebooks.map((ebook, i) =>
              ebook.cover ? (
                <Image
                  key={ebook.slug}
                  src={ebook.cover.src}
                  alt={ebook.cover.alt}
                  width={ebook.cover.width}
                  height={ebook.cover.height}
                  sizes="(min-width: 768px) 300px, 44vw"
                  loading="eager"
                  fetchPriority={i === 0 ? "high" : "auto"}
                  className={`float-soft rounded-xl shadow-[0_30px_60px_-24px_rgba(43,26,36,0.55)] ${
                    many ? `w-[min(42vw,260px)] ${i === 0 ? "-rotate-3" : "-ml-10 mt-10 rotate-3"}` : "w-[min(52vw,360px)]"
                  }`}
                />
              ) : null,
            )}
          </div>
          <div>
            <p className="kicker">{many ? "E-books" : "E-book"}</p>
            <h1 className="mt-3 text-[clamp(34px,5vw,54px)]">
              {many ? (
                <>
                  Recipe <span className="script">e-books</span>
                </>
              ) : (
                ebooks[0].title
              )}
            </h1>
            <p className="lead mt-4 whitespace-pre-line">
              {many ? "Measured portions and calories on every recipe, made for desi kitchens. Get one or both." : ebooks[0].description}
            </p>
            <EbookBuy paymentMode={mode} memberPrice={memberPrice} ebooks={ebooks.map(({ slug, title, cover }) => ({ slug, title, cover }))} />
          </div>
        </div>
      </section>

      {/* One section per e-book: what's inside */}
      {ebooks.map((ebook, n) => (
        <section key={ebook.slug} id={ebook.slug} className={`section ${n % 2 ? "bg-blush/40" : ""}`}>
          <div className="container-site">
            <div className="mx-auto mb-8 grid max-w-[900px] items-center gap-6 sm:grid-cols-[150px_1fr]">
              {ebook.cover ? (
                <Image src={ebook.cover.src} alt="" width={150} height={210} className="mx-auto w-[130px] rounded-lg shadow-[0_18px_36px_-18px_rgba(43,26,36,0.55)] sm:w-[150px]" />
              ) : null}
              <div>
                <p className="kicker">What&apos;s inside</p>
                <h2 className="mt-2 text-[clamp(28px,4vw,40px)]">{ebook.title}</h2>
                {many ? <p className="mt-2 text-[15px] whitespace-pre-line text-muted">{ebook.description}</p> : null}
                {ebook.points.length ? (
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {ebook.points.map((point) => (
                      <li key={point} className="flex gap-2.5 leading-snug font-medium">
                        <CheckBullet />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>

            {ebook.chapters.length ? (
              <Reveal as="ol" className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ebook.chapters.map((chapter, i) => (
                  <li key={chapter.title} className="card card-hover flex flex-col gap-3 p-5">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.14em] text-brand-dark uppercase">Chapter {String(i + 1).padStart(2, "0")}</p>
                      <h3 className="text-[22px] font-semibold">{chapter.title}</h3>
                      {chapter.note ? <p className="mt-1 text-sm font-semibold text-muted">{chapter.note}</p> : null}
                    </div>
                    <ul className="flex flex-col gap-1.5 text-[15px] font-medium text-ink/85">
                      {chapter.highlights.map((recipe) => (
                        <li key={recipe} className="flex gap-2.5 leading-snug">
                          <CheckBullet />
                          <span>{recipe}</span>
                        </li>
                      ))}
                      <li className="pl-7 text-sm text-muted italic">and more…</li>
                    </ul>
                  </li>
                ))}
              </Reveal>
            ) : null}

            {ebook.guides.length ? (
              <div className="mx-auto mt-8 max-w-[860px] rounded-[18px] bg-blush p-5 text-center">
                <p className="font-display text-xl font-semibold">Also inside</p>
                <ul className="mt-3 flex flex-wrap justify-center gap-2">
                  {ebook.guides.map((guide) => (
                    <li key={guide} className="rounded-full border border-brand/30 bg-card px-3.5 py-1.5 text-sm font-semibold text-brand-dark">{guide}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      ))}
    </RegionProvider>
  );
}
