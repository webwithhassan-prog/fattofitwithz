/** Newsletter sign-ups from the footer. Export them (CSV) when choosing an email marketing tool. */
import type { CollectionConfig } from "payload";
import { normalizeEmail } from "../fields/normalizeEmail";

export const Subscribers: CollectionConfig = {
  slug: "subscribers",
  labels: { singular: "Newsletter sign-up", plural: "Newsletter sign-ups" },
  defaultSort: "-createdAt",
  admin: { useAsTitle: "email", defaultColumns: ["email", "createdAt"], group: "Settings", description: "Emails left in the newsletter box at the bottom of the website." },
  fields: [{ name: "email", type: "email", required: true, unique: true, index: true, hooks: { beforeValidate: [normalizeEmail] } }],
};
