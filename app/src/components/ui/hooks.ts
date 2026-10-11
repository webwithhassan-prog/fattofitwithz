"use client";

/**
 * Small hooks for values that only exist in the browser.
 * They use React's useSyncExternalStore, which renders a safe "server" value first and
 * the real browser value right after, without hydration warnings.
 */
import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** A value computed in the browser (e.g. today's date in the member's time zone). */
export function useClientValue<T extends string | number | boolean>(getValue: () => T, serverValue: T): T {
  return useSyncExternalStore(noopSubscribe, getValue, () => serverValue);
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** true when the visitor has asked their device to reduce motion. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(REDUCED_MOTION_QUERY);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}
