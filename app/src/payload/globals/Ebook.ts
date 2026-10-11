/**
 * The e-book for sale: on its own (e.g. $8) or added to a program at a lower price (e.g. $6).
 * Prices per country are under Prices. After payment the buyer gets the Google Drive link below
 * (on the thank-you page, by email and in her dashboard).
 */
import type { GlobalConfig } from "payload";
import { revalidateGlobalAfterChange } from "../hooks/revalidateSite";

export const Ebook: GlobalConfig = {
  slug: "ebook",
  label: "E-book",
  admin: { group: "Website", description: "The e-book offer. Its prices per country are under Prices." },
  hooks: { afterChange: [revalidateGlobalAfterChange] },
  fields: [
    {
      name: "enabled",
      type: "checkbox",
      label: "Sell the e-book on the website",
      defaultValue: true,
      admin: { description: "Untick to hide it everywhere (the e-book page and the offer when joining a program)." },
    },
    { name: "title", type: "text", required: true, defaultValue: "Desi Weightloss Recipes" },
    {
      name: "description",
      type: "textarea",
      required: true,
      admin: { rows: 3, description: "One or two sentences shown on the e-book page and in the offer." },
    },
    { name: "cover", type: "upload", relationTo: "media", label: "Cover image" },
    {
      name: "driveLink",
      type: "text",
      label: "Google Drive link",
      admin: {
        placeholder: "https://drive.google.com/...",
        description: 'Set sharing to "Anyone with the link can view". Buyers receive this link after paying.',
      },
    },
  ],
};
