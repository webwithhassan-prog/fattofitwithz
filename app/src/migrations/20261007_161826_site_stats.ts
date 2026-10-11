import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" varchar NOT NULL,
  	"key" varchar NOT NULL,
  	"count" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "site_stats_id" integer;
  CREATE INDEX "site_stats_date_idx" ON "site_stats" USING btree ("date");
  CREATE INDEX "site_stats_updated_at_idx" ON "site_stats" USING btree ("updated_at");
  CREATE INDEX "site_stats_created_at_idx" ON "site_stats" USING btree ("created_at");
  CREATE UNIQUE INDEX "date_key_idx" ON "site_stats" USING btree ("date","key");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_stats_fk" FOREIGN KEY ("site_stats_id") REFERENCES "public"."site_stats"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_site_stats_id_idx" ON "payload_locked_documents_rels" USING btree ("site_stats_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_stats" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_stats" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_site_stats_fk";
  
  DROP INDEX "payload_locked_documents_rels_site_stats_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "site_stats_id";`)
}
