/**
 * Works out the visitor's COUNTRY from her internet address (server only). Used by GET /api/region.
 * No permission popup: this is the same location the hosting company already knows.
 *
 *   1. hosting provider's location headers
 *        Netlify: x-nf-geo (base64 JSON with country.code), x-country
 *        Vercel:  x-vercel-ip-country      Cloudflare: cf-ipcountry
 *   2. if there is no header: look up her IP address at country.is (free, no key)
 *   3. otherwise null -> the browser guesses from the device's time zone (src/lib/countries.ts)
 */
import "server-only";
import { isCountryCode } from "./countries";

export type CountryResult = { country: string | null; source: "header" | "ip-lookup" | "none" };

/** Netlify's x-nf-geo header: base64-encoded JSON like {"country":{"code":"PK"}}. */
function countryFromNetlifyGeo(value: string | null): string | null {
  if (!value) return null;
  try {
    const text = value.trim().startsWith("{") ? value : Buffer.from(value, "base64").toString("utf8");
    const geo = JSON.parse(text) as { country?: { code?: string } };
    return geo.country?.code ?? null;
  } catch {
    return null;
  }
}

export function countryFromHeaders(headers: Headers): string | null {
  const found =
    countryFromNetlifyGeo(headers.get("x-nf-geo")) ??
    headers.get("x-country") ??
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry");
  return isCountryCode(found) ? found.toUpperCase() : null;
}

/** The visitor's IP address as passed on by the hosting provider. */
function clientIp(headers: Headers): string | null {
  const ip = headers.get("x-nf-client-connection-ip") ?? headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0];
  const clean = ip?.trim() ?? "";
  // Local addresses (localhost, home networks) can't be located
  if (!clean || clean === "::1" || clean.startsWith("127.") || clean.startsWith("10.") || clean.startsWith("192.168.")) return null;
  return clean;
}

async function countryFromIp(ip: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.country.is/${encodeURIComponent(ip)}`, { signal: AbortSignal.timeout(2500), cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { country?: string };
    return isCountryCode(data.country) ? data.country.toUpperCase() : null;
  } catch (error) {
    console.warn("[region] IP lookup failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function countryFromRequest(headers: Headers): Promise<CountryResult> {
  const fromHeader = countryFromHeaders(headers);
  if (fromHeader) return { country: fromHeader, source: "header" };
  const ip = clientIp(headers);
  const fromIp = ip ? await countryFromIp(ip) : null;
  if (fromIp) return { country: fromIp, source: "ip-lookup" };
  return { country: null, source: "none" };
}
