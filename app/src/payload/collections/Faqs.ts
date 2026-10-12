/**
 * Every question and answer on the site, in one list:
 *   - "FAQ page" questions are grouped by category on /faq
 *   - "Homepage" questions are the short list near the bottom of the homepage
 */
import type { CollectionConfig } from "payload";
import { contentHooks } from "../hooks/revalidateSite";
import { textList } from "../fields/textList";

const onFaqPage = (data: Partial<{ showOn: string }>) => data?.showOn !== "homepage";

export const Faqs: CollectionConfig = {
  slug: "faqs",
  labels: { singular: "FAQ", plural: "FAQs" },
  defaultSort: "order",
  admin: {
    useAsTitle: "question",
    defaultColumns: ["question", "showOn", "category", "order"],
    listSearchableFields: ["question", "answer"],
    group: false, // hidden from the menu (2026-10-13): the page still works at its address
    pagination: { defaultLimit: 50 },
    description: "Questions for the FAQ page and the homepage. Lower order numbers show first.",
  },
  hooks: contentHooks,
  fields: [
    { name: "question", type: "text", required: true },
    { name: "answer", type: "textarea", required: true, admin: { rows: 4 } },
    {
      type: "collapsible",
      label: "Bullet points (optional)",
      admin: { initCollapsed: true, condition: onFaqPage },
      fields: [
        textList("bullets", "Bullet points", "Shown under the answer."),
        { name: "answerAfterList", type: "textarea", label: "Text after the bullet points" },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "showOn",
          type: "select",
          label: "Show on",
          required: true,
          defaultValue: "faq-page",
          options: [
            { label: "FAQ page", value: "faq-page" },
            { label: "Homepage", value: "homepage" },
          ],
        },
        {
          name: "category",
          type: "select",
          defaultValue: "general",
          admin: { condition: onFaqPage },
          options: [
            { label: "General", value: "general" },
            { label: "Membership", value: "membership" },
            { label: "Payments & support", value: "payments-support" },
          ],
        },
        { name: "order", type: "number", required: true, defaultValue: 10 },
      ],
    },
  ],
};
