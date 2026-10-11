/**
 * 404 for URLs that match no route at all.
 * Needed because the app has two root layouts (website and admin panel), so Next.js
 * renders this file on its own, without a layout: it brings its own <html>, fonts and styles.
 */
import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/NotFoundContent";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = { title: "Page not found | Fat To Fit With Z", robots: { index: false } };

export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="antialiased">
        <NotFoundContent />
      </body>
    </html>
  );
}
