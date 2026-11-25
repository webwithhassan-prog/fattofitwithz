/**
 * Content layer: the ONLY place pages read website content from.
 *
 * Content lives in the database and is edited in the admin panel (/admin).
 * Each function below:
 *   1. reads from Payload (the database),
 *   2. converts the result into the simple shapes in ./types.ts that components use,
 *   3. is cached across visits until the coach saves something in /admin
 *      (see cachedContent below and src/payload/hooks/revalidateSite.ts).
 *
 * Debugging tip: if the site shows old content, saving any item in /admin refreshes everything.
 * The cache also expires by itself after an hour, as a safety net. `npm run migrate` and
 * `npm run seed` change the database directly (no refresh), so restart `npm run dev` after them.
 */
import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPayloadClient } from "./payload.server";
import { CONTENT_CACHE_TAG } from "./cache-tags";
import { durationLabel, type Rates } from "./pricing";
import type { Media } from "@/payload-types";
import type {
  BeforeAfter,
  EbookOffer,
  FaqItem,
  Goal,
  HeroBanner,
  InstagramItem,
  OwnPrices,
  PaymentSettings,
  PriceCell,
  Program,
  Region,
  RegionCode,
  SiteSettings,
  WorkoutSession,
} from "./types";

/**
 * Wraps a database query so that:
 * - across visits, the result is kept in Next.js' cache (tagged CONTENT_CACHE_TAG),
 * - within one page render, repeated calls share one result (React cache).
 */
function cachedContent<T>(name: string, query: () => Promise<T>): () => Promise<T> {
  return cache(unstable_cache(query, ["content", name], { tags: [CONTENT_CACHE_TAG], revalidate: 3600 }));
}

// ---------- small helpers ----------

/** Payload arrays of { text } rows -> plain strings */
const texts = (rows: { text: string }[] | null | undefined) => (rows ?? []).map((row) => row.text);

/** An upload field is the full Media object when queried with depth >= 1. */
function photo(media: number | Media | null | undefined): { src: string; alt: string; width: number; height: number } {
  if (!media || typeof media === "number" || !media.url) {
    throw new Error("[content] A photo is missing or was not loaded (query with depth: 1).");
  }
  return { src: media.url, alt: media.alt, width: media.width ?? 1200, height: media.height ?? 1200 };
}

/** "https://youtu.be/dGyVLPcUcs8" or "https://www.youtube.com/watch?v=dGyVLPcUcs8" -> "dGyVLPcUcs8" */
export function youtubeId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/);
  return match ? match[1] : "";
}

// ---------- homepage global (hero banners, founder messages, goal picker) ----------

const getHomepageGlobal = cachedContent("homepage", async () => {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "homepage", depth: 1 });
});

// ---------- programs ----------

export const getPrograms = cachedContent("programs", async (): Promise<Program[]> => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({ collection: "programs", sort: "order", limit: 100, depth: 0 });
  return docs.map((p) => ({
    id: p.id,
    ownPrices: (p.ownPrices ?? []).reduce<OwnPrices>((own, row) => {
      const list = (own[row.region as RegionCode] ??= {});
      list[String(row.months)] = { amount: row.amount, compareAt: row.compareAt };
      return own;
    }, {}),
    slug: p.slug,
    name: p.name,
    tag: p.tag ?? "",
    focus: p.focus,
    summary: p.summary,
    durations: p.durations.map((d) => ({
      months: d.months,
      isMinimum: Boolean(d.isMinimum),
      label: durationLabel(d.months, Boolean(d.isMinimum)),
    })),
    benefitsLabel: p.benefitsLabel ?? "Main Benefits",
    cardBenefits: texts(p.cardBenefits),
    fullBenefits: texts(p.fullBenefits),
    covers: texts(p.covers),
    includes: texts(p.includes),
    whoIsItFor: p.whoIsItFor,
    howItWorks: p.howItWorks,
    order: p.order,
  }));
});

/** Returns undefined for an unknown slug, so the page can show a 404. */
export async function getProgram(slug: string): Promise<Program | undefined> {
  return (await getPrograms()).find((p) => p.slug === slug);
}

export async function getGoals(): Promise<Goal[]> {
  const { goals } = await getHomepageGlobal(); // admin > Homepage > Goal picker
  return (goals ?? []).map((g) => {
    const rows = g.programs.filter((row) => typeof row.program === "object");
    const slugOf = (row: (typeof rows)[number]) => (row.program as { slug: string }).slug;
    return {
      id: g.goalId,
      label: g.label,
      healthConcern: Boolean(g.healthConcern),
      order: rows.map(slugOf),
      why: Object.fromEntries(rows.filter((row) => row.why).map((row) => [slugOf(row), row.why as string])),
    };
  });
}

// ---------- pricing ----------

const getPricingGlobal = cachedContent("pricing", async () => {
  const payload = await getPayloadClient();
  return payload.findGlobal({ slug: "pricing", depth: 0 });
});

export async function getRegions(): Promise<Region[]> {
  const { regions } = await getPricingGlobal();
  return regions.map((r) => ({
    code: r.code,
    label: r.label,
    currency: r.currency,
    format: r.format,
    countries: r.countries.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean),
    isDefault: Boolean(r.isDefault),
    ebook: { alone: r.ebookPrice, withPlan: r.ebookPriceWithPlan },
  }));
}

/** Price table: region -> duration in months (as a string key) -> price cell. */
export type PriceTable = Record<RegionCode, Record<string, PriceCell>>;

export async function getPriceTable(): Promise<PriceTable> {
  const { regions } = await getPricingGlobal();
  return Object.fromEntries(
    regions.map((r) => [r.code, Object.fromEntries(r.prices.map((p) => [String(p.months), { amount: p.amount, compareAt: p.compareAt }]))]),
  ) as PriceTable;
}

// ---------- exchange rates (for countries without their own price list) ----------

/**
 * How much of each currency 1 US dollar buys, from ExchangeRate-API's free service
 * (no account or key; updated daily; they ask for a "Rates By Exchange Rate API" link, shown under the
 * country picker). Cached for 12 hours. If the service is down, returns {} and everyone sees
 * their own price list or USD, so a payment never uses a made-up rate.
 */
export const getExchangeRates = unstable_cache(
  async (): Promise<Rates> => {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
      const data = (await res.json()) as { result?: string; rates?: Rates };
      if (data.result !== "success" || !data.rates) throw new Error(`unexpected answer: ${data.result}`);
      return data.rates;
    } catch (error) {
      console.error("[rates] Could not load exchange rates, showing USD for other countries:", error);
      return {};
    }
  },
  ["exchange-rates-usd"],
  { revalidate: 12 * 60 * 60 },
);

// ---------- homepage ----------

export async function getHeroBanners(): Promise<{ autoplayMs: number; banners: HeroBanner[] }> {
  const home = await getHomepageGlobal();
  return {
    autoplayMs: home.autoplaySeconds * 1000,
    banners: home.banners.map((b, i) => {
      const image = photo(b.photo);
      return {
        id: b.id ?? `banner-${i + 1}`,
        photo: image.src,
        photoAlt: image.alt,
        kicker: b.kicker,
        title: b.title,
        titleScript: b.titleScript,
        sub: b.sub,
        primary: b.primary,
        secondary: b.secondary,
        badge: b.badge,
      };
    }),
  };
}

// ---------- FAQs ----------

const getAllFaqs = cachedContent("faqs", async () => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({ collection: "faqs", sort: "order", limit: 300, depth: 0 });
  return docs;
});

/** Questions for the /faq page ("Show on: FAQ page"). */
export async function getFaqs(): Promise<FaqItem[]> {
  const docs = (await getAllFaqs()).filter((f) => f.showOn !== "homepage");
  return docs.map((f) => ({
    order: f.order,
    category: f.category ?? "general",
    question: f.question,
    answer: f.answer,
    bullets: texts(f.bullets),
    answerAfterList: f.answerAfterList || undefined,
  }));
}

/** The short list on the homepage ("Show on: Homepage"). */
export async function getHomeFaqs(): Promise<{ question: string; answer: string }[]> {
  return (await getAllFaqs()).filter((f) => f.showOn === "homepage").map(({ question, answer }) => ({ question, answer }));
}

// ---------- testimonials ----------

const getTestimonials = cachedContent("testimonials", async () => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({ collection: "testimonials", sort: "order", limit: 300, depth: 1 });
  return docs;
});

/** Before/after photos (admin > Testimonials, type "Before / after photo"). */
export async function getBeforeAfters(): Promise<BeforeAfter[]> {
  const docs = (await getTestimonials()).filter((t) => t.type === "photo" && t.image);
  return docs.map((t) => {
    const image = photo(t.image);
    const startKg = t.startKg ?? null;
    const endKg = t.endKg ?? null;
    return {
      order: t.order,
      image: image.src,
      startKg,
      endKg,
      lossKg: startKg !== null && endKg !== null ? Math.round((startKg - endKg) * 10) / 10 : null,
      rating: t.rating ?? 5,
      showOnHome: Boolean(t.showOnHome),
      width: image.width,
      height: image.height,
    };
  });
}

/** Instagram links (admin > Testimonials, type "Instagram post"). */
export async function getInstagramItems(): Promise<InstagramItem[]> {
  const docs = (await getTestimonials()).filter((t) => t.type === "instagram" && t.instagramUrl);
  return docs.map((d) => ({ type: d.instagramKind ?? "transformation", url: d.instagramUrl as string, onLiveSite: Boolean(d.onLiveSite) }));
}

// ---------- recorded workouts (member dashboard) ----------

export const getWorkoutSessions = cachedContent("workouts", async (): Promise<WorkoutSession[]> => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({ collection: "workout-sessions", sort: "week", limit: 500, depth: 0 });
  return docs
    .map((s) => ({ week: s.week, day: s.day, workout: s.workout, url: s.youtubeUrl, youtubeId: youtubeId(s.youtubeUrl) }))
    .sort((a, b) => a.week - b.week || a.day - b.day);
});

// ---------- legal pages ----------

export const getLegalPages = cachedContent("legal", async () => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({ collection: "legal-pages", limit: 20, depth: 0 });
  return docs.map((d) => ({ slug: d.slug, title: d.title, effectiveDate: d.effectiveDate ?? "", body: d.body }));
});

// ---------- e-book ----------

/** Every e-book, also the ones switched off (buyers keep their links). Use getEbooks() to sell. */
export const getAllEbooks = cachedContent("ebooks", async (): Promise<EbookOffer[]> => {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({ collection: "ebooks", sort: "order", limit: 20, depth: 1 });
  return docs.map((e) => ({
    id: e.id,
    slug: e.slug,
    enabled: Boolean(e.enabled),
    title: e.title,
    description: e.description,
    cover: e.cover && typeof e.cover === "object" && e.cover.url ? photo(e.cover) : null,
    driveLink: e.driveLink?.trim() ?? "",
    points: texts(e.points),
    chapters: (e.chapters ?? []).map((c) => ({
      title: c.title,
      note: c.note ?? "",
      highlights: (c.highlights ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
    })),
    guides: texts(e.guides),
  }));
});

/** The e-books on sale, in admin order. */
export async function getEbooks(): Promise<EbookOffer[]> {
  return (await getAllEbooks()).filter((e) => e.enabled);
}

// ---------- page photos (About page + before/after slider) ----------

/** position: CSS object-position, e.g. "40% 15%" (set with "Adjust position" in admin > Site photos) */
export type SimplePhoto = { src: string; alt: string; position?: string };
export type PagePhotos = {
  aboutPhoto: SimplePhoto;
  before: SimplePhoto;
  after: SimplePhoto;
  /** weights shown with the before/after slider, e.g. 71 and 61 (null = not shown) */
  beforeKg: number | null;
  afterKg: number | null;
};

/** Used when a photo hasn't been chosen in admin > Page photos (the original files in public/images). */
const PAGE_PHOTO_FALLBACKS: Omit<PagePhotos, "beforeKg" | "afterKg"> = {
  aboutPhoto: { src: "/images/coach/coach-p03.jpg", alt: "Portrait of Zaineb Danish" },
  before: { src: "/images/results/before-71kg.jpg", alt: "Client before the program, 71 kg" },
  after: { src: "/images/results/after-61kg.jpg", alt: "The same client after the program, 61 kg" },
};

/** A chosen photo, or the fallback when the field is empty. */
function photoOr(media: number | Media | null | undefined, fallback: SimplePhoto): SimplePhoto {
  if (!(media && typeof media === "object" && media.url)) return fallback;
  return { src: media.url, alt: media.alt, position: photoPosition(media) };
}

/** The photo's chosen position (focal point); 50/50 = never set, then undefined (each place uses its own default). */
export function photoPosition(media: Pick<Media, "focalX" | "focalY">): string | undefined {
  const x = media.focalX ?? 50;
  const y = media.focalY ?? 50;
  return x === 50 && y === 50 ? undefined : `${Math.round(x)}% ${Math.round(y)}%`;
}

export const getPagePhotos = cachedContent("page-photos", async (): Promise<PagePhotos> => {
  const payload = await getPayloadClient();
  const p = await payload.findGlobal({ slug: "page-photos", depth: 1 });
  return {
    aboutPhoto: photoOr(p.aboutPhoto, PAGE_PHOTO_FALLBACKS.aboutPhoto),
    before: photoOr(p.beforePhoto, PAGE_PHOTO_FALLBACKS.before),
    after: photoOr(p.afterPhoto, PAGE_PHOTO_FALLBACKS.after),
    beforeKg: p.beforeKg ?? null,
    afterKg: p.afterKg ?? null,
  };
});

// ---------- settings ----------

export const getSettings = cachedContent("settings", async (): Promise<SiteSettings> => {
  const payload = await getPayloadClient();
  const s = await payload.findGlobal({ slug: "site-settings", depth: 0 });
  const links = (rows: { label: string; href: string }[] | null | undefined) =>
    (rows ?? []).map(({ label, href }) => ({ label, href }));
  return {
    brand: {
      name: s.brand.name,
      legalName: s.brand.legalName,
      founder: s.brand.founder,
      founderTitle: s.brand.founderTitle,
      location: s.brand.location,
      footerDescription: s.brand.footerDescription,
    },
    contact: {
      whatsappE164: s.contact.whatsappE164,
      whatsappUrl: s.contact.whatsappUrl,
      whatsappDefaultMessage: s.contact.whatsappDefaultMessage,
      publicEmail: s.contact.publicEmail,
      legalEmail: s.contact.legalEmail,
    },
    social: {
      instagram: s.social.instagram,
      facebook: s.social.facebook,
      youtube: s.social.youtube,
      tiktok: s.social.tiktok,
    },
    nav: links(s.nav),
    footerLinks: links(s.footerLinks),
    contactSubjects: texts(s.contactSubjects),
    qualifications: texts(s.qualifications),
    expertise: texts(s.expertise),
  };
});

// ---------- payment details ----------

export const getPaymentSettings = cachedContent("payments", async (): Promise<PaymentSettings> => {
  const payload = await getPayloadClient();
  const p = await payload.findGlobal({ slug: "payments", depth: 1 });
  const t = (value: string | null | undefined) => value?.trim() ?? "";
  const logo = (media: number | Media | null | undefined, name: string) =>
    media && typeof media === "object" && media.url ? { src: media.url, alt: media.alt || `${name} logo`, width: media.width ?? 240, height: media.height ?? 80 } : null;
  return {
    cardPayments: Boolean(p.cardPayments),
    bank: {
      enabled: p.bankEnabled !== false && Boolean(t(p.bankAccountNumber) || t(p.bankIban)),
      bankName: t(p.bankName),
      accountTitle: t(p.bankAccountTitle),
      accountNumber: t(p.bankAccountNumber),
      iban: t(p.bankIban),
      branch: t(p.bankBranch),
      logo: logo(p.bankLogo, t(p.bankName) || "Bank"),
    },
    wallet: {
      enabled: p.walletEnabled !== false && Boolean(t(p.walletNumber)),
      number: t(p.walletNumber),
      accountName: t(p.walletAccountName),
      logos: [logo(p.jazzcashLogo, "JazzCash"), logo(p.easypaisaLogo, "Easypaisa")].filter((l) => l !== null),
    },
    instructions: t(p.instructions),
    otherCountriesText: t(p.otherCountriesText),
  };
});

/** WhatsApp link, optionally with a prefilled message. */
export async function whatsappLink(message?: string): Promise<string> {
  const { whatsappUrl, whatsappDefaultMessage } = (await getSettings()).contact;
  return `${whatsappUrl}?text=${encodeURIComponent(message ?? whatsappDefaultMessage)}`;
}
