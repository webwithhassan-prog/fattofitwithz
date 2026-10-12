"use client";

/**
 * Holds the visitor's COUNTRY in the browser, so every price on the page shows in her currency
 * and updates together when she picks another country in "Prices for".
 *
 * Why in the browser (not on the server): public pages are built once and served from the CDN,
 * which makes them fast, so the server doesn't know who is visiting. After the page loads we pick
 * the country in this order:
 *   1) the visitor's saved choice (cookie ftf_country)
 *   2) her location, from GET /api/region (from her internet address, no permission popup)
 *   3) a guess from her device's time zone
 *   4) the USA
 * Until then `ready` is false and prices stay hidden, so nobody sees the wrong currency flash.
 * The pricing rules themselves (which price list, conversion, rounding) are in src/lib/pricing.ts.
 */
import { createContext, useContext, useEffect, useState } from "react";
import { useClientValue } from "@/components/ui/hooks";
import type { PriceTable } from "@/lib/content";
import { countryFromTimeZone, isCountryCode } from "@/lib/countries";
import { COUNTRY_COOKIE, formatMoney, getMarket, marketEbook, marketPrice, type Market, type Rates } from "@/lib/pricing";
import type { PriceCell, Region } from "@/lib/types";

type RegionContextValue = {
  /** Her country, price list and currency */
  market: Market;
  /** false until we know her country */
  ready: boolean;
  setCountry: (code: string) => void;
  /** A program price in her currency */
  price: (months: number) => PriceCell;
  /** E-book prices in her currency */
  ebook: { alone: number; withPlan: number };
  /** 49 -> "£49" in her currency */
  money: (amount: number) => string;
};

const RegionContext = createContext<RegionContextValue | null>(null);

type Props = {
  regions: Region[];
  table: PriceTable;
  rates: Rates;
  children: React.ReactNode;
};

/** Remember the country for a year so the next visit starts in the same currency. */
function saveCountryCookie(code: string) {
  document.cookie = `${COUNTRY_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
}

function readCountryCookie(): string | undefined {
  return document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${COUNTRY_COOKIE}=`))
    ?.split("=")[1];
}

export function RegionProvider({ regions, table, rates, children }: Props) {
  const cookieValue = useClientValue(() => readCountryCookie() ?? "", ""); // "" while the server renders
  const saved = isCountryCode(cookieValue) ? cookieValue.toUpperCase() : null;
  const [chosen, setChosen] = useState<string | null>(null); // picked in the "Prices for" dropdown
  const [detected, setDetected] = useState<string | null>(null); // from /api/region or the time zone
  const [detectionDone, setDetectionDone] = useState(false);

  useEffect(() => {
    if (isCountryCode(readCountryCookie())) return; // we already know her country
    fetch("/api/region")
      .then((res) => res.json() as Promise<{ country?: string | null }>)
      .catch(() => ({ country: null }))
      .then((data) => {
        const country = isCountryCode(data.country) ? data.country.toUpperCase() : countryFromTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        if (country) {
          setDetected(country);
          saveCountryCookie(country);
        } else {
          console.info("[region] Country unknown, showing US prices.");
        }
      })
      .finally(() => setDetectionDone(true));
  }, []);

  function setCountry(next: string) {
    setChosen(next);
    saveCountryCookie(next);
  }

  const country = chosen ?? saved ?? detected ?? "US";
  const market = getMarket(country, regions, rates);
  const value: RegionContextValue = {
    market,
    ready: chosen !== null || saved !== null || detectionDone,
    setCountry,
    price: (months) => marketPrice(market, table, months),
    ebook: marketEbook(market),
    money: (amount) => formatMoney(amount, market),
  };
  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

/** Use inside any component below <RegionProvider>. */
export function useRegion(): RegionContextValue {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion() must be used inside <RegionProvider>. Wrap the page with it.");
  return ctx;
}
