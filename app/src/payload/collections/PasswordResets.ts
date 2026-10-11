/**
 * "Set / reset your password" links for members (see src/lib/auth/passwords.server.ts).
 * Only a hash of each link's secret token is stored. A link works once, until it expires.
 * Hidden from the admin menu; old rows are deleted automatically.
 */
import type { CollectionConfig } from "payload";
import { normalizeEmail } from "../fields/normalizeEmail";

export const PasswordResets: CollectionConfig = {
  slug: "password-resets",
  admin: { hidden: true },
  fields: [
    { name: "member", type: "relationship", relationTo: "members", required: true, index: true },
    { name: "email", type: "email", required: true, index: true, hooks: { beforeValidate: [normalizeEmail] } },
    { name: "tokenHash", type: "text", required: true, unique: true, index: true },
    { name: "expiresAt", type: "date", required: true },
    { name: "usedAt", type: "date" },
    { name: "ip", type: "text", index: true },
  ],
};
