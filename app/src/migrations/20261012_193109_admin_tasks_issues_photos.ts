import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_client_issues_status" AS ENUM('open', 'in-progress', 'solved');
  CREATE TYPE "public"."enum_client_issues_topic" AS ENUM('Payment', 'Login / account', 'Forms', 'Workout videos', 'Diet plan', 'Other');
  CREATE TYPE "public"."enum_announcements_audience" AS ENUM('everyone', 'one');
  CREATE TABLE "client_issues" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"status" "enum_client_issues_status" DEFAULT 'open' NOT NULL,
  	"member_id" integer NOT NULL,
  	"topic" "enum_client_issues_topic" NOT NULL,
  	"message" varchar NOT NULL,
  	"reply" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "announcements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"audience" "enum_announcements_audience" DEFAULT 'everyone' NOT NULL,
  	"member_id" integer,
  	"title" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"show_until" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "page_photos_about_events" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"photo_id" integer NOT NULL,
  	"caption" varchar NOT NULL
  );
  
  CREATE TABLE "page_photos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"about_photo_id" integer,
  	"before_photo_id" integer,
  	"after_photo_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "client_issues_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "announcements_id" integer;
  ALTER TABLE "client_issues" ADD CONSTRAINT "client_issues_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "announcements" ADD CONSTRAINT "announcements_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_photos_about_events" ADD CONSTRAINT "page_photos_about_events_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_photos_about_events" ADD CONSTRAINT "page_photos_about_events_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_photos" ADD CONSTRAINT "page_photos_about_photo_id_media_id_fk" FOREIGN KEY ("about_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_photos" ADD CONSTRAINT "page_photos_before_photo_id_media_id_fk" FOREIGN KEY ("before_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_photos" ADD CONSTRAINT "page_photos_after_photo_id_media_id_fk" FOREIGN KEY ("after_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "client_issues_member_idx" ON "client_issues" USING btree ("member_id");
  CREATE INDEX "client_issues_updated_at_idx" ON "client_issues" USING btree ("updated_at");
  CREATE INDEX "client_issues_created_at_idx" ON "client_issues" USING btree ("created_at");
  CREATE INDEX "announcements_member_idx" ON "announcements" USING btree ("member_id");
  CREATE INDEX "announcements_updated_at_idx" ON "announcements" USING btree ("updated_at");
  CREATE INDEX "announcements_created_at_idx" ON "announcements" USING btree ("created_at");
  CREATE INDEX "page_photos_about_events_order_idx" ON "page_photos_about_events" USING btree ("_order");
  CREATE INDEX "page_photos_about_events_parent_id_idx" ON "page_photos_about_events" USING btree ("_parent_id");
  CREATE INDEX "page_photos_about_events_photo_idx" ON "page_photos_about_events" USING btree ("photo_id");
  CREATE INDEX "page_photos_about_photo_idx" ON "page_photos" USING btree ("about_photo_id");
  CREATE INDEX "page_photos_before_photo_idx" ON "page_photos" USING btree ("before_photo_id");
  CREATE INDEX "page_photos_after_photo_idx" ON "page_photos" USING btree ("after_photo_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_client_issues_fk" FOREIGN KEY ("client_issues_id") REFERENCES "public"."client_issues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_announcements_fk" FOREIGN KEY ("announcements_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_client_issues_id_idx" ON "payload_locked_documents_rels" USING btree ("client_issues_id");
  CREATE INDEX "payload_locked_documents_rels_announcements_id_idx" ON "payload_locked_documents_rels" USING btree ("announcements_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Links and indexes first, then the tables (hand-ordered so a rollback can't fail half-way).
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_client_issues_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_announcements_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_client_issues_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_announcements_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "client_issues_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "announcements_id";
  DROP TABLE IF EXISTS "client_issues" CASCADE;
  DROP TABLE IF EXISTS "announcements" CASCADE;
  DROP TABLE IF EXISTS "page_photos_about_events" CASCADE;
  DROP TABLE IF EXISTS "page_photos" CASCADE;
  DROP TYPE IF EXISTS "public"."enum_client_issues_status";
  DROP TYPE IF EXISTS "public"."enum_client_issues_topic";
  DROP TYPE IF EXISTS "public"."enum_announcements_audience";`)
}
