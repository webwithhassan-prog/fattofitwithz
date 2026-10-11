/**
 * Privacy policy, refund policy and terms. The body is Markdown:
 *   ## Heading      a section (also listed in the page's table of contents)
 *   - item          a bullet point
 *   blank line      a new paragraph
 */
import type { CollectionConfig } from "payload";
import { contentHooks } from "../hooks/revalidateSite";

export const LegalPages: CollectionConfig = {
  slug: "legal-pages",
  labels: { singular: "Legal page", plural: "Legal pages" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "effectiveDate"],
    group: "Website",
  },
  hooks: contentHooks,
  fields: [
    {
      type: "row",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "slug", type: "text", required: true, unique: true, admin: { readOnly: true } },
      ],
    },
    {
      name: "effectiveDate",
      type: "text",
      admin: { description: 'e.g. "1 November 2026". Leave empty to show "to be confirmed".' },
    },
    {
      name: "body",
      type: "textarea",
      required: true,
      admin: { rows: 30, description: "## for a section heading, - for a bullet point, blank line for a new paragraph." },
    },
  ],
};
