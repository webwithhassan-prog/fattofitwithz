"use client";

/**
 * Readable titles for rows in admin lists ("Pakistan (PKR)" instead of "Country 01").
 *
 * Used through the rowLabel() helper in src/payload/fields/rowLabel.ts, e.g.
 *   rowLabel("{label} ({currency})", "Country")
 * {field} or {group.field} is replaced with that field's value in the row.
 * If the row is still empty, it shows the fallback and the row number: "Country 3".
 */
import { useRowLabel } from "@payloadcms/ui";

type Props = { template: string; fallback: string };

function read(data: unknown, path: string): string {
  const value = path.split(".").reduce<unknown>((obj, key) => (obj && typeof obj === "object" ? (obj as Record<string, unknown>)[key] : undefined), data);
  return value === undefined || value === null ? "" : String(value);
}

export function RowLabel({ template, fallback }: Props) {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>();
  let filledAny = false;
  const text = template.replace(/\{([\w.]+)\}/g, (_, path: string) => {
    const value = read(data, path);
    if (value) filledAny = true;
    return value;
  });
  const label = filledAny ? text.replace(/\s+/g, " ").trim() : `${fallback} ${(rowNumber ?? 0) + 1}`;
  return <span>{label.length > 90 ? `${label.slice(0, 87)}…` : label}</span>;
}
