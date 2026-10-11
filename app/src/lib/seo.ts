/**
 * SEO helpers: page metadata + JSON-LD structured data.
 *
 * Checklist this file covers (from the site-audit skill: SEO + GEO):
 *  - unique <title> and meta description per page
 *  - canonical URL, Open Graph and Twitter cards with a share image
 *  - Organization, WebSite, Person, Service/Offer, FAQPage and BreadcrumbList schema
 * Validate output at https://validator.schema.org or Google's Rich Results Test.
 */
import type { Metadata } from "next";
import { absoluteUrl, DEFAULT_DESCRIPTION, SITE_NAME } from "./site";
import { getSettings } from "./content";
import type { Program, Region, PriceCell } from "./types";

type PageMetaInput = {
  /** Page title without the brand; the root layout's template adds " | Fat To Fit With Z". */
  title?: string;
  description?: string;
  /** Path of the page, e.g. "/programs". Used for the canonical link. */
  path: string;
  /** Absolute or root-relative image path for social sharing. */
  image?: string;
  /** Hide from search engines (dashboard, checkout pages). */
  noIndex?: boolean;
};

export function buildMetadata({ title, description, path, image, noIndex }: PageMetaInput): Metadata {
  const desc = description ?? DEFAULT_DESCRIPTION;
  const img = image ?? "/images/og.jpg";
  return {
    // Only set a title when given: an explicit `title: undefined` would wipe out the layout's default title.
    ...(title ? { title } : {}),
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: title ? `${title} | ${SITE_NAME}` : SITE_NAME,
      description: desc,
      url: path,
      images: [{ url: img, width: 1200, height: 630, alt: SITE_NAME }],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: title ? `${title} | ${SITE_NAME}` : SITE_NAME,
      description: desc,
      images: [img],
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

// ---------- JSON-LD builders ----------
// Each returns a plain object; render it with <JsonLd data={...} />.

export async function organizationSchema() {
  const s = await getSettings();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/images/logo.png"),
    image: absoluteUrl("/images/og.jpg"),
    description: DEFAULT_DESCRIPTION,
    email: s.contact.publicEmail,
    telephone: s.contact.whatsappE164,
    address: { "@type": "PostalAddress", addressLocality: "Lahore", addressCountry: "PK" },
    founder: { "@id": absoluteUrl("/about#founder") },
    sameAs: Object.values(s.social),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    publisher: { "@id": absoluteUrl("/#organization") },
    inLanguage: "en",
  };
}

export async function founderSchema() {
  const s = await getSettings();
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl("/about#founder"),
    name: s.brand.founder,
    jobTitle: "Nutritionist and Certified Fitness Coach",
    worksFor: { "@id": absoluteUrl("/#organization") },
    knowsAbout: s.expertise,
    hasCredential: s.qualifications.map((q) => ({ "@type": "EducationalOccupationalCredential", name: q })),
    image: absoluteUrl("/images/coach/coach-p03.jpg"),
    sameAs: [s.social.instagram, s.social.youtube],
  };
}

/** Service + Offers for one program, priced in the given region. */
export function programSchema(program: Program, region: Region, prices: { months: number; cell: PriceCell }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": absoluteUrl(`/programs/${program.slug}#service`),
    name: program.name,
    description: program.summary,
    serviceType: "Online nutrition and fitness coaching",
    provider: { "@id": absoluteUrl("/#organization") },
    areaServed: "Worldwide",
    audience: { "@type": "PeopleAudience", audienceType: "Women" },
    offers: prices.map(({ months, cell }) => ({
      "@type": "Offer",
      name: `${program.name} - ${months} month${months === 1 ? "" : "s"}`,
      price: cell.amount,
      priceCurrency: region.currency,
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/programs/${program.slug}`),
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}

export function breadcrumbSchema(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}
