"use client";

/**
 * Recorded library: the client's 4-week workout plan (admin > Recorded library), hosted on YouTube.
 * Included with every program.
 *
 * Videos load only when the member presses play (a "facade"), so the page stays fast:
 * we show YouTube's thumbnail first, then swap in the player (WorkoutVideo).
 *
 * "Done" badge: added automatically when she finishes a video (WorkoutVideo -> onWatched),
 * or by hand with "Mark as done". Saved on her account with setWorkoutDone().
 */
import Image from "next/image";
import { useState } from "react";
import { Check, PlayCircle } from "@/components/ui/Icons";
import { WorkoutVideo } from "./WorkoutVideo";
import { setWorkoutDone } from "@/app/(frontend)/dashboard/library/actions";
import { workoutKey } from "@/lib/member";
import type { WorkoutSession } from "@/lib/types";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Props = {
  sessions: WorkoutSession[];
  initialWeek: number;
  /** Videos she has finished ("1-3" = week 1, day 3). Leave out to hide the Done badges (locked preview). */
  done?: string[];
};

export function RecordedSessions({ sessions, initialWeek, done }: Props) {
  const weeks = [...new Set(sessions.map((s) => s.week))].sort((a, b) => a - b);
  const [week, setWeek] = useState(weeks.includes(initialWeek) ? initialWeek : weeks[0]);
  const [playing, setPlaying] = useState<string | null>(null);
  const [doneKeys, setDoneKeys] = useState(() => new Set(done ?? []));
  const list = sessions.filter((s) => s.week === week).sort((a, b) => a.day - b.day);
  const tracking = done !== undefined;

  /** Shows the change straight away, saves it, and undoes it on screen if saving failed. */
  function saveDone(key: string, value: boolean) {
    const show = (v: boolean) =>
      setDoneKeys((prev) => {
        const next = new Set(prev);
        if (v) next.add(key);
        else next.delete(key);
        return next;
      });
    show(value);
    setWorkoutDone(key, value)
      .then((result) => {
        if (!result.ok) show(!value);
      })
      .catch(() => show(!value));
  }

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
          const key = workoutKey(s.week, s.day);
          const title = `Week ${s.week}, ${DAY_NAMES[s.day - 1]}: ${s.workout}`;
          const isDone = tracking && doneKeys.has(key);
          return (
            <li key={key} className={`card overflow-hidden ${isDone ? "border-brand" : ""}`}>
              <div className="relative aspect-video bg-ink">
                {playing === key ? (
                  <WorkoutVideo youtubeId={s.youtubeId} title={title} onWatched={() => tracking && !doneKeys.has(key) && saveDone(key, true)} />
                ) : (
                  <button type="button" onClick={() => setPlaying(key)} className="group absolute inset-0" aria-label={`Play ${s.workout}, week ${s.week} day ${s.day}`}>
                    <Image src={`https://i.ytimg.com/vi/${s.youtubeId}/hqdefault.jpg`} alt="" fill sizes="(min-width: 1280px) 360px, (min-width: 640px) 45vw, 92vw" className="object-cover opacity-90 transition group-hover:opacity-100" />
                    <span className="absolute inset-0 grid place-items-center">
                      <PlayCircle className="h-16 w-16 text-white drop-shadow-lg" />
                    </span>
                  </button>
                )}
                {isDone && playing !== key ? (
                  <span className="fade-in pointer-events-none absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-ink shadow-[0_8px_18px_-8px_rgba(43,26,36,0.6)]">
                    <Check className="h-3.5 w-3.5" /> Done
                  </span>
                ) : null}
              </div>
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-xs tracking-[0.12em] text-gold uppercase">Day {s.day} · {DAY_NAMES[s.day - 1]}</p>
                  <h3 className="text-lg">{s.workout}</h3>
                </div>
                {tracking ? (
                  isDone ? (
                    <button type="button" onClick={() => saveDone(key, false)} className="flex-none py-1.5 text-xs text-muted underline hover:text-ink" aria-label={`Undo done: ${s.workout}`}>
                      Undo
                    </button>
                  ) : (
                    <button type="button" onClick={() => saveDone(key, true)} className="inline-flex flex-none items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-brand hover:bg-blush">
                      <Check className="h-3.5 w-3.5 text-brand-dark" /> Mark as done
                    </button>
                  )
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-sm text-muted">Six sessions a week, Monday to Saturday; Sunday is a rest day. Warm up first and stop if anything hurts.</p>
    </div>
  );
}
