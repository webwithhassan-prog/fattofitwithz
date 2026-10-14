import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "memberships" ADD COLUMN "frozen_until" timestamp(3) with time zone;
  ALTER TABLE "memberships" ADD COLUMN "frozen_from" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "memberships" DROP COLUMN "frozen_until";
  ALTER TABLE "memberships" DROP COLUMN "frozen_from";`)
}
