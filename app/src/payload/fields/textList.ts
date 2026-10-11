/**
 * A list of short texts, e.g. a program's benefits.
 * Payload stores it as [{ text: "..." }, ...]; src/lib/content.ts turns it back into string[].
 * In the admin each row shows its own text as the title, and rows can be dragged to reorder.
 */
import type { ArrayField } from "payload";
import { rowLabel } from "./rowLabel";

export function textList(name: string, label: string, description?: string): ArrayField {
  return {
    name,
    label,
    type: "array",
    labels: { singular: "Line", plural: "Lines" },
    admin: { description, initCollapsed: true, components: { RowLabel: rowLabel("{text}", "Line") } },
    fields: [{ name: "text", type: "text", required: true, label: "Text" }],
  };
}
