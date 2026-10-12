/**
 * GET /api/region -> { "country": "PK", "source": "header" }
 * The browser calls this once on a visitor's first visit, to show prices in her currency
 * (see components/pricing/RegionProvider.tsx). The answer is then saved in a cookie.
 * "source" says how the country was found (handy when debugging on the live site).
 */
import { countryFromRequest } from "@/lib/region.server";

export async function GET(request: Request) {
  const result = await countryFromRequest(request.headers);
  return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
}
