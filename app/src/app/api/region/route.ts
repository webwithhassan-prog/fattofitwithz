/**
 * GET /api/region -> { "country": "PK", "source": "header" }
 * The browser calls this once on a visitor's first visit, to show prices in her currency
 * (see components/pricing/RegionProvider.tsx). The answer is then saved in a cookie.
 * "source" says how the country was found (handy when debugging on the live site).
 */
import { countryFromHeaders, countryFromRequest } from "@/lib/region.server";
import { ipFromHeaders, LIMITS, rateLimit } from "@/lib/rate-limit.server";

const NO_STORE = { "Cache-Control": "private, no-store" };

export async function GET(request: Request) {
  // Usual case: the hosting provider already tells us the country (free, instant).
  const fromHeader = countryFromHeaders(request.headers);
  if (fromHeader) return Response.json({ country: fromHeader, source: "header" }, { headers: NO_STORE });

  // Otherwise an outside IP lookup is needed: limit how often one address can trigger it.
  // Over the limit -> "unknown" (the browser then guesses from the time zone).
  const limited = await rateLimit(LIMITS.regionLookup, ipFromHeaders(request.headers));
  if (!limited.ok) return Response.json({ country: null, source: "none" }, { headers: NO_STORE });
  return Response.json(await countryFromRequest(request.headers), { headers: NO_STORE });
}
