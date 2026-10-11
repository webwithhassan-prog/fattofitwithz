"use client";

/** "Prices for: [country]" dropdown. Changing it updates every price on the page. */
import { useId } from "react";
import { useRegion } from "./RegionProvider";
import type { RegionCode } from "@/lib/types";

export function RegionSelect() {
  const { region, regions, setRegion } = useRegion();
  const id = useId();
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2.5 text-sm text-muted">
      Prices for
      <select
        id={id}
        value={region.code}
        onChange={(e) => setRegion(e.target.value as RegionCode)}
        className="rounded border border-line bg-card px-3 py-2 text-ink"
      >
        {regions.map((r) => (
          <option key={r.code} value={r.code}>
            {r.label}
          </option>
        ))}
      </select>
    </label>
  );
}
