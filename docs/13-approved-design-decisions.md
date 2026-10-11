# 13 — Approved Design & Build Decisions

Decision log. The newest entries are at the top. These override earlier recommendations in 10 and 12.

## 2026-10-07 (evening) — Admin Overview dashboard

The user's request: build something like the analytics dashboard of another admin panel they showed (fitnesszone.ltd/admin/dashboard).

- **The admin home page is now an Overview,** with a 7d / 30d / 90d switch and quick-link buttons.
  - Website cards: visits, checkouts started, payments completed with conversion %, revenue per currency.
  - A daily visits bar chart, a top pages table and the latest orders.
  - Coaching cards: active memberships, new members, check-ins to review, contact messages. Then the latest weekly check-ins.
- **New: private visit counting.**
  - The website sends only the page path; no cookies and no IP addresses are used.
  - Counts are kept in memory and saved to the `site-stats` table at most once an hour, so the free Neon database isn't woken on every visit.
  - "Join now" checkouts are counted as an event.
  - Only the live site counts visits, so local testing doesn't mix with real numbers.
- **Privacy policy:** the client may want to add a line saying the site counts anonymous page views (no cookies).
- **Verified:** visits are recorded in about 30 ms with no database call. The dashboard shows them after it saves the counts. The layout was checked at laptop and narrow widths. The test admin login and test visits were removed afterwards.

## 2026-10-07 (later) — Admin panel reorganized

The user's request: "admin panel looking very messy, arrange it and merge the content which can fit together and easy to edit".

- **Menu grouped by task:**
  - Clients: Members, Memberships, Weekly check-ins, Orders
  - Member area: Notifications to members, Recorded workouts
  - Website: Programs, Testimonials, FAQs, Legal pages, Photos, Homepage, Prices, Contact & site settings
  - Inbox: Contact messages, Newsletter subscribers
  - Admin: Admin users
  - Daily logs and member logins are no longer in the menu; they are shown inside each member.
- **Merged:**
  - Transformations + Instagram posts → **Testimonials**: one list, with a type of "Before/after photo" or "Instagram post".
  - Homepage FAQ list + FAQs → **FAQs**, each with "Show on: FAQ page / Homepage".
  - Goal picker → a tab of **Homepage**, next to Hero banners and Founder messages.
  - Existing content was copied by the migration `merge_admin_content`, then `remove_merged_leftovers` removed the old structures.
- **Member page:** one screen per client, with these tabs:
  - Overview
  - Membership: her memberships and orders, with "Add new" for bank-transfer clients
  - Progress: check-ins, measurements, water and sleep
  - Personal details
  - Meal plan
  - Login: password status, lock, and her devices
- **Easier editing:**
  - list rows show readable titles: "Pakistan (PKR)", "1-month price: 4000 (was 5500)", banner titles, "Before/after: 62 → 54 kg", "Week 2 · 68.5 kg", "Fat Loss Program · 22 Sep – 22 Nov"
  - long lists open folded
  - each country in Prices opens on its prices, with the rarely-changed settings folded away
  - tick boxes default to "no"
  - lists show 50 rows per page
  - weekly check-ins have a "Reviewed" tick
- **Branding and home screen:** the logo is on the admin login and menu. The home screen is a welcome panel with counts (check-ins to review, active memberships, orders this month, messages this week) and quick-action buttons.
- **Verified:**
  - Every screen was checked in the browser with a temporary admin login, which was deleted afterwards.
  - The website shows the same content as before.
  - `next build` passes.

## 2026-10-07 — Phase 2: database, admin panel, member accounts

**Decisions (user, 2026-10-07):**
- **Login = email + password, with "Forgot password".** The user's words: "keep the login simple" and "only forget pass". This replaces the email-code / magic-link idea in doc 10.
  - It is our own small code in `app/src/lib/auth`, not Better Auth:
    - passwords hashed with scrypt
    - account locked for 15 minutes after 5 wrong passwords
    - one-time reset links that work for 1 hour
    - 30-day sessions in an httpOnly cookie
  - First password: the welcome email after payment contains a "create your password" link that works for 7 days. Clients the coach adds by hand use "Forgot password" to set theirs.
- **Hosting = completely free.** The user's words: "it is costly for now can we go totally free". This replaces Vercel Pro and R2 from doc 10. It gets set up at launch.
  - Oracle Cloud Always Free server in Singapore.
  - Cloudflare free plan for DNS, CDN, HTTPS and email routing.
  - Neon free plan and Resend free plan.
  - Uploaded photos stored on the server's own disk.
  - The code also reads Cloudflare's `cf-ipcountry` header, so region detection still works.

**Built:**
- **Admin panel:** Payload CMS 3.90 on Neon Postgres (Singapore), at `/admin`.
  - Collections:
    - Programs, FAQs, Transformations, Instagram posts, Legal pages, Photos
    - Members, Memberships, Weekly check-ins, Daily logs, Announcements, Recorded workouts
    - Orders, Contact messages, Newsletter subscribers
    - Admin users, Member logins, Password resets
  - Globals: Homepage (hero banners, founder messages, homepage FAQ), Pricing, Goal picker, Site settings.
- **Content in the database:** all content was imported from the approved JSON with `npm run seed`, including 21 photos.
  - The site reads it through `src/lib/content.ts`, cached.
  - Saving anything in `/admin` refreshes the site.
- **Database changes only through migration files** (`push: false`): `baseline`, `add_password_login` and `remove_login_codes`.
- **Member area:** `/login`, `/forgot-password` and `/reset-password`. The dashboard needs a login.
  - Every card saves to the database: profile, measurements, weekly check-ins, water and sleep per day, and workout ticks.
  - The coach writes each member's meal plan in `/admin`; until then a sample day is shown.
  - Announcements fill the notification bell.
  - A banner shows when the member has no active membership.
- **Stripe webhook** now creates the member, order and membership:
  - renewals start the day after the current membership ends
  - the same event delivered twice is ignored
  - a refund cancels the membership
- **Contact form and newsletter** are saved in the database as well as emailed.

**Verified 2026-10-07:**
- The type check and lint are clean, and `next build` passes (39 pages). 19 routes respond correctly.
- **Member flow,** tested with a throwaway member that was deleted afterwards:
  - forgot password, then set a password
  - saves persist after a reload
  - log out; a wrong password shows the right message; log back in
  - a used reset link is refused
- **Payment logic,** tested with a fake paid session:
  - it creates the order and the membership
  - a duplicate delivery is ignored
  - a refund cancels the membership

**Waiting on the user/client:**
- the first admin account (create it at `/admin`)
- Stripe test keys
- Resend key and domain
- an Oracle Cloud account, at launch
- the Pakistani payment gateway
- the open questions in doc 10 §5

## 2026-10-06 — Build started (phase 1) + client dashboard spec

**Code:** `D:\fattofit.com\app` (Next.js **16.3** + React 19 + TypeScript + Tailwind v4). Next 16 replaced 15 as the current stable version, and Payload 3.90 supports it. How to run it and where things are: `app/README.md`.

**Phase 1 (done):**
- all public pages (home with the approved carousels, programs + 6 program pages, about, how it works, testimonials, FAQ, contact, 3 legal pages, checkout success, 404)
- Stripe Checkout in test mode (server-side pricing from the pricing sheet, webhook, safety switch against live keys)
- contact + newsletter APIs (email via Resend, or printed to the terminal if no key)
- SEO/GEO (metadata, JSON-LD, sitemap, robots with AI crawlers allowed, llms.txt, 301s from all Shopify URLs)
- the member dashboard UI in demo mode (saved in the browser)

**Client dashboard (client mockup received 2026-10-06), with the client's changes:**
- Sidebar: Dashboard · My Profile · Progress Form · Workout Plan · Meal Plan · **Recorded Sessions** · Settings.
  **Removed:** Messages, Resources. **Live Sessions → Recorded Sessions** (the 4-week YouTube plan, week → day → video, mark as done).
- Overview page, as in the mockup:
  - welcome banner ("Stronger Healthier Happier You") + Today card
  - Personal Details (name, age, height, weight, gender, marital status, student, diet, smoking, medical conditions, allergies, likes, dislikes)
  - Measurement Chart (chest, waist, hips, thigh, arm, shoulder, calf, auto BMI)
  - Progress Form (week picker, weekly weight, mood, notes, progress-to-goal ring)
  - Workout Details (Mon–Sun tabs, status, focus checklist)
  - Water Intake (12 glasses / 3 L), Sleep, Quick Actions ("Join Live Session" → "Watch recorded sessions")
- Small fixes vs the mockup: one Notes field (the mockup repeated it); the BMI is calculated, not typed; the progress ring shows % of the way to the goal weight.
- Data is a demo member (Ayesha Khan) until phase 2, when the same components read and save real member data.

**Phase 2 (next):**
- Payload CMS + Neon (Singapore) with admin access for the coach
- email-code login; orders and memberships created by the webhook
- dashboard saving to the database
- Pakistani gateway
- deploy to Vercel + run the site-audit skill and Lighthouse on the live URL

## 2026-10-06 — Homepage approved (with fixes) + stack confirmed

**Homepage** (`decisions/homepage`, approved): all 5 hero banners and all 4 carousels (hero, programs, recommended, founder) kept.

Client notes (verbatim): *"the hero section should be in one style like only pics and text change and founder pics should be bigger and clear some are not showing clearly and fix everything"*

Applied in preview v2:
- **Hero = one layout for every banner:** text left (kicker, Fraunces headline with an italic script line + drawn underline, lead, two buttons), arch photo right with a gold outline and an info badge. Only the photo, text and badge change per slide. Same height for all slides.
- **Founder photos bigger and sharper:** photo column widened to half the section (max 540px). All 12 photos are re-cropped to 4:5 **around the coach** at 720×900 from the originals (`assets/client-supplied/crops-4x5/`), so nothing important is cut off. Thumbnails enlarged to 84×105.
- The build must use these crops (or the same focal points: `seed/founder-messages.json` + crops folder) through `next/image` at 1×/2×.

**Stack: confirmed as the build stack** (details in 10 §1):
Next.js 15 (App Router, TypeScript) · Tailwind CSS v4 · shadcn/ui · Motion (Framer Motion) + Embla Carousel · Payload CMS 3 on PostgreSQL (Neon) · Better Auth (email OTP) · **Stripe Checkout (test mode)** · Resend · Cloudflare R2 · Vercel.

## 2026-10-06 — Payments v1: Stripe Checkout in TEST mode

- Build checkout with **Stripe Checkout (hosted page), test mode only**, using test keys (`pk_test_…` / `sk_test_…`) in `.env.local`. Never commit keys.
- One Checkout Session per program/variant; `price_data` built server-side from `seed/pricing.json` for the visitor's region (currency USD, CAD, AED, SAR, QAR, INR, PKR or AUD; amounts in the smallest unit). Stripe supports all 8 currencies. Never trust a client-sent amount.
- `metadata`: `programSlug`, `durationMonths`, `region`, `userId`. Collect email in Checkout. A Terms + Refund policy acceptance checkbox via `consent_collection.terms_of_service = "required"` (needs the Terms URL set in the Stripe dashboard).
- Webhook `checkout.session.completed` → create Order + Membership (idempotent on `session.id`) → send the welcome email. Also handle `checkout.session.expired` and `charge.refunded`.
- Test with Stripe's published test cards (e.g. `4242 4242 4242 4242` success, `4000 0000 0000 9995` declined, `4000 0025 0000 3155` 3-D Secure) and the Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`).
- Show a visible **"Test mode: no real payment is taken"** banner on checkout pages while test keys are in use.
- **Later (before launch):** the Pakistani gateway (Safepay/PayFast) and manual bank transfer. Stripe live mode needs a business in a Stripe-supported country (Stripe does not onboard Pakistan-based businesses). Options: US LLC via Stripe Atlas, UAE or UK entity. This is a client decision.

## 2026-10-06 — Theme approved: **Blossom**

Saved in the Theme Studio (`decisions/theme`, approved twice by the owner).

**Theme:** Blossom (soft luxury).
- **Colours:** Palette `#FFFBF8` background, `#FBEFF1` soft blush, `#A3154F` brand/buttons (AA on white), `#E8A0B8` decorative pink, `#2B1A1F` ink, `#6E5A5F` muted, `#A57B4F` gold lines; brand pink `#FF65C5` kept for accents only.
- **Type:** **Fraunces** (display, italic for the script line) + **Jost** (body).
- **Shapes:** Arch-shaped photos (`border-radius: 999px 999px 14px 14px`) with an offset thin gold outline; 12px card radius; square-ish buttons (4px radius, letter-spaced).

**Animations approved (8):**

| On | Animation |
|---|---|
| ✓ | Scroll reveals |
| ✓ | Headline script draw (wipe + underline) |
| ✓ | Drifting petals (hero) |
| ✓ | Price flip on region/duration change |
| ✓ | Card hover lift |
| ✓ | Step line draw |
| ✓ | Before/after drag slider |
| ✓ | WhatsApp pulse |
| ✗ | Moving waves, floating bubbles, results ticker, number counters (not selected; counters show static numbers) |

**Client notes (verbatim):** *"can you use all 12 pics with slider on admin message and more message and for hero also make more banner designs and add slider and use more slider fore more things like programs and what recommened"*

**Interpretation, now part of the spec:**
1. **Founder ("admin") message carousel** uses **all 12 gallery photos**, each paired with a different message from the coach (real lines from her e-book, About page, founder message, FAQ and event banner). Crossfade, thumbnail strip, counter, arrows, swipe, keyboard. Data: `seed/founder-messages.json`.
2. **Hero banner carousel** with **5 banner designs** (Safe Hands · Desi recipes e-book · Clinical/health concerns · Stronger every day · Recognised for real results), each with its own layout. Autoplay 6.5s with a visible pause control, progress tabs, pause on hover/focus, no autoplay with reduced motion. Data: `seed/hero-banners.json`.
3. **Programs carousel**: all 6 programs, scroll-snap with arrows and dots, region switcher, Fat Loss 2/4-month toggle, price flip.
4. **"Recommended for you" carousel**: goal chips (Lose fat · PCOS/thyroid/menopause · Diabetes · Just starting · Complete makeover · 1-on-1 VIP) reorder the programs with a "Best match" badge and a one-line reason. This is the lightweight version of the program-finder quiz in 12.
5. The before/after drag slider stays as approved.

**Preview for confirmation:** the Blossom homepage artifact (see the README) shows all of the above with real photos, copy and prices. Its feedback box saves to `decisions/homepage`.

**Open items:** confirm the draft captions and the banner copy marked `draft:true` (recipe e-book banner, "Recognised" banner); confirm which of the 5 banners to keep.
