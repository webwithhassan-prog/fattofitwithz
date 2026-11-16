import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payments" ADD COLUMN "bank_logo_id" integer;
  ALTER TABLE "payments" ADD COLUMN "jazzcash_logo_id" integer;
  ALTER TABLE "payments" ADD COLUMN "easypaisa_logo_id" integer;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_bank_logo_id_media_id_fk" FOREIGN KEY ("bank_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_jazzcash_logo_id_media_id_fk" FOREIGN KEY ("jazzcash_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_easypaisa_logo_id_media_id_fk" FOREIGN KEY ("easypaisa_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "payments_bank_logo_idx" ON "payments" USING btree ("bank_logo_id");
  CREATE INDEX "payments_jazzcash_logo_idx" ON "payments" USING btree ("jazzcash_logo_id");
  CREATE INDEX "payments_easypaisa_logo_idx" ON "payments" USING btree ("easypaisa_logo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payments" DROP CONSTRAINT "payments_bank_logo_id_media_id_fk";
  
  ALTER TABLE "payments" DROP CONSTRAINT "payments_jazzcash_logo_id_media_id_fk";
  
  ALTER TABLE "payments" DROP CONSTRAINT "payments_easypaisa_logo_id_media_id_fk";
  
  DROP INDEX "payments_bank_logo_idx";
  DROP INDEX "payments_jazzcash_logo_idx";
  DROP INDEX "payments_easypaisa_logo_idx";
  ALTER TABLE "payments" DROP COLUMN "bank_logo_id";
  ALTER TABLE "payments" DROP COLUMN "jazzcash_logo_id";
  ALTER TABLE "payments" DROP COLUMN "easypaisa_logo_id";`)
}
