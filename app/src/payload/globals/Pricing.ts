/**
 * Prices per country, from the client's pricing sheet.
 * Price depends on the DURATION (months), not on the program.
 * "Amount" is what the client pays; "Compare at" is the crossed-out standard price.
 */
import type { GlobalConfig } from "payload";
import { revalidateGlobalAfterChange } from "../hooks/revalidateSite";
import { rowLabel } from "../fields/rowLabel";

// Region codes are fixed in code (src/lib/types.ts) because the site maps visitors' countries to them.
export const REGION_OPTIONS = [
  { label: "USA / Global", value: "usa" },
  { label: "Canada", value: "canada" },
  { label: "UAE", value: "uae" },
  { label: "Saudi Arabia", value: "saudi" },
  { label: "Qatar", value: "qatar" },
  { label: "India", value: "india" },
  { label: "Pakistan", value: "pakistan" },
  { label: "Australia", value: "australia" },
];

export const Pricing: GlobalConfig = {
  slug: "pricing",
  label: "Prices: e-books & countries",
  admin: {
    group: "Settings",
    description:
      "E-book prices and country settings. PROGRAM prices are now in each program (Website > Programs > open a program > \"Prices\" tab). The program prices below are only a backup, used when a program has no price for a country or duration.",
  },
  hooks: { afterChange: [revalidateGlobalAfterChange] },
  fields: [
    {
      name: "regions",
      type: "array",
      label: "Countries",
      required: true,
      labels: { singular: "Country", plural: "Countries" },
      admin: { initCollapsed: true, components: { RowLabel: rowLabel("{label} ({currency}): e-book {ebookPrice}, with a program {ebookPriceWithPlan}", "Country") } },
      fields: [
        // E-book prices first (the program prices below are only a backup now).
        {
          type: "row",
          fields: [
            {
              name: "ebookPrice",
              type: "number",
              required: true,
              min: 0,
              label: "E-book price",
              admin: { description: "One-time price when bought on its own (e.g. USD 8). Never monthly." },
            },
            {
              name: "ebookPriceWithPlan",
              type: "number",
              required: true,
              min: 0,
              label: "E-book price with a program",
              validate: (value: number | null | undefined, { siblingData }: { siblingData: { ebookPrice?: number | null } }) => {
                if (value === null || value === undefined) return "Please enter a price.";
                if (typeof siblingData.ebookPrice === "number" && value > siblingData.ebookPrice) return "Should not be more than the normal e-book price.";
                return true;
              },
              admin: { description: "Lower one-time price when added to a program, or for clients who already have one (e.g. USD 6)." },
            },
          ],
        },
        // Backup program prices (each program has its own prices in its "Prices" tab).
        {
          name: "prices",
          type: "array",
          required: true,
          labels: { singular: "Price", plural: "Prices" },
          admin: { components: { RowLabel: rowLabel("{months}-month price: {amount} (was {compareAt})", "Price") } },
          fields: [
            {
              type: "row",
              fields: [
                { name: "months", type: "number", required: true, min: 1, max: 12, label: "Months" },
                { name: "amount", type: "number", required: true, min: 0, label: "Price" },
                { name: "compareAt", type: "number", required: true, min: 0, label: "Was (crossed out)" },
              ],
            },
          ],
        },
        // Rarely changed: which visitors see this price list and how prices are written.
        {
          type: "collapsible",
          label: "Country settings (rarely changed)",
          admin: { initCollapsed: true },
          fields: [
            {
              type: "row",
              fields: [
                { name: "code", type: "select", required: true, options: REGION_OPTIONS, label: "Price list" },
                { name: "label", type: "text", required: true, label: "Name in the country picker" },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "currency", type: "text", required: true, label: "Currency code", admin: { description: "3 letters, e.g. PKR" } },
                {
                  name: "format",
                  type: "text",
                  required: true,
                  label: "How prices are written",
                  admin: { description: '{n} is the number, e.g. "Rs. {n}"' },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "countries",
                  type: "text",
                  required: true,
                  label: "Visitors from",
                  admin: { description: "2-letter country codes, separated by commas, e.g. AE" },
                },
                { name: "isDefault", type: "checkbox", label: "Also use for every other country", defaultValue: false },
              ],
            },
          ],
        },
      ],
    },
  ],
};
