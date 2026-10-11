/**
 * SEED SCRIPT: fills the database with the website content.
 *
 *   npm run seed
 *
 * Source: the approved content in src/content/*.json and src/content/legal/*.md,
 * plus the photos in public/images (uploaded to the admin's Photos library).
 *
 * Safe to run again: rows are matched (by slug, question, link...) and updated,
 * never duplicated. It does NOT touch members, orders or admin users.
 * Careful: running it again overwrites content edits made in /admin with the JSON version.
 */
import path from "node:path";
import { readFile } from "node:fs/promises";
import { getPayload, type CollectionSlug, type Payload, type Where } from "payload";
import config from "../../payload.config";
import type { BeforeAfter, FaqItem, FounderSlide, Goal, HeroBanner, InstagramItem, PriceCell, Program, Region, SiteSettings, WorkoutSession } from "../../lib/types";

const APP_DIR = process.cwd(); // npm scripts run from app/
const context = { skipRevalidate: true }; // no Next.js page cache to refresh while seeding

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(path.join(APP_DIR, "src", "content", file), "utf8")) as T;
}

/** ["a", "b"] -> [{ text: "a" }, { text: "b" }]  (the shape of textList fields) */
const lines = (items: string[] | undefined) => (items ?? []).map((text) => ({ text }));

async function main() {
  const payload = await getPayload({ config });
  const log = (message: string) => payload.logger.info(`[seed] ${message}`);

  // Create the row, or update it if one already matches `where`.
  async function upsert(collection: CollectionSlug, where: Where, data: Record<string, unknown>) {
    const found = await payload.find({ collection, where, limit: 1, depth: 0, context });
    if (found.docs[0]) {
      return payload.update({ collection, id: found.docs[0].id, data: data as never, depth: 0, context });
    }
    return payload.create({ collection, data: data as never, depth: 0, context });
  }

  // ---------- photos ----------
  const photoIds = new Map<string, number>(); // "/images/coach/coach-p01.jpg" -> media id

  async function photo(publicPath: string, alt: string): Promise<number> {
    const cached = photoIds.get(publicPath);
    if (cached) return cached;
    const filename = path.basename(publicPath);
    const found = await payload.find({ collection: "media", where: { filename: { equals: filename } }, limit: 1, context });
    const doc = found.docs[0]
      ? found.docs[0]
      : await payload.create({
          collection: "media",
          data: { alt },
          filePath: path.join(APP_DIR, "public", publicPath),
          context,
        });
    photoIds.set(publicPath, doc.id);
    return doc.id;
  }

  // ---------- programs ----------
  const { programs } = await readJson<{ programs: Program[] }>("programs.json");
  const programIds = new Map<string, number>();
  for (const p of programs) {
    const doc = await upsert("programs", { slug: { equals: p.slug } }, {
      name: p.name,
      slug: p.slug,
      tag: p.tag,
      order: p.order,
      focus: p.focus,
      summary: p.summary,
      durations: p.durations.map((d) => ({ months: d.months, isMinimum: d.isMinimum })),
      benefitsLabel: p.benefitsLabel,
      cardBenefits: lines(p.cardBenefits),
      fullBenefits: lines(p.fullBenefits),
      covers: lines(p.covers),
      includes: lines(p.includes),
      whoIsItFor: p.whoIsItFor,
      howItWorks: p.howItWorks,
      legacyShopifyHandle: p.legacyShopifyHandle,
    });
    programIds.set(p.slug, doc.id as number);
  }
  log(`programs: ${programs.length}`);

  // ---------- FAQs ----------
  const faqs = await readJson<{ faqPage: FaqItem[]; homepage: { question: string; answer: string }[] }>("faqs.json");
  for (const f of faqs.faqPage) {
    await upsert("faqs", { and: [{ question: { equals: f.question } }, { showOn: { equals: "faq-page" } }] }, {
      question: f.question,
      answer: f.answer,
      bullets: lines(f.bullets),
      answerAfterList: f.answerAfterList ?? "",
      category: f.category,
      showOn: "faq-page",
      order: f.order,
    });
  }
  for (const [index, f] of faqs.homepage.entries()) {
    await upsert("faqs", { and: [{ question: { equals: f.question } }, { showOn: { equals: "homepage" } }] }, {
      question: f.question,
      answer: f.answer,
      showOn: "homepage",
      order: index + 1,
    });
  }
  log(`faqs: ${faqs.faqPage.length} for the FAQ page, ${faqs.homepage.length} for the homepage`);

  // ---------- testimonials ----------
  const testimonials = await readJson<{ beforeAfter: BeforeAfter[]; instagram: InstagramItem[] }>("testimonials.json");
  for (const t of testimonials.beforeAfter) {
    const kg = t.startKg && t.endKg ? `, ${t.startKg} kg to ${t.endKg} kg` : "";
    const imageId = await photo(t.image, `Client before and after the program${kg}`);
    await upsert("testimonials", { image: { equals: imageId } }, {
      type: "photo",
      image: imageId,
      startKg: t.startKg,
      endKg: t.endKg,
      rating: t.rating,
      showOnHome: t.showOnHome,
      order: t.order,
    });
  }
  for (const [index, item] of testimonials.instagram.entries()) {
    await upsert("testimonials", { instagramUrl: { equals: item.url } }, {
      type: "instagram",
      instagramUrl: item.url,
      instagramKind: item.type,
      onLiveSite: item.onLiveSite,
      order: 100 + index, // after the before/after photos
    });
  }
  log(`testimonials: ${testimonials.beforeAfter.length} photos, ${testimonials.instagram.length} Instagram posts`);

  // ---------- recorded workouts ----------
  const { sessions } = await readJson<{ sessions: WorkoutSession[] }>("workouts-4-week.json");
  for (const s of sessions) {
    await upsert("workout-sessions", { and: [{ week: { equals: s.week } }, { day: { equals: s.day } }] }, {
      week: s.week,
      day: s.day,
      workout: s.workout,
      youtubeUrl: s.url,
    });
  }
  log(`recorded workouts: ${sessions.length}`);

  // ---------- legal pages ----------
  for (const slug of ["privacy-policy", "refund-cancellation-freeze-policy", "terms-and-services"]) {
    const markdown = await readFile(path.join(APP_DIR, "src", "content", "legal", `${slug}.md`), "utf8");
    let title = "";
    let effectiveDate = "";
    const body: string[] = [];
    for (const line of markdown.split(/\r?\n/)) {
      if (line.startsWith("# ")) title = line.slice(2).trim();
      else if (line.toLowerCase().startsWith("effective date:")) effectiveDate = line.slice(15).trim();
      else body.push(line);
    }
    if (effectiveDate.includes("[")) effectiveDate = ""; // "[Insert Date]" placeholder -> "to be confirmed"
    await upsert("legal-pages", { slug: { equals: slug } }, { slug, title, effectiveDate, body: body.join("\n").trim() });
  }
  log("legal pages: 3");

  // ---------- globals ----------
  await seedGlobals(payload, photo, programIds);
  log("globals: prices, contact & site settings, homepage (banners, founder messages, goal picker)");

  log("Done. Open http://localhost:3000/admin to see the content.");
}

async function seedGlobals(
  payload: Payload,
  photo: (publicPath: string, alt: string) => Promise<number>,
  programIds: Map<string, number>,
) {
  // Pricing
  const pricing = await readJson<{ regions: Region[]; pricesByDuration: Record<string, Record<string, PriceCell>> }>("pricing.json");
  await payload.updateGlobal({
    slug: "pricing",
    context,
    data: {
      regions: pricing.regions.map((r) => ({
        code: r.code,
        label: r.label,
        currency: r.currency,
        format: r.format,
        countries: r.countries.join(", "),
        isDefault: r.isDefault,
        prices: Object.entries(pricing.pricesByDuration[r.code]).map(([months, cell]) => ({
          months: Number(months),
          amount: cell.amount,
          compareAt: cell.compareAt,
        })),
      })),
    },
  });

  // Site settings
  const s = await readJson<SiteSettings>("settings.json");
  await payload.updateGlobal({
    slug: "site-settings",
    context,
    data: {
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
      social: s.social,
      nav: s.nav,
      footerLinks: s.footerLinks,
      contactSubjects: lines(s.contactSubjects),
      qualifications: lines(s.qualifications),
      expertise: lines(s.expertise),
    },
  });

  // Homepage: hero banners, founder slides, short FAQ
  const hero = await readJson<{ autoplayMs: number; banners: HeroBanner[] }>("hero-banners.json");
  const founder = await readJson<{ author: string; authorTitle: string; slides: FounderSlide[] }>("founder-messages.json");
  const { goals } = await readJson<{ goals: Goal[] }>("goals.json");

  const banners = [];
  for (const b of hero.banners) {
    banners.push({
      photo: await photo(b.photo, b.photoAlt),
      kicker: b.kicker,
      title: b.title,
      titleScript: b.titleScript,
      sub: b.sub,
      primary: b.primary,
      secondary: b.secondary,
      badge: b.badge,
    });
  }
  const slides = [];
  for (const f of founder.slides) {
    slides.push({
      photo: await photo(f.photo, `Zaineb Danish: ${f.caption.toLowerCase()}`),
      caption: f.caption,
      message: f.message,
      source: f.source,
    });
  }
  await payload.updateGlobal({
    slug: "homepage",
    context,
    data: {
      autoplaySeconds: Math.round(hero.autoplayMs / 1000),
      banners,
      founder: { author: founder.author, authorTitle: founder.authorTitle, slides },
      // Goal picker
      goals: goals.map((g) => ({
        goalId: g.id,
        label: g.label,
        programs: g.order.map((slug) => {
          const id = programIds.get(slug);
          if (!id) throw new Error(`[seed] goals.json mentions unknown program "${slug}"`);
          return { program: id, why: g.why[slug] ?? "" };
        }),
      })),
    },
  });
}

// Top-level await: `payload run` exits as soon as this file has been imported,
// so the import itself must wait until seeding has finished.
try {
  await main();
} catch (error) {
  console.error("[seed] FAILED:", error);
  process.exit(1);
}
