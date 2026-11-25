/** People who can log in to /admin: the coach and the developer. Members log in on the website instead. */
import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Admin login", plural: "Admin logins" },
  admin: {
    useAsTitle: "email",
    group: false, // not in the menu (kept short); the Overview cards and client pages link here
    description: "People who can log in to this admin panel (the coach, the developer). Members log in on the website instead.",
  },
  auth: {
    maxLoginAttempts: 5, // then the account is locked for lockTime
    lockTime: 15 * 60 * 1000,
    // The admin login cookie: HTTPS only on the live site, never sent with requests from other websites
    cookies: { secure: process.env.NODE_ENV === "production", sameSite: "Lax" },
  },
  fields: [{ name: "name", type: "text" }],
};
