"use client";

/**
 * Tells the server "this page was viewed" (for the admin dashboard's visit chart).
 * Sends only the page path - no cookies, no personal data. Placed in the public site layout.
 */
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageViewTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return; // React may run effects twice in development
    lastSent.current = pathname;
    const body = JSON.stringify({ path: pathname });
    // sendBeacon survives the visitor leaving the page; fetch is the fallback.
    const sent = navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }));
    if (!sent) void fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
  }, [pathname]);

  return null;
}
