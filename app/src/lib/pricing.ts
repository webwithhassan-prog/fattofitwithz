/**
 * Pricing rules (safe to use on both server and browser).
 *
 * Source of truth: the client's pricing sheet -> admin > Pricing (seeded from src/content/pricing.json).
 * Price depends on REGION + DURATION (months), not on the program:
 *   1 month  = Kickstart
 *   2/4 months = Fat Loss
 *   3 months = Diabetes Control, Health Concerns
 *   6 months = Total Transformation, Premium Signature
 */
import type { PriceCell, Region, RegionCode } from "./types";
import type { PriceTable } from "./content";

export const DEFAULT_REGION: RegionCode = "usa";

/** Name of the cookie that remembers the visitor's chosen region. */
export const REGION_COOKIE = "ftf_region";

export const REGION_CODES: RegionCode[] = [
  "usa",
  "canada",
  "uae",
  "saudi",
  "qatar",
  "india",
  "pakistan",
  "australia",
];

export function isRegionCode(value: unknown): value is RegionCode {
  return typeof value === "string" && (REGION_CODES as string[]).includes(value);
}

/** Map an ISO country code (e.g. from Vercel's geo header) to one of our regions. */
export function countryToRegion(country: string | null | undefined, regions: Region[]): RegionCode {
  if (!country) return DEFAULT_REGION;
  const upper = country.toUpperCase();
  const match = regions.find((r) => r.countries.includes(upper));
  return match ? match.code : DEFAULT_REGION;
}

/**
 * Look up a price. Throws with a clear message if the pricing sheet has no cell,
 * so a missing price is caught in development instead of showing "undefined".
 */
export function getPrice(table: PriceTable, region: RegionCode, months: number): PriceCell {
  const cell = table[region]?.[String(months)];
  if (!cell) {
    throw new Error(`No price for region "${region}" and ${months} month(s). Check admin > Pricing.`);
  }
  return cell;
}

/** "Rs. 4,000", "$15", "₹1,499" - uses the region's display pattern. */
export function formatPrice(amount: number, region: Region): string {
  const locale = region.code === "india" ? "en-IN" : "en-US";
  return region.format.replace("{n}", amount.toLocaleString(locale));
}

export function savingsPercent(cell: PriceCell): number {
  return Math.round((1 - cell.amount / cell.compareAt) * 100);
}

/** Human label for a duration, e.g. "1 Month", "6 Months (minimum)". */
export function durationLabel(months: number, isMinimum = false): string {
  const base = months === 1 ? "1 Month" : `${months} Months`;
  return isMinimum ? `${base} (minimum)` : base;
}
