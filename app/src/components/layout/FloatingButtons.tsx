"use client";

/**
 * Small round buttons stacked ABOVE the floating WhatsApp button (bottom-right):
 *   - her profile initial -> /dashboard   (only when she is logged in; see useMemberInitial)
 *   - "Back to top"                        (appears after scrolling down a little)
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUp } from "@/components/ui/Icons";
import { useMemberInitial, usePrefersReducedMotion } from "@/components/ui/hooks";

export function FloatingButtons() {
  const memberInitial = useMemberInitial();
  const reducedMotion = usePrefersReducedMotion();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // Same width as the WhatsApp button (56px) and 12px above it, so the buttons line up.
    <div className="fixed right-[18px] bottom-[calc(86px+env(safe-area-inset-bottom,0px))] z-30 flex w-14 flex-col items-center gap-3">
      {memberInitial ? (
        <Link
          href="/dashboard"
          aria-label="My account"
          className="fade-in grid h-12 w-12 place-items-center rounded-full border-2 border-white bg-brand font-display text-lg font-semibold text-ink shadow-[0_12px_26px_-10px_rgba(214,51,159,0.8)] transition hover:-translate-y-0.5"
        >
          {memberInitial}
        </Link>
      ) : null}
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })}
        className={`grid h-11 w-11 place-items-center rounded-full border border-line bg-card text-ink shadow-[0_12px_26px_-14px_rgba(43,26,36,0.6)] transition duration-300 hover:-translate-y-0.5 hover:border-brand ${showTop ? "visible translate-y-0 opacity-100" : "invisible translate-y-3 opacity-0"}`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </div>
  );
}
