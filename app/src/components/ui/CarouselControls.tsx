"use client";

/** Prev/next arrow buttons and the dot pager shared by the snap carousels. */
import { ChevronLeft, ChevronRight } from "./Icons";

type ArrowsProps = { canPrev: boolean; canNext: boolean; prev: () => void; next: () => void; label: string };

/**
 * Arrows on the LEFT and RIGHT edges of a slider, vertically centred.
 * Put inside a `relative` wrapper around the slider. Hidden arrows keep their space empty.
 */
export function SideArrows({ canPrev, canNext, prev, next, label }: ArrowsProps) {
  const base =
    "icon-btn absolute top-1/2 z-10 -translate-y-1/2 bg-card shadow-[0_8px_20px_-8px_rgba(80,20,40,0.45)] disabled:pointer-events-none disabled:opacity-0";
  return (
    <>
      <button type="button" className={`${base} left-0 sm:-left-5`} onClick={prev} disabled={!canPrev} aria-label={`Previous ${label}`}>
        <ChevronLeft />
      </button>
      <button type="button" className={`${base} right-0 sm:-right-5`} onClick={next} disabled={!canNext} aria-label={`Next ${label}`}>
        <ChevronRight />
      </button>
    </>
  );
}

type DotsProps = { count: number; selected: number; goTo: (i: number) => void };

export function CarouselDots({ count, selected, goTo }: DotsProps) {
  if (count < 2) return null;
  return (
    <div className="mt-5 flex justify-center gap-2">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => goTo(i)}
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === selected}
          className={`h-2 rounded-full transition-all ${i === selected ? "w-6.5 bg-brand" : "w-2 bg-line"}`}
        />
      ))}
    </div>
  );
}
