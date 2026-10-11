/**
 * Simple shapes of the website content that components work with.
 * src/lib/content.ts converts database rows (Payload) into these shapes;
 * the seed script reads src/content/*.json in the same shapes.
 * If you change a JSON file's structure, update the matching type here and
 * TypeScript will point at every place that needs to change.
 */

export type RegionCode =
  | "usa"
  | "canada"
  | "uae"
  | "saudi"
  | "qatar"
  | "india"
  | "pakistan"
  | "australia";

export type Region = {
  code: RegionCode;
  label: string;
  /** ISO currency code, e.g. "USD", "PKR" */
  currency: string;
  /** Display pattern; "{n}" is replaced by the number, e.g. "Rs. {n}" */
  format: string;
  /** ISO country codes that map to this region, e.g. ["PK"] */
  countries: string[];
  isDefault: boolean;
  /** E-book prices in this region's currency: on its own, and when added to a program */
  ebook: { alone: number; withPlan: number };
};

/** One price cell from the client's pricing sheet. */
export type PriceCell = { amount: number; compareAt: number };

export type ProgramDuration = {
  label: string;
  months: number;
  /** true for "6 Months (Minimum)" */
  isMinimum: boolean;
  legacyShopifyVariantId?: number;
};

export type Program = {
  slug: string;
  name: string;
  tag: string;
  focus: string;
  durations: ProgramDuration[];
  summary: string;
  benefitsLabel: string;
  cardBenefits: string[];
  fullBenefits: string[];
  covers: string[];
  whoIsItFor: string;
  howItWorks: string;
  includes: string[];
  order: number;
  legacyShopifyHandle?: string;
};

export type Goal = {
  id: string;
  label: string;
  /** Program slugs, best match first */
  order: string[];
  /** One-line reason per program slug (top three) */
  why: Record<string, string>;
};

export type HeroBanner = {
  id: string;
  photo: string;
  photoAlt: string;
  kicker: string;
  title: string;
  titleScript: string;
  sub: string;
  /** href "whatsapp" is turned into the WhatsApp link from settings */
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  badge: { big: string; small: string };
};

export type FounderSlide = {
  photo: string;
  caption: string;
  message: string;
  source: string;
};

export type FaqItem = {
  order: number;
  category: "general" | "membership" | "payments-support";
  question: string;
  answer: string;
  bullets: string[];
  answerAfterList?: string;
};

export type BeforeAfter = {
  order: number;
  image: string;
  startKg: number | null;
  endKg: number | null;
  lossKg: number | null;
  rating: number;
  showOnHome: boolean;
  /** Real pixel size of the image, so the page doesn't jump while it loads */
  width: number;
  height: number;
};

export type InstagramItem = {
  type: "transformation" | "video" | "review";
  url: string;
  onLiveSite: boolean;
};

export type WorkoutSession = {
  week: number;
  day: number;
  workout: string;
  youtubeId: string;
  url: string;
};

/** The e-book offer (admin > Website > E-book). */
export type EbookOffer = {
  enabled: boolean;
  title: string;
  description: string;
  cover: { src: string; alt: string; width: number; height: number } | null;
  /** Google Drive link sent to buyers ("" until the owner adds it) */
  driveLink: string;
};

export type SiteSettings = {
  brand: {
    name: string;
    legalName: string;
    founder: string;
    founderTitle: string;
    location: string;
    footerDescription: string;
  };
  contact: {
    whatsappE164: string;
    whatsappUrl: string;
    whatsappDefaultMessage: string;
    publicEmail: string;
    legalEmail: string;
  };
  social: Record<"instagram" | "facebook" | "youtube" | "tiktok", string>;
  nav: { label: string; href: string }[];
  footerLinks: { label: string; href: string }[];
  contactSubjects: string[];
  qualifications: string[];
  expertise: string[];
};
