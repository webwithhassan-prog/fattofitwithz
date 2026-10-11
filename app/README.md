# Fat To Fit With Z: website

Next.js 16 + TypeScript + Tailwind CSS v4, with **Payload CMS 3** (admin panel at `/admin`) on a **Neon Postgres** database
(Singapore). The approved **Blossom** design, Stripe Checkout in **test mode**, member accounts with email + password, and
a member dashboard that saves to the database. Specs and decisions live in [`../docs`](../docs/README.md). Start with
`13-approved-design-decisions.md`.

## Run it

```bash
npm install
cp .env.example .env.local      # then fill in DATABASE_URL, PAYLOAD_SECRET and the Stripe TEST keys
npm run migrate                 # create/update the database tables (safe to run any time)
npm run seed                    # first time only: import the website content and photos
npm run dev                     # http://localhost:3000  (admin: http://localhost:3000/admin)
```

The first time you open `/admin`, it asks you to create the first admin account (the coach's email + a password).

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (also type-checks) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type-check only |
| `npm run migrate` | Apply new database migrations (`src/migrations`) |
| `npm run migrate:create -- <name>` | After changing a collection: write a migration for it |
| `npm run migrate:status` | Which migrations have run |
| `npm run seed` | Import content from `src/content` into the database (overwrites content edited in /admin!) |
| `npx payload run src/payload/seed/test-member.ts` | Create a test member (add `remove` to delete it and its data) |
| `npm run generate:types` | Refresh `src/payload-types.ts` after changing a collection |
| `node --env-file=.env.local scripts/db-row-counts.mjs` | How many rows each table has |
| `python scripts/prepare-assets.py` | Re-copy images/content from `../docs` (resizes photos, makes favicon and share image) |

## Database (Payload + Neon)

- Every table is a **collection** (`src/payload/collections`) or a **global** (`src/payload/globals`, single pages such as
  Pricing or Homepage). Each file starts with a comment explaining what it is for.
- Tables change **only through migration files** (`push: false` in `src/payload.config.ts`). After editing a collection:
  `npm run migrate:create -- what-changed`, read the generated SQL, then `npm run migrate`. The same files build the live
  database, so development and production never drift apart.
- Website pages read content through `src/lib/content.ts` (cached; saving anything in `/admin` refreshes the site).
  Member data goes through `src/lib/members.server.ts` and the server actions in `src/app/(frontend)/dashboard/actions.ts`.

## Member login (email + password)

- `/login`: email + password. `/forgot-password`: emails a one-time link to `/reset-password` (works 1 hour).
- **First password:** after paying, the welcome email has a "create your password" link (works 7 days). Members the coach
  adds by hand in `/admin` use **Forgot password** to create theirs.
- Passwords are hashed with scrypt; 5 wrong passwords lock the account for 15 minutes (shown and clearable in
  admin > Members > Login tab). Code: `src/lib/auth/`.
- While `RESEND_API_KEY` is empty, the reset email (with its link) is printed in the `npm run dev` terminal.

## Test a payment (Stripe test mode)

1. Put your `sk_test_…` key in `.env.local` as `STRIPE_SECRET_KEY`.
2. In another terminal: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, then copy the `whsec_…` it prints
   into `STRIPE_WEBHOOK_SECRET` and restart `npm run dev`.
3. Open any program, e.g. `/programs/fat-loss`, and press **Join now**.
4. Pay with card `4242 4242 4242 4242`, any future date, any CVC. Declined test: `4000 0000 0000 9995`.
5. The webhook creates the **member, order and membership** (see `/admin`) and sends the welcome email with the
   "create your password" link (printed in the terminal without Resend).

Live keys (`sk_live_…`) are refused unless `ALLOW_LIVE_PAYMENTS=true` (safety switch in `src/lib/stripe.server.ts`).

## Where things are

```
src/
  payload.config.ts         admin panel + database settings (lists every collection)
  payload/
    collections/            one file per table: Programs, Faqs, Members, Orders, Memberships, CheckIns...
    globals/                single pages: Homepage, Pricing, Recommendations (goal picker), SiteSettings
    hooks/revalidateSite.ts refreshes the website when the coach saves something
    seed/seed.ts            imports src/content/* into the database
  migrations/               database migrations (applied with npm run migrate)
  app/
    (frontend)/             the website (its own root layout)
      (site)/               public pages with header/footer: home, programs, about, faq, contact, login...
      dashboard/            member dashboard + actions.ts (everything a member can save)
    (payload)/              the admin panel and Payload's API (generated files, don't edit)
    api/checkout/           creates the Stripe Checkout Session (price calculated on the server)
    api/webhooks/stripe/    "payment completed" -> member + order + membership
    api/contact/, api/newsletter/   save to the database and email the team
    global-not-found.tsx    404 page; sitemap.ts, robots.ts, llms.txt/, manifest.ts
  components/               home/, programs/, pricing/, dashboard/, auth/, layout/, ui/
  content/                  the original content as JSON/Markdown (seed source only)
  lib/
    content.ts              reads website content from the database (cached)
    members.server.ts       loads the logged-in member's dashboard data
    orders.server.ts        what happens after a payment
    auth/                   passwords, reset links, sessions, login actions
    pricing.ts, seo.ts, site.ts, email.server.ts, stripe.server.ts
public/images/              photos used by the code (logo, illustrations, share image)
media/                      photos uploaded in /admin while developing (not committed)
```

## Changing content (admin panel at `/admin`)

The home screen is an **Overview** (`src/payload/admin/Dashboard.tsx`) with a 7d / 30d / 90d switch:
- **Website:** visits, checkouts started, payments completed with conversion %, revenue per currency, a daily visits
  chart, top pages and latest orders.
- **Coaching:** active memberships, new members, check-ins to review, contact messages, latest weekly check-ins.

Visits are counted privately (no cookies, no IP): the site sends only the page path to `/api/track`, counts are kept in
memory and saved to the `site-stats` table at most once an hour (`STATS_FLUSH_MINUTES`), so visitors don't wake the
free database. Only the live site counts visits; set `STATS_IN_DEV=true` in `.env.local` to try it locally.
Code: `src/lib/stats.server.ts`, `src/app/api/track/route.ts`, `src/components/analytics/PageViewTracker.tsx`.

The menu is grouped by task:

| Group | What's in it |
|---|---|
| **Clients** | **Members**: one page per client with tabs for Overview, Membership (her memberships + orders), Progress (weekly check-ins, measurements, water/sleep), Personal details, Meal plan and Login. Also Memberships, Weekly check-ins (tick "Reviewed") and Orders |
| **Member area** | Notifications to members (the bell on the dashboard), Recorded workouts |
| **Website** | Programs, Testimonials (before/after photos **and** Instagram posts), FAQs (FAQ page **and** homepage questions: "Show on"), Legal pages (fill in the effective date before launch), Photos, Homepage (hero banners, founder messages, goal picker), Prices, Contact & site settings |
| **Inbox** | Contact messages, Newsletter subscribers |
| **Admin** | Admin users |

Admin-only pieces live in `src/payload/admin/` (welcome screen, logo, readable row titles).

## Debugging tips

- Server errors are logged with a prefix: `[checkout]`, `[stripe-webhook]`, `[orders]`, `[auth]`, `[login]`,
  `[dashboard:<action>]`, `[contact]`, `[newsletter]`, `[email]`, `[content]`, `[revalidate]`.
- Site shows old content? Save any item in `/admin` (refreshes everything). The cache also expires after an hour.
  `npm run migrate` and `npm run seed` change the database directly, so restart `npm run dev` after them.
- A member can't log in? Admin > Members > her row > Login tab: is a password set, is she locked?
- Wrong currency showing? Delete the `ftf_region` cookie; region order is cookie → geo header → USA.
- Animations: search `globals.css` for the class name (`reveal-play`, `anim-script`, `petal`, `price-flip`, `step-line`,
  `whatsapp-pulse`, `progress-run`). They are all turned off when the visitor's device has "reduce motion" on.

## SEO / GEO built in

Unique title and description per page, canonical URLs, Open Graph/Twitter image (`public/images/og.jpg`), JSON-LD
(Organization, WebSite, Person, Service + Offer, FAQPage, BreadcrumbList), `sitemap.xml`, `robots.txt` (AI crawlers allowed,
private areas blocked), `llms.txt` for AI assistants, 301 redirects from every old Shopify URL (`next.config.ts`), one `<h1>`
per page, alt text on images, skip link, keyboard-friendly carousels and accordions.

## Still to do

Pakistani payment gateway (waiting on the client's merchant account), photo storage for production, hosting set-up
(planned: free Oracle Cloud server in Singapore + Cloudflare), then Lighthouse and site-audit on the live site.
j