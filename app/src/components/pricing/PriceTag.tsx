"use client";

/**
 * Shows "£39  ~~£63~~  Save 39%" for a duration, in the visitor's currency.
 * - Hidden (but taking its space) until her country is known, then fades in.
 * - Approved animation #4: the price flips when she changes the country or duration.
 */
import { useEffect, useRef, useState } from "react";
import { savingsPercent } from "@/lib/pricing";
import { useRegion } from "./RegionProvider";

type Props = { months: number; size?: "lg" | "md" };

export function PriceTag({ months, size = "lg" }: Props) {
  const { market, ready, price, money } = useRegion();
  const cell = price(months);

  // Flip only when the visitor changes something AFTER the price was shown.
  const [flipKey, setFlipKey] = useState(0);
  const shownValue = useRef<string | null>(null);
  useEffect(() => {
    if (!ready) return;
    const value = `${market.country}-${months}`;
    if (shownValue.current !== null && shownValue.current !== value) setFlipKey((k) => k + 1);
    shownValue.current = value;
  }, [ready, market.country, months]);

  return (
    <div className={`flex flex-wrap items-baseline gap-2.5 transition-opacity duration-300 [perspective:400px] ${ready ? "opacity-100" : "opacity-0"}`}>
      <span
        key={flipKey}
        className={`font-display tabular-nums text-ink ${size === "lg" ? "text-[34px]" : "text-2xl"} ${flipKey ? "price-flip" : ""}`}
      >
        {money(cell.amount)}
      </span>
      <s className="text-[15px] text-muted" aria-label={`Standard price ${money(cell.compareAt)}`}>
        {money(cell.compareAt)}
      </s>
      <span className="rounded-full bg-blush px-2.5 py-0.5 text-xs text-brand-dark">Save {savingsPercent(cell)}%</span>
    </div>
  );
}
