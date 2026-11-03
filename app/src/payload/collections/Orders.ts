/**
 * One row per order: a program, the e-book, or a program + the e-book.
 *
 * How orders are made:
 *   - Checkout on the website (card payments off): saved as "Waiting for payment" with an order number
 *     (e.g. FTF-7K2Q9M). She pays by bank / JazzCash / Easypaisa (Pakistan) or arranges it on WhatsApp.
 *   - Stripe (when card payments are on): saved as "Paid" by the Stripe webhook (src/lib/orders.server.ts).
 *   - By hand here, for any other payment.
 *
 * When an order becomes PAID (saved as Paid, or changed to Paid), the hook below starts her program
 * (a membership) and emails her. Refunded or cancelled -> her membership from this order is cancelled.
 * The work itself is in src/lib/orders.server.ts (activatePaidOrder / cancelOrderMemberships).
 */
import crypto from "crypto";
import type { CollectionConfig } from "payload";
import { REGION_OPTIONS } from "../globals/Pricing";
import { normalizeEmail } from "../fields/normalizeEmail";

/** Order numbers like FTF-7K2Q9M: short to type in a bank reference, no 0/O or 1/I mix-ups. */
const REFERENCE_LETTERS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const newReference = () => `FTF-${Array.from(crypto.randomBytes(6), (b) => REFERENCE_LETTERS[b % REFERENCE_LETTERS.length]).join("")}`;

export const Orders: CollectionConfig = {
  slug: "orders",
  labels: { singular: "Order", plural: "Orders & payments" },
  defaultSort: "-createdAt",
  admin: {
    useAsTitle: "orderLabel",
    defaultColumns: ["reference", "orderLabel", "buyerName", "amount", "currency", "status", "createdAt"],
    group: "Clients",
    pagination: { defaultLimit: 50 },
    listSearchableFields: ["reference", "email", "buyerName", "phone"],
    description: 'Payment arrived? Open the order, set Status to "Paid" and save: her program starts and she gets a welcome email.',
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "reference", type: "text", label: "Order number", unique: true, index: true, admin: { readOnly: true, description: "She writes this in the payment reference." } },
        { name: "orderLabel", type: "text", label: "Order", admin: { readOnly: true, description: 'Filled in automatically, e.g. "Fat Loss Program - 2 months + e-book"' } },
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
            { label: "Waiting for payment", value: "pending" },
            { label: "Paid", value: "paid" },
            { label: "Refunded", value: "refunded" },
            { label: "Cancelled (not paid)", value: "cancelled" },
          ],
          admin: { description: "Paid: her program starts and she gets a welcome email. Refunded / Cancelled: the program from this order stops." },
        },
        {
          name: "paymentMethod",
          type: "select",
          required: true,
          defaultValue: "bank-transfer",
          label: "Paid with",
          options: [
            { label: "Bank transfer", value: "bank-transfer" },
            { label: "JazzCash / Easypaisa", value: "jazzcash-easypaisa" },
            { label: "Arranged on WhatsApp", value: "whatsapp" },
            { label: "Card (Stripe)", value: "stripe" },
            { label: "Other", value: "other" },
          ],
        },
        { name: "paidAt", type: "date", label: "Paid on", admin: { readOnly: true, date: { pickerAppearance: "dayAndTime" } } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "buyerName", type: "text", label: "Name" },
        { name: "email", type: "email", required: true, hooks: { beforeValidate: [normalizeEmail] }, admin: { description: "Buyer's email" } },
        { name: "phone", type: "text", label: "WhatsApp number" },
      ],
    },
    { name: "member", type: "relationship", relationTo: "members", admin: { description: "Her account. Empty for e-book buyers without an account." } },
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
        { name: "amount", type: "number", required: true, min: 0, admin: { description: "Total, e.g. 7000" } },
        { name: "currency", type: "text", required: true, admin: { description: "e.g. PKR" } },
        { name: "region", type: "select", options: REGION_OPTIONS },
        { name: "country", type: "text", admin: { description: "Two letters, e.g. PK" } },
      ],
    },
    { name: "notes", type: "textarea", admin: { rows: 2, description: "Your notes, e.g. the bank transaction ID." } },
    // Secret part of the link to her order page (/checkout/pay/FTF-...?key=...): never shown in admin
    { name: "accessKey", type: "text", admin: { hidden: true } },
    {
      name: "stripeSessionId",
      type: "text",
      unique: true,
      index: true,
      admin: { readOnly: true, description: "Stripe Checkout session (cs_...). Search for it in the Stripe dashboard.", condition: (data) => Boolean(data?.stripeSessionId) },
    },
    { name: "stripePaymentIntentId", type: "text", index: true, admin: { readOnly: true, condition: (data) => Boolean(data?.stripePaymentIntentId) } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        // New order: order number + the secret for her order page
        if (operation === "create") {
          data.reference ??= newReference();
          data.accessKey ??= crypto.randomBytes(18).toString("base64url");
        }
        // Remember when it was paid
        const becamePaid = data.status === "paid" && originalDoc?.status !== "paid";
        if (becamePaid && !data.paidAt) data.paidAt = new Date().toISOString();

        // A readable label so the list of orders makes sense at a glance
        const parts: string[] = [];
        const programRef = data.program ?? originalDoc?.program;
        const months = data.months ?? originalDoc?.months;
        if (programRef && months) {
          const programId = typeof programRef === "object" ? programRef.id : programRef;
          const program = await req.payload.findByID({ collection: "programs", id: programId, depth: 0, req });
          parts.push(`${program.name} - ${months} month${months > 1 ? "s" : ""}`);
        }
        if (data.ebook ?? originalDoc?.ebook) parts.push(parts.length ? "e-book" : "E-book");
        if (parts.length) data.orderLabel = parts.join(" + ");
        return data;
      },
    ],
    afterChange: [
      // Paid -> start her program + welcome email.  Refunded / cancelled -> stop the program from this order.
      async ({ doc, previousDoc, operation, req }) => {
        const before = operation === "create" ? null : previousDoc?.status;
        if (doc.status === before) return doc;
        // Loaded only when needed: it uses server-only code (email), which can't load in CLI scripts.
        const orders = await import("../../lib/orders.server");
        if (doc.status === "paid") await orders.activatePaidOrder(doc, req);
        if (before === "paid" && (doc.status === "refunded" || doc.status === "cancelled")) await orders.cancelOrderMemberships(doc, req);
        return doc;
      },
    ],
  },
};
