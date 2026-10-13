/**
 * Rate limiting: stops one visitor (or bot) from repeating an action too often,
 * e.g. hammering "Forgot password", creating many accounts or spamming the contact form.
 *
 * How it works (simple "fixed window" counter):
 *   rateLimit(LIMITS.forgotPassword, ip) adds 1 to the counter for that action + visitor in the
 *   current time window (e.g. this 15 minutes). Above `max` -> refused until the window ends.
 * Counters are kept in the database table "rate_limits" (migration 20261013_170000_rate_limits),
 * because Netlify runs many copies of the site at once: memory-only counters wouldn't add up.
 * Visitor ids (IP addresses, member ids) are stored hashed, never in plain text.
 * If the database check itself fails, the action is ALLOWED (a broken limiter must not lock out clients).
 *
 * Debugging: SELECT * FROM rate_limits ORDER BY window_start DESC LIMIT 20;
 * Change the numbers in LIMITS below.
 */
import "server-only";
import { createHash } from "crypto";
import { headers } from "next/headers";
import { sql } from "@payloadcms/db-postgres";
import { getPayloadClient } from "./payload.server";

export type Limit = { name: string; max: number; windowMinutes: number };

export const LIMITS = {
  // accounts and passwords (per internet address)
  login: { name: "login", max: 20, windowMinutes: 15 },
  forgotPassword: { name: "forgot-password", max: 5, windowMinutes: 15 },
  resetPassword: { name: "reset-password", max: 10, windowMinutes: 15 },
  signup: { name: "signup", max: 5, windowMinutes: 60 },
  // buying (per internet address)
  checkout: { name: "checkout", max: 15, windowMinutes: 60 },
  // public forms (per internet address)
  contact: { name: "contact", max: 5, windowMinutes: 60 },
  newsletter: { name: "newsletter", max: 5, windowMinutes: 60 },
  regionLookup: { name: "region", max: 60, windowMinutes: 60 },
  // member area (per member)
  reportIssue: { name: "report-issue", max: 5, windowMinutes: 60 },
  saveForm: { name: "save-form", max: 30, windowMinutes: 60 },
  formImage: { name: "form-image", max: 60, windowMinutes: 60 },
} satisfies Record<string, Limit>;

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number; message: string };

/** Counts one attempt of `limit` for `who` (an IP address or "member:12"). */
export async function rateLimit(limit: Limit, who: string): Promise<RateLimitResult> {
  const windowSeconds = limit.windowMinutes * 60;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % windowSeconds);
  const key = `${limit.name}:${createHash("sha256").update(who).digest("hex").slice(0, 32)}`;

  try {
    const payload = await getPayloadClient();
    const db = (payload.db as unknown as { drizzle: { execute: (q: ReturnType<typeof sql>) => Promise<{ rows: { count: number | string }[] }> } }).drizzle;
    const result = await db.execute(sql`
      INSERT INTO rate_limits (key, window_start, count) VALUES (${key}, ${windowStart}, 1)
      ON CONFLICT (key) DO UPDATE SET
        count = CASE WHEN rate_limits.window_start = EXCLUDED.window_start THEN rate_limits.count + 1 ELSE 1 END,
        window_start = EXCLUDED.window_start
      RETURNING count`);
    // Now and then, remove counters older than a day so the table stays tiny.
    if (Math.random() < 0.02) await db.execute(sql`DELETE FROM rate_limits WHERE window_start < ${now - 86400}`);

    const count = Number(result.rows[0]?.count ?? 0);
    if (count <= limit.max) return { ok: true };
    const retryAfterSeconds = windowStart + windowSeconds - now;
    const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
    console.warn(`[rate-limit] ${limit.name}: limit of ${limit.max} per ${limit.windowMinutes} min reached (${key})`);
    return { ok: false, retryAfterSeconds, message: `Too many attempts. Please wait ${minutes} minute${minutes === 1 ? "" : "s"} and try again.` };
  } catch (error) {
    console.error(`[rate-limit] Could not check ${limit.name}, allowing the request:`, error);
    return { ok: true };
  }
}

/** The visitor's internet address. Netlify's own header first (it can't be faked by the visitor). */
export function ipFromHeaders(h: Headers): string {
  return h.get("x-nf-client-connection-ip") || h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

/** Same, inside server actions (no Request object there). */
export async function clientIp(): Promise<string> {
  return ipFromHeaders(await headers());
}

/** A 429 "Too many requests" answer for API routes. */
export function tooManyRequests(result: Extract<RateLimitResult, { ok: false }>): Response {
  return Response.json({ error: result.message }, { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } });
}
