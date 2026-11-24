/**
 * Photos used on the website (hero banners, founder slides, transformations...).
 * The photo files are saved in the database (table media_files), see src/payload/storage/databaseFiles.ts.
 */
import type { CollectionConfig } from "payload";
import { anyone } from "../access";
import { contentHooks } from "../hooks/revalidateSite";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Photo", plural: "Photo library" },
  admin: {
    useAsTitle: "alt", // show the description, not the file name
    defaultColumns: ["filename", "alt", "updatedAt"],
    group: false, // hidden from the menu (2026-11-25, kept simple); open it from admin Overview > More
    pagination: { defaultLimit: 50 },
    description: "The photo library (every uploaded file). To change a picture on the website, go to Site photos (top of the menu) and press \"Replace photo\" under it: that's the easy way.",
  },
  access: { read: anyone }, // photos are public; uploading and deleting still need an admin
  hooks: {
    ...contentHooks,
    // Every uploaded file gets a new, unique name (e.g. "lq3k2a-photo.jpg"). So when a photo is
    // replaced, browsers and the CDN load the new picture instead of an old cached copy.
    beforeOperation: [
      ({ operation, req }) => {
        if ((operation === "create" || operation === "update") && req.file) {
          req.file.name = `${Date.now().toString(36)}-${req.file.name}`;
        }
      },
    ],
  },
  upload: {
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    // Big phone photos are made smaller (max 1800 px) when uploaded, so pages stay fast.
    resizeOptions: { width: 1800, height: 1800, fit: "inside", withoutEnlargement: true },
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
