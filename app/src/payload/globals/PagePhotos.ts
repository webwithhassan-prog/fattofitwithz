/**
 * The About page photo and the before/after slider photos (homepage + testimonials page).
 * Not in the menu: open it from admin > Site photos, which shows every picture on the site.
 * Read by src/lib/content.ts -> getPagePhotos() (falls back to the original files if a photo is empty).
 */
import type { GlobalConfig } from "payload";
import { revalidateGlobalAfterChange } from "../hooks/revalidateSite";

export const PagePhotos: GlobalConfig = {
  slug: "page-photos",
  label: "Page photos",
  admin: { group: false, description: "About page photos and the before/after slider. All other photos: admin > Site photos." },
  hooks: { afterChange: [revalidateGlobalAfterChange] },
  fields: [
    { name: "aboutPhoto", type: "upload", relationTo: "media", label: "About page: main photo" },
    {
      type: "row",
      fields: [
        { name: "beforePhoto", type: "upload", relationTo: "media", label: "Before photo (slider)" },
        { name: "afterPhoto", type: "upload", relationTo: "media", label: "After photo (slider)" },
      ],
    },
  ],
};
