/**
 * Photos used on the website (hero banners, founder slides, transformations...).
 * Files are stored in app/media/ while developing; production will use cloud storage (R2).
 */
import type { CollectionConfig } from "payload";
import { anyone } from "../access";
import { contentHooks } from "../hooks/revalidateSite";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Photo", plural: "Photos" },
  admin: {
    group: "Website",
    pagination: { defaultLimit: 50 },
    description: "All photos used on the website. Every photo needs a short description (alt text) for blind visitors and for Google.",
  },
  access: { read: anyone }, // photos are public; uploading and deleting still need an admin
  hooks: contentHooks,
  upload: {
    staticDir: "../media", // relative to src/ (where payload.config.ts lives), so files land in app/media
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Description (alt text)",
      admin: { description: 'Describe the photo in a few words, e.g. "Zaineb Danish speaking at the Lahore Press Club".' },
    },
  ],
};
