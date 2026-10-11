/**
 * One row per payment: a program, the e-book, or a program + the e-book.
 * Created by the Stripe webhook (src/lib/orders.server.ts). The Stripe session id is unique,
 * so if Stripe sends the same event twice we never create a second order.
 * Payments made another way (e.g. bank transfer) can be added here by hand.
 */
import type { CollectionConfig } from "payload";
import { REGION_OPTIONS } from "../globals/Pricing";
import { normalizeEmail } from "../fields/normalizeEmail";

export const Orders: CollectionConfig = {
  slug: "orders",
  labels: { singular: "Order", plural: "Orders" },
  defaultSort: "-createdAt",
  admin: {
    useAsTitle: "orderLabel",
    defaultColumns: ["orderLabel", "email", "amount", "currency", "status", "createdAt"],
    group: "Clients",
    pagination: { defaultLimit: 50 },
  },
  fields: [
    {
      name: "orderLabel",
      type: "text",
      admin: { readOnly: true, description: 'Filled in automatically, e.g. "Fat Loss Program - 2 months + e-book"' },
    },
    {
      type: "row",
      fields: [
        { name: "email", type: "email", required: true, hooks: { beforeValidate: [normalizeEmail] }, admin: { description: "Buyer's email" } },
        { name: "member", type: "relationship", relationTo: "members", admin: { description: "Empty for e-book buyers without an account" } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "program", type: "relationship", relationTo: "programs", admin: { description: "Empty for an e-book only order" } },
        { name: "months", type: "number", min: 1, max: 12 },
        { name: "ebook", type: "checkbox", label: "Includes the e-book", defaultValue: false },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "amount", type: "number", required: true, min: 0, admin: { description: "Total paid, e.g. 7000" } },
        { name: "currency", type: "text", required: true, admin: { description: "e.g. PKR" } },
        { name: "region", type: "select", options: REGION_OPTIONS },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "paid",
          options: [
            { label: "Paid", value: "paid" },
            { label: "Refunded", value: "refunded" },
          ],
        },
        {
          name: "paymentMethod",
          type: "select",
          required: true,
          defaultValue: "stripe",
          options: [
            { label: "Card (Stripe)", value: "stripe" },
            { label: "Bank transfer", value: "bank-transfer" },
            { label: "Other", value: "other" },
          ],
        },
      ],
    },
    {
      name: "stripeSessionId",
      type: "text",
      unique: true,
      index: true,
      admin: { readOnly: true, description: "Stripe Checkout session (cs_...). Search for it in the Stripe dashboard." },
    },
    { name: "stripePaymentIntentId", type: "text", index: true, admin: { readOnly: true } },
  ],
  hooks: {
    beforeChange: [
      // A readable label so the list of orders makes sense at a glance.
      async ({ data, req }) => {
        const parts: string[] = [];
        if (data.program && data.months) {
          const programId = typeof data.program === "object" ? data.program.id : data.program;
          const program = await req.payload.findByID({ collection: "programs", id: programId, depth: 0, req });
          parts.push(`${program.name} - ${data.months} month${data.months > 1 ? "s" : ""}`);
        }
        if (data.ebook) parts.push(parts.length ? "e-book" : "E-book");
        if (parts.length) data.orderLabel = parts.join(" + ");
        return data;
      },
    ],
  },
};
