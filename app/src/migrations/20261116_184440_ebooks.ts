import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "orders_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"ebooks_id" integer
  );
  
  CREATE TABLE "ebooks_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "ebooks_chapters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"note" varchar,
  	"highlights" varchar
  );
  
  CREATE TABLE "ebooks_guides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "ebooks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 1,
  	"enabled" boolean DEFAULT true,
  	"description" varchar NOT NULL,
  	"cover_id" integer,
  	"drive_link" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ebooks_id" integer;
  ALTER TABLE "orders_rels" ADD CONSTRAINT "orders_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_rels" ADD CONSTRAINT "orders_rels_ebooks_fk" FOREIGN KEY ("ebooks_id") REFERENCES "public"."ebooks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ebooks_points" ADD CONSTRAINT "ebooks_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ebooks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ebooks_chapters" ADD CONSTRAINT "ebooks_chapters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ebooks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ebooks_guides" ADD CONSTRAINT "ebooks_guides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ebooks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ebooks" ADD CONSTRAINT "ebooks_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "orders_rels_order_idx" ON "orders_rels" USING btree ("order");
  CREATE INDEX "orders_rels_parent_idx" ON "orders_rels" USING btree ("parent_id");
  CREATE INDEX "orders_rels_path_idx" ON "orders_rels" USING btree ("path");
  CREATE INDEX "orders_rels_ebooks_id_idx" ON "orders_rels" USING btree ("ebooks_id");
  CREATE INDEX "ebooks_points_order_idx" ON "ebooks_points" USING btree ("_order");
  CREATE INDEX "ebooks_points_parent_id_idx" ON "ebooks_points" USING btree ("_parent_id");
  CREATE INDEX "ebooks_chapters_order_idx" ON "ebooks_chapters" USING btree ("_order");
  CREATE INDEX "ebooks_chapters_parent_id_idx" ON "ebooks_chapters" USING btree ("_parent_id");
  CREATE INDEX "ebooks_guides_order_idx" ON "ebooks_guides" USING btree ("_order");
  CREATE INDEX "ebooks_guides_parent_id_idx" ON "ebooks_guides" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "ebooks_slug_idx" ON "ebooks" USING btree ("slug");
  CREATE INDEX "ebooks_cover_idx" ON "ebooks" USING btree ("cover_id");
  CREATE INDEX "ebooks_updated_at_idx" ON "ebooks" USING btree ("updated_at");
  CREATE INDEX "ebooks_created_at_idx" ON "ebooks" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ebooks_fk" FOREIGN KEY ("ebooks_id") REFERENCES "public"."ebooks"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_ebooks_id_idx" ON "payload_locked_documents_rels" USING btree ("ebooks_id");`)

  // The old single e-book (admin > E-book) becomes the first row of E-books, and the orders that
  // included "the e-book" are linked to it. (The old "ebook" table is left in place: the live site
  // uses it until the new code is deployed. It can be dropped later.)
  await db.execute(sql`
  INSERT INTO "ebooks" ("title", "slug", "order", "enabled", "description", "cover_id", "drive_link")
    SELECT "title", 'desi-weightloss-recipes', 1, COALESCE("enabled", true), "description", "cover_id", "drive_link" FROM "ebook" LIMIT 1
    ON CONFLICT DO NOTHING;
  INSERT INTO "orders_rels" ("order", "parent_id", "path", "ebooks_id")
    SELECT 1, o."id", 'ebooks', e."id" FROM "orders" o, "ebooks" e WHERE o."ebook" = true AND e."slug" = 'desi-weightloss-recipes';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
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
  
  ALTER TABLE "orders_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ebooks_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ebooks_chapters" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ebooks_guides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ebooks" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "orders_rels" CASCADE;
  DROP TABLE "ebooks_points" CASCADE;
  DROP TABLE "ebooks_chapters" CASCADE;
  DROP TABLE "ebooks_guides" CASCADE;
  DROP TABLE "ebooks" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_ebooks_fk";
  
  DROP INDEX "payload_locked_documents_rels_ebooks_id_idx";
  ALTER TABLE "ebook" ADD CONSTRAINT "ebook_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "ebook_cover_idx" ON "ebook" USING btree ("cover_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ebooks_id";`)
}
