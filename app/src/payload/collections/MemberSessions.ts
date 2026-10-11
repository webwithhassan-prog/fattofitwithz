/**
 * Logged-in member sessions (see src/lib/auth/session.server.ts).
 * The browser keeps a random token in the "ftf_session" cookie; we store only its hash.
 * Deleting a row here logs that member out on that device.
 */
import type { CollectionConfig } from "payload";

export const MemberSessions: CollectionConfig = {
  slug: "member-sessions",
  labels: { singular: "Member login", plural: "Member logins" },
  defaultSort: "-createdAt",
  admin: {
    defaultColumns: ["member", "createdAt", "expiresAt"],
    group: false, // shown inside each member (Login tab)
    description: "Delete a row to log that member out on that device.",
  },
  fields: [
    { name: "member", type: "relationship", relationTo: "members", required: true, index: true },
    { name: "tokenHash", type: "text", required: true, unique: true, index: true, admin: { readOnly: true } },
    { name: "expiresAt", type: "date", required: true },
    { name: "userAgent", type: "text", admin: { readOnly: true } },
  ],
};
