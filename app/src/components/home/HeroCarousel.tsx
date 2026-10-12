"use client";

/**
 * Homepage hero: 5 banners, ONE shared layout (approved) - only photo, text and badge change.
 *
 * How autoplay works (easy to debug):
 *  - The active tab's progress bar runs a CSS animation lasting `autoplayMs`.
 *  - When that animation ends (onAnimationEnd), we move to the next banner.
 *  - Hovering or focusing the hero pauses the bar, so the timer pauses with it.
 *  - Visitors with "reduce motion" get no autoplay; they use the arrows/tabs.
 */
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/ui/hooks";
import { ChevronLeft, ChevronRight, Pause, Play, WhatsAppIcon } from "@/components/ui/Icons";
import type { HeroBanner } from "@/lib/types";

type Props = { banners: HeroBanner[]; autoplayMs: number; whatsappHref: string };

/** Round white arrow button (position classes are added where it is used). */
const ARROW = "icon-btn absolute z-20 -translate-y-1/2 bg-card shadow-[0_8px_20px_-8px_rgba(80,20,40,0.45)]";

const PETALS = Array.from({ length: 10 }, (_, i) => ({
  left: `${(5 + i * 10) % 100}%`,
  size: 10 + (i % 3) * 4,
  duration: `${11 + ((i * 5) % 8)}s`,
  delay: `${-i * 1.8}s`,
}));

export function HeroCarousel({ banners, autoplayMs, whatsappHref }: Props) {
  const [active, setActive] = useState(0);
  const [tick, setTick] = useState(0); // bumps on every change so the headline animation replays
  const [paused, setPaused] = useState(false); // pause button
  const [hovering, setHovering] = useState(false); // mouse over / keyboard focus inside
  const reducedMotion = usePrefersReducedMotion();
  const swipeStartX = useRef<number | null>(null);

  const autoplayOn = !paused && !reducedMotion;

  function goTo(index: number) {
    setActive((index + banners.length) % banners.length);
    setTick((t) => t + 1);
  }

  const resolveHref = (href: string) => (href === "whatsapp" ? whatsappHref : href);
  const isExternal = (href: string) => href === "whatsapp";

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-blush to-bg"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovering(false);
      }}
    >
      {/* Approved animation #3: drifting petals (decorative, behind the text so they never cover words) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {PETALS.map((p, i) => (
          <span
            key={i}
            className="petal"
            style={{ left: p.left, width: p.size, height: p.size, animationDuration: p.duration, animationDelay: p.delay }}
          />
        ))}
      </div>

      <div className="container-site relative">
        {/* Desktop: arrows on the left and right sides of the banner. (Phones: arrows sit beside the photo, see below.) */}
        <button type="button" className={`${ARROW} top-1/2 left-1 hidden md:grid xl:-left-6`} onClick={() => goTo(active - 1)} aria-label="Previous banner">
          <ChevronLeft />
        </button>
        <button type="button" className={`${ARROW} top-1/2 right-1 hidden md:grid xl:-right-6`} onClick={() => goTo(active + 1)} aria-label="Next banner">
          <ChevronRight />
        </button>

        {/* All slides sit in the same grid cell, so the hero keeps the height of the tallest one. */}
        <div
          className="grid touch-pan-y" // touch-pan-y: phones scroll the page up/down, sideways swipes change the banner
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse") swipeStartX.current = e.clientX;
          }}
          onPointerUp={(e) => {
            if (swipeStartX.current === null) return;
            const dx = e.clientX - swipeStartX.current;
            swipeStartX.current = null;
            if (Math.abs(dx) > 50) goTo(active + (dx < 0 ? 1 : -1));
          }}
        >
          {banners.map((banner, index) => {
            const isActive = index === active;
            const Heading = index === 0 ? "h1" : "h2"; // one <h1> per page, for SEO
            return (
              <div
                key={banner.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${banners.length}`}
                aria-hidden={!isActive}
                inert={!isActive}
                className={`grid content-start items-center gap-6 pt-5 pb-7 transition-[opacity,visibility] duration-700 [grid-area:1/1] md:grid-cols-[1.05fr_0.95fr] md:content-center md:gap-[clamp(24px,5vw,64px)] md:pt-[clamp(28px,4vw,48px)] md:pb-[clamp(40px,5vw,64px)] ${isActive ? "visible opacity-100" : "invisible opacity-0"}`}
              >
                {/* Text. On phones it comes AFTER the photo (order-2); on desktop it is the left column. */}
                <div key={isActive ? `t-${tick}` : "t-off"} className={`order-2 min-w-0 md:order-1 ${isActive ? "hero-enter" : ""}`}>
                  <p className="kicker text-[11px] tracking-[0.1em] sm:text-xs sm:tracking-[0.14em]">{banner.kicker}</p>
                  <Heading className="mt-3 text-[clamp(34px,5.2vw,62px)] md:min-h-[2.3em]">
                    {banner.title}{" "}
                    <span className={`script block ${isActive ? "anim-script" : ""}`}>{banner.titleScript}</span>
                  </Heading>
                  <svg
                    className={`mt-1 block h-3 w-[min(80%,420px)] ${isActive ? "anim-underline" : ""}`}
                    viewBox="0 0 420 14"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d="M4 10 C 100 2, 220 2, 416 8" fill="none" stroke="var(--color-brand)" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                  <p className="lead mt-4">{banner.sub}</p>
                  <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
                    <Link className="btn" href={resolveHref(banner.primary.href)}>
                      {banner.primary.label}
                    </Link>
                    {isExternal(banner.secondary.href) ? (
                      <a className="btn btn-ghost" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                        <WhatsAppIcon className="h-4.5 w-4.5 text-whatsapp" /> {banner.secondary.label}
                      </a>
                    ) : (
                      <Link className="btn btn-ghost" href={banner.secondary.href}>
                        {banner.secondary.label}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Photo. Phones: smaller and first; the row is full width so the arrows sit at the left and right edges of the section. */}
                <div className="relative isolate order-1 flex w-full justify-center md:order-2 md:w-auto md:justify-self-center">
                  <button type="button" className={`${ARROW} top-1/2 -left-1 md:hidden`} onClick={() => goTo(active - 1)} aria-label="Previous banner">
                    <ChevronLeft />
                  </button>
                  <button type="button" className={`${ARROW} top-1/2 -right-1 md:hidden`} onClick={() => goTo(active + 1)} aria-label="Next banner">
                    <ChevronRight />
                  </button>

                  {/* soft pink glow behind the photo */}
                  <div aria-hidden="true" className="absolute inset-x-[22%] inset-y-[8%] -z-10 rounded-full bg-brand/30 blur-3xl md:inset-[8%]" />
                  <div className="arch-frame w-[min(54vw,215px)] md:w-[min(36vw,420px)]">
                    <div className="arch overflow-hidden">
                      <Image
                        key={isActive ? `img-${tick}` : "img-off"}
                        src={banner.photo}
                        alt={banner.photoAlt}
                        width={720}
                        height={900}
                        sizes="(min-width: 768px) 420px, 215px"
                        loading={index === 0 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        className={`aspect-[4/5] w-full object-cover ${isActive ? "slow-zoom" : ""}`}
                      />
                    </div>
                    <div className="float-soft absolute bottom-[8%] -left-6 rounded-[14px] border border-line bg-card px-3.5 py-2.5 text-[12px] leading-snug text-muted shadow-[0_18px_40px_-18px_rgba(80,20,40,0.4)] md:-left-[10%] md:px-4 md:py-3 md:text-[13px]">
                      <b className="block font-display text-xl font-medium text-brand-dark md:text-2xl">{banner.badge.big}</b>
                      {banner.badge.small}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls: progress tabs (also the timer) and pause */}
        <div className="relative z-20 flex flex-wrap items-center gap-3.5 pb-6.5">
          <div role="tablist" aria-label="Choose banner" className="flex min-w-0 flex-1 gap-2.5">
            {banners.map((banner, index) => {
              const isActive = index === active;
              return (
                <button
                  key={banner.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Banner ${index + 1}: ${banner.kicker}`}
                  onClick={() => goTo(index)}
                  className="min-w-0 flex-1 py-1.5 text-left text-[12.5px] tracking-wide text-muted aria-selected:text-ink"
                >
                  <span className="mb-2 block h-0.5 overflow-hidden rounded bg-line">
                    <i
                      key={isActive ? `p-${tick}` : "p-off"}
                      className={`block h-full bg-brand ${isActive && autoplayOn ? "progress-run" : ""} ${isActive && autoplayOn && hovering ? "progress-paused" : ""} ${isActive && !autoplayOn ? "w-full" : ""}`}
                      style={{ "--autoplay-ms": `${autoplayMs}ms` } as React.CSSProperties}
                      onAnimationEnd={() => {
                        if (isActive && autoplayOn) goTo(active + 1);
                      }}
                    />
                  </span>
                  <span className="hidden truncate sm:block">{banner.kicker}</span>
                </button>
              );
            })}
          </div>
          {!reducedMotion ? (
            <button
              type="button"
              className="icon-btn"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              aria-label={paused ? "Play banner rotation" : "Pause banner rotation"}
            >
              {paused ? <Play className="h-4.5 w-4.5" /> : <Pause className="h-4.5 w-4.5" />}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
