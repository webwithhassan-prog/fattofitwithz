"use client";

/**
 * Holds the visitor's price region in the browser so every price on the page
 * updates together when they pick another country.
 *
 * The server decides the starting region (cookie -> geo header -> USA) and passes it in,
 * so the first HTML already shows the right currency (no flicker).
 */
import { createContext, useContext, useState } from "react";
import type { PriceTable } from "@/lib/content";
import { REGION_COOKIE } from "@/lib/pricing";
import type { Region, RegionCode } from "@/lib/types";

type RegionContextValue = {
  region: Region;
  regions: Region[];
  table: PriceTable;
  setRegion: (code: RegionCode) => void;
};

const RegionContext = createContext<RegionContextValue | null>(null);

type Props = {
  initialRegion: RegionCode;
  regions: Region[];
  table: PriceTable;
  children: React.ReactNode;
};

export function RegionProvider({ initialRegion, regions, table, children }: Props) {
  const [code, setCode] = useState<RegionCode>(initialRegion);

  function setRegion(next: RegionCode) {
    setCode(next);
    // Remember the choice for a year so the next visit starts in the same currency.
    document.cookie = `${REGION_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }

  const region = regions.find((r) => r.code === code) ?? regions[0];
  return <RegionContext.Provider value={{ region, regions, table, setRegion }}>{children}</RegionContext.Provider>;
}

/** Use inside any component below <RegionProvider>. */
export function useRegion(): RegionContextValue {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion() must be used inside <RegionProvider>. Wrap the page with it.");
  return ctx;
}
