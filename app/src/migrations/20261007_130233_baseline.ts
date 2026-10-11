import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_faqs_category" AS ENUM('general', 'membership', 'payments-support');
  CREATE TYPE "public"."enum_instagram_posts_type" AS ENUM('transformation', 'video', 'review');
  CREATE TYPE "public"."enum_memberships_status" AS ENUM('active', 'frozen', 'cancelled');
  CREATE TYPE "public"."enum_check_ins_mood" AS ENUM('great', 'good', 'okay', 'tired', 'low');
  CREATE TYPE "public"."enum_orders_region" AS ENUM('usa', 'canada', 'uae', 'saudi', 'qatar', 'india', 'pakistan', 'australia');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('paid', 'refunded');
  CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('stripe', 'bank-transfer', 'other');
  CREATE TYPE "public"."enum_pricing_regions_code" AS ENUM('usa', 'canada', 'uae', 'saudi', 'qatar', 'india', 'pakistan', 'australia');
  CREATE TABLE "programs_durations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"months" numeric NOT NULL,
  	"is_minimum" boolean
  );
  
  CREATE TABLE "programs_card_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "programs_full_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "programs_covers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "programs_includes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "programs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"tag" varchar,
  	"order" numeric DEFAULT 1 NOT NULL,
  	"focus" varchar NOT NULL,
  	"summary" varchar NOT NULL,
  	"benefits_label" varchar DEFAULT 'Main Benefits',
  	"who_is_it_for" varchar NOT NULL,
  	"how_it_works" varchar NOT NULL,
  	"legacy_shopify_handle" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faqs_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"answer_after_list" varchar,
  	"category" "enum_faqs_category" DEFAULT 'general' NOT NULL,
  	"order" numeric DEFAULT 1 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
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
  
  CREATE TABLE "legal_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"effective_date" varchar,
  	"body" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
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
  
  CREATE TABLE "members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"full_name" varchar,
  	"phone" varchar,
  	"start_weight_kg" numeric,
  	"goal_weight_kg" numeric,
  	"measurements_chest" numeric,
  	"measurements_waist" numeric,
  	"measurements_hips" numeric,
  	"measurements_thigh" numeric,
  	"measurements_arm" numeric,
  	"measurements_shoulder" numeric,
  	"measurements_calf" numeric,
  	"profile_age" varchar,
  	"profile_height" varchar,
  	"profile_current_weight_kg" varchar,
  	"profile_gender" varchar,
  	"profile_marital_status" varchar,
  	"profile_student" varchar,
  	"profile_diet" varchar,
  	"profile_smoking" varchar,
  	"profile_medical_conditions" varchar,
  	"profile_medical_details" varchar,
  	"profile_allergies" varchar,
  	"profile_allergy_details" varchar,
  	"profile_likes" varchar,
  	"profile_dislikes" varchar,
  	"meal_plan_note" varchar,
  	"ticks" jsonb,
  	"coach_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "memberships" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_id" integer NOT NULL,
  	"program_id" integer NOT NULL,
  	"order_id" integer,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"status" "enum_memberships_status" DEFAULT 'active' NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "check_ins" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_id" integer NOT NULL,
  	"week" numeric NOT NULL,
  	"weight_kg" numeric,
  	"mood" "enum_check_ins_mood",
  	"notes" varchar,
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
  
  CREATE TABLE "announcements" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "workout_sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"week" numeric NOT NULL,
  	"day" numeric NOT NULL,
  	"workout" varchar NOT NULL,
  	"youtube_url" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order_label" varchar,
  	"member_id" integer NOT NULL,
  	"program_id" integer NOT NULL,
  	"months" numeric NOT NULL,
  	"amount" numeric NOT NULL,
  	"currency" varchar NOT NULL,
  	"region" "enum_orders_region",
  	"status" "enum_orders_status" DEFAULT 'paid' NOT NULL,
  	"payment_method" "enum_orders_payment_method" DEFAULT 'stripe' NOT NULL,
  	"stripe_session_id" varchar,
  	"stripe_payment_intent_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contact_messages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"subject" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "subscribers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "member_sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_id" integer NOT NULL,
  	"token_hash" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"user_agent" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
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
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"programs_id" integer,
  	"faqs_id" integer,
  	"transformations_id" integer,
  	"instagram_posts_id" integer,
  	"legal_pages_id" integer,
  	"media_id" integer,
  	"members_id" integer,
  	"memberships_id" integer,
  	"check_ins_id" integer,
  	"daily_logs_id" integer,
  	"announcements_id" integer,
  	"workout_sessions_id" integer,
  	"orders_id" integer,
  	"contact_messages_id" integer,
  	"subscribers_id" integer,
  	"users_id" integer,
  	"member_sessions_id" integer,
  	"login_codes_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "homepage_banners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"photo_id" integer NOT NULL,
  	"kicker" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"title_script" varchar NOT NULL,
  	"sub" varchar NOT NULL,
  	"primary_label" varchar NOT NULL,
  	"primary_href" varchar NOT NULL,
  	"secondary_label" varchar NOT NULL,
  	"secondary_href" varchar NOT NULL,
  	"badge_big" varchar NOT NULL,
  	"badge_small" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_founder_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"photo_id" integer NOT NULL,
  	"caption" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"source" varchar
  );
  
  CREATE TABLE "homepage_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"autoplay_seconds" numeric DEFAULT 7 NOT NULL,
  	"founder_author" varchar NOT NULL,
  	"founder_author_title" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "pricing_regions_prices" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"months" numeric NOT NULL,
  	"amount" numeric NOT NULL,
  	"compare_at" numeric NOT NULL
  );
  
  CREATE TABLE "pricing_regions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"code" "enum_pricing_regions_code" NOT NULL,
  	"label" varchar NOT NULL,
  	"currency" varchar NOT NULL,
  	"format" varchar NOT NULL,
  	"countries" varchar NOT NULL,
  	"is_default" boolean
  );
  
  CREATE TABLE "pricing" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
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
  
  CREATE TABLE "site_settings_nav" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_contact_subjects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_qualifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_expertise" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand_name" varchar NOT NULL,
  	"brand_legal_name" varchar NOT NULL,
  	"brand_founder" varchar NOT NULL,
  	"brand_founder_title" varchar NOT NULL,
  	"brand_location" varchar NOT NULL,
  	"brand_footer_description" varchar NOT NULL,
  	"contact_whatsapp_e164" varchar NOT NULL,
  	"contact_whatsapp_url" varchar NOT NULL,
  	"contact_whatsapp_default_message" varchar NOT NULL,
  	"contact_public_email" varchar NOT NULL,
  	"contact_legal_email" varchar NOT NULL,
  	"social_instagram" varchar NOT NULL,
  	"social_facebook" varchar NOT NULL,
  	"social_youtube" varchar NOT NULL,
  	"social_tiktok" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "programs_durations" ADD CONSTRAINT "programs_durations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_card_benefits" ADD CONSTRAINT "programs_card_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_full_benefits" ADD CONSTRAINT "programs_full_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_covers" ADD CONSTRAINT "programs_covers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "programs_includes" ADD CONSTRAINT "programs_includes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs_bullets" ADD CONSTRAINT "faqs_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "transformations" ADD CONSTRAINT "transformations_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "members_meal_plan_items" ADD CONSTRAINT "members_meal_plan_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."members_meal_plan"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "members_meal_plan" ADD CONSTRAINT "members_meal_plan_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "memberships" ADD CONSTRAINT "memberships_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "memberships" ADD CONSTRAINT "memberships_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "memberships" ADD CONSTRAINT "memberships_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "member_sessions" ADD CONSTRAINT "member_sessions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_programs_fk" FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_transformations_fk" FOREIGN KEY ("transformations_id") REFERENCES "public"."transformations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_instagram_posts_fk" FOREIGN KEY ("instagram_posts_id") REFERENCES "public"."instagram_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_legal_pages_fk" FOREIGN KEY ("legal_pages_id") REFERENCES "public"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_members_fk" FOREIGN KEY ("members_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_memberships_fk" FOREIGN KEY ("memberships_id") REFERENCES "public"."memberships"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_check_ins_fk" FOREIGN KEY ("check_ins_id") REFERENCES "public"."check_ins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_daily_logs_fk" FOREIGN KEY ("daily_logs_id") REFERENCES "public"."daily_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_announcements_fk" FOREIGN KEY ("announcements_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_workout_sessions_fk" FOREIGN KEY ("workout_sessions_id") REFERENCES "public"."workout_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_messages_fk" FOREIGN KEY ("contact_messages_id") REFERENCES "public"."contact_messages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subscribers_fk" FOREIGN KEY ("subscribers_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_member_sessions_fk" FOREIGN KEY ("member_sessions_id") REFERENCES "public"."member_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_login_codes_fk" FOREIGN KEY ("login_codes_id") REFERENCES "public"."login_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_banners" ADD CONSTRAINT "homepage_banners_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_banners" ADD CONSTRAINT "homepage_banners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_founder_slides" ADD CONSTRAINT "homepage_founder_slides_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_founder_slides" ADD CONSTRAINT "homepage_founder_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_faqs" ADD CONSTRAINT "homepage_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_regions_prices" ADD CONSTRAINT "pricing_regions_prices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing_regions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pricing_regions" ADD CONSTRAINT "pricing_regions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recommendations_goals_programs" ADD CONSTRAINT "recommendations_goals_programs_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "recommendations_goals_programs" ADD CONSTRAINT "recommendations_goals_programs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recommendations_goals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recommendations_goals" ADD CONSTRAINT "recommendations_goals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."recommendations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_nav" ADD CONSTRAINT "site_settings_nav_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_links" ADD CONSTRAINT "site_settings_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_contact_subjects" ADD CONSTRAINT "site_settings_contact_subjects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_qualifications" ADD CONSTRAINT "site_settings_qualifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_expertise" ADD CONSTRAINT "site_settings_expertise_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "programs_durations_order_idx" ON "programs_durations" USING btree ("_order");
  CREATE INDEX "programs_durations_parent_id_idx" ON "programs_durations" USING btree ("_parent_id");
  CREATE INDEX "programs_card_benefits_order_idx" ON "programs_card_benefits" USING btree ("_order");
  CREATE INDEX "programs_card_benefits_parent_id_idx" ON "programs_card_benefits" USING btree ("_parent_id");
  CREATE INDEX "programs_full_benefits_order_idx" ON "programs_full_benefits" USING btree ("_order");
  CREATE INDEX "programs_full_benefits_parent_id_idx" ON "programs_full_benefits" USING btree ("_parent_id");
  CREATE INDEX "programs_covers_order_idx" ON "programs_covers" USING btree ("_order");
  CREATE INDEX "programs_covers_parent_id_idx" ON "programs_covers" USING btree ("_parent_id");
  CREATE INDEX "programs_includes_order_idx" ON "programs_includes" USING btree ("_order");
  CREATE INDEX "programs_includes_parent_id_idx" ON "programs_includes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "programs_slug_idx" ON "programs" USING btree ("slug");
  CREATE INDEX "programs_updated_at_idx" ON "programs" USING btree ("updated_at");
  CREATE INDEX "programs_created_at_idx" ON "programs" USING btree ("created_at");
  CREATE INDEX "faqs_bullets_order_idx" ON "faqs_bullets" USING btree ("_order");
  CREATE INDEX "faqs_bullets_parent_id_idx" ON "faqs_bullets" USING btree ("_parent_id");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE INDEX "transformations_image_idx" ON "transformations" USING btree ("image_id");
  CREATE INDEX "transformations_updated_at_idx" ON "transformations" USING btree ("updated_at");
  CREATE INDEX "transformations_created_at_idx" ON "transformations" USING btree ("created_at");
  CREATE INDEX "instagram_posts_updated_at_idx" ON "instagram_posts" USING btree ("updated_at");
  CREATE INDEX "instagram_posts_created_at_idx" ON "instagram_posts" USING btree ("created_at");
  CREATE UNIQUE INDEX "legal_pages_slug_idx" ON "legal_pages" USING btree ("slug");
  CREATE INDEX "legal_pages_updated_at_idx" ON "legal_pages" USING btree ("updated_at");
  CREATE INDEX "legal_pages_created_at_idx" ON "legal_pages" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "members_meal_plan_items_order_idx" ON "members_meal_plan_items" USING btree ("_order");
  CREATE INDEX "members_meal_plan_items_parent_id_idx" ON "members_meal_plan_items" USING btree ("_parent_id");
  CREATE INDEX "members_meal_plan_order_idx" ON "members_meal_plan" USING btree ("_order");
  CREATE INDEX "members_meal_plan_parent_id_idx" ON "members_meal_plan" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "members_email_idx" ON "members" USING btree ("email");
  CREATE INDEX "members_updated_at_idx" ON "members" USING btree ("updated_at");
  CREATE INDEX "members_created_at_idx" ON "members" USING btree ("created_at");
  CREATE INDEX "memberships_member_idx" ON "memberships" USING btree ("member_id");
  CREATE INDEX "memberships_program_idx" ON "memberships" USING btree ("program_id");
  CREATE INDEX "memberships_order_idx" ON "memberships" USING btree ("order_id");
  CREATE INDEX "memberships_updated_at_idx" ON "memberships" USING btree ("updated_at");
  CREATE INDEX "memberships_created_at_idx" ON "memberships" USING btree ("created_at");
  CREATE INDEX "check_ins_member_idx" ON "check_ins" USING btree ("member_id");
  CREATE INDEX "check_ins_updated_at_idx" ON "check_ins" USING btree ("updated_at");
  CREATE INDEX "check_ins_created_at_idx" ON "check_ins" USING btree ("created_at");
  CREATE INDEX "daily_logs_member_idx" ON "daily_logs" USING btree ("member_id");
  CREATE INDEX "daily_logs_date_idx" ON "daily_logs" USING btree ("date");
  CREATE INDEX "daily_logs_updated_at_idx" ON "daily_logs" USING btree ("updated_at");
  CREATE INDEX "daily_logs_created_at_idx" ON "daily_logs" USING btree ("created_at");
  CREATE INDEX "announcements_updated_at_idx" ON "announcements" USING btree ("updated_at");
  CREATE INDEX "announcements_created_at_idx" ON "announcements" USING btree ("created_at");
  CREATE INDEX "workout_sessions_updated_at_idx" ON "workout_sessions" USING btree ("updated_at");
  CREATE INDEX "workout_sessions_created_at_idx" ON "workout_sessions" USING btree ("created_at");
  CREATE INDEX "orders_member_idx" ON "orders" USING btree ("member_id");
  CREATE INDEX "orders_program_idx" ON "orders" USING btree ("program_id");
  CREATE UNIQUE INDEX "orders_stripe_session_id_idx" ON "orders" USING btree ("stripe_session_id");
  CREATE INDEX "orders_stripe_payment_intent_id_idx" ON "orders" USING btree ("stripe_payment_intent_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "contact_messages_updated_at_idx" ON "contact_messages" USING btree ("updated_at");
  CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages" USING btree ("created_at");
  CREATE UNIQUE INDEX "subscribers_email_idx" ON "subscribers" USING btree ("email");
  CREATE INDEX "subscribers_updated_at_idx" ON "subscribers" USING btree ("updated_at");
  CREATE INDEX "subscribers_created_at_idx" ON "subscribers" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "member_sessions_member_idx" ON "member_sessions" USING btree ("member_id");
  CREATE UNIQUE INDEX "member_sessions_token_hash_idx" ON "member_sessions" USING btree ("token_hash");
  CREATE INDEX "member_sessions_updated_at_idx" ON "member_sessions" USING btree ("updated_at");
  CREATE INDEX "member_sessions_created_at_idx" ON "member_sessions" USING btree ("created_at");
  CREATE INDEX "login_codes_email_idx" ON "login_codes" USING btree ("email");
  CREATE INDEX "login_codes_ip_idx" ON "login_codes" USING btree ("ip");
  CREATE INDEX "login_codes_updated_at_idx" ON "login_codes" USING btree ("updated_at");
  CREATE INDEX "login_codes_created_at_idx" ON "login_codes" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_programs_id_idx" ON "payload_locked_documents_rels" USING btree ("programs_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_transformations_id_idx" ON "payload_locked_documents_rels" USING btree ("transformations_id");
  CREATE INDEX "payload_locked_documents_rels_instagram_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("instagram_posts_id");
  CREATE INDEX "payload_locked_documents_rels_legal_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("legal_pages_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_members_id_idx" ON "payload_locked_documents_rels" USING btree ("members_id");
  CREATE INDEX "payload_locked_documents_rels_memberships_id_idx" ON "payload_locked_documents_rels" USING btree ("memberships_id");
  CREATE INDEX "payload_locked_documents_rels_check_ins_id_idx" ON "payload_locked_documents_rels" USING btree ("check_ins_id");
  CREATE INDEX "payload_locked_documents_rels_daily_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("daily_logs_id");
  CREATE INDEX "payload_locked_documents_rels_announcements_id_idx" ON "payload_locked_documents_rels" USING btree ("announcements_id");
  CREATE INDEX "payload_locked_documents_rels_workout_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("workout_sessions_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_contact_messages_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_messages_id");
  CREATE INDEX "payload_locked_documents_rels_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("subscribers_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_member_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("member_sessions_id");
  CREATE INDEX "payload_locked_documents_rels_login_codes_id_idx" ON "payload_locked_documents_rels" USING btree ("login_codes_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "homepage_banners_order_idx" ON "homepage_banners" USING btree ("_order");
  CREATE INDEX "homepage_banners_parent_id_idx" ON "homepage_banners" USING btree ("_parent_id");
  CREATE INDEX "homepage_banners_photo_idx" ON "homepage_banners" USING btree ("photo_id");
  CREATE INDEX "homepage_founder_slides_order_idx" ON "homepage_founder_slides" USING btree ("_order");
  CREATE INDEX "homepage_founder_slides_parent_id_idx" ON "homepage_founder_slides" USING btree ("_parent_id");
  CREATE INDEX "homepage_founder_slides_photo_idx" ON "homepage_founder_slides" USING btree ("photo_id");
  CREATE INDEX "homepage_faqs_order_idx" ON "homepage_faqs" USING btree ("_order");
  CREATE INDEX "homepage_faqs_parent_id_idx" ON "homepage_faqs" USING btree ("_parent_id");
  CREATE INDEX "pricing_regions_prices_order_idx" ON "pricing_regions_prices" USING btree ("_order");
  CREATE INDEX "pricing_regions_prices_parent_id_idx" ON "pricing_regions_prices" USING btree ("_parent_id");
  CREATE INDEX "pricing_regions_order_idx" ON "pricing_regions" USING btree ("_order");
  CREATE INDEX "pricing_regions_parent_id_idx" ON "pricing_regions" USING btree ("_parent_id");
  CREATE INDEX "recommendations_goals_programs_order_idx" ON "recommendations_goals_programs" USING btree ("_order");
  CREATE INDEX "recommendations_goals_programs_parent_id_idx" ON "recommendations_goals_programs" USING btree ("_parent_id");
  CREATE INDEX "recommendations_goals_programs_program_idx" ON "recommendations_goals_programs" USING btree ("program_id");
  CREATE INDEX "recommendations_goals_order_idx" ON "recommendations_goals" USING btree ("_order");
  CREATE INDEX "recommendations_goals_parent_id_idx" ON "recommendations_goals" USING btree ("_parent_id");
  CREATE INDEX "site_settings_nav_order_idx" ON "site_settings_nav" USING btree ("_order");
  CREATE INDEX "site_settings_nav_parent_id_idx" ON "site_settings_nav" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_links_order_idx" ON "site_settings_footer_links" USING btree ("_order");
  CREATE INDEX "site_settings_footer_links_parent_id_idx" ON "site_settings_footer_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_contact_subjects_order_idx" ON "site_settings_contact_subjects" USING btree ("_order");
  CREATE INDEX "site_settings_contact_subjects_parent_id_idx" ON "site_settings_contact_subjects" USING btree ("_parent_id");
  CREATE INDEX "site_settings_qualifications_order_idx" ON "site_settings_qualifications" USING btree ("_order");
  CREATE INDEX "site_settings_qualifications_parent_id_idx" ON "site_settings_qualifications" USING btree ("_parent_id");
  CREATE INDEX "site_settings_expertise_order_idx" ON "site_settings_expertise" USING btree ("_order");
  CREATE INDEX "site_settings_expertise_parent_id_idx" ON "site_settings_expertise" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "programs_durations" CASCADE;
  DROP TABLE "programs_card_benefits" CASCADE;
  DROP TABLE "programs_full_benefits" CASCADE;
  DROP TABLE "programs_covers" CASCADE;
  DROP TABLE "programs_includes" CASCADE;
  DROP TABLE "programs" CASCADE;
  DROP TABLE "faqs_bullets" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "transformations" CASCADE;
  DROP TABLE "instagram_posts" CASCADE;
  DROP TABLE "legal_pages" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "members_meal_plan_items" CASCADE;
  DROP TABLE "members_meal_plan" CASCADE;
  DROP TABLE "members" CASCADE;
  DROP TABLE "memberships" CASCADE;
  DROP TABLE "check_ins" CASCADE;
  DROP TABLE "daily_logs" CASCADE;
  DROP TABLE "announcements" CASCADE;
  DROP TABLE "workout_sessions" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "contact_messages" CASCADE;
  DROP TABLE "subscribers" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "member_sessions" CASCADE;
  DROP TABLE "login_codes" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "homepage_banners" CASCADE;
  DROP TABLE "homepage_founder_slides" CASCADE;
  DROP TABLE "homepage_faqs" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "pricing_regions_prices" CASCADE;
  DROP TABLE "pricing_regions" CASCADE;
  DROP TABLE "pricing" CASCADE;
  DROP TABLE "recommendations_goals_programs" CASCADE;
  DROP TABLE "recommendations_goals" CASCADE;
  DROP TABLE "recommendations" CASCADE;
  DROP TABLE "site_settings_nav" CASCADE;
  DROP TABLE "site_settings_footer_links" CASCADE;
  DROP TABLE "site_settings_contact_subjects" CASCADE;
  DROP TABLE "site_settings_qualifications" CASCADE;
  DROP TABLE "site_settings_expertise" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_faqs_category";
  DROP TYPE "public"."enum_instagram_posts_type";
  DROP TYPE "public"."enum_memberships_status";
  DROP TYPE "public"."enum_check_ins_mood";
  DROP TYPE "public"."enum_orders_region";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_payment_method";
  DROP TYPE "public"."enum_pricing_regions_code";`)
}
