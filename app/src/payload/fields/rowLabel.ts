/**
 * Gives array rows in the admin a readable title. Example:
 *   admin: { components: { RowLabel: rowLabel("{label} ({currency})", "Country") } }
 * See src/payload/admin/RowLabel.tsx for how the template works.
 */
export function rowLabel(template: string, fallback: string) {
  return { path: "/payload/admin/RowLabel#RowLabel", clientProps: { template, fallback } };
}
