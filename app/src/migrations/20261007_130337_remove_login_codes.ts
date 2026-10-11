import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // The email-code login was replaced by passwords (see add_password_login). This removes its
  // empty table. Order matters: first the link from payload_locked_documents_rels, then the table.
  // (Edited by hand: the generated version dropped the table first, which already removes the link.)
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_login_codes_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_login_codes_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "login_codes_id";
  DROP TABLE IF EXISTS "login_codes";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "login_codes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"code_hash" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"attempts" numeric DEFAULT 0 NOT NULL,
  	"used_at" timestamp(3) with time zone,
  	"ip" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "login_codes_id" integer;
  CREATE INDEX "login_codes_email_idx" ON "login_codes" USING btree ("email");
  CREATE INDEX "login_codes_ip_idx" ON "login_codes" USING btree ("ip");
  CREATE INDEX "login_codes_updated_at_idx" ON "login_codes" USING btree ("updated_at");
  CREATE INDEX "login_codes_created_at_idx" ON "login_codes" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_login_codes_fk" FOREIGN KEY ("login_codes_id") REFERENCES "public"."login_codes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_login_codes_id_idx" ON "payload_locked_documents_rels" USING btree ("login_codes_id");`)
}
