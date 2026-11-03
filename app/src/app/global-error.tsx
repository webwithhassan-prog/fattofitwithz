"use client";

/**
 * Last-resort error screen when even the main layout fails. It replaces the whole page,
 * so it brings its own <html>, <body> and simple styles (the site's styles aren't loaded here).
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fff7fb", color: "#2b1a24", display: "grid", minHeight: "100vh", placeItems: "center", padding: 24, textAlign: "center" }}>
        <title>Something went wrong | Fat To Fit With Z</title>
        <div style={{ maxWidth: 520 }}>
          <h1 style={{ fontSize: 30, margin: "0 0 12px" }}>Sorry, something went wrong</h1>
          <p style={{ color: "#4f3c47", lineHeight: 1.6 }}>Please try again in a moment. If it keeps happening, message us on WhatsApp.</p>
          <button type="button" onClick={() => retry()} style={{ marginTop: 20, padding: "12px 26px", borderRadius: 999, border: 0, background: "#ff65c5", color: "#2b1a24", fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>
          {error.digest ? <p style={{ marginTop: 18, fontSize: 12, color: "#4f3c47" }}>Error code: {error.digest}</p> : null}
        </div>
      </body>
    </html>
  );
}
