/**
 * All client results in one list, shown on the Testimonials page:
 *   - "Before / after photo"  with the weights (ticked ones also appear on the homepage)
 *   - "Instagram post"        a link to a transformation, video testimonial or review on Instagram
 * Only publish a client's photos with her written permission.
 */
import type { CollectionConfig } from "payload";
import { contentHooks } from "../hooks/revalidateSite";

const isPhoto = (data: Partial<{ type: string }>) => data?.type !== "instagram";
const isInstagram = (data: Partial<{ type: string }>) => data?.type === "instagram";

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  labels: { singular: "Testimonial", plural: "Testimonials" },
  defaultSort: "order",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["image", "title", "type", "consentOnFile", "order"],
    pagination: { defaultLimit: 50 },
    group: false, // hidden from the menu (2026-10-13): the page still works at its address
    description: "Before/after photos and Instagram posts for the Testimonials page. Lower order numbers show first.",
  },
  hooks: {
    ...contentHooks,
    beforeChange: [
      // A readable title for the list, e.g. "Before/after: 62 → 54 kg" or "Instagram video".
      ({ data }) => {
        if (data.type === "instagram") {
          const kind = { transformation: "transformation", video: "video testimonial", review: "review" }[data.instagramKind as string] ?? "post";
          data.title = `Instagram ${kind}`;
        } else {
          data.title = data.startKg && data.endKg ? `Before/after: ${data.startKg} → ${data.endKg} kg` : "Before/after photo";
        }
        return data;
      },
    ],
  },
  fields: [
    { name: "title", type: "text", admin: { hidden: true } },
    {
      type: "row",
      fields: [
        {
          name: "type",
          type: "radio",
          required: true,
          defaultValue: "photo",
          options: [
            { label: "Before / after photo", value: "photo" },
            { label: "Instagram post", value: "instagram" },
          ],
        },
        { name: "order", type: "number", required: true, defaultValue: 10, admin: { width: "160px" } },
      ],
    },

    // ---- before / after photo ----
    { name: "image", type: "upload", relationTo: "media", label: "Photo", admin: { condition: isPhoto } },
    {
      type: "row",
      admin: { condition: isPhoto },
      fields: [
        { name: "startKg", type: "number", label: "Start weight (kg)" },
        { name: "endKg", type: "number", label: "End weight (kg)" },
        { name: "rating", type: "number", label: "Stars (1–5)", min: 1, max: 5, defaultValue: 5 },
      ],
    },
    {
      type: "row",
      admin: { condition: isPhoto },
      fields: [
        { name: "showOnHome", type: "checkbox", label: "Also show on the homepage", defaultValue: false },
        { name: "consentOnFile", type: "checkbox", label: "Client gave written permission", defaultValue: false },
      ],
    },

    // ---- Instagram post ----
    {
      type: "row",
      admin: { condition: isInstagram },
      fields: [
        { name: "instagramUrl", type: "text", label: "Instagram link", admin: { placeholder: "https://www.instagram.com/p/..." } },
        {
          name: "instagramKind",
          type: "select",
          label: "Kind of post",
          defaultValue: "transformation",
          options: [
            { label: "Transformation", value: "transformation" },
            { label: "Video testimonial", value: "video" },
            { label: "Review", value: "review" },
          ],
        },
      ],
    },
    { name: "onLiveSite", type: "checkbox", label: "Was on the old Shopify site", defaultValue: false, admin: { hidden: true } },
  ],
};
