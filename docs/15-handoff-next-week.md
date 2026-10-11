# 15 — Handoff: finish the "simplify" change

Updated 2026-10-07 (end of day). The type check and lint are **clean**. A few features are still missing (see "Still to do"). Nothing is broken, but don't deploy until they're finished.

---

## 👉 Prompt to paste into a new Claude Code session

Open Claude Code in `D:\fattofit.com` and paste everything between the lines:

```
You are continuing work on the Fat To Fit With Z website (Next.js 16 + Payload CMS 3.90 + Neon Postgres).
Read these first, in this order: docs/15-handoff-next-week.md (this task), app/README.md, docs/14-workflows.md,
docs/13-approved-design-decisions.md (newest entries at the top). Also read app/AGENTS.md: this Next.js version
differs from older ones, so check node_modules/next/dist/docs before using an unfamiliar API.

Owner's rules: keep everything SIMPLE for clients and the admin; do not add features beyond the list in doc 15;
write code a human can easily debug (a comment at the top of each file, small files, clear error messages with
[prefix] logs). Never put secrets in chat; they live in app/.env.local.

Do the "Still to do" list in docs/15-handoff-next-week.md, in order. After each step run
`npx tsc --noEmit` and `npm run lint` (from app/). At the end run `npm run build` and test in the browser,
following "How to test" in doc 15. Then update docs/14-workflows.md, app/README.md and add a dated entry at the
top of docs/13-approved-design-decisions.md. Report what you finished and what you could not finish.

Database rules: change a collection -> `npm run migrate:create -- <name>` -> READ the generated SQL ->
if it drops anything, reorder it by hand (drop links/indexes first, then tables, use IF EXISTS) -> `npm run migrate`
-> `npm run generate:types` -> restart `npm run dev`. Never remove and add tables in the same migration
(the tool stops to ask "renamed?"); split into two migrations. Never wipe the database.
Shell tip (Windows Git Bash): don't put apostrophes in heredocs; write code with the file Write/Edit tools.
```

---

## What the owner asked for (2026-10-07)

1. **Diet plans** are shared on **WhatsApp**. The website has no meal plans.
2. **Member area:** only a **first day form** and **follow-up forms**, saved in the database and shown in `/admin`.
   - After filling in a form she gets an **image** of her answers, which she can save, and a **WhatsApp button** to send it to the coach.
3. **E-book:** a Google Drive link that the owner sets in admin.
   - **$8** on its own.
   - When buying a program, a **popup offers it for $6**.
4. **Accounts and checkout:**
   - Anyone can **sign up without buying**.
   - When buying a program, **checkout asks only for name, email, WhatsApp number and password**; everything else goes in the first day form after payment.
5. **Recorded library** included with every plan (the 4-week workout PDF).
6. **Remove everything else.** Keep it simple; coordination happens on WhatsApp.
7. **Interface:** slider arrows on the **left/right** sides ✅; remove the **duplicate founder photos** ✅.

## Done ✅

- **Database** (migrations applied):
  - first-day and follow-up form collections
  - e-book global
  - e-book prices per country in Prices (USD 8 alone / 6 with a program, converted; **owner must confirm**)
  - orders support e-book-only purchases (`email` and `ebook` fields; `program`, `months` and `member` optional)
  - removed: check-ins, daily logs, notifications, meal plans, and member profile/measurement/tick fields (all were empty)
- **Content:**
  - E-book: "Desi Weightloss Recipes" with a description and cover. The **Drive link is still empty**; add it in admin › Website › E-book.
  - Founder slider: duplicates `coach-p04` and `coach-p08` removed (10 photos left).
- **Admin:**
  - Members have 4 tabs: Overview, Forms, Membership, Login.
  - First day forms and Follow-up forms are under Clients, each with a "Reviewed" tick.
  - The Overview counts "Follow-ups to review" and lists the latest follow-ups.
  - Quick links: First day forms, Follow-up forms, E-book.
- **Member area,** working and type-checked:
  - **pages:**
    - `/dashboard`: home with program, form cards, library, e-book and a "Message your coach" button
    - `/dashboard/first-day`: the first day form
    - `/dashboard/follow-up`: new follow-up plus a list of earlier ones
    - `/dashboard/library`: the recorded workouts
    - `/dashboard/settings`
  - The forms and library show "available after you join a program" when she has no active program.
  - **Image:** `GET /api/forms/image?form=first-day|follow-up&id=N[&download=1]`. Only the owner can open it.
  - **WhatsApp button:** `FormSharePanel`. On phones it opens the share sheet with the image attached; on computers it opens WhatsApp with a message and asks her to attach the saved image.
- **Locked dashboard:** accounts without a program see every section (home cards marked "Locked"; the forms and library shown faded behind a lock with a "Choose a program" button, `components/dashboard/LockedPreview.tsx`). Everything unlocks when a membership is active.
- **Slider arrows** on the left and right sides of the hero, programs, recommended and founder sliders (`SideArrows` in `components/ui/CarouselControls.tsx`).

## Still to do (in this order)

1. **Checkout flow.** `app/src/app/api/checkout/route.ts` still exists with the old one-click flow; replace it.
   - `src/lib/checkout.server.ts`: `createCheckoutSession({ programSlug?, months?, ebook, region, email?, memberId?, origin })`.
     - Prices come from `getPriceTable()`. E-book prices come from `getRegions()` → `region.ebook.alone`, or `region.ebook.withPlan` when bought with a program.
     - Every line item must use the region's currency.
     - Metadata: `programSlug`, `months`, `region`, `ebook` ("1"/"0") and `memberId`.
     - Call `countEvent("checkout-started")`.
     - Keep the safety switch in `getStripe()`, and the 503 message "Payments are not set up yet" when there are no keys.
   - **New page** `/checkout?program=&months=&ebook=0|1` in `src/app/(frontend)/(site)/checkout/page.tsx` + a client form + `actions.ts`:
     - order summary: program, duration, price, plus an e-book line (tick box) and the total
     - **logged in:** confirm her WhatsApp number → continue to payment
     - **not logged in:** full name, email, WhatsApp number and a new password. The action creates the member (if the email already exists, say "This email already has an account, please log in" with a link to `/login?next=<this checkout url>`), starts the session, then redirects to Stripe.
   - `src/components/programs/ProgramPurchase.tsx`: "Join now" opens a **native `<dialog>`** with the e-book cover and title: "Add the e-book for {withPlan} (normally {alone})?" The buttons are "Yes, add it" / "No thanks", and both go to `/checkout?...&ebook=1|0`. If the e-book is disabled, skip the popup. Pass the e-book data from the program page (`getEbook()`); prices come from `useRegion().region.ebook`.
   - **New `/ebook` page:** cover, description and price (`region.ebook.alone`, with the region picker). Buying needs no account; Stripe collects the email; if she's logged in, pass her email and id. Add a footer link to `/ebook` (Contact & site settings › footer links, and `src/content/settings.json`) and add `/ebook` to `src/app/sitemap.ts`.
   - `/checkout/success`:
     - for a program: a "Next: fill in your first day form" button (→ `/dashboard/first-day`)
     - if the e-book was bought: the Drive link, or "we'll send it on WhatsApp" if the link is empty
   - Delete `src/app/api/checkout/route.ts`.
2. **Webhook:** `src/lib/orders.server.ts`, `fulfilCheckout()`.
   - **Program orders:** find the member by `metadata.memberId`, else by email (create one without a password if missing). Save the order with `email` and `ebook`, then create the membership (keep the renewal logic).
   - **E-book-only orders:** save the order with the email; link a member only if that email exists. No membership.
   - **Emails:**
     - program: welcome + login link + "fill in your first day form" + e-book link if bought
     - e-book only: the link
     - Remove the "create your password" link (the account is made at checkout); keep "Forgot password" as the fallback.
3. **Sign up:** ✅ DONE (`/signup`, `signUpAction`, and the "Create an account" link on login). Still to do:
   - `logInAction` supports a hidden `next` field. **Only allow relative paths starting with `/` and not `//`.**
   - The header "Member login" link stays (it goes to `/dashboard`, which sends visitors who aren't logged in to `/login`).
4. **Seed and content files** (so a fresh database matches):
   - `src/content/pricing.json`: add `ebookPrice` / `ebookPriceWithPlan` per region, and use them in `src/payload/seed/seed.ts`
   - seed the `ebook` global (title, description, cover from `public/images/ebook-cover.jpg`, `enabled: true`)
   - `src/content/founder-messages.json`: remove the `coach-p04` and `coach-p08` slides
5. **Copy clean-up:**
   - Search the site for "diet plan" and "dashboard" promises and make sure they say the diet plan comes on WhatsApp: How It Works step 3, the success page, the FAQ "How do I access my membership?" (FAQ text is edited in admin), and the program card lead "Every program includes...".
   - Leave the legal pages as they are.

## How to test (after the build passes)

1. `cd app`, then `npm run dev`. Use the browser at http://localhost:3000.
2. **Sign up** at `/signup` → you land on `/dashboard`, which shows "You haven't joined a program yet".
3. **Program page** → **Join now** → e-book popup → `/checkout`. Without Stripe keys you should see "Payments are not set up yet".
4. **Test member with a membership:** `npx payload run src/payload/seed/test-member.ts` → `/forgot-password` with `test.member@example.com` (the reset link is printed in the dev-server log) → set a password.
5. **First day form:** fill it in → save → the image appears → **Save image** downloads a PNG → **Send on WhatsApp** opens wa.me on a computer.
6. **Follow-up:** send one → it appears under "Sent before". **Library:** the videos play.
7. **Admin:** `/admin` → Members → test member → **Forms** tab shows both forms. Follow-up forms → tick **Reviewed**. Overview counts update.
8. **Image security:** open `/api/forms/image?form=first-day&id=<id>` in a private window; it should say "Please log in".
9. **Clean up:** `npx payload run src/payload/seed/test-member.ts remove`, and delete any test sign-up accounts in admin › Members.

## Waiting on the owner / client

- **E-book:** the Google Drive link, and confirmation of the e-book prices per country (admin › Prices).
- **Payments:**
  - Stripe test keys (`app/.env.local`)
  - live payments: Stripe doesn't accept Pakistani businesses, so this needs a foreign company or a local gateway
- **Email:** a Resend key + domain (until then emails are only printed in the server log).
- **Hosting:** Oracle Free (Singapore, Pay As You Go) or a Hostinger KVM 2 VPS; then Cloudflare and DNS access.
- **Content and rules:** legal effective date, one public email address, freeze and upgrade rules, photo consents, vector logo. Also: keep both award photos (p10, p12) in the founder slider, or drop one?

## Useful facts

- Admin: http://localhost:3000/admin (your own account).
- After `npm run migrate` or `seed`, restart dev. If old content still shows, delete `app/.next/dev/cache/fetch-cache`.
- Visit stats only count on the live site (`STATS_IN_DEV=true` in `.env.local` to try locally).
- Logs are prefixed: `[checkout]`, `[stripe-webhook]`, `[orders]`, `[auth]`, `[dashboard:first-day]`, `[dashboard:follow-up]`, `[form-share]`, `[stats]`.
