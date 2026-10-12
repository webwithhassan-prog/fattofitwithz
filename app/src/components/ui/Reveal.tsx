"use client";

/**
 * Scroll reveal (approved animation #1).
 * Content is ALWAYS visible by default (good for SEO, screenshots and slow devices).
 * When an element that starts below the fold scrolls into view, we add the
 * `reveal-play` class (see globals.css) which fades it up once.
 */
import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "ol" | "ul";
  id?: string;
};

export function Reveal({ children, className = "", as = "div", id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Only animate things the visitor hasn't seen yet (below the first screen).
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("reveal-play");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Tag = as as "div";
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={className} id={id}>
      {children}
    </Tag>
  );
}
