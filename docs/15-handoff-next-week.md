# 15 — Handoff: status, deploy steps and what's left

Updated 2026-10-13. The type check, lint and production build **pass**. The live site is https://fattofitwithz.netlify.app (Netlify deploys from GitHub `main`).

---

## 👉 Prompt to paste into a new Claude Code session

Open Claude Code in `D:\fattofit.com\fattofitwithz` and paste everything between the lines:

```
You are continuing work on the Fat To Fit With Z website (Next.js 16 + Payload CMS 3.90 + Neon Postgres),
live on Netlify (https://fattofitwithz.netlify.app, deploys from GitHub main).
Read these first, in this order: docs/15-handoff-next-week.md (status + what's left), app/README.md,
docs/14-workflows.md (section 2a is current), docs/13-approved-design-decisions.md (newest entries at the top).
Also read app/AGENTS.md: this Next.js version differs from older ones, so check node_modules/next/dist/docs
before using an unfamiliar API.

Owner's rules: keep everything SIMPLE for clients and the admin; do not add features nobody asked for;
write code a human can easily debug (a comment at the top of each file, small files, plain code, clear error
messages with [prefix] logs). Colours: bg-brand (#FF65C5) for fills with dark text, text-brand-dark (#D6339F)
for pink text. Never put secrets in chat; they live in app/.env.local and in Netlify's environment variables.

Database rules: change a collection -> `npm run migrate:create -- <name>` -> READ the generated SQL ->
if it drops anything, reorder it by hand (drop links/indexes first, then tables, use IF EXISTS) -> `npm run migrate`
-> `npm run generate:types` -> restart `npm run dev`. Never remove and add tables in the same migration.
Never wipe the database: local and live share ONE database.
Shell tip (Windows Git Bash): don't put apostrophes in heredocs; write code with the file Write/Edit tools.
```

---

## Done ✅ (2026-10-12/13)

- **Look and feel**
  - Brand pink **#FF65C5** with a matching palette:
    - pink buttons with dark text
    - a deeper pink (#D6339F) for pink text
    - soft pink backgrounds and dark plum text
    - pill-shaped buttons
  - Body font **DM Sans** (easier to read), headings **Fraunces**.
  - Leaf bullets replaced by pink ticks.
  - Goal picker: "Health concerns" row (PCOS/thyroid/menopause, diabetes) highlighted, controlled by a **Health concern** tick on each goal in admin › Homepage › Goal picker.
  - **Mobile hero redesigned:** photo first, arrows beside it, full-width buttons. It all fits the first screen.
  - Locked cards in the member dashboard use a drawn lock icon instead of an emoji.
- **Light animations** (CSS only, off with "reduce motion"):
  - hero text fade-up, slow photo zoom, floating badge
  - button shine
  - reading-progress bar and header shadow
  - cards and steps appear one by one
  - FAQ slide-in, goal card fade, e-book popup pop-in
- **Speed:** Home, Programs, program pages and /ebook are **static** (CDN). The currency is detected in the browser (`/api/region`).
- **Photos work on Netlify:** they're stored in the database (`media_files` table). The 22 existing photos were copied in. New uploads are shrunk to 1800 px.
- **Checkout flow:**
  - Join now → e-book popup → `/checkout` (creates the account) → Stripe → success page.
  - Also: the `/ebook` page; the webhook handles e-book-only orders; login `?next=` returns to checkout; `api/checkout` was removed.
- **Seed files** match the database: e-book prices, the e-book itself, founder slides, the health-concern goals.
- **Copy:** the diet plan comes on WhatsApp (How it works, homepage, programs, success page, FAQ seed).

## Done ✅ (2026-10-13, later)

- **Admin panel:**
  - Overview (to-do list + 30-day sales log)
  - Clients
  - First day forms, Follow-up forms
  - Diet plans to send
  - Reminders & announcements
  - Client issues
  - Site photos, Workout recordings, All photos
  - New admin design.
  - Everything else is hidden from the menu, but its pages still work by address: `/admin/collections/orders`, `/memberships`, `/programs`, `/testimonials`, `/faqs`, `/legal-pages`, `/contact-messages`, `/subscribers`, `/users`; globals `/admin/globals/pricing`, `/homepage`, `/ebook` (Drive link), `/site-settings`, `/page-photos`.
- **Client site:** "Report an issue" page; "From your coach" messages on the dashboard home.
- **Worldwide prices:** currency from location; every country in "Prices for". Details in doc 13.
- **Audit:** unused code removed; links checked; scroll, layout and date bugs fixed (doc 13).
- **Privacy note for the policy page:** the site looks up the visitor's country from her IP address (Netlify, or country.is as a fallback) only to show prices in her currency. Nothing is stored except a cookie with the country code.

## Done ✅ (2026-10-13, evening): domain + email

- **Domain:** fattofitwithz.com is live on Netlify with SSL.
  - GoDaddy DNS: `A @ → 75.2.60.5` and `CNAME www → fattofitwithz.netlify.app`; www redirects to the root domain.
  - GoDaddy email records (MX, SPF, DKIM, DMARC, autodiscover) are untouched.
  - Cloudflare is not used (not needed; a Cloudflare proxy would hide visitors' locations).
  - Netlify `NEXT_PUBLIC_SITE_URL` = `https://fattofitwithz.com`.
- **Email (Resend, free plan):** domain verified (us-east-1).
  - GoDaddy records: `TXT resend._domainkey`, `CNAME rsend → rsend.forge.rmta.net`, `CNAME send → send.forge.rmta.net`. Resend's inbound MX was deliberately NOT added, so the GoDaddy inbox keeps working.
  - Netlify: `RESEND_API_KEY` (secret) and `EMAIL_FROM` = `Fat To Fit With Z <info@fattofitwithz.com>`.
  - A test contact-form email to info@ was delivered. The test message ("TEST - email setup check") is in admin › Contact messages and can be deleted.

## Done ✅ (2026-10-13, night)

- **Stats strip:** compact on phones (3 small cards on top, 2 below). The numbers count up from 0 when they scroll into view, and so does "10k+ Success Stories" in the founder section (`components/ui/CountUp.tsx`).
- **Forms:**
  - All 7 measurements are now required in both forms.
  - Both forms ask "Water you drink a day" and "Sleep a night" (answer lists in `lib/member.ts`).
  - The new answers show on the WhatsApp image and in admin.
  - Migration `20261013_171400_water_sleep` (already applied).
- **Send on WhatsApp:** the image is downloaded when the panel opens, so a tap opens the phone's share sheet at once. If sharing fails, an "Open WhatsApp chat" link is shown.
- **Workout "Done" badge:**
  - A video is marked done automatically when she finishes it (or watches 90%), using YouTube's official player. She can also tap "Mark as done" / "Undo".
  - Saved on her account (`members.workoutsDone`, read-only in admin › Clients › Forms).
  - Migration `20261013_171959_workouts_done` (already applied).
- **Demo client:**
  - `npx payload run src/payload/seed/demo-client.ts fix-form` refreshes its sample forms without changing the password.
  - Week 1 "Upper Body" is marked done to show the badge.

## Done ✅ (2026-10-14): freezes + renamed form

- **Freezing a package.** The client asks on WhatsApp; the coach freezes it in admin. All rules are in `src/lib/freeze.ts`.
  - **To freeze:** admin › Clients › the client › Membership tab › open the membership › Status = **Frozen (paused)** › pick **Resume on** (optional) › Save.
  - The freeze starts today. The end date moves forward by the frozen days.
  - While frozen, her forms and workouts are locked. Her dashboard and Settings say "Your program is paused until …", with a WhatsApp button to the coach. Form saves are refused.
  - **Restart:** it restarts by itself on the "Resume on" day (checked when she opens her dashboard and when admin opens the Overview). To restart early, set Status = Active; the unused days come off the end date again.
  - Every freeze and restart is written in the membership's notes. "Days added by freezes" keeps the program length correct (a 3-month program still shows "3 Months").
  - Admin Overview shows a **Paused clients** count.
  - Migrations `20261013_174046_membership_freeze` and `20261014_143605_membership_days_frozen` (already applied).
- **Renamed for clients:** "First day form" is now **"Personal Wellness Profile"**: page heading, form title, sidebar, dashboard card, browser tab title, the WhatsApp image and message, and the save button ("Save my profile"). The admin panel still calls it "First day form". Some body text still says "first day form": checkout success page, How it works, program pages.

## ⚠️ Next deploy (2026-10-13 evening changes)

1. Push to `main` and wait until Netlify shows the deploy as Published.
2. THEN run `npm run migrate` (from `app/`). It applies:
   - `20261013_163631_remove_about_events`: drops the old About photo list. **Running it before the deploy breaks the live About and home pages.**
   - `20261013_170000_rate_limits`: the table already exists, so this does nothing.

## 🚀 Deploy steps (do these in order)

1. **Push the code** to GitHub `main` (Netlify builds it automatically, about 3 minutes).
2. **After the deploy is live**, run the content migration from your computer (it adds "E-book" to the menu and updates one FAQ answer):
   ```
   cd app
   npm run migrate
   ```
   Don't run it before the deploy: the old live site has no /ebook page yet.
3. Open https://fattofitwithz.netlify.app/admin, open any item and press **Save**. This refreshes the live site's cache straight away; otherwise it refreshes within an hour.
4. Check:
   - photos on the homepage
   - `/ebook`
   - a program → Join now → popup → checkout
   - `/api/region` should show your country, e.g. `{"country":"PK","region":"pakistan"}`. If `country` is `null`, tell Claude: the geo header name on Netlify needs adjusting in `src/lib/region.server.ts`.

## ⚡ Make the admin panel and dashboard faster (owner, about 15 minutes, free)

Netlify's free plan runs the server in **Ohio, USA**, but the database is in **Singapore**. Every admin page makes several database calls across the Pacific, which is why the admin panel feels slow. Changing Netlify's region needs a paid plan, so move the database instead:

1. In https://console.neon.tech create a **new project** in region **AWS US East 2 (Ohio)**.
2. Copy the data from the old project. Use Neon's **Import data** tool (in the new project) with the old connection string, or ask Claude to do it with Docker (`pg_dump` / `pg_restore`; Docker Desktop is installed).
3. Put the new **pooled** connection string in:
   - `app/.env.local` → `DATABASE_URL`
   - Netlify → Site configuration → Environment variables → `DATABASE_URL`
4. Redeploy on Netlify (Deploys → Trigger deploy). Keep the old project for a week, then delete it.

## Still to do

1. **Owner's list for the admin panel** (the owner will send what to add or remove).
2. **Stripe test keys** in `app/.env.local` and in Netlify env vars:
   - `STRIPE_SECRET_KEY` (sk_test_...)
   - `STRIPE_WEBHOOK_SECRET`
   - In Stripe add a webhook to `https://<site>/api/webhooks/stripe` with the events `checkout.session.completed`, `checkout.session.async_payment_succeeded` and `charge.refunded`.
   - Until then, checkout says "Payments are not set up yet".
3. **E-book Drive link** in admin › Website › E-book. Confirm the e-book prices in admin › Prices.
4. Doc 14 sections 3+ still describe the old weekly check-ins; rewrite them when the admin list is final.

## How to test locally

1. `cd app`, then `npm run dev`, then open http://localhost:3000.
2. **Sign up** at `/signup` → `/dashboard` shows locked cards with "Choose a program to unlock".
3. **Program page** → **Join now** → e-book popup → `/checkout` → fill in the form → "Payments are not set up yet" (no Stripe keys). The account is created.
4. **Test member with a membership:**
   - `npx payload run src/payload/seed/test-member.ts`
   - `/forgot-password` with `test.member@example.com` (the link is printed in the dev-server log) → set a password.
5. **First day form / follow-up / library**, as before.
6. **Clean up:**
   - `npx payload run src/payload/seed/test-member.ts remove`
   - delete test accounts in admin › Members. Remember: **local and live share the same database.**

## Useful facts

- Photos: `SELECT filename, length(data) FROM media_files;`. To copy files from the old `media/` folder again: `npx payload run src/payload/seed/copy-media-to-db.ts`.
- After `npm run migrate` or `seed`, restart dev. If old content still shows, delete `app/.next/dev/cache/fetch-cache`.
- Logs are prefixed: `[checkout]`, `[stripe-webhook]`, `[orders]`, `[auth]`, `[region]`, `[media]`, `[dashboard:first-day]`, `[dashboard:follow-up]`, `[form-share]`, `[stats]`.
- Netlify free-plan limits: about 6 MB per request, so very large photo uploads fail. Phone photos are fine.

Sources for the region note: [Netlify functions configuration](https://docs.netlify.com/build/functions/configuration/), [Netlify forum: server location](https://answers.netlify.com/t/can-i-set-my-netlify-server-location/41835).
