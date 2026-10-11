/**
 * POST /api/track  { "path": "/programs" }
 * Counts one page view for the admin dashboard. Sent by components/analytics/PageViewTracker.tsx.
 * Nothing about the visitor is stored (no cookies, no IP): see src/lib/stats.server.ts.
 */
import { countPageView } from "@/lib/stats.server";

const BOTS = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|whatsapp/i;

export async function POST(request: Request) {
  if (BOTS.test(request.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });

  const body = (await request.json().catch(() => null)) as { path?: unknown } | null;
  const raw = typeof body?.path === "string" ? body.path : "";
  // Keep only the page itself: no query string, no trailing slash, sensible length.
  const path = raw.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  if (path.startsWith("/") && path.length <= 120 && !path.startsWith("/api") && !path.startsWith("/admin")) {
    countPageView(path);
  }
  return new Response(null, { status: 204 });
}
