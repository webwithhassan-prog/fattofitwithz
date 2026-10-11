"use client";

/**
 * Founder message carousel: all 12 photos of Zaineb, each paired with a real line
 * from her own material (approved). Photos crossfade; arrows, thumbnails, keyboard
 * arrows and swipe all change the slide. Data: admin > Homepage > Founder messages.
 */
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/Icons";
import type { FounderSlide } from "@/lib/types";

type Props = { slides: FounderSlide[]; author: string; authorTitle: string };

export function FounderCarousel({ slides, author, authorTitle }: Props) {
  const [index, setIndex] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const swipeStartX = useRef<number | null>(null);
  const go = (i: number) => setIndex((i + slides.length) % slides.length);

  // Keep the active thumbnail visible in the thumbnail strip.
  useEffect(() => {
    const strip = thumbsRef.current;
    const thumb = strip?.children[index] as HTMLElement | undefined;
    if (strip && thumb) {
      strip.scrollTo({ left: thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2, behavior: "smooth" });
    }
  }, [index]);

  const current = slides[index];

  return (
    <section
      className="section"
      id="founder"
      aria-roledescription="carousel"
      aria-label="Messages from the founder"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div className="container-site">
        <div className="grid items-center gap-[clamp(28px,6vw,80px)] md:grid-cols-2">
          {/* Photo: big arch with gold outline, counter and caption */}
          <div className="arch-frame w-full max-w-[540px] justify-self-center">
            <div
              className="grid aspect-[4/5] touch-pan-y overflow-hidden rounded-[999px_999px_14px_14px] bg-blush"
              onPointerDown={(e) => (swipeStartX.current = e.clientX)}
              onPointerUp={(e) => {
                if (swipeStartX.current === null) return;
                const dx = e.clientX - swipeStartX.current;
                swipeStartX.current = null;
                if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
              }}
            >
              {slides.map((slide, i) => (
                <Image
                  key={slide.photo}
                  src={slide.photo}
                  alt={i === index ? `${author}, ${slide.caption.toLowerCase()}` : ""}
                  aria-hidden={i !== index}
                  width={720}
                  height={900}
                  sizes="(min-width: 768px) 540px, 92vw"
                  className={`h-full w-full object-cover transition-opacity duration-700 [grid-area:1/1] ${i === index ? "opacity-100" : "opacity-0"}`}
                />
              ))}
            </div>
            {/* Arrows on the left and right sides of the photo */}
            <button type="button" className="icon-btn absolute top-1/2 z-20 -translate-y-1/2 bg-card shadow-[0_8px_20px_-8px_rgba(80,20,40,0.45)] -left-2 sm:-left-5" onClick={() => go(index - 1)} aria-label="Previous message">
              <ChevronLeft />
            </button>
            <button type="button" className="icon-btn absolute top-1/2 z-20 -translate-y-1/2 bg-card shadow-[0_8px_20px_-8px_rgba(80,20,40,0.45)] -right-2 sm:-right-5" onClick={() => go(index + 1)} aria-label="Next message">
              <ChevronRight />
            </button>
            <span className="absolute top-4.5 right-4.5 rounded-full bg-white/90 px-3 py-1 text-[12.5px] tracking-wider tabular-nums" aria-hidden="true">
              {String(index + 1).padStart(2, "0")} / {slides.length}
            </span>
            <span className="absolute bottom-4 left-1/2 max-w-[90%] -translate-x-1/2 truncate rounded-full bg-ink/80 px-3.5 py-1 text-[12.5px] text-white">
              {current.caption}
            </span>
          </div>

          {/* Message */}
          <div>
            <div className="gold-rule gold-rule-left">
              <span className="kicker">A message from the founder</span>
            </div>
            <div className="mt-5.5 grid" aria-live="polite">
              {slides.map((slide, i) => (
                <figure
                  key={slide.photo + slide.source}
                  inert={i !== index}
                  aria-hidden={i !== index}
                  className={`transition-all duration-500 [grid-area:1/1] ${i === index ? "visible translate-y-0 opacity-100" : "invisible translate-y-2.5 opacity-0"}`}
                >
                  <blockquote className="font-display text-[clamp(24px,3vw,36px)] leading-tight font-normal italic">
                    <span aria-hidden="true" className="block font-display text-7xl leading-[0.6] text-rose not-italic">
                      “
                    </span>
                    {slide.message}
                  </blockquote>
                  <figcaption className="mt-3.5 text-xs tracking-[0.14em] text-gold uppercase">{slide.source}</figcaption>
                </figure>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
              <div>
                <p className="font-display text-[22px]">{author}</p>
                <p className="text-sm text-muted">{authorTitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnails: all photos */}
        <div ref={thumbsRef} className="relative mt-7 flex gap-2.5 overflow-x-auto px-1 pt-1.5 pb-2.5" aria-label="Choose a photo">
          {slides.map((slide, i) => (
            <button
              key={slide.photo}
              type="button"
              onClick={() => go(i)}
              aria-label={`Photo ${i + 1}: ${slide.caption}`}
              aria-current={i === index}
              className="h-[105px] w-[84px] flex-none overflow-hidden rounded-[999px_999px_8px_8px] bg-blush opacity-55 transition hover:opacity-90 aria-[current=true]:-translate-y-0.5 aria-[current=true]:opacity-100 aria-[current=true]:shadow-[0_0_0_2px_var(--color-bg),0_0_0_3.5px_var(--color-brand)]"
            >
              <Image src={slide.photo} alt="" width={168} height={210} sizes="84px" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
