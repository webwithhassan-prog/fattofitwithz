/** /sitemap.xml - every public page. Dashboard and checkout pages are left out on purpose. */
import type { MetadataRoute } from "next";
import { getPrograms } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const pages: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/programs", priority: 0.9 },
    { path: "/ebook", priority: 0.7 },
    { path: "/about", priority: 0.7 },
    { path: "/how-it-works", priority: 0.7 },
    { path: "/testimonials", priority: 0.7 },
    { path: "/faq", priority: 0.6 },
    { path: "/contact", priority: 0.6 },
    { path: "/privacy-policy", priority: 0.2 },
    { path: "/refund-policy", priority: 0.2 },
    { path: "/terms", priority: 0.2 },
  ];
  const programPages = (await getPrograms()).map((p) => ({ path: `/programs/${p.slug}`, priority: 0.8 }));

  return [...pages, ...programPages].map(({ path, priority }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: "monthly",
    priority,
  }));
}
