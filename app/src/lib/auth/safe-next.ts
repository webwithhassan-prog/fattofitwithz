/**
 * Where to go after logging in (?next=/checkout?...).
 * Only paths on THIS site are allowed ("/something", never "//other.site" or "https://..."),
 * so nobody can use our login page to send a member to a fake website.
 */
export function safeNextPath(next: unknown, fallback = "/dashboard"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
