/** The six coaching programs. Prices are NOT here: they depend on duration and country (see the Pricing global). */
import type { CollectionConfig } from "payload";
import { contentHooks } from "../hooks/revalidateSite";
import { textList } from "../fields/textList";
import { rowLabel } from "../fields/rowLabel";

export const Programs: CollectionConfig = {
  slug: "programs",
  labels: { singular: "Program", plural: "Programs" },
  defaultSort: "order",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "tag", "order"],
    group: false, // hidden from the menu (2026-10-13): the page still works at its address
    description: "The six programs. Prices are under Prices (they depend on months and country, not on the program).",
  },
  hooks: contentHooks,
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Basics",
          fields: [
            {
              type: "row",
              fields: [
                { name: "name", type: "text", required: true },
                {
                  name: "slug",
                  type: "text",
                  required: true,
                  unique: true,
                  index: true,
                  admin: { description: "Web address: /programs/<slug>. Changing it breaks links people have shared." },
                },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "tag", type: "text", admin: { description: 'Small label on the card, e.g. "Most popular".' } },
                { name: "order", type: "number", required: true, defaultValue: 1, admin: { description: "1 is shown first." } },
              ],
            },
            { name: "focus", type: "text", required: true, admin: { description: 'Shown as "Best for" in the comparison table.' } },
            { name: "summary", type: "textarea", required: true },
            {
              name: "durations",
              type: "array",
              required: true,
              minRows: 1,
              labels: { singular: "Duration", plural: "Durations" },
              admin: {
                description: "Each duration needs a price for every country under Prices.",
                components: { RowLabel: rowLabel("{months}-month option", "Duration") },
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "months", type: "number", required: true, min: 1, max: 12 },
                    { name: "isMinimum", type: "checkbox", label: 'Minimum commitment (shown as "6 Months (Minimum)")', defaultValue: false },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Benefits",
          fields: [
            { name: "benefitsLabel", type: "text", defaultValue: "Main Benefits" },
            textList("cardBenefits", "Benefits on the card", "Short lines shown on the program card (about 6)."),
            textList("fullBenefits", "Benefits on the program page", "Longer versions shown on the program's own page."),
            textList("covers", "What it covers", "Optional, e.g. the health conditions a program supports."),
            textList("includes", "Also included", "Optional extras, e.g. the recipe e-book."),
          ],
        },
        {
          label: "Details",
          fields: [
            { name: "whoIsItFor", type: "textarea", required: true, label: "Who is it for?" },
            { name: "howItWorks", type: "textarea", required: true, label: "How does it work?" },
            {
              name: "legacyShopifyHandle",
              type: "text",
              admin: { readOnly: true, description: "Old Shopify address, kept for redirects. Leave as is." },
            },
          ],
        },
      ],
    },
  ],
};
