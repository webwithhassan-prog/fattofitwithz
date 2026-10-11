/**
 * /robots.txt
 * Search engines AND AI assistants (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)
 * may read public pages - that's what makes the site show up in AI answers (GEO).
 * Private areas (dashboard, API, checkout) are blocked for everyone.
 */
import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

const PRIVATE_PATHS = ["/dashboard", "/api/", "/checkout/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"], allow: "/", disallow: PRIVATE_PATHS },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
