/**
 * Which program a member is on and for how long. The dashboard shows the member's
 * latest active membership.
 * Freezes: set Status = Frozen (+ "Resume on"); the hook below moves the end date. Rules: src/lib/freeze.ts
 */
import { APIError, type CollectionConfig } from "payload";
import { applyFreezeChange } from "../../lib/freeze";

const dayOnly = { date: { pickerAppearance: "dayOnly" as const, displayFormat: "d MMM yyyy" } };
const isFrozen = (data: { status?: string } | undefined) => data?.status === "frozen";

export const Memberships: CollectionConfig = {
  slug: "memberships",
  labels: { singular: "Membership", plural: "Memberships" },
  defaultSort: "-startDate",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["member", "title", "status"],
    group: false, // hidden from the menu (2026-10-13): the page still works at its address
    description: "Which program each member is on, and until when. To freeze: open the membership, set Status to Frozen, pick \"Resume on\" and save.",
  },
  hooks: {
    beforeChange: [
      // Freeze / restart: moves the end date and writes a line in the notes (rules: src/lib/freeze.ts)
      ({ data, originalDoc }) => {
        const before = originalDoc ?? { status: "active", endDate: data.endDate };
        const nextStatus = data.status ?? before.status;
        const nextUntil = "frozenUntil" in data ? (data.frozenUntil ?? null) : (before.frozenUntil ?? null);
        const endDate = data.endDate ?? before.endDate;
        if (!endDate) return data;

        let change;
        try {
          change = applyFreezeChange({ ...before, endDate }, nextStatus, nextUntil);
        } catch (error) {
          throw new APIError(error instanceof Error ? error.message : "Could not freeze this membership.", 400, undefined, true);
        }
        if (!change) return data;

        data.endDate = change.endDate;
        data.daysFrozen = Math.max(0, (before.daysFrozen ?? 0) + change.shift);
        data.frozenFrom = change.frozenFrom;
        data.frozenUntil = change.frozenUntil;
        const notes = String(data.notes ?? before.notes ?? "").trim();
        data.notes = notes ? `${notes}
${change.note}` : change.note;
        return data;
      },
      // A readable title, e.g. "Fat Loss Program · 22 Sep 2026 – 22 Nov 2026"
      async ({ data, originalDoc, req }) => {
        const programRef = data.program ?? originalDoc?.program;
        const programId = typeof programRef === "object" ? programRef?.id : programRef;
        const program = programId ? await req.payload.findByID({ collection: "programs", id: programId, depth: 0, req }) : null;
        const day = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
        const startDate = data.startDate ?? originalDoc?.startDate;
        const endDate = data.endDate ?? originalDoc?.endDate;
        if (startDate && endDate) data.title = `${program?.name ?? "Program"} · ${day(startDate)} – ${day(endDate)}`;
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
        { name: "startDate", type: "date", required: true, admin: dayOnly },
        { name: "endDate", type: "date", required: true, admin: dayOnly },
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "active",
          options: [
            { label: "Active", value: "active" },
            { label: "Frozen (paused)", value: "frozen" },
            { label: "Cancelled", value: "cancelled" },
          ],
          admin: { description: "Frozen: her forms and workouts lock and the end date moves forward. Set Active to restart early." },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "frozenUntil",
          type: "date",
          label: "Resume on",
          admin: { ...dayOnly, condition: isFrozen, description: "Her program restarts by itself on this day. Leave empty if you don't know yet." },
        },
        { name: "frozenFrom", type: "date", label: "Frozen since", admin: { ...dayOnly, condition: isFrozen, readOnly: true } },
        {
          name: "daysFrozen",
          type: "number",
          label: "Days added by freezes",
          defaultValue: 0,
          admin: { readOnly: true, condition: (data) => isFrozen(data) || (data?.daysFrozen ?? 0) > 0 },
        },
      ],
    },
    { name: "notes", type: "textarea", admin: { description: "Freezes and restarts are noted here automatically." } },
  ],
};
