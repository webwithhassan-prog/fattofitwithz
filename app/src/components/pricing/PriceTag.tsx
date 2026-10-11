"use client";

/**
 * Shows "Rs. 7,000  ~~Rs. 11,000~~  Save 36%" for a duration in the current region.
 * Approved animation #4: the price flips when the region or duration changes
 * (not on first load).
 */
import { useEffect, useRef, useState } from "react";
import { formatPrice, getPrice, savingsPercent } from "@/lib/pricing";
import { useRegion } from "./RegionProvider";

type Props = { months: number; size?: "lg" | "md" };

export function PriceTag({ months, size = "lg" }: Props) {
  const { region, table } = useRegion();
  const cell = getPrice(table, region.code, months);

  // Play the flip animation only when the value changes after the first render.
  const [flipKey, setFlipKey] = useState(0);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setFlipKey((k) => k + 1);
  }, [region.code, months]);

  return (
    <div className="flex flex-wrap items-baseline gap-2.5 [perspective:400px]">
      <span
        key={flipKey}
        className={`font-display tabular-nums text-ink ${size === "lg" ? "text-[34px]" : "text-2xl"} ${flipKey ? "price-flip" : ""}`}
      >
        {formatPrice(cell.amount, region)}
      </span>
      <s className="text-[15px] text-muted" aria-label={`Standard price ${formatPrice(cell.compareAt, region)}`}>
        {formatPrice(cell.compareAt, region)}
      </s>
      <span className="rounded-full bg-blush px-2.5 py-0.5 text-xs text-brand">Save {savingsPercent(cell)}%</span>
    </div>
  );
}
