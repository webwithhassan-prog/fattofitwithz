/**
 * Simple, private visit counting for the admin dashboard (no cookies, no personal data).
 *
 *   countPageView("/programs")         called by /api/track for every page a visitor opens
 *   countEvent("checkout-started")     called by /api/checkout
 *   await flushStats()                 writes the counts to the database (admin > site-stats)
 *
 * Counts are kept in memory and written in ONE query at most every STATS_FLUSH_MINUTES
 * (default 60), so visitors don't wake the free Neon database on every page view.
 * The admin dashboard flushes first, so it always shows up-to-date numbers.
 * If the server restarts, counts not yet written are lost - fine for statistics.
 */
import "server-only";
import { sql, type PostgresAdapter } from "@payloadcms/db-postgres";
import { getPayloadClient } from "./payload.server";

const FLUSH_MS = Number(process.env.STATS_FLUSH_MINUTES ?? 60) * 60 * 1000;
// Only the live site counts visits, so testing on your own computer doesn't mix with real visitors
// (both use the same database). Set STATS_IN_DEV=true in .env.local to try it while developing.
const ENABLED = process.env.NODE_ENV === "production" || process.env.STATS_IN_DEV === "true";
const TIME_ZONE = "Asia/Karachi"; // days are counted in the business's own time zone

type Buffer = { counts: Map<string, number>; lastFlush: number; flushing: Promise<void> | null };

// Kept on globalThis so hot reloads in development don't create a second buffer.
const store = globalThis as unknown as { __ftfStats?: Buffer };
const buffer: Buffer = (store.__ftfStats ??= { counts: new Map(), lastFlush: Date.now(), flushing: null });

/** Today's date in Pakistan time, e.g. "2026-10-07". */
export function statsDay(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function add(key: string) {
  if (!ENABLED) return;
  const id = `${statsDay()}|${key}`;
  buffer.counts.set(id, (buffer.counts.get(id) ?? 0) + 1);
  if (Date.now() - buffer.lastFlush > FLUSH_MS) void flushStats();
}

export function countPageView(path: string) {
  add(path);
}

export function countEvent(name: "checkout-started") {
  add(`event:${name}`);
}

/** Writes the buffered counts to the database (adds to existing rows). Safe to call any time. */
export async function flushStats(): Promise<void> {
  if (buffer.flushing) return buffer.flushing;
  if (buffer.counts.size === 0) {
    buffer.lastFlush = Date.now();
    return;
  }
  const entries = [...buffer.counts.entries()];
  buffer.counts.clear();
  buffer.lastFlush = Date.now();

  buffer.flushing = (async () => {
    try {
      const payload = await getPayloadClient();
      const db = (payload.db as unknown as PostgresAdapter).drizzle;
      const rows = entries.map(([id, count]) => {
        const [date, key] = id.split("|");
        return sql`(${date}, ${key}, ${count}, now(), now())`;
      });
      await db.execute(sql`
        INSERT INTO "site_stats" ("date", "key", "count", "updated_at", "created_at")
        VALUES ${sql.join(rows, sql`, `)}
        ON CONFLICT ("date", "key") DO UPDATE
        SET "count" = "site_stats"."count" + EXCLUDED."count", "updated_at" = now()`);
    } catch (error) {
      // Put the counts back so they are written next time.
      for (const [id, count] of entries) buffer.counts.set(id, (buffer.counts.get(id) ?? 0) + count);
      console.error("[stats] Could not save visit counts (will retry):", error);
    } finally {
      buffer.flushing = null;
    }
  })();
  return buffer.flushing;
}
