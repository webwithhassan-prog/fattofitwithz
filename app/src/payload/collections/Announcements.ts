/**
 * Reminders and announcements shown on the client's dashboard home page.
 *   Announcement = every client sees it (e.g. "Eid break: replies may be slower this week").
 *   Reminder     = one client sees it (e.g. "Please send your follow-up form today").
 * Hidden automatically after "Show until" (leave it empty to keep showing it).
 * Read by src/lib/members.server.ts -> getClientMessages().
 */
import type { CollectionConfig } from "payload";

export const Announcements: CollectionConfig = {
  slug: "announcements",
  labels: { singular: "Reminder / announcement", plural: "Reminders & announcements" },
  defaultSort: "-createdAt",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "audience", "member", "showUntil", "createdAt"],
    group: "Messages to clients",
    description: "Shown on the client's dashboard. An announcement goes to every client; a reminder goes to one client.",
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "audience",
          type: "select",
          required: true,
          defaultValue: "everyone",
          label: "Who sees it",
          options: [
            { label: "Announcement: every client", value: "everyone" },
            { label: "Reminder: one client", value: "one" },
          ],
        },
        {
          name: "member",
          type: "relationship",
          relationTo: "members",
          label: "Client",
          admin: { condition: (data) => data?.audience === "one", description: "The client who sees this reminder." },
          validate: (value: unknown, { siblingData }: { siblingData: { audience?: string } }) =>
            siblingData?.audience === "one" && !value ? "Choose the client for this reminder" : true,
        },
      ],
    },
    { name: "title", type: "text", required: true, admin: { placeholder: "Please send your follow-up form" } },
    { name: "message", type: "textarea", required: true, admin: { rows: 4 } },
    {
      name: "showUntil",
      type: "date",
      label: "Show until",
      admin: { date: { pickerAppearance: "dayOnly" }, description: "Optional. After this day it is hidden from the dashboard." },
    },
  ],
};
