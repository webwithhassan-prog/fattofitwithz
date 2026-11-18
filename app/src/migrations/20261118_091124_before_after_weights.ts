import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_photos" ADD COLUMN "before_kg" numeric DEFAULT 71;
  ALTER TABLE "page_photos" ADD COLUMN "after_kg" numeric DEFAULT 61;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "page_photos" DROP COLUMN "before_kg";
  ALTER TABLE "page_photos" DROP COLUMN "after_kg";`)
}
