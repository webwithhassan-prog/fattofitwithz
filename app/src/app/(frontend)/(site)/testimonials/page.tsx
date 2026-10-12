/**
 * /testimonials - before/after results (shown uncropped), video testimonials and reviews.
 * The old site cropped the posters to squares and its slider arrows did nothing;
 * here every image is visible in a grid.
 */
import Image from "next/image";
import Link from "next/link";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InstagramIcon } from "@/components/ui/Icons";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBeforeAfters, getInstagramItems, getPagePhotos, getSettings } from "@/lib/content";
import { breadcrumbSchema, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Transformations & Testimonials",
  path: "/testimonials",
  description:
    "Real results from women coached by Fat To Fit With Z: before-and-after transformations, video testimonials and client reviews.",
});

const TYPE_LABEL = { video: "Video testimonial", review: "Client review", transformation: "Transformation" } as const;

export default async function TestimonialsPage() {
  const [results, instagram, { social }, photos] = await Promise.all([getBeforeAfters(), getInstagramItems(), getSettings(), getPagePhotos()]);

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Testimonials", path: "/testimonials" }])} />

      <section className="section bg-gradient-to-b from-blush to-bg">
        <div className="container-site">
          <SectionHeading
            as="h1"
            kicker="Real people. Real results."
            title="Transformations that"
            highlight="inspire"
            lead="Real journeys and real progress from women who trusted Fat To Fit With Z and committed to changing their lives."
          />
          <div className="grid items-center gap-10 md:grid-cols-2">
            <BeforeAfter before={photos.before.src} after={photos.after.src} beforeAlt={photos.before.alt} afterAlt={photos.after.alt} />
            <div>
              <p className="font-display text-[30px]">
                71 kg → 61 kg <span className="text-brand-dark">· −10 kg</span>
              </p>
              <p className="lead mt-3">Drag the handle to compare. Below is every transformation our clients agreed to share.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-site">
          <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {results.map((r) => (
              <li key={r.image} className="card mb-5 break-inside-avoid overflow-hidden">
                <Image
                  src={r.image}
                  alt={
                    r.startKg && r.endKg
                      ? `Client transformation from ${r.startKg} kg to ${r.endKg} kg`
                      : "Client before and after transformation"
                  }
                  width={r.width}
                  height={r.height}
                  sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 92vw"
                  className="h-auto w-full"
                />
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="tracking-[2px] text-gold" aria-label="Rated 5 out of 5">★★★★★</span>
                  {r.startKg && r.endKg ? (
                    <span className="rounded-full bg-brand px-3 py-1 text-sm text-white">
                      {r.startKg} → {r.endKg} kg · −{r.lossKg} kg
                    </span>
                  ) : (
                    <span className="rounded-full border border-brand px-3 py-1 text-sm text-brand-dark">Before &amp; after</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-center text-sm text-muted">
            Individual results vary and depend on consistency, starting point, health and lifestyle.
          </p>
        </div>
      </section>

      <section className="section bg-blush">
        <div className="container-site">
          <SectionHeading
            kicker="Client experiences"
            title="Hear it from"
            highlight="our clients"
            lead="Video testimonials and reviews shared on Instagram."
          />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {instagram
              .filter((item) => item.type !== "transformation")
              .map((item, i) => (
                <li key={item.url}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card card-hover flex items-center gap-3 px-4 py-3.5"
                  >
                    <InstagramIcon className="h-6 w-6 text-brand-dark" />
                    <span>
                      <span className="block font-display text-lg">
                        {TYPE_LABEL[item.type]} {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm text-muted">Watch on Instagram (opens in a new tab)</span>
                    </span>
                  </a>
                </li>
              ))}
          </ul>
          <div className="mt-10 text-center">
            <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              More on Instagram
            </a>
          </div>
        </div>
      </section>

      <section className="section text-center">
        <div className="container-site">
          <h2 className="text-[clamp(28px,4vw,42px)]">
            Your journey can <span className="script">start today</span>
          </h2>
          <p className="lead mx-auto mt-4">Your transformation begins with one decision.</p>
          <Link href="/programs" className="btn mt-7">
            Explore our programs
          </Link>
        </div>
      </section>
    </>
  );
}
