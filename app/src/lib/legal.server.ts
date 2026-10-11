/**
 * Legal pages (privacy, refund, terms): read from the database (admin > Legal pages)
 * and converted to simple blocks for <LegalPage>.
 *
 * The body only uses "## Heading", "- bullet" and plain paragraphs,
 * so a tiny parser is enough (and easy to follow) - no markdown library needed.
 */
import "server-only";
import { notFound } from "next/navigation";
import { getLegalPages } from "./content";

export type LegalBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export type LegalDoc = { title: string; effectiveDate: string; blocks: LegalBlock[] };

export type LegalSlug = "privacy-policy" | "refund-cancellation-freeze-policy" | "terms-and-services";

export async function getLegalDoc(slug: LegalSlug): Promise<LegalDoc> {
  const page = (await getLegalPages()).find((p) => p.slug === slug);
  if (!page) {
    console.error(`[legal] No legal page with slug "${slug}" in the database. Run "npm run seed" or add it in /admin.`);
    notFound();
  }

  const blocks: LegalBlock[] = [];
  for (const raw of page.body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("# ")) continue; // the title comes from its own field

    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3) });
    } else if (line.startsWith("- ")) {
      const last = blocks.at(-1);
      if (last?.type === "ul") last.items.push(line.slice(2));
      else blocks.push({ type: "ul", items: [line.slice(2)] });
    } else {
      blocks.push({ type: "p", text: line });
    }
  }
  return { title: page.title, effectiveDate: page.effectiveDate, blocks };
}
