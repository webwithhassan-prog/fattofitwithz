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
import { Ebooks } from "./payload/collections/Ebooks";
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
import { PagePhotos } from "./payload/globals/PagePhotos";
import { Payments } from "./payload/globals/Payments";

const dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.error("[payload] DATABASE_URL is missing. Add your Neon connection string to app/.env.local.");
}
if (!process.env.PAYLOAD_SECRET) {
  console.error("[payload] PAYLOAD_SECRET is missing. Add a long random string to app/.env.local.");
}

/** Hides the developer "API" tab (raw data as code) on every admin page: the coach never needs it. */
function hideApiTab<T extends { admin?: object }>(entity: T): T {
  return { ...entity, admin: { ...entity.admin, hideAPIURL: true } };
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
      // Big photos are made smaller in the browser before upload (Netlify refuses requests over ~6 MB)
      providers: ["/payload/admin/ShrinkUploads#ShrinkUploads"],
      views: {
        // The admin home page: to-do list + sales of the last 30 days
        dashboard: { Component: "/payload/admin/Dashboard#Dashboard" },
        dietPlans: { Component: "/payload/admin/DietPlans#DietPlans", path: "/diet-plans", meta: { title: "Diet plans to send" } },
        sitePhotos: { Component: "/payload/admin/SitePhotos#SitePhotos", path: "/site-photos", meta: { title: "Site photos" } },
      },
    },
  },

  // THE ADMIN MENU (2026-11-24: everything the coach edits is in the menu, in plain words).
  // Groups appear in this order; each file sets its own group.
  //   (top shortcuts: Overview, Payments to confirm, Diet plans to send, Site photos - payload/admin/NavLinks.tsx)
  //   Clients:             Clients, Wellness profiles, Follow-up forms, Orders & payments, Client issues, Website messages
  //   Messages to clients: Reminders & announcements
  //   Website:             Programs, E-books, Transformations, FAQs, Workout recordings, Homepage text
  //   Settings:            Photo library, Legal pages, Newsletter sign-ups, Admin logins,
  //                        Payment details, Prices: e-books & countries, Contact info & menus
  // Hidden (group: false), used through other pages: Memberships (inside each client), logins, password links,
  // visit counts, Page photos (edited in Site photos).
  collections: [
    Members,
    FirstDayForms,
    FollowUpForms,
    Orders,
    ClientIssues,
    ContactMessages,
    Announcements,
    Programs,
    Ebooks,
    Testimonials,
    Faqs,
    WorkoutSessions,
    Media,
    LegalPages,
    Subscribers,
    Users,
    // Hidden from the menu
    Memberships,
    MemberSessions,
    PasswordResets,
    SiteStats,
  ].map(hideApiTab),
  globals: [Homepage, Payments, Pricing, SiteSettings, PagePhotos].map(hideApiTab),

  secret: process.env.PAYLOAD_SECRET ?? "",
  // The admin login is only accepted from these addresses (protection against cross-site requests)
  csrf: [
    (process.env.NEXT_PUBLIC_SITE_URL ?? "https://fattofitwithz.com").replace(/\/$/, ""),
    "https://fattofitwithz.com",
    "https://www.fattofitwithz.com",
    "https://fattofitwithz.netlify.app",
    "http://localhost:3000",
  ],
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
