"use client";

/**
 * Recorded library: the client's 4-week workout plan (admin > Recorded library), hosted on YouTube.
 * Included with every program.
 *
 * Videos load only when the member presses play (a "facade"), so the page stays fast:
 * we show YouTube's thumbnail first, then swap in the privacy-friendly embed.
 */
import Image from "next/image";
import { useState } from "react";
import { PlayCircle } from "@/components/ui/Icons";
import type { WorkoutSession } from "@/lib/types";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Props = { sessions: WorkoutSession[]; initialWeek: number };

export function RecordedSessions({ sessions, initialWeek }: Props) {
  const weeks = [...new Set(sessions.map((s) => s.week))].sort((a, b) => a - b);
  const [week, setWeek] = useState(weeks.includes(initialWeek) ? initialWeek : weeks[0]);
  const [playing, setPlaying] = useState<string | null>(null);
  const list = sessions.filter((s) => s.week === week).sort((a, b) => a.day - b.day);

  return (
    <div>
      <div role="tablist" aria-label="Week" className="mb-6 flex flex-wrap gap-2">
        {weeks.map((w) => (
          <button
            key={w}
            type="button"
            role="tab"
            aria-selected={w === week}
            onClick={() => { setWeek(w); setPlaying(null); }}
            className="rounded-full border border-line bg-card px-4 py-2 text-sm aria-selected:border-brand aria-selected:bg-brand aria-selected:text-ink"
          >
            Week {w}
          </button>
        ))}
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((s) => {
          const key = `${s.week}-${s.day}`;
          return (
            <li key={key} className="card overflow-hidden">
              <div className="relative aspect-video bg-ink">
                {playing === key ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${s.youtubeId}?autoplay=1&rel=0`}
                    title={`Week ${s.week}, ${DAY_NAMES[s.day - 1]}: ${s.workout}`}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <button type="button" onClick={() => setPlaying(key)} className="group absolute inset-0" aria-label={`Play ${s.workout}, week ${s.week} day ${s.day}`}>
                    <Image src={`https://i.ytimg.com/vi/${s.youtubeId}/hqdefault.jpg`} alt="" fill sizes="(min-width: 1280px) 360px, (min-width: 640px) 45vw, 92vw" className="object-cover opacity-90 transition group-hover:opacity-100" />
                    <span className="absolute inset-0 grid place-items-center">
                      <PlayCircle className="h-16 w-16 text-white drop-shadow-lg" />
                    </span>
                  </button>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs tracking-[0.12em] text-gold uppercase">Day {s.day} · {DAY_NAMES[s.day - 1]}</p>
                <h3 className="text-lg">{s.workout}</h3>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-sm text-muted">Six sessions a week, Monday to Saturday; Sunday is a rest day. Warm up first and stop if anything hurts.</p>
    </div>
  );
}
