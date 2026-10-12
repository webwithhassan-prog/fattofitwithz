import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage_goals" ADD COLUMN "health_concern" boolean DEFAULT false;`)
  // Highlight the two health-issue goals that already exist (PCOS/thyroid/menopause and diabetes).
  await db.execute(sql`
   UPDATE "homepage_goals" SET "health_concern" = true WHERE "goal_id" IN ('hormonal', 'diabetes');`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage_goals" DROP COLUMN "health_concern";`)
}
