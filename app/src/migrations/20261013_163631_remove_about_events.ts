import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Removes the About page "talks & recognition" photo list (section removed 2026-10-13).
// RUN ONLY AFTER THE NEW CODE IS LIVE: the old live code still reads this table.

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "page_photos_about_events" CASCADE;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "page_photos_about_events" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"photo_id" integer NOT NULL,
  	"caption" varchar NOT NULL
  );
  
  ALTER TABLE "page_photos_about_events" ADD CONSTRAINT "page_photos_about_events_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_photos_about_events" ADD CONSTRAINT "page_photos_about_events_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_photos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "page_photos_about_events_order_idx" ON "page_photos_about_events" USING btree ("_order");
  CREATE INDEX "page_photos_about_events_parent_id_idx" ON "page_photos_about_events" USING btree ("_parent_id");
  CREATE INDEX "page_photos_about_events_photo_idx" ON "page_photos_about_events" USING btree ("photo_id");`)
}
