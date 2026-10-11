"use client";

/** One program in the programs carousel/grid. Fat Loss gets a 2/4-month toggle. */
import Link from "next/link";
import { useState } from "react";
import { PriceTag } from "@/components/pricing/PriceTag";
import { durationLabel } from "@/lib/pricing";
import type { Program } from "@/lib/types";

export function ProgramCard({ program }: { program: Program }) {
  const [months, setMonths] = useState(program.durations[0].months);
  const hasChoice = program.durations.length > 1;
  const current = program.durations.find((d) => d.months === months)!;

  return (
    <article className="card card-hover flex h-full flex-col gap-3 p-6">
      <div className="flex items-start justify-between gap-2.5">
        <h3 className="text-2xl">{program.name}</h3>
        <span className="rounded-full border border-gold px-2.5 py-0.5 text-[11px] tracking-[0.12em] whitespace-nowrap text-gold uppercase">
          {program.tag}
        </span>
      </div>
      <p className="text-sm text-muted">{program.focus}</p>

      {hasChoice ? (
        <div role="group" aria-label="Duration" className="inline-flex w-max gap-1 rounded-full bg-blush p-[3px]">
          {program.durations.map((d) => (
            <button
              key={d.months}
              type="button"
              aria-pressed={d.months === months}
              onClick={() => setMonths(d.months)}
              className="rounded-full px-3.5 py-1 text-[13px] text-muted aria-pressed:bg-brand aria-pressed:text-white"
            >
              {durationLabel(d.months)}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-brand">{durationLabel(current.months, current.isMinimum)}</p>
      )}

      <PriceTag months={months} />

      <ul className="flex flex-col gap-2 text-[15px]">
        {program.cardBenefits.slice(0, 4).map((benefit) => (
          <li key={benefit} className="flex gap-2.5">
            <span aria-hidden="true" className="mt-2.5 h-[7px] w-[7px] flex-none rounded-[7px_0_7px_0] bg-rose" />
            {benefit}
          </li>
        ))}
      </ul>

      <Link href={`/programs/${program.slug}?months=${months}`} className="btn mt-auto">
        Choose program
      </Link>
    </article>
  );
}
