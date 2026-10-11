import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Removes the structures that were merged by the previous migration (their content was copied
  // there first). Edited by hand: links are removed before the tables, and IF EXISTS keeps it safe.
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_transformations_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_instagram_posts_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_transformations_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_instagram_posts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "transformations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "instagram_posts_id";
  DROP TABLE IF EXISTS "transformations";
  DROP TABLE IF EXISTS "instagram_posts";
  DROP TABLE IF EXISTS "homepage_faqs";
  DROP TABLE IF EXISTS "recommendations_goals_programs";
  DROP TABLE IF EXISTS "recommendations_goals";
  DROP TABLE IF EXISTS "recommendations";
  DROP TYPE IF EXISTS "public"."enum_instagram_posts_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_instagram_posts_type" AS ENUM('transformation', 'video', 'review');
  CREATE TABLE "transformations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"start_kg" numeric,
  	"end_kg" numeric,
  	"rating" numeric DEFAULT 5,
  	"show_on_home" boolean,
  	"consent_on_file" boolean,
  	"order" numeric DEFAULT 1 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "instagram_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL,
  	"type" "enum_instagram_posts_type" DEFAULT 'transformation' NOT NULL,
  	"on_live_site" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "homepage_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "recommendations_goals_programs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"program_id" integer NOT NULL,
  	"why" varchar
  );
  
  CREATE TABLE "recommendations_goals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"goal_id" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "recommendations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "transformations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "instagram_posts_id" integer;
  ALTER TABLE "transformations" ADD CONSTRAINT "transformations_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_faqs" ADD CONSTRAINT "homepage_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recommendations_goals_programs" ADD CONSTRAINT "recommendations_goals_programs_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recommendations_goals_programs" ADD CONSTRAINT "recommendations_goals_programs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recommendations_goals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recommendations_goals" ADD CONSTRAINT "recommendations_goals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recommendations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "transformations_image_idx" ON "transformations" USING btree ("image_id");
  CREATE INDEX "transformations_updated_at_idx" ON "transformations" USING btree ("updated_at");
  CREATE INDEX "transformations_created_at_idx" ON "transformations" USING btree ("created_at");
  CREATE INDEX "instagram_posts_updated_at_idx" ON "instagram_posts" USING btree ("updated_at");
  CREATE INDEX "instagram_posts_created_at_idx" ON "instagram_posts" USING btree ("created_at");
  CREATE INDEX "homepage_faqs_order_idx" ON "homepage_faqs" USING btree ("_order");
  CREATE INDEX "homepage_faqs_parent_id_idx" ON "homepage_faqs" USING btree ("_parent_id");
  CREATE INDEX "recommendations_goals_programs_order_idx" ON "recommendations_goals_programs" USING btree ("_order");
  CREATE INDEX "recommendations_goals_programs_parent_id_idx" ON "recommendations_goals_programs" USING btree ("_parent_id");
  CREATE INDEX "recommendations_goals_programs_program_idx" ON "recommendations_goals_programs" USING btree ("program_id");
  CREATE INDEX "recommendations_goals_order_idx" ON "recommendations_goals" USING btree ("_order");
  CREATE INDEX "recommendations_goals_parent_id_idx" ON "recommendations_goals" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_transformations_fk" FOREIGN KEY ("transformations_id") REFERENCES "public"."transformations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_instagram_posts_fk" FOREIGN KEY ("instagram_posts_id") REFERENCES "public"."instagram_posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_transformations_id_idx" ON "payload_locked_documents_rels" USING btree ("transformations_id");
  CREATE INDEX "payload_locked_documents_rels_instagram_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("instagram_posts_id");`)
}
