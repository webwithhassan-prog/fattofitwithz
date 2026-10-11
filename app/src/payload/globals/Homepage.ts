/**
 * Homepage sections, one tab each: hero banners, founder messages (12 photos) and the goal picker.
 * (The homepage FAQ questions are in FAQs, with "Show on: Homepage".)
 */
import type { GlobalConfig } from "payload";
import { revalidateGlobalAfterChange } from "../hooks/revalidateSite";
import { rowLabel } from "../fields/rowLabel";

const button = (name: string, label: string) => ({
  name,
  label,
  type: "group" as const,
  fields: [
    {
      type: "row" as const,
      fields: [
        { name: "label", type: "text" as const, required: true, label: "Button text" },
        {
          name: "href",
          type: "text" as const,
          required: true,
          label: "Goes to",
          admin: { description: 'A page such as /programs, or "whatsapp" to open the WhatsApp chat.' },
        },
      ],
    },
  ],
});

export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: "Homepage",
  admin: { group: "Website", description: "The big banners at the top, Zaineb's messages, and the goal picker." },
  hooks: { afterChange: [revalidateGlobalAfterChange] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Hero banners",
          description: "The slides at the very top. All banners share one design; only the photo and text change.",
          fields: [
            {
              name: "autoplaySeconds",
              type: "number",
              label: "Seconds per banner",
              required: true,
              defaultValue: 7,
              min: 3,
              max: 30,
              admin: { width: "200px" },
            },
            {
              name: "banners",
              type: "array",
              required: true,
              minRows: 1,
              labels: { singular: "Banner", plural: "Banners" },
              admin: { initCollapsed: true, components: { RowLabel: rowLabel("{title} {titleScript}", "Banner") } },
              fields: [
                { name: "photo", type: "upload", relationTo: "media", required: true },
                { name: "kicker", type: "text", required: true, label: "Small line above the title" },
                {
                  type: "row",
                  fields: [
                    { name: "title", type: "text", required: true, label: "Title" },
                    { name: "titleScript", type: "text", required: true, label: "Title, handwritten part" },
                  ],
                },
                { name: "sub", type: "textarea", required: true, label: "Text under the title", admin: { rows: 2 } },
                button("primary", "Main button"),
                button("secondary", "Second button"),
                {
                  name: "badge",
                  type: "group",
                  label: "Badge on the photo",
                  fields: [
                    {
                      type: "row",
                      fields: [
                        { name: "big", type: "text", required: true, label: "Big text", admin: { placeholder: "5+ years" } },
                        { name: "small", type: "text", required: true, label: "Small text", admin: { placeholder: "coaching women in 8 countries" } },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Founder messages",
          name: "founder",
          description: "The photo slider with Zaineb's messages.",
          fields: [
            {
              type: "row",
              fields: [
                { name: "author", type: "text", required: true, label: "Name" },
                { name: "authorTitle", type: "text", required: true, label: "Title under the name" },
              ],
            },
            {
              name: "slides",
              type: "array",
              required: true,
              labels: { singular: "Slide", plural: "Slides" },
              admin: { initCollapsed: true, components: { RowLabel: rowLabel("{caption}", "Slide") } },
              fields: [
                { name: "photo", type: "upload", relationTo: "media", required: true },
                {
                  type: "row",
                  fields: [
                    { name: "caption", type: "text", required: true, label: "Photo caption" },
                    { name: "source", type: "text", label: "Quote from", admin: { placeholder: "Recipe e-book" } },
                  ],
                },
                { name: "message", type: "textarea", required: true, admin: { rows: 3 } },
              ],
            },
          ],
        },
        {
          label: "Goal picker",
          description: '"What\'s your main goal?": which programs to suggest for each goal, best match first.',
          fields: [
            {
              name: "goals",
              type: "array",
              required: true,
              labels: { singular: "Goal", plural: "Goals" },
              admin: { initCollapsed: true, components: { RowLabel: rowLabel("{label}", "Goal") } },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "label", type: "text", required: true, label: "Button text", admin: { placeholder: "Lose fat & tone up" } },
                    { name: "goalId", type: "text", required: true, label: "Short code", admin: { placeholder: "fat-loss" } },
                  ],
                },
                {
                  name: "programs",
                  type: "array",
                  required: true,
                  labels: { singular: "Suggested program", plural: "Suggested programs" },
                  admin: {
                    description: "Best match first. Give the first three a short reason.",
                    components: { RowLabel: rowLabel("{why}", "Program") },
                  },
                  fields: [
                    {
                      type: "row",
                      fields: [
                        { name: "program", type: "relationship", relationTo: "programs", required: true },
                        { name: "why", type: "text", label: "Why it fits" },
                      ],
                    },
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
