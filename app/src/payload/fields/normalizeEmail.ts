/** Field hook: store emails trimmed and lower-case, so "Ayesha@Gmail.com " and "ayesha@gmail.com" are the same member. */
import type { FieldHook } from "payload";

export const normalizeEmail: FieldHook = ({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value);
