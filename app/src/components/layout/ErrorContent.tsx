"use client";

/**
 * "Something went wrong" screen, used by the error.tsx files (website and member area).
 * The real error is in the server logs: search them for the code shown (error.digest).
 */
import Link from "next/link";
import { useEffect } from "react";

type Props = { error: Error & { digest?: string }; retry: () => void };

export function ErrorContent({ error, retry }: Props) {
  useEffect(() => {
    console.error("[page-error]", error.digest ?? "", error);
  }, [error]);

  return (
    <div className="section text-center">
      <div className="container-site max-w-[600px]">
        <p className="kicker">Something went wrong</p>
        <h1 className="mt-3 text-[clamp(30px,5vw,46px)]">
          Sorry, this page didn&apos;t <span className="script">load</span>
        </h1>
        <p className="lead mx-auto mt-4">It&apos;s usually a short hiccup. Please try again; if it keeps happening, message us on WhatsApp.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn" onClick={() => retry()}>
            Try again
          </button>
          <Link href="/" className="btn btn-ghost">
            Go to the homepage
          </Link>
        </div>
        {error.digest ? <p className="mt-6 text-xs text-muted">Error code: {error.digest}</p> : null}
      </div>
    </div>
  );
}
