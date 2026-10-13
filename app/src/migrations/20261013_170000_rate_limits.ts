import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Counters for rate limiting (src/lib/rate-limit.server.ts). Not a Payload collection.
// key = action + hashed visitor id, window_start = start of the time window (unix seconds).
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "rate_limits" (
     "key" varchar PRIMARY KEY NOT NULL,
     "window_start" integer NOT NULL,
     "count" integer NOT NULL
   );`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "rate_limits";`)
}
