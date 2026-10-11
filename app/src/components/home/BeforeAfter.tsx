"use client";

/**
 * Before/after drag slider (approved animation #7).
 * A transparent <input type="range"> covers the photos, so it works with mouse, touch
 * AND keyboard (arrow keys) without any custom drag code.
 */
import Image from "next/image";
import { useState } from "react";

type Props = { before: string; after: string; beforeAlt: string; afterAlt: string };

export function BeforeAfter({ before, after, beforeAlt, afterAlt }: Props) {
  const [cut, setCut] = useState(50); // % from the left where the "after" photo starts

  return (
    <div
      className="relative aspect-[360/498] w-full max-w-[380px] justify-self-center overflow-hidden rounded-[999px_999px_14px_14px] bg-blush select-none"
      style={{ "--cut": `${cut}%` } as React.CSSProperties}
    >
      <Image src={before} alt={beforeAlt} fill sizes="380px" className="object-cover" />
      <Image
        src={after}
        alt={afterAlt}
        fill
        sizes="380px"
        className="object-cover [clip-path:inset(0_0_0_var(--cut))]"
      />
      <span className="absolute bottom-4.5 left-4.5 rounded-full bg-ink/80 px-3 py-1 text-[11px] tracking-[0.12em] text-white uppercase">
        Before
      </span>
      <span className="absolute right-4.5 bottom-4.5 rounded-full bg-brand px-3 py-1 text-[11px] tracking-[0.12em] text-white uppercase">
        After
      </span>
      <div aria-hidden="true" className="absolute inset-y-0 left-[var(--cut)] w-0.5 -translate-x-1/2 bg-white" />
      <div
        aria-hidden="true"
        className="absolute top-[58%] left-[var(--cut)] grid h-11.5 w-11.5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-lg text-brand shadow-[0_6px_18px_rgba(0,0,0,0.25)]"
      >
        ↔
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={cut}
        onChange={(e) => setCut(Number(e.target.value))}
        aria-label="Drag to compare before and after"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
