import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Photos are stored in the database from now on (see src/payload/storage/databaseFiles.ts).
 * - media_files: one row per photo (filename, type, bytes). Not a Payload collection, only used by the storage adapter.
 * - media._objectkey: column added by Payload's storage plugin.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "_objectkey" varchar;
   CREATE TABLE IF NOT EXISTS "media_files" (
     "filename" varchar PRIMARY KEY NOT NULL,
     "mime_type" varchar NOT NULL,
     "data" bytea NOT NULL,
     "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "media_files";
   ALTER TABLE "media" DROP COLUMN "_objectkey";`)
}
