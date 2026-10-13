"use client";

/**
 * A number that counts up (0 -> value) the first time it scrolls into view, e.g. "2,000+".
 * The real number is in the HTML from the start (for Google and if JavaScript is off);
 * visitors who prefer reduced motion just see the final number.
 */
import { useEffect, useRef, useState } from "react";

type Props = { value: number; prefix?: string; suffix?: string; durationMs?: number };

export function CountUp({ value, prefix = "", suffix = "", durationMs = 1600 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / durationMs);
          const eased = 1 - (1 - progress) ** 3; // fast at first, gentle at the end
          setShown(Math.round(value * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {shown.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
