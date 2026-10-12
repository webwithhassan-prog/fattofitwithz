/**
 * Pricing rules (safe to use on both server and browser).
 *
 * Source of truth: the client's pricing sheet -> admin > Prices (seeded from src/content/pricing.json).
 * Price depends on PRICE LIST + DURATION (months), not on the program:
 *   1 month = Kickstart, 2/4 months = Fat Loss, 3 months = Diabetes Control / Health Concerns,
 *   6 months = Total Transformation / Premium Signature
 *
 * WHICH PRICES A VISITOR SEES (her "market", from her country):
 *   - Her country has its own price list (USA, Canada, UAE, Saudi, Qatar, India, Pakistan, Australia):
 *     exactly those prices, in that currency.
 *   - Any other country: the default (USA) price list converted into her own currency with today's
 *     exchange rate, rounded to a tidy number (e.g. $49 -> £39). Stripe charges exactly that amount.
 *   - If there is no exchange rate for her currency (or Stripe can't charge in it): USD.
 */
import { currencyOfCountry } from "./countries";
import type { PriceCell, Region, RegionCode } from "./types";
import type { PriceTable } from "./content";

export const DEFAULT_REGION: RegionCode = "usa";

/** Cookie that remembers the visitor's country (detected or picked in "Prices for"). */
export const COUNTRY_COOKIE = "ftf_country";

export const REGION_CODES: RegionCode[] = ["usa", "canada", "uae", "saudi", "qatar", "india", "pakistan", "australia"];

export function isRegionCode(value: unknown): value is RegionCode {
  return typeof value === "string" && (REGION_CODES as string[]).includes(value);
}

/** Exchange rates: how much of each currency 1 US dollar buys, e.g. { GBP: 0.79, EUR: 0.92 }. */
export type Rates = Record<string, number>;

/** Currencies Stripe can't charge in (or that are blocked): visitors there see USD. */
const NO_STRIPE = new Set(["CUP", "IRR", "KPW", "SYP", "SDG", "SSP", "VES", "BYN", "RUB", "ERN", "LYD", "IQD", "TMT", "BTN", "MRU"]);
/** Stripe counts these without cents (¥100 = 100) ... */
const ZERO_DECIMAL = new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"]);
/** ... and these with three decimals (1 KWD = 1000). */
const THREE_DECIMAL = new Set(["BHD", "JOD", "KWD", "OMR", "TND"]);

export type Market = {
  /** ISO country code, e.g. "GB" */
  country: string;
  /** The price list used: her own country's, or the default (USA) one */
  region: Region;
  /** Currency shown and charged, e.g. "GBP" */
  currency: string;
  /** Multiply price-list amounts by this (1 = no conversion) */
  rate: number;
  /** true when prices are converted from the price list's currency */
  converted: boolean;
};

export function getMarket(country: string, regions: Region[], rates: Rates): Market {
  const upper = country.toUpperCase();
  const own = regions.find((r) => r.countries.includes(upper));
  if (own) return { country: upper, region: own, currency: own.currency, rate: 1, converted: false };

  const base = regions.find((r) => r.isDefault) ?? regions[0];
  const currency = currencyOfCountry(upper);
  const baseRate = base.currency === "USD" ? 1 : rates[base.currency];
  const targetRate = rates[currency];
  if (currency === base.currency || !baseRate || !targetRate || NO_STRIPE.has(currency)) {
    return { country: upper, region: base, currency: base.currency, rate: 1, converted: false };
  }
  return { country: upper, region: base, currency, rate: targetRate / baseRate, converted: true };
}

/**
 * Rounds a converted price to a tidy number: 38.7 -> 39, 412 -> 410, 4,083 -> 4,100, 437,912 -> 440,000.
 * (Small amounts in three-decimal currencies keep halves: 8.27 KWD -> 8.5.)
 */
export function niceAmount(value: number, currency: string): number {
  if (THREE_DECIMAL.has(currency) && value < 20) return Math.round(value * 2) / 2;
  if (value < 100) return Math.max(1, Math.round(value));
  const step = 5 * 10 ** (Math.floor(Math.log10(value)) - 2); // 100-999: 5, 1,000-9,999: 50, ...
  return Math.round(value / step) * step;
}

/**
 * Look up a price-list cell. Throws with a clear message if the pricing sheet has no cell,
 * so a missing price is caught in development instead of showing "undefined".
 */
export function getPrice(table: PriceTable, region: RegionCode, months: number): PriceCell {
  const cell = table[region]?.[String(months)];
  if (!cell) {
    throw new Error(`No price for region "${region}" and ${months} month(s). Check admin > Prices.`);
  }
  return cell;
}

/** A program price in the visitor's currency. */
export function marketPrice(market: Market, table: PriceTable, months: number): PriceCell {
  const cell = getPrice(table, market.region.code, months);
  if (!market.converted) return cell;
  return { amount: niceAmount(cell.amount * market.rate, market.currency), compareAt: niceAmount(cell.compareAt * market.rate, market.currency) };
}

/** E-book prices in the visitor's currency: on its own, and when bought with a program. */
export function marketEbook(market: Market): { alone: number; withPlan: number } {
  const { alone, withPlan } = market.region.ebook;
  if (!market.converted) return { alone, withPlan };
  return { alone: niceAmount(alone * market.rate, market.currency), withPlan: niceAmount(withPlan * market.rate, market.currency) };
}

/** "Rs. 4,000", "$15", "₹1,499" (own price lists use the pattern from admin), "£39", "€45", "¥4,100" (converted). */
export function formatMoney(amount: number, market: Market): string {
  if (!market.converted) {
    const locale = market.region.code === "india" ? "en-IN" : "en-US";
    return market.region.format.replace("{n}", amount.toLocaleString(locale));
  }
  const decimals = Number.isInteger(amount) ? 0 : 2;
  const format = (currencyDisplay: "narrowSymbol" | "symbol") =>
    new Intl.NumberFormat("en", { style: "currency", currency: market.currency, currencyDisplay, minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(amount);
  // The local sign (₦, ₱, ₺, zł...), except a bare "$" that could be mistaken for US dollars (then "NZ$", "SGD"...)
  const local = format("narrowSymbol");
  return /^\$/.test(local) && market.currency !== "USD" ? format("symbol") : local;
}

/** Amount in Stripe's smallest unit: $49 -> 4900, ¥4,100 -> 4100, 8.5 KWD -> 8500. */
export function toStripeAmount(amount: number, currency: string): number {
  const code = currency.toUpperCase();
  const factor = ZERO_DECIMAL.has(code) ? 1 : THREE_DECIMAL.has(code) ? 1000 : 100;
  return Math.round(amount * factor);
}

/** The opposite of toStripeAmount (for saving what Stripe says was paid). */
export function fromStripeAmount(minorUnits: number, currency: string): number {
  const code = currency.toUpperCase();
  const factor = ZERO_DECIMAL.has(code) ? 1 : THREE_DECIMAL.has(code) ? 1000 : 100;
  return minorUnits / factor;
}

export function savingsPercent(cell: PriceCell): number {
  return Math.round((1 - cell.amount / cell.compareAt) * 100);
}

/** Human label for a duration, e.g. "1 Month", "6 Months (minimum)". */
export function durationLabel(months: number, isMinimum = false): string {
  const base = months === 1 ? "1 Month" : `${months} Months`;
  return isMinimum ? `${base} (minimum)` : base;
}
