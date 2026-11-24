/**
 * Turns whatever was typed into a valid web address part: "Healthy Desserts & Sweet " -> "healthy-desserts-sweet".
 * Used by the slug fields of Programs and E-books: hooks: { beforeValidate: [formatSlug] }
 */
import type { FieldHook } from "payload";

export const formatSlug: FieldHook = ({ value }) =>
  typeof value === "string" ? value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : value;
