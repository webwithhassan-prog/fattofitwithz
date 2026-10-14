"use client";

/**
 * One workout video, played with YouTube's official player (IFrame Player API).
 * The player script loads only after she presses play, so the library page stays fast.
 *
 * Calls onWatched() once she has watched the video to the end, or 90% of it
 * (many stop during the last stretches). If YouTube's script can't load (e.g. blocked),
 * the video still plays in a plain embed; it just isn't tracked.
 */
import { useEffect, useRef, useState } from "react";

const WATCHED_SHARE = 0.9;

type YTPlayer = { getCurrentTime(): number; getDuration(): number; getIframe(): HTMLIFrameElement; destroy(): void };
type YTApi = { Player: new (el: HTMLElement, options: object) => YTPlayer; PlayerState: { ENDED: number } };

declare global {
  interface Window {
    YT?: YTApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/** Loads https://www.youtube.com/iframe_api once and waits until it's ready. */
let apiPromise: Promise<YTApi> | null = null;
function loadYouTubeApi(): Promise<YTApi> {
  apiPromise ??= new Promise((resolve, reject) => {
    if (window.YT?.Player) return resolve(window.YT);
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => {
      apiPromise = null;
      reject(new Error("YouTube's player script could not load"));
    };
    document.head.appendChild(script);
  });
  return apiPromise;
}

type Props = { youtubeId: string; title: string; onWatched: () => void };

export function WorkoutVideo({ youtubeId, title, onWatched }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const onWatchedRef = useRef(onWatched);
  const [plainEmbed, setPlainEmbed] = useState(false);

  useEffect(() => {
    onWatchedRef.current = onWatched;
  });

  useEffect(() => {
    let player: YTPlayer | null = null;
    let timer = 0;
    let cancelled = false;
    let reported = false;
    const watched = () => {
      if (reported) return;
      reported = true;
      onWatchedRef.current();
    };

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !box.current) return;
        // YouTube replaces this element with its iframe (so React's own <div> is left alone).
        const target = document.createElement("div");
        box.current.appendChild(target);
        player = new YT.Player(target, {
          host: "https://www.youtube-nocookie.com",
          videoId: youtubeId,
          width: "100%",
          height: "100%",
          playerVars: { autoplay: 1, rel: 0, playsinline: 1 },
          events: {
            onReady: () => player?.getIframe().setAttribute("title", title),
            onStateChange: (event: { data: number }) => {
              if (event.data === YT.PlayerState.ENDED) watched();
            },
          },
        });
        // Every 5 seconds: has she watched 90% yet?
        timer = window.setInterval(() => {
          const duration = player?.getDuration?.() ?? 0;
          if (duration > 0 && (player?.getCurrentTime?.() ?? 0) / duration >= WATCHED_SHARE) watched();
        }, 5000);
      })
      .catch((error) => {
        console.warn("[workouts] Playing without progress tracking:", error);
        if (!cancelled) setPlainEmbed(true);
      });

    return () => {
      cancelled = true;
      clearInterval(timer);
      player?.destroy();
    };
  }, [youtubeId, title]);

  if (plainEmbed) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    );
  }
  return <div ref={box} className="absolute inset-0 [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full" />;
}
