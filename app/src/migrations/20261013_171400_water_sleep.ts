import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "first_day_forms" ADD COLUMN "water_intake" varchar;
  ALTER TABLE "first_day_forms" ADD COLUMN "sleep_hours" varchar;
  ALTER TABLE "follow_up_forms" ADD COLUMN "water_intake" varchar;
  ALTER TABLE "follow_up_forms" ADD COLUMN "sleep_hours" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "first_day_forms" DROP COLUMN "water_intake";
  ALTER TABLE "first_day_forms" DROP COLUMN "sleep_hours";
  ALTER TABLE "follow_up_forms" DROP COLUMN "water_intake";
  ALTER TABLE "follow_up_forms" DROP COLUMN "sleep_hours";`)
}
