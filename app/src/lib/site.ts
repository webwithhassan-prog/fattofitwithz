/** Site-wide constants. */

/**
 * Public URL of the site, used for canonical links, sitemap and structured data.
 * Set NEXT_PUBLIC_SITE_URL in .env.local (e.g. http://localhost:3000 while developing).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://fattofitwithz.com").replace(/\/$/, "");

export const SITE_NAME = "Fat To Fit With Z";

export const DEFAULT_DESCRIPTION =
  "Online nutrition and fitness coaching for women by nutritionist Zaineb Danish: personalized diet plans, home workouts, fat loss, PCOS and diabetes programs.";

/** Turns a path like "/programs" into an absolute URL. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
