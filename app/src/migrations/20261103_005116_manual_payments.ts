import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_orders_status" ADD VALUE 'pending' BEFORE 'paid';
  ALTER TYPE "public"."enum_orders_status" ADD VALUE 'cancelled';
  CREATE TABLE "payments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"card_payments" boolean DEFAULT false,
  	"bank_enabled" boolean DEFAULT true,
  	"bank_name" varchar,
  	"bank_account_title" varchar,
  	"bank_branch" varchar,
  	"bank_account_number" varchar,
  	"bank_iban" varchar,
  	"wallet_enabled" boolean DEFAULT true,
  	"wallet_number" varchar,
  	"wallet_account_name" varchar,
  	"instructions" varchar DEFAULT 'Send the exact amount and write your order number in the payment reference. Then send us a screenshot of the payment on WhatsApp. Your program starts as soon as we confirm it, usually within a few hours.',
  	"other_countries_text" varchar DEFAULT 'We''ll confirm your order and send you a secure way to pay on WhatsApp. Your program starts as soon as the payment is confirmed.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "orders" ALTER COLUMN "payment_method" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "payment_method" SET DEFAULT 'bank-transfer'::text;
  DROP TYPE "public"."enum_orders_payment_method";
  CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('bank-transfer', 'jazzcash-easypaisa', 'whatsapp', 'stripe', 'other');
  ALTER TABLE "orders" ALTER COLUMN "payment_method" SET DEFAULT 'bank-transfer'::"public"."enum_orders_payment_method";
  ALTER TABLE "orders" ALTER COLUMN "payment_method" SET DATA TYPE "public"."enum_orders_payment_method" USING "payment_method"::"public"."enum_orders_payment_method";
  ALTER TABLE "orders" ADD COLUMN "reference" varchar;
  ALTER TABLE "orders" ADD COLUMN "paid_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "buyer_name" varchar;
  ALTER TABLE "orders" ADD COLUMN "phone" varchar;
  ALTER TABLE "orders" ADD COLUMN "country" varchar;
  ALTER TABLE "orders" ADD COLUMN "notes" varchar;
  ALTER TABLE "orders" ADD COLUMN "access_key" varchar;
  CREATE UNIQUE INDEX "orders_reference_idx" ON "orders" USING btree ("reference");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payments" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payments" CASCADE;
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'paid'::text;
  DROP TYPE "public"."enum_orders_status";
  CREATE TYPE "public"."enum_orders_status" AS ENUM('paid', 'refunded');
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'paid'::"public"."enum_orders_status";
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."enum_orders_status" USING "status"::"public"."enum_orders_status";
  ALTER TABLE "orders" ALTER COLUMN "payment_method" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "payment_method" SET DEFAULT 'stripe'::text;
  DROP TYPE "public"."enum_orders_payment_method";
  CREATE TYPE "public"."enum_orders_payment_method" AS ENUM('stripe', 'bank-transfer', 'other');
  ALTER TABLE "orders" ALTER COLUMN "payment_method" SET DEFAULT 'stripe'::"public"."enum_orders_payment_method";
  ALTER TABLE "orders" ALTER COLUMN "payment_method" SET DATA TYPE "public"."enum_orders_payment_method" USING "payment_method"::"public"."enum_orders_payment_method";
  DROP INDEX "orders_reference_idx";
  ALTER TABLE "orders" DROP COLUMN "reference";
  ALTER TABLE "orders" DROP COLUMN "paid_at";
  ALTER TABLE "orders" DROP COLUMN "buyer_name";
  ALTER TABLE "orders" DROP COLUMN "phone";
  ALTER TABLE "orders" DROP COLUMN "country";
  ALTER TABLE "orders" DROP COLUMN "notes";
  ALTER TABLE "orders" DROP COLUMN "access_key";`)
}
