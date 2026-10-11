/**
 * Website visit counts for the admin dashboard: one row per day per page (or event).
 *   key "/programs"                 -> views of that page that day
 *   key "event:checkout-started"    -> times someone pressed "Join now" and reached Stripe
 *
 * No cookies, no IP addresses, nothing about the visitor: only "page X was viewed N times on day Y".
 * Written in batches by src/lib/stats.server.ts. Not shown in the admin menu.
 */
import type { CollectionConfig } from "payload";

export const SiteStats: CollectionConfig = {
  slug: "site-stats",
  labels: { singular: "Visit count", plural: "Visit counts" },
  admin: { group: false, useAsTitle: "key", defaultColumns: ["date", "key", "count"] },
  indexes: [{ fields: ["date", "key"], unique: true }],
  fields: [
    { name: "date", type: "text", required: true, index: true, admin: { description: "YYYY-MM-DD (Pakistan time)" } },
    { name: "key", type: "text", required: true },
    { name: "count", type: "number", required: true, defaultValue: 0 },
  ],
};
