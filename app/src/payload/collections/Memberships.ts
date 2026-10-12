/**
 * Which program a member is on and for how long. The dashboard shows the member's
 * latest active membership. Freezes (per the refund policy) are done by changing the end date.
 */
import type { CollectionConfig } from "payload";

export const Memberships: CollectionConfig = {
  slug: "memberships",
  labels: { singular: "Membership", plural: "Memberships" },
  defaultSort: "-startDate",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["member", "title", "status"],
    group: false, // hidden from the menu (2026-10-13): the page still works at its address
    description: "Which program each member is on, and until when. To freeze a membership, move the end date and add a note.",
  },
  hooks: {
    beforeChange: [
      // A readable title, e.g. "Fat Loss Program · 22 Sep 2026 – 22 Nov 2026"
      async ({ data, req }) => {
        const programId = typeof data.program === "object" ? data.program?.id : data.program;
        const program = programId ? await req.payload.findByID({ collection: "programs", id: programId, depth: 0, req }) : null;
        const day = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
        if (data.startDate && data.endDate) data.title = `${program?.name ?? "Program"} · ${day(data.startDate)} – ${day(data.endDate)}`;
        return data;
      },
    ],
  },
  fields: [
    { name: "title", type: "text", admin: { hidden: true } },
    {
      type: "row",
      fields: [
        { name: "member", type: "relationship", relationTo: "members", required: true, index: true },
        { name: "program", type: "relationship", relationTo: "programs", required: true },
        { name: "order", type: "relationship", relationTo: "orders", admin: { description: "Empty for memberships added by hand." } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "startDate", type: "date", required: true, admin: { date: { pickerAppearance: "dayOnly", displayFormat: "d MMM yyyy" } } },
        { name: "endDate", type: "date", required: true, admin: { date: { pickerAppearance: "dayOnly", displayFormat: "d MMM yyyy" } } },
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "active",
          options: [
            { label: "Active", value: "active" },
            { label: "Frozen", value: "frozen" },
            { label: "Cancelled", value: "cancelled" },
          ],
        },
      ],
    },
    { name: "notes", type: "textarea", admin: { description: "e.g. frozen 2 weeks for travel, end date moved." } },
  ],
};
