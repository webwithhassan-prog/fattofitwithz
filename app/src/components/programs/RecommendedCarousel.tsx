"use client";

/**
 * "Recommended for you": the visitor picks a goal, and the programs reorder
 * best-match first, each with a one-line reason. Data: admin > Goal picker.
 */
import Link from "next/link";
import { useState } from "react";
import { CarouselDots, SideArrows } from "@/components/ui/CarouselControls";
import { useCarousel } from "@/components/ui/useCarousel";
import { PriceTag } from "@/components/pricing/PriceTag";
import { durationLabel } from "@/lib/pricing";
import type { Goal, Program } from "@/lib/types";

type Props = { goals: Goal[]; programs: Program[] };

export function RecommendedCarousel({ goals, programs }: Props) {
  const [goalId, setGoalId] = useState(goals[0].id);
  const [viewportRef, c] = useCarousel();
  const goal = goals.find((g) => g.id === goalId) ?? goals[0];
  const ordered = goal.order
    .map((slug) => programs.find((p) => p.slug === slug))
    .filter((p): p is Program => Boolean(p));

  return (
    <div>
      <div role="radiogroup" aria-label="Your main goal" className="mb-6 flex flex-wrap justify-center gap-2.5">
        {goals.map((g) => (
          <button
            key={g.id}
            type="button"
            role="radio"
            aria-checked={g.id === goalId}
            onClick={() => {
              setGoalId(g.id);
              c.reset(); // jump back to the best match
            }}
            className="rounded-full border border-line bg-card px-4.5 py-2 text-[14.5px] transition aria-checked:border-ink aria-checked:bg-ink aria-checked:text-bg"
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="relative">
      <SideArrows canPrev={c.canPrev} canNext={c.canNext} prev={c.prev} next={c.next} label="recommendations" />
      <div ref={viewportRef} className="overflow-hidden" aria-live="polite">
        <div className="-ml-5 flex py-2">
          {ordered.map((program, i) => {
            const months = program.durations[0].months;
            const label = i === 0 ? "Best match" : i < 3 ? "Also a good fit" : "Other option";
            return (
              <div key={program.slug} className="min-w-0 flex-[0_0_88%] pl-5 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
                <article
                  className={`card card-hover flex h-full flex-col gap-2.5 p-5.5 ${i === 0 ? "border-brand shadow-[0_0_0_1px_var(--color-brand)]" : ""}`}
                >
                  <span
                    className={`self-start rounded-full px-2.5 py-1 text-[11px] tracking-[0.12em] uppercase ${i === 0 ? "bg-brand text-white" : "bg-blush text-brand"}`}
                  >
                    {label}
                  </span>
                  <h3 className="text-[22px]">{program.name}</h3>
                  <p className="text-[15px] text-muted">{goal.why[program.slug] ?? program.focus}</p>
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-2.5 pt-2">
                    <div>
                      <PriceTag months={months} size="md" />
                      <p className="text-[13px] text-muted">
                        {durationLabel(months, program.durations[0].isMinimum)}
                        {program.durations.length > 1 ? " · more options" : ""}
                      </p>
                    </div>
                    <Link href={`/programs/${program.slug}`} className="btn btn-sm">
                      View
                    </Link>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>
      </div>
      <CarouselDots count={c.snapCount} selected={c.selected} goTo={c.goTo} />
    </div>
  );
}
