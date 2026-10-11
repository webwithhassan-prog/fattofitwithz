/**
 * Payload CMS configuration: the admin panel at /admin and the database (Neon Postgres).
 *
 * Every table is defined in src/payload/collections (lists of things) or
 * src/payload/globals (single settings pages). The website reads them through
 * src/lib/content.ts (public content) and src/lib/members.server.ts (member data).
 *
 * Needs in .env.local:  DATABASE_URL (Neon, pooled)  and  PAYLOAD_SECRET (random string).
 */
import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import sharp from "sharp";

import { Users } from "./payload/collections/Users";
import { Media } from "./payload/collections/Media";
import { Programs } from "./payload/collections/Programs";
import { Faqs } from "./payload/collections/Faqs";
import { Testimonials } from "./payload/collections/Testimonials";
import { LegalPages } from "./payload/collections/LegalPages";
import { WorkoutSessions } from "./payload/collections/WorkoutSessions";
import { Members } from "./payload/collections/Members";
import { Memberships } from "./payload/collections/Memberships";
import { FirstDayForms } from "./payload/collections/FirstDayForms";
import { FollowUpForms } from "./payload/collections/FollowUpForms";
import { Orders } from "./payload/collections/Orders";
import { ContactMessages } from "./payload/collections/ContactMessages";
import { Subscribers } from "./payload/collections/Subscribers";
import { PasswordResets } from "./payload/collections/PasswordResets";
import { MemberSessions } from "./payload/collections/MemberSessions";
import { SiteStats } from "./payload/collections/SiteStats";
import { SiteSettings } from "./payload/globals/SiteSettings";
import { Pricing } from "./payload/globals/Pricing";
import { Homepage } from "./payload/globals/Homepage";
import { Ebook } from "./payload/globals/Ebook";

const dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.error("[payload] DATABASE_URL is missing. Add your Neon connection string to app/.env.local.");
}
if (!process.env.PAYLOAD_SECRET) {
  console.error("[payload] PAYLOAD_SECRET is missing. Add a long random string to app/.env.local.");
}

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: " | Fat To Fit With Z admin" },
    importMap: { baseDir: path.resolve(dirname) },
    components: {
      graphics: { Logo: "/payload/admin/Logo#Logo", Icon: "/payload/admin/Logo#Icon" },
      // The admin home page: website + coaching overview (src/payload/admin/Dashboard.tsx)
      views: { dashboard: { Component: "/payload/admin/Dashboard#Dashboard" } },
    },
  },

  // The admin menu shows groups in the order they first appear below, and inside a group
  // lists (collections) come before single pages (globals). Each file sets its own group.
  collections: [
    // Clients: the coach's daily work
    Members,
    Memberships,
    FirstDayForms,
    FollowUpForms,
    Orders,
    // Member area: the recorded workout library
    WorkoutSessions,
    // Website: lists, then the single pages from `globals` (Homepage, Prices, Contact & site settings)
    Programs,
    Testimonials,
    Faqs,
    LegalPages,
    Media,
    // Inbox
    ContactMessages,
    Subscribers,
    // Admin
    Users,
    // Not in the menu (shown inside each member, or internal)
    MemberSessions,
    PasswordResets,
    SiteStats,
  ],
  globals: [Homepage, Pricing, Ebook, SiteSettings],

  secret: process.env.PAYLOAD_SECRET ?? "",
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL ?? "" },
    // Tables are changed ONLY through migration files in src/migrations (never automatically),
    // so development and the live site always have the same structure. After changing a collection:
    //   npm run migrate:create -- <short-name>    writes a new migration file
    //   npm run migrate                           applies it to the database
    push: false,
    migrationDir: path.resolve(dirname, "migrations"),
  }),
  graphQL: { disable: true }, // not used; fewer endpoints to secure
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
});
