/** Messages sent through the website's contact form (also emailed to the public email address). */
import type { CollectionConfig } from "payload";

export const ContactMessages: CollectionConfig = {
  slug: "contact-messages",
  labels: { singular: "Website message", plural: "Website messages" },
  defaultSort: "-createdAt",
  admin: {
    useAsTitle: "subject",
    defaultColumns: ["name", "email", "subject", "createdAt"],
    group: false, // hidden from the menu (2026-11-25, kept simple); open it from admin Overview > More
  },
  fields: [
    { type: "row", fields: [{ name: "name", type: "text", required: true }, { name: "email", type: "email", required: true }] },
    { type: "row", fields: [{ name: "phone", type: "text" }, { name: "subject", type: "text", required: true }] },
    { name: "message", type: "textarea", required: true },
  ],
};
