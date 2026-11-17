/**
 * The coaching programs (admin > Website > Programs).
 * Prices normally come from admin > Prices (by months and country, shared by all programs).
 * A program can have its OWN prices instead ("Own prices" tab), e.g. a special package at a lower price.
 */
import type { CollectionConfig } from "payload";
import { contentHooks } from "../hooks/revalidateSite";
import { textList } from "../fields/textList";
import { rowLabel } from "../fields/rowLabel";
import { REGION_OPTIONS } from "../globals/Pricing";

export const Programs: CollectionConfig = {
  slug: "programs",
  labels: { singular: "Program", plural: "Programs" },
  defaultSort: "order",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "tag", "order"],
    group: "Website",
    description: "The coaching programs. Prices come from admin > Prices, unless a program has its own prices (\"Own prices\" tab).",
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
                description: "Each duration needs a price for every country: under Prices, or in this program's \"Own prices\" tab.",
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
          ],
        },
        {
          label: "Own prices",
          description:
            "Only for a program with special prices (e.g. a discounted package). Leave empty to use admin > Prices. Add one row per country and duration. A country without a row gets the USA / Global price converted into its currency.",
          fields: [
            {
              name: "ownPrices",
              type: "array",
              label: "Own prices",
              labels: { singular: "Price", plural: "Prices" },
              admin: { components: { RowLabel: rowLabel("{region}: {months} months", "Price") } },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "region", type: "select", required: true, options: REGION_OPTIONS, label: "Country" },
                    { name: "months", type: "number", required: true, min: 1, max: 12, label: "Months" },
                    { name: "amount", type: "number", required: true, min: 0, label: "Price" },
                    { name: "compareAt", type: "number", required: true, min: 0, label: "Was (crossed out)" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
