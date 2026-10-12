/** Newsletter sign-ups from the footer. Export them (CSV) when choosing an email marketing tool. */
import type { CollectionConfig } from "payload";
import { normalizeEmail } from "../fields/normalizeEmail";

export const Subscribers: CollectionConfig = {
  slug: "subscribers",
  labels: { singular: "Newsletter subscriber", plural: "Newsletter subscribers" },
  defaultSort: "-createdAt",
  admin: { useAsTitle: "email", defaultColumns: ["email", "createdAt"], group: false }, // hidden from the menu (2026-10-13)
  fields: [{ name: "email", type: "email", required: true, unique: true, index: true, hooks: { beforeValidate: [normalizeEmail] } }],
};
