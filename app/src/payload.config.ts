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
import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage";
import sharp from "sharp";
import { databaseFiles } from "./payload/storage/databaseFiles";

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
import { Announcements } from "./payload/collections/Announcements";
import { ClientIssues } from "./payload/collections/ClientIssues";
import { SiteSettings } from "./payload/globals/SiteSettings";
import { Pricing } from "./payload/globals/Pricing";
import { Homepage } from "./payload/globals/Homepage";
import { Ebook } from "./payload/globals/Ebook";
import { PagePhotos } from "./payload/globals/PagePhotos";

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
    theme: "light", // the admin design (src/app/(payload)/custom.css) is made for light mode
    components: {
      graphics: { Logo: "/payload/admin/Logo#Logo", Icon: "/payload/admin/Logo#Icon" },
      // Shortcuts at the top of the menu: Overview, Diet plans to send, Site photos
      beforeNavLinks: ["/payload/admin/NavLinks#NavLinks"],
      views: {
        // The admin home page: to-do list + sales of the last 30 days
        dashboard: { Component: "/payload/admin/Dashboard#Dashboard" },
        dietPlans: { Component: "/payload/admin/DietPlans#DietPlans", path: "/diet-plans", meta: { title: "Diet plans to send" } },
        sitePhotos: { Component: "/payload/admin/SitePhotos#SitePhotos", path: "/site-photos", meta: { title: "Site photos" } },
      },
    },
  },

  // THE ADMIN MENU (owner's list, 2026-10-13). Groups appear in the order below; each file sets its group.
  //   Clients:             Clients, First day forms, Follow-up forms, Client issues
  //   Messages to clients: Reminders & announcements
  //   Website:             Workout recordings, All photos
  // Everything else has `admin.group: false`: hidden from the menu, but the pages and data still work
  // (open them from a client's page, the Overview, Site photos, or by address, e.g. /admin/globals/pricing).
  collections: [
    Members,
    FirstDayForms,
    FollowUpForms,
    ClientIssues,
    Announcements,
    WorkoutSessions,
    Media,
    // Hidden from the menu
    Memberships,
    Orders,
    Programs,
    Testimonials,
    Faqs,
    LegalPages,
    ContactMessages,
    Subscribers,
    Users,
    MemberSessions,
    PasswordResets,
    SiteStats,
  ],
  globals: [Homepage, Pricing, Ebook, SiteSettings, PagePhotos], // all hidden from the menu

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
  plugins: [
    // Photos are saved in the database (table media_files), not on disk: see src/payload/storage/databaseFiles.ts
    cloudStoragePlugin({ collections: { media: { adapter: databaseFiles, disableLocalStorage: true } } }),
  ],
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
});
