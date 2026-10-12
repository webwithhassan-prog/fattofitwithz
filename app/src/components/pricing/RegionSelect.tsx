"use client";

/**
 * "Prices for: [country]" dropdown with every country in the world. Changing it updates every
 * price on the page. For countries without their own price list, a small note says the price is
 * converted at today's rate (and credits the exchange-rate service, as its free plan asks).
 */
import { useId, useMemo } from "react";
import { allCountries } from "@/lib/countries";
import { useClientValue } from "@/components/ui/hooks";
import { useRegion } from "./RegionProvider";

export function RegionSelect() {
  const { market, setCountry, ready } = useRegion();
  const id = useId();
  // Country names come from the browser: the server can spell some differently (e.g. "Falkland Islands
  // (Islas Malvinas)"), which would make React rebuild the page. So the full list appears in the browser only.
  const inBrowser = useClientValue(() => true, false);
  const countries = useMemo(() => (inBrowser ? allCountries() : [{ code: market.country, name: "Your country", currency: "" }]), [inBrowser, market.country]);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="inline-flex flex-wrap items-center gap-2.5 text-sm text-muted">
        Prices for
        <select
          id={id}
          value={market.country}
          onChange={(e) => setCountry(e.target.value)}
          className={`max-w-[240px] rounded-lg border border-line bg-card px-3 py-2 text-ink transition-opacity ${ready ? "opacity-100" : "opacity-60"}`}
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      {ready && market.converted ? (
        <p className="text-xs text-muted">
          Prices in {market.currency}, converted from {market.region.currency} at today&apos;s rate.{" "}
          <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer" className="underline">
            Rates By Exchange Rate API
          </a>
        </p>
      ) : null}
    </div>
  );
}
