import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_testimonials_type" AS ENUM('photo', 'instagram');
  CREATE TYPE "public"."enum_testimonials_instagram_kind" AS ENUM('transformation', 'video', 'review');
  CREATE TYPE "public"."enum_faqs_show_on" AS ENUM('faq-page', 'homepage');
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"type" "enum_testimonials_type" DEFAULT 'photo' NOT NULL,
  	"order" numeric DEFAULT 10 NOT NULL,
  	"image_id" integer,
  	"start_kg" numeric,
  	"end_kg" numeric,
  	"rating" numeric DEFAULT 5,
  	"show_on_home" boolean,
  	"consent_on_file" boolean,
  	"instagram_url" varchar,
  	"instagram_kind" "enum_testimonials_instagram_kind" DEFAULT 'transformation',
  	"on_live_site" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "homepage_goals_programs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"program_id" integer NOT NULL,
  	"why" varchar
  );
  
  CREATE TABLE "homepage_goals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"goal_id" varchar NOT NULL
  );
  
  ALTER TABLE "faqs" ALTER COLUMN "category" DROP NOT NULL;
  ALTER TABLE "faqs" ALTER COLUMN "order" SET DEFAULT 10;
  ALTER TABLE "faqs" ADD COLUMN "show_on" "enum_faqs_show_on" DEFAULT 'faq-page' NOT NULL;
  ALTER TABLE "members" ADD COLUMN "display_name" varchar;
  ALTER TABLE "memberships" ADD COLUMN "title" varchar;
  ALTER TABLE "check_ins" ADD COLUMN "title" varchar;
  ALTER TABLE "check_ins" ADD COLUMN "reviewed" boolean;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_goals_programs" ADD CONSTRAINT "homepage_goals_programs_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_goals_programs" ADD CONSTRAINT "homepage_goals_programs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_goals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_goals" ADD CONSTRAINT "homepage_goals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "testimonials_image_idx" ON "testimonials" USING btree ("image_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "homepage_goals_programs_order_idx" ON "homepage_goals_programs" USING btree ("_order");
  CREATE INDEX "homepage_goals_programs_parent_id_idx" ON "homepage_goals_programs" USING btree ("_parent_id");
  CREATE INDEX "homepage_goals_programs_program_idx" ON "homepage_goals_programs" USING btree ("program_id");
  CREATE INDEX "homepage_goals_order_idx" ON "homepage_goals" USING btree ("_order");
  CREATE INDEX "homepage_goals_parent_id_idx" ON "homepage_goals" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");`)

  // ---- Added by hand: copy the existing content into the merged structures ----
  // (the old tables are removed by the NEXT migration, after this copy has run)
  await db.execute(sql`
  -- Transformations -> Testimonials (type "photo")
  INSERT INTO "testimonials" ("title", "type", "order", "image_id", "start_kg", "end_kg", "rating", "show_on_home", "consent_on_file", "updated_at", "created_at")
  SELECT
    CASE WHEN "start_kg" IS NOT NULL AND "end_kg" IS NOT NULL
      THEN 'Before/after: ' || trim_scale("start_kg")::text || ' → ' || trim_scale("end_kg")::text || ' kg'
      ELSE 'Before/after photo' END,
    'photo', "order", "image_id", "start_kg", "end_kg", "rating", "show_on_home", "consent_on_file", "updated_at", "created_at"
  FROM "transformations";

  -- Instagram posts -> Testimonials (type "instagram"), listed after the photos
  INSERT INTO "testimonials" ("title", "type", "order", "instagram_url", "instagram_kind", "on_live_site", "updated_at", "created_at")
  SELECT
    CASE "type"::text WHEN 'video' THEN 'Instagram video testimonial' WHEN 'review' THEN 'Instagram review' ELSE 'Instagram transformation' END,
    'instagram', 100 + row_number() OVER (ORDER BY "created_at", "id"), "url", "type"::text::"enum_testimonials_instagram_kind",
    "on_live_site", "updated_at", "created_at"
  FROM "instagram_posts";

  -- Homepage FAQ list -> FAQs (show on: homepage)
  INSERT INTO "faqs" ("question", "answer", "show_on", "order", "updated_at", "created_at")
  SELECT "question", "answer", 'homepage', "_order", now(), now() FROM "homepage_faqs";

  -- Goal picker global -> Homepage > Goal picker tab
  INSERT INTO "homepage_goals" ("_order", "_parent_id", "id", "goal_id", "label")
  SELECT g."_order", (SELECT "id" FROM "homepage" ORDER BY "id" LIMIT 1), g."id", g."goal_id", g."label"
  FROM "recommendations_goals" g
  WHERE EXISTS (SELECT 1 FROM "homepage");
  INSERT INTO "homepage_goals_programs" ("_order", "_parent_id", "id", "program_id", "why")
  SELECT p."_order", p."_parent_id", p."id", p."program_id", p."why"
  FROM "recommendations_goals_programs" p
  WHERE p."_parent_id" IN (SELECT "id" FROM "homepage_goals");

  -- Readable titles for rows that already exist
  UPDATE "members" SET "display_name" = COALESCE(NULLIF(trim("full_name"), ''), "email");
  UPDATE "check_ins" SET "title" = 'Week ' || "week"::text || COALESCE(' · ' || trim_scale("weight_kg")::text || ' kg', '');
  UPDATE "memberships" m SET "title" = p."name" || ' · ' || to_char(m."start_date", 'FMDD Mon YYYY') || ' – ' || to_char(m."end_date", 'FMDD Mon YYYY')
  FROM "programs" p WHERE p."id" = m."program_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_goals_programs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_goals" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "homepage_goals_programs" CASCADE;
  DROP TABLE "homepage_goals" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_testimonials_fk";
  
  DROP INDEX "payload_locked_documents_rels_testimonials_id_idx";
  ALTER TABLE "faqs" ALTER COLUMN "category" SET NOT NULL;
  ALTER TABLE "faqs" ALTER COLUMN "order" SET DEFAULT 1;
  ALTER TABLE "members" DROP COLUMN "display_name";
  ALTER TABLE "memberships" DROP COLUMN "title";
  ALTER TABLE "check_ins" DROP COLUMN "title";
  ALTER TABLE "check_ins" DROP COLUMN "reviewed";
  ALTER TABLE "faqs" DROP COLUMN "show_on";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "testimonials_id";
  DROP TYPE "public"."enum_testimonials_type";
  DROP TYPE "public"."enum_testimonials_instagram_kind";
  DROP TYPE "public"."enum_faqs_show_on";`)
}
