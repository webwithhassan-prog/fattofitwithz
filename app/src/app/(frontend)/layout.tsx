/**
 * Root layout of the WEBSITE (public pages + member dashboard).
 * The admin panel has its own root layout in src/app/(payload)/layout.tsx.
 */
import type { Metadata, Viewport } from "next";
import { fontVariables } from "../fonts";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "../globals.css";

// Defaults for every page. Pages override title/description via buildMetadata() in lib/seo.ts.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Online Nutrition & Fitness Coaching for Women`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, type: "website", images: ["/images/og.jpg"] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#a3154f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: browser extensions (e.g. "crxlauncher") add attributes to <html>
    // before React loads, which causes a harmless hydration warning. This only ignores
    // attribute differences on this one tag; mismatches inside the page are still reported.
    <html
      lang="en"
      className={fontVariables}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="antialiased">
        {/* Accessibility: lets keyboard users jump past the navigation */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
