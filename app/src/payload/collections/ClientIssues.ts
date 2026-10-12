/**
 * Problems reported by clients from their dashboard ("Report an issue", /dashboard/issues).
 * The coach sets the status and can write a reply; the client sees both on her issues page.
 */
import type { CollectionConfig } from "payload";
import { ISSUE_TOPICS } from "../../lib/member";

export const ISSUE_STATUSES = [
  { label: "Open", value: "open" },
  { label: "In progress", value: "in-progress" },
  { label: "Solved", value: "solved" },
] as const;

export const ClientIssues: CollectionConfig = {
  slug: "client-issues",
  labels: { singular: "Client issue", plural: "Client issues" },
  defaultSort: "-createdAt",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "createdAt"],
    group: "Clients",
    pagination: { defaultLimit: 50 },
    description: "Problems reported by clients. Write a reply (she sees it on her dashboard) and set the status.",
  },
  hooks: {
    beforeChange: [
      // Readable title for lists, e.g. "Payment · Ayesha Khan"
      async ({ data, req }) => {
        if (data.member && !data.title) {
          const memberId = typeof data.member === "object" ? data.member.id : data.member;
          const member = await req.payload.findByID({ collection: "members", id: memberId, depth: 0, req }).catch(() => null);
          data.title = `${data.topic ?? "Issue"} · ${member?.displayName ?? member?.email ?? "Client"}`;
        }
        return data;
      },
    ],
  },
  fields: [
    { name: "title", type: "text", admin: { hidden: true } },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "open",
      options: [...ISSUE_STATUSES],
      admin: { position: "sidebar" },
    },
    { name: "member", type: "relationship", relationTo: "members", required: true, label: "Client", admin: { position: "sidebar" } },
    { name: "topic", type: "select", required: true, options: [...ISSUE_TOPICS] },
    { name: "message", type: "textarea", required: true, label: "Her message", admin: { rows: 5 } },
    { name: "reply", type: "textarea", label: "Your reply (she sees this)", admin: { rows: 4 } },
  ],
};
