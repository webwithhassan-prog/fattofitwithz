import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_programs_own_prices_region" AS ENUM('usa', 'canada', 'uae', 'saudi', 'qatar', 'india', 'pakistan', 'australia');
  CREATE TABLE "programs_own_prices" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"region" "enum_programs_own_prices_region" NOT NULL,
  	"months" numeric NOT NULL,
  	"amount" numeric NOT NULL,
  	"compare_at" numeric NOT NULL
  );
  
  ALTER TABLE "programs_own_prices" ADD CONSTRAINT "programs_own_prices_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "programs_own_prices_order_idx" ON "programs_own_prices" USING btree ("_order");
  CREATE INDEX "programs_own_prices_parent_id_idx" ON "programs_own_prices" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "programs_own_prices" CASCADE;
  DROP TYPE "public"."enum_programs_own_prices_region";`)
}
