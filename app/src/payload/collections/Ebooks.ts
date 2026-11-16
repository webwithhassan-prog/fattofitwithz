/**
 * The e-books for sale (admin > Website > E-books). Each one has its own cover, Google Drive link
 * and "What's inside" list, shown on /ebook. Prices are the same for every e-book and set per
 * country in admin > Prices ("E-book price", and the lower price when bought with a program).
 * Read by the website through getEbooks() in src/lib/content.ts.
 */
import type { CollectionConfig } from "payload";
import { contentHooks } from "../hooks/revalidateSite";

export const Ebooks: CollectionConfig = {
  slug: "ebooks",
  labels: { singular: "E-book", plural: "E-books" },
  defaultSort: "order",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "enabled", "driveLink", "order"],
    group: "Website",
    description: "Each e-book for sale. Buyers get the Google Drive link after their payment is confirmed. Prices: admin > Prices.",
  },
  hooks: contentHooks,
  fields: [
    {
      type: "row",
      fields: [
        { name: "title", type: "text", required: true },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          index: true,
          admin: { description: 'Short name for links, e.g. "healthy-desserts". Don\'t change it after people have bought it.' },
        },
        { name: "order", type: "number", defaultValue: 1, admin: { description: "1 shows first" } },
      ],
    },
    {
      name: "enabled",
      type: "checkbox",
      label: "Sell this e-book on the website",
      defaultValue: true,
    },
    { name: "description", type: "textarea", required: true, admin: { rows: 3, description: "One or two sentences for the e-book page and the offer when joining a program." } },
    { name: "cover", type: "upload", relationTo: "media", label: "Cover image" },
    {
      name: "driveLink",
      type: "text",
      label: "Google Drive link",
      admin: { placeholder: "https://drive.google.com/...", description: 'Set sharing to "Anyone with the link can view". Buyers receive this link after paying.' },
    },
    {
      name: "points",
      type: "array",
      label: "Key points (ticks next to the cover)",
      maxRows: 6,
      fields: [{ name: "text", type: "text", required: true }],
    },
    {
      name: "chapters",
      type: "array",
      label: "What's inside (chapters)",
      fields: [
        {
          type: "row",
          fields: [
            { name: "title", type: "text", required: true },
            { name: "note", type: "text", admin: { description: 'e.g. "7 recipes, 115-165 kcal"' } },
          ],
        },
        { name: "highlights", type: "textarea", admin: { rows: 3, description: "A few recipes from this chapter, one per line" } },
      ],
    },
    {
      name: "guides",
      type: "array",
      label: "Also inside (guides)",
      fields: [{ name: "text", type: "text", required: true }],
    },
  ],
};
