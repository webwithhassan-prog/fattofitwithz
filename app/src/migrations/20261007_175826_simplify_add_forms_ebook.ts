import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_follow_up_forms_mood" AS ENUM('great', 'good', 'okay', 'tired', 'low');
  CREATE TABLE "first_day_forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"reviewed" boolean DEFAULT false,
  	"member_id" integer NOT NULL,
  	"full_name" varchar,
  	"age" varchar,
  	"height" varchar,
  	"current_weight_kg" numeric,
  	"goal_weight_kg" numeric,
  	"gender" varchar,
  	"marital_status" varchar,
  	"student" varchar,
  	"diet" varchar,
  	"smoking" varchar,
  	"medical_conditions" varchar,
  	"medical_details" varchar,
  	"allergies" varchar,
  	"allergy_details" varchar,
  	"likes" varchar,
  	"dislikes" varchar,
  	"chest" numeric,
  	"waist" numeric,
  	"hips" numeric,
  	"thigh" numeric,
  	"arm" numeric,
  	"shoulder" numeric,
  	"calf" numeric,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "follow_up_forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"reviewed" boolean DEFAULT false,
  	"member_id" integer NOT NULL,
  	"weight_kg" numeric NOT NULL,
  	"mood" "enum_follow_up_forms_mood",
  	"chest" numeric,
  	"waist" numeric,
  	"hips" numeric,
  	"thigh" numeric,
  	"arm" numeric,
  	"shoulder" numeric,
  	"calf" numeric,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "ebook" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"title" varchar DEFAULT 'Desi Weightloss Recipes' NOT NULL,
  	"description" varchar NOT NULL,
  	"cover_id" integer,
  	"drive_link" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "orders" ALTER COLUMN "member_id" DROP NOT NULL;
  ALTER TABLE "orders" ALTER COLUMN "program_id" DROP NOT NULL;
  ALTER TABLE "orders" ALTER COLUMN "months" DROP NOT NULL;
  ALTER TABLE "orders" ADD COLUMN "email" varchar NOT NULL;
  ALTER TABLE "orders" ADD COLUMN "ebook" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "first_day_forms_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "follow_up_forms_id" integer;
  ALTER TABLE "pricing_regions" ADD COLUMN "ebook_price" numeric;
  ALTER TABLE "pricing_regions" ADD COLUMN "ebook_price_with_plan" numeric;
  -- Edited by hand: fill the e-book prices for the existing countries before making them required.
  -- USD 8 on its own / USD 6 with a program, converted and rounded (the coach can change them in admin > Prices).
  UPDATE "pricing_regions" SET
    "ebook_price" = CASE "code"::text WHEN 'canada' THEN 11 WHEN 'uae' THEN 29 WHEN 'saudi' THEN 30 WHEN 'qatar' THEN 29
      WHEN 'india' THEN 690 WHEN 'pakistan' THEN 2250 WHEN 'australia' THEN 12 ELSE 8 END,
    "ebook_price_with_plan" = CASE "code"::text WHEN 'canada' THEN 8 WHEN 'uae' THEN 22 WHEN 'saudi' THEN 23 WHEN 'qatar' THEN 22
      WHEN 'india' THEN 520 WHEN 'pakistan' THEN 1700 WHEN 'australia' THEN 9 ELSE 6 END;
  ALTER TABLE "pricing_regions" ALTER COLUMN "ebook_price" SET NOT NULL;
  ALTER TABLE "pricing_regions" ALTER COLUMN "ebook_price_with_plan" SET NOT NULL;
  ALTER TABLE "first_day_forms" ADD CONSTRAINT "first_day_forms_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "follow_up_forms" ADD CONSTRAINT "follow_up_forms_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ebook" ADD CONSTRAINT "ebook_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "first_day_forms_member_idx" ON "first_day_forms" USING btree ("member_id");
  CREATE INDEX "first_day_forms_updated_at_idx" ON "first_day_forms" USING btree ("updated_at");
  CREATE INDEX "first_day_forms_created_at_idx" ON "first_day_forms" USING btree ("created_at");
  CREATE INDEX "follow_up_forms_member_idx" ON "follow_up_forms" USING btree ("member_id");
  CREATE INDEX "follow_up_forms_updated_at_idx" ON "follow_up_forms" USING btree ("updated_at");
  CREATE INDEX "follow_up_forms_created_at_idx" ON "follow_up_forms" USING btree ("created_at");
  CREATE INDEX "ebook_cover_idx" ON "ebook" USING btree ("cover_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_first_day_forms_fk" FOREIGN KEY ("first_day_forms_id") REFERENCES "public"."first_day_forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_follow_up_forms_fk" FOREIGN KEY ("follow_up_forms_id") REFERENCES "public"."follow_up_forms"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_first_day_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("first_day_forms_id");
  CREATE INDEX "payload_locked_documents_rels_follow_up_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("follow_up_forms_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "first_day_forms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "follow_up_forms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ebook" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "first_day_forms" CASCADE;
  DROP TABLE "follow_up_forms" CASCADE;
  DROP TABLE "ebook" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_first_day_forms_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_follow_up_forms_fk";
  
  DROP INDEX "payload_locked_documents_rels_first_day_forms_id_idx";
  DROP INDEX "payload_locked_documents_rels_follow_up_forms_id_idx";
  ALTER TABLE "orders" ALTER COLUMN "member_id" SET NOT NULL;
  ALTER TABLE "orders" ALTER COLUMN "program_id" SET NOT NULL;
  ALTER TABLE "orders" ALTER COLUMN "months" SET NOT NULL;
  ALTER TABLE "orders" DROP COLUMN "email";
  ALTER TABLE "orders" DROP COLUMN "ebook";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "first_day_forms_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "follow_up_forms_id";
  ALTER TABLE "pricing_regions" DROP COLUMN "ebook_price";
  ALTER TABLE "pricing_regions" DROP COLUMN "ebook_price_with_plan";
  DROP TYPE "public"."enum_follow_up_forms_mood";`)
}
