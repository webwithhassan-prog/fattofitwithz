/**
 * POST /api/track  { "path": "/programs" }
 * Counts one page view for the admin dashboard. Sent by components/analytics/PageViewTracker.tsx.
 * Nothing about the visitor is stored (no cookies, no IP): see src/lib/stats.server.ts.
 */
import { countPageView } from "@/lib/stats.server";

const BOTS = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|whatsapp/i;

/** Only real pages of the site are counted (stops junk addresses filling the stats table). */
const SECTIONS = new Set(["", "programs", "about", "how-it-works", "testimonials", "faq", "contact", "ebook", "privacy-policy", "refund-policy", "terms", "checkout", "login", "signup", "dashboard"]);
const isSitePage = (path: string) => {
  const parts = path.split("/").slice(1);
  return parts.length <= 3 && SECTIONS.has(parts[0]) && parts.every((p) => /^[a-z0-9-]{0,60}$/.test(p));
};

export async function POST(request: Request) {
  if (BOTS.test(request.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });

  const body = (await request.json().catch(() => null)) as { path?: unknown } | null;
  const raw = typeof body?.path === "string" ? body.path : "";
  // Keep only the page itself: no query string, no trailing slash, sensible length.
  const path = raw.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  if (path.startsWith("/") && path.length <= 120 && isSitePage(path)) {
    countPageView(path);
  }
  return new Response(null, { status: 204 });
}
