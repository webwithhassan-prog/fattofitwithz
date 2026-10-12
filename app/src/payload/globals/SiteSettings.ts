/** Contact details, social links, menus and the coach's qualifications - used across the whole site. */
import type { GlobalConfig } from "payload";
import { revalidateGlobalAfterChange } from "../hooks/revalidateSite";
import { textList } from "../fields/textList";
import { rowLabel } from "../fields/rowLabel";

const link = (name: string, label: string) => ({
  name,
  label,
  type: "array" as const,
  labels: { singular: "Link", plural: "Links" },
  admin: { initCollapsed: true, components: { RowLabel: rowLabel("{label} → {href}", "Link") } },
  fields: [
    {
      type: "row" as const,
      fields: [
        { name: "label", type: "text" as const, required: true },
        { name: "href", type: "text" as const, required: true, label: "Address", admin: { description: "e.g. /about" } },
      ],
    },
  ],
});

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Contact & site settings",
  admin: { group: false, // hidden from the menu (2026-10-13)
    description: "WhatsApp, emails, social links, menus and the coach's qualifications." },
  hooks: { afterChange: [revalidateGlobalAfterChange] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Brand",
          name: "brand",
          fields: [
            { type: "row", fields: [{ name: "name", type: "text", required: true }, { name: "legalName", type: "text", required: true }] },
            { type: "row", fields: [{ name: "founder", type: "text", required: true }, { name: "founderTitle", type: "text", required: true }] },
            { name: "location", type: "text", required: true },
            { name: "footerDescription", type: "textarea", required: true },
          ],
        },
        {
          label: "Contact",
          name: "contact",
          fields: [
            {
              type: "row",
              fields: [
                { name: "whatsappE164", type: "text", required: true, label: "WhatsApp number", admin: { description: "With country code, e.g. +19176952569" } },
                { name: "whatsappUrl", type: "text", required: true, label: "WhatsApp link", admin: { description: "e.g. https://wa.me/19176952569" } },
              ],
            },
            { name: "whatsappDefaultMessage", type: "text", required: true, label: "Pre-filled WhatsApp message" },
            {
              type: "row",
              fields: [
                { name: "publicEmail", type: "email", required: true, label: "Public email" },
                { name: "legalEmail", type: "email", required: true, label: "Email in the legal pages" },
              ],
            },
          ],
        },
        {
          label: "Social",
          name: "social",
          fields: [
            { type: "row", fields: [{ name: "instagram", type: "text", required: true }, { name: "facebook", type: "text", required: true }] },
            { type: "row", fields: [{ name: "youtube", type: "text", required: true }, { name: "tiktok", type: "text", required: true }] },
          ],
        },
        {
          label: "Menus",
          fields: [
            link("nav", "Main menu"),
            link("footerLinks", "Footer links"),
            textList("contactSubjects", "Contact form subjects"),
          ],
        },
        {
          label: "About the coach",
          fields: [textList("qualifications", "Qualifications"), textList("expertise", "Areas of expertise")],
        },
      ],
    },
  ],
};
