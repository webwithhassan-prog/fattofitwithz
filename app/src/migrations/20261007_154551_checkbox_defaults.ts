import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "check_ins" ALTER COLUMN "reviewed" SET DEFAULT false;
  ALTER TABLE "programs_durations" ALTER COLUMN "is_minimum" SET DEFAULT false;
  ALTER TABLE "testimonials" ALTER COLUMN "show_on_home" SET DEFAULT false;
  ALTER TABLE "testimonials" ALTER COLUMN "consent_on_file" SET DEFAULT false;
  ALTER TABLE "testimonials" ALTER COLUMN "on_live_site" SET DEFAULT false;
  ALTER TABLE "pricing_regions" ALTER COLUMN "is_default" SET DEFAULT false;`)

  // Added by hand: tick boxes that were never set become "no" (empty ones show as "general:null" in admin lists).
  await db.execute(sql`
  UPDATE "check_ins" SET "reviewed" = false WHERE "reviewed" IS NULL;
  UPDATE "programs_durations" SET "is_minimum" = false WHERE "is_minimum" IS NULL;
  UPDATE "testimonials" SET "show_on_home" = false WHERE "show_on_home" IS NULL;
  UPDATE "testimonials" SET "consent_on_file" = false WHERE "consent_on_file" IS NULL;
  UPDATE "testimonials" SET "on_live_site" = false WHERE "on_live_site" IS NULL;
  UPDATE "pricing_regions" SET "is_default" = false WHERE "is_default" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "check_ins" ALTER COLUMN "reviewed" DROP DEFAULT;
  ALTER TABLE "programs_durations" ALTER COLUMN "is_minimum" DROP DEFAULT;
  ALTER TABLE "testimonials" ALTER COLUMN "show_on_home" DROP DEFAULT;
  ALTER TABLE "testimonials" ALTER COLUMN "consent_on_file" DROP DEFAULT;
  ALTER TABLE "testimonials" ALTER COLUMN "on_live_site" DROP DEFAULT;
  ALTER TABLE "pricing_regions" ALTER COLUMN "is_default" DROP DEFAULT;`)
}
