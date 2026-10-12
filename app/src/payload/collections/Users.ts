/** People who can log in to /admin: the coach and the developer. Members log in on the website instead. */
import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Admin user", plural: "Admin users" },
  admin: {
    useAsTitle: "email",
    group: false, // hidden from the menu (2026-10-13): the page still works at its address
    description: "People who can log in to this admin panel (the coach, the developer). Members log in on the website instead.",
  },
  auth: {
    maxLoginAttempts: 5, // then the account is locked for lockTime
    lockTime: 15 * 60 * 1000,
  },
  fields: [{ name: "name", type: "text" }],
};
