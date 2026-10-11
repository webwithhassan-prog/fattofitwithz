"use client";

/**
 * Wraps Embla Carousel (https://www.embla-carousel.com) and exposes the few things
 * our carousels need: prev/next, which dot is active, and how many dots to draw.
 *
 * Usage:
 *   const [viewportRef, carousel] = useCarousel();
 *   <div ref={viewportRef} className="overflow-hidden"> <div className="flex">slides</div> </div>
 *   <button onClick={carousel.next} disabled={!carousel.canNext}>Next</button>
 */
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useSyncExternalStore } from "react";

const EMPTY = "0|0|0|0";

export function useCarousel() {
  const [viewportRef, api] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });

  // Embla is an "external store": we subscribe to its events and read its state.
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!api) return () => {};
      api.on("select", onChange).on("reInit", onChange);
      return () => {
        api.off("select", onChange).off("reInit", onChange);
      };
    },
    [api],
  );
  // Packed into one string so React can compare snapshots cheaply: "selected|count|canPrev|canNext".
  const snapshot = useSyncExternalStore(
    subscribe,
    () =>
      api
        ? `${api.selectedScrollSnap()}|${api.scrollSnapList().length}|${api.canScrollPrev() ? 1 : 0}|${api.canScrollNext() ? 1 : 0}`
        : EMPTY,
    () => EMPTY,
  );
  const [selected, snapCount, canPrev, canNext] = snapshot.split("|").map(Number);

  const controls = {
    selected,
    snapCount,
    canPrev: canPrev === 1,
    canNext: canNext === 1,
    prev: () => api?.scrollPrev(),
    next: () => api?.scrollNext(),
    goTo: (index: number) => api?.scrollTo(index),
    /** Jump back to the first slide (e.g. after the visitor picks another goal). */
    reset: () => api?.scrollTo(0, true),
  };
  return [viewportRef, controls] as const;
}
