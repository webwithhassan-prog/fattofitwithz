import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "password_resets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_id" integer NOT NULL,
  	"email" varchar NOT NULL,
  	"token_hash" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"used_at" timestamp(3) with time zone,
  	"ip" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "members" ADD COLUMN "password_hash" varchar;
  ALTER TABLE "members" ADD COLUMN "password_set_at" timestamp(3) with time zone;
  ALTER TABLE "members" ADD COLUMN "failed_logins" numeric DEFAULT 0;
  ALTER TABLE "members" ADD COLUMN "locked_until" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "password_resets_id" integer;
  ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "password_resets_member_idx" ON "password_resets" USING btree ("member_id");
  CREATE INDEX "password_resets_email_idx" ON "password_resets" USING btree ("email");
  CREATE UNIQUE INDEX "password_resets_token_hash_idx" ON "password_resets" USING btree ("token_hash");
  CREATE INDEX "password_resets_ip_idx" ON "password_resets" USING btree ("ip");
  CREATE INDEX "password_resets_updated_at_idx" ON "password_resets" USING btree ("updated_at");
  CREATE INDEX "password_resets_created_at_idx" ON "password_resets" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_password_resets_fk" FOREIGN KEY ("password_resets_id") REFERENCES "public"."password_resets"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_password_resets_id_idx" ON "payload_locked_documents_rels" USING btree ("password_resets_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "password_resets" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "password_resets" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_password_resets_fk";
  
  DROP INDEX "payload_locked_documents_rels_password_resets_id_idx";
  ALTER TABLE "members" DROP COLUMN "password_hash";
  ALTER TABLE "members" DROP COLUMN "password_set_at";
  ALTER TABLE "members" DROP COLUMN "failed_logins";
  ALTER TABLE "members" DROP COLUMN "locked_until";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "password_resets_id";`)
}
