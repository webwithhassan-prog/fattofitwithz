import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Simplified member area (2026-10-07): no meal plans, check-ins, notifications or water/sleep logs any more.
  // Edited by hand: links are removed before the tables, and IF EXISTS keeps it safe to re-run.
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_check_ins_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_announcements_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_daily_logs_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_check_ins_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_announcements_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_daily_logs_id_idx";
  DROP TABLE IF EXISTS "members_meal_plan_items";
  DROP TABLE IF EXISTS "members_meal_plan";
  DROP TABLE IF EXISTS "check_ins";
  DROP TABLE IF EXISTS "announcements";
  DROP TABLE IF EXISTS "daily_logs";
  ALTER TABLE "members" DROP COLUMN "start_weight_kg";
  ALTER TABLE "members" DROP COLUMN "goal_weight_kg";
  ALTER TABLE "members" DROP COLUMN "measurements_chest";
  ALTER TABLE "members" DROP COLUMN "measurements_waist";
  ALTER TABLE "members" DROP COLUMN "measurements_hips";
  ALTER TABLE "members" DROP COLUMN "measurements_thigh";
  ALTER TABLE "members" DROP COLUMN "measurements_arm";
  ALTER TABLE "members" DROP COLUMN "measurements_shoulder";
  ALTER TABLE "members" DROP COLUMN "measurements_calf";
  ALTER TABLE "members" DROP COLUMN "profile_age";
  ALTER TABLE "members" DROP COLUMN "profile_height";
  ALTER TABLE "members" DROP COLUMN "profile_current_weight_kg";
  ALTER TABLE "members" DROP COLUMN "profile_gender";
  ALTER TABLE "members" DROP COLUMN "profile_marital_status";
  ALTER TABLE "members" DROP COLUMN "profile_student";
  ALTER TABLE "members" DROP COLUMN "profile_diet";
  ALTER TABLE "members" DROP COLUMN "profile_smoking";
  ALTER TABLE "members" DROP COLUMN "profile_medical_conditions";
  ALTER TABLE "members" DROP COLUMN "profile_medical_details";
  ALTER TABLE "members" DROP COLUMN "profile_allergies";
  ALTER TABLE "members" DROP COLUMN "profile_allergy_details";
  ALTER TABLE "members" DROP COLUMN "profile_likes";
  ALTER TABLE "members" DROP COLUMN "profile_dislikes";
  ALTER TABLE "members" DROP COLUMN "meal_plan_note";
  ALTER TABLE "members" DROP COLUMN "ticks";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "check_ins_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "announcements_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "daily_logs_id";
  DROP TYPE "public"."enum_check_ins_mood";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_check_ins_mood" AS ENUM('great', 'good', 'okay', 'tired', 'low');
  CREATE TABLE "members_meal_plan_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"kcal" numeric
  );
  
  CREATE TABLE "members_meal_plan" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"meal" varchar NOT NULL
  );
  
  CREATE TABLE "check_ins" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"reviewed" boolean DEFAULT false,
  	"member_id" integer NOT NULL,
  	"week" numeric NOT NULL,
  	"weight_kg" numeric,
  	"mood" "enum_check_ins_mood",
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "announcements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "daily_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_id" integer NOT NULL,
  	"date" varchar NOT NULL,
  	"water_glasses" numeric DEFAULT 0,
  	"sleep_minutes" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "members" ADD COLUMN "start_weight_kg" numeric;
  ALTER TABLE "members" ADD COLUMN "goal_weight_kg" numeric;
  ALTER TABLE "members" ADD COLUMN "measurements_chest" numeric;
  ALTER TABLE "members" ADD COLUMN "measurements_waist" numeric;
  ALTER TABLE "members" ADD COLUMN "measurements_hips" numeric;
  ALTER TABLE "members" ADD COLUMN "measurements_thigh" numeric;
  ALTER TABLE "members" ADD COLUMN "measurements_arm" numeric;
  ALTER TABLE "members" ADD COLUMN "measurements_shoulder" numeric;
  ALTER TABLE "members" ADD COLUMN "measurements_calf" numeric;
  ALTER TABLE "members" ADD COLUMN "profile_age" varchar;
  ALTER TABLE "members" ADD COLUMN "profile_height" varchar;
  ALTER TABLE "members" ADD COLUMN "profile_current_weight_kg" varchar;
  ALTER TABLE "members" ADD COLUMN "profile_gender" varchar;
  ALTER TABLE "members" ADD COLUMN "profile_marital_status" varchar;
  ALTER TABLE "members" ADD COLUMN "profile_student" varchar;
  ALTER TABLE "members" ADD COLUMN "profile_diet" varchar;
  ALTER TABLE "members" ADD COLUMN "profile_smoking" varchar;
  ALTER TABLE "members" ADD COLUMN "profile_medical_conditions" varchar;
  ALTER TABLE "members" ADD COLUMN "profile_medical_details" varchar;
  ALTER TABLE "members" ADD COLUMN "profile_allergies" varchar;
  ALTER TABLE "members" ADD COLUMN "profile_allergy_details" varchar;
  ALTER TABLE "members" ADD COLUMN "profile_likes" varchar;
  ALTER TABLE "members" ADD COLUMN "profile_dislikes" varchar;
  ALTER TABLE "members" ADD COLUMN "meal_plan_note" varchar;
  ALTER TABLE "members" ADD COLUMN "ticks" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "check_ins_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "announcements_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "daily_logs_id" integer;
  ALTER TABLE "members_meal_plan_items" ADD CONSTRAINT "members_meal_plan_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."members_meal_plan"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "members_meal_plan" ADD CONSTRAINT "members_meal_plan_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "members_meal_plan_items_order_idx" ON "members_meal_plan_items" USING btree ("_order");
  CREATE INDEX "members_meal_plan_items_parent_id_idx" ON "members_meal_plan_items" USING btree ("_parent_id");
  CREATE INDEX "members_meal_plan_order_idx" ON "members_meal_plan" USING btree ("_order");
  CREATE INDEX "members_meal_plan_parent_id_idx" ON "members_meal_plan" USING btree ("_parent_id");
  CREATE INDEX "check_ins_member_idx" ON "check_ins" USING btree ("member_id");
  CREATE INDEX "check_ins_updated_at_idx" ON "check_ins" USING btree ("updated_at");
  CREATE INDEX "check_ins_created_at_idx" ON "check_ins" USING btree ("created_at");
  CREATE INDEX "announcements_updated_at_idx" ON "announcements" USING btree ("updated_at");
  CREATE INDEX "announcements_created_at_idx" ON "announcements" USING btree ("created_at");
  CREATE INDEX "daily_logs_member_idx" ON "daily_logs" USING btree ("member_id");
  CREATE INDEX "daily_logs_date_idx" ON "daily_logs" USING btree ("date");
  CREATE INDEX "daily_logs_updated_at_idx" ON "daily_logs" USING btree ("updated_at");
  CREATE INDEX "daily_logs_created_at_idx" ON "daily_logs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_check_ins_fk" FOREIGN KEY ("check_ins_id") REFERENCES "public"."check_ins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_announcements_fk" FOREIGN KEY ("announcements_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_daily_logs_fk" FOREIGN KEY ("daily_logs_id") REFERENCES "public"."daily_logs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_check_ins_id_idx" ON "payload_locked_documents_rels" USING btree ("check_ins_id");
  CREATE INDEX "payload_locked_documents_rels_announcements_id_idx" ON "payload_locked_documents_rels" USING btree ("announcements_id");
  CREATE INDEX "payload_locked_documents_rels_daily_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("daily_logs_id");`)
}
