"use client";

/** "Choose your program" carousel: all 6 programs, swipeable, with region switcher. */
import { CarouselDots, SideArrows } from "@/components/ui/CarouselControls";
import { useCarousel } from "@/components/ui/useCarousel";
import { RegionSelect } from "@/components/pricing/RegionSelect";
import { ProgramCard } from "./ProgramCard";
import type { Program } from "@/lib/types";

export function ProgramsCarousel({ programs }: { programs: Program[] }) {
  const [viewportRef, c] = useCarousel();
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3.5">
        <RegionSelect />
      </div>
      <div className="relative">
      <SideArrows canPrev={c.canPrev} canNext={c.canNext} prev={c.prev} next={c.next} label="programs" />
      <div ref={viewportRef} className="overflow-hidden" aria-roledescription="carousel" aria-label="Programs">
        <div className="-ml-5 flex py-2">
          {programs.map((program, i) => (
            <div
              key={program.slug}
              className="min-w-0 flex-[0_0_88%] pl-5 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${programs.length}`}
            >
              <ProgramCard program={program} />
            </div>
          ))}
        </div>
      </div>
      </div>
      <CarouselDots count={c.snapCount} selected={c.selected} goTo={c.goTo} />
    </div>
  );
}
