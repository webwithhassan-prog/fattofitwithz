/**
 * Works out which price region to show first (server only).
 * Order: 1) the visitor's saved choice (cookie)  2) country from the hosting
 * provider's geo header (Vercel: x-vercel-ip-country, Cloudflare: cf-ipcountry)  3) USA / Global.
 */
import "server-only";
import { cookies, headers } from "next/headers";
import { getRegions } from "./content";
import { countryToRegion, isRegionCode, REGION_COOKIE } from "./pricing";
import type { RegionCode } from "./types";

export async function getInitialRegion(): Promise<RegionCode> {
  const cookieStore = await cookies();
  const saved = cookieStore.get(REGION_COOKIE)?.value;
  if (isRegionCode(saved)) return saved;

  const headerList = await headers();
  const country = headerList.get("x-vercel-ip-country") ?? headerList.get("cf-ipcountry");
  return countryToRegion(country, await getRegions());
}
