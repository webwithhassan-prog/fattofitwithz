# 14 — How everything works (full workflow)

How a visitor becomes a client, what the client does each day and week, and what the coach does in the admin panel. It also covers what the system does by itself, and how the developer changes and ships the site.

> **Note (2026-10-13):** the member area was simplified on 2026-10-07. It now has a first day form, follow-up forms, the recorded library and the e-book. Diet plans go on WhatsApp. Any section below that still mentions weekly check-ins, daily logs or meal plans in the dashboard is out of date; section 2a is current.

**Status markers:**
- ✅ built and tested
- 🟡 planned, can be built now
- ⛔ waiting on the client (an account, a decision or content)

---

## 1. Who is involved

| Who | Uses | Main jobs |
|---|---|---|
| **Visitor** | the website | finds a program, pays, becomes a client |
| **Client (member)** | `/login` → member dashboard | follows the plan, logs progress every week |
| **Coach (Zaineb / team)** | `/admin` | reviews check-ins, writes meal plans, manages memberships, edits the website |
| **System** | runs on its own | prices by country, Stripe payments, accounts, emails, visit counts |
| **Developer** | code + server | changes features, database migrations, deploys, backups |

---

## 2. Visitor → paying client

### 2a. Card payment (Stripe) ✅ (live mode ⛔). Updated 2026-10-13

1. The visitor arrives from Instagram, WhatsApp, Google or an AI assistant. Public pages are served from the CDN, so they open fast.
2. **Prices show in her country's currency automatically.** The browser checks her saved choice (cookie), else asks `/api/region` (Netlify's country header), else uses USD. She can switch country in the picker.
3. She chooses a program by:
   - browsing the **Programs** carousel or page,
   - using the **goal picker** ("What's your main goal?"; health concerns are highlighted), or
   - asking on **WhatsApp** (floating button on every page).
4. On the program page she picks a duration and presses **Join now**.
5. **E-book popup:** "Add the e-book for $6 (normally $8)?", shown in her currency. Either "Yes, add it" or "No thanks" opens **/checkout**. The popup is skipped if the e-book is switched off in admin.
6. **/checkout:** order summary (program + optional e-book + total).
   - **Not logged in:** full name, email, WhatsApp number, new password. The account is created and she is logged in.
   - **Already has an account?** "Log in" brings her back to the same checkout (`/login?next=...`).
   - **Logged in:** she only confirms her WhatsApp number.
7. The server works out the price from **admin › Prices** (never from the browser) and opens **Stripe Checkout**. This counts as "Checkout started".
8. She pays. Stripe sends her to **/checkout/success**, which shows "Next: fill in your first day form" and the e-book link if she bought it.
9. **Automatically (Stripe webhook):**
   - links the order to the account made at checkout (or finds or creates her by email)
   - saves the **order** (program, months, e-book yes/no, amount, currency)
   - creates the **membership**: start today, end after the paid months. If she already has a running membership, the new one starts the day after it ends.
   - emails a **welcome message**: login link, first day form link, e-book link if bought
   - Stripe sending the same event twice never creates duplicates.
10. She fills in the **first day form**. The coach prepares the diet plan and sends it on **WhatsApp**.

**E-book on its own:** `/ebook` → "Buy the e-book" → Stripe (no account needed) → success page with the Drive link. The order is saved; it is linked to a member only if that email already has an account.

> ⛔ Live card payments: Stripe does not accept businesses registered in Pakistan. This needs a company in a supported country (for example Stripe Atlas), or another gateway.

### 2b. Bank transfer (for Pakistan) 🟡

1. On the program page the client chooses **Pay by bank transfer**.
2. She sees the bank details and the exact amount, then uploads a screenshot of the payment and her email address.
3. An **order** is saved as **Waiting for approval**, and the coach is notified.
4. The coach checks the bank app, then opens **admin › Orders** and presses **Approve**.
5. From there it is the same as steps 7–8 above: member, membership, welcome email and WhatsApp intake.
6. If the payment is not found, the coach marks the order **Rejected** with a reason, and the client is emailed.

### 2c. Client joins through WhatsApp / in person ✅

1. The coach opens **admin › Members › Create**: name, email, phone.
2. On the member's **Membership** tab: **Add new** → program, start and end date (and an order, if paid).
3. The client goes to `/login` → **Forgot password?** → sets her password from the email link.

### 2d. Pakistani payment gateway (Safepay / PayFast / JazzCash) ⛔

This needs the client's merchant account. Once it exists, it plugs into the same order and membership flow as 2a.

---

## 3. Onboarding (first days) ✅

| Step | Who | Where |
|---|---|---|
| Create password | client | welcome email link → `/reset-password`, or `/forgot-password` |
| Log in | client | `/login` (email + password; "Member login" in the site header) |
| Fill **Personal details** (age, height, diet, allergies, medical conditions, likes and dislikes) and **Measurements** | client | Dashboard › My Profile |
| Intake call / chat | coach | WhatsApp |
| Set **start and goal weight**, read her details | coach | admin › Members › her page › Overview + Personal details |
| Write her **meal plan** (meals, foods, calories, note) | coach | admin › Members › her page › Meal plan (until then she sees a sample day) |
| Diet plan PDF / e-books 🟡 | coach uploads, client downloads | member page › Files (private, only she can open them) |

---

## 4. The client's routine ✅

**Every day (Dashboard):**
- **Workout:** today's recorded session from the 4-week plan, Monday to Saturday, with Sunday for rest. She presses play (YouTube) and ticks it **Done**.
- **Water:** taps a glass for each one she drinks (goal 12 glasses / 3 L).
- **Sleep:** logs hours and minutes from last night.
- Reads her **meal plan**.

**Every week:**
- Submits the **Progress Form**: weight, mood, notes. One form per week, which she can update. The progress ring shows how far she is towards her goal weight.

**Any time:**
- **Notification bell:** news from the coach.
- **Settings:** her membership dates, log out.
- **Change password** 🟡 (for now she uses "Forgot password").
- **Freeze request** 🟡 (for now by WhatsApp; see section 6).

---

## 5. The coach's routine in `/admin` ✅

**Every day (5–10 min):** open **Overview**.
- **Check-ins to review:** read each one, reply on WhatsApp, tick **Reviewed**.
- **Latest orders:** new clients → start the WhatsApp intake.
- **Contact messages** (Inbox): reply by email or WhatsApp.

**Every week:**
- Update **meal plans** where needed (member page › Meal plan).
- Optionally post a **Notification to members** ("New recipes added", "Holiday schedule").

**Every month:**
- Overview › **30d / 90d**: visits, checkouts started, payments completed (conversion), revenue, top pages.
- Members whose membership is ending → remind them on WhatsApp to renew.

**Whenever needed (website content).** Every save updates the live site straight away.

| Change | Where |
|---|---|
| Hero banners, founder messages, goal picker | Website › Homepage |
| Prices per country | Website › Prices |
| Program text, durations | Website › Programs |
| Before/after photos, Instagram posts (only with the client's written permission) | Website › Testimonials |
| FAQs for the FAQ page or the homepage | Website › FAQs |
| Privacy / Refund / Terms, effective date | Website › Legal pages |
| WhatsApp, emails, socials, menus, qualifications | Website › Contact & site settings |
| Photos | Website › Photos |
| Recorded workouts (YouTube links) | Member area › Recorded workouts |

---

## 6. Membership lifecycle

```
paid ──► ACTIVE (start → end date) ──► ended ──► renew? ──► new membership starts after the old one
            │        │
            │        └── freeze (per policy): end date moved later + note
            └── refund: order "Refunded", membership "Cancelled"
```

| Event | What happens | Status |
|---|---|---|
| **Renewal** | Client buys again. The new membership starts the day after the current one ends. | ✅ |
| **Freeze** | Client asks by WhatsApp. The coach moves the **end date** and adds a note (Memberships, or member page › Membership). | ✅ (manual) |
| **Freeze request button** | Client requests on the dashboard; the coach approves in the admin panel and the end date moves automatically. | 🟡 |
| **Freeze rules** (maximum length, how often) | — | ⛔ client decision |
| **Upgrade** (pay the difference?) | — | ⛔ client decision |
| **Ended** | She can still log in. A banner says the membership has ended, with links to programs and WhatsApp. | ✅ |
| **Refund (card)** | The coach refunds in the Stripe dashboard. The system marks the order **Refunded** and the membership **Cancelled**. | ✅ |
| **Refund (bank transfer)** | The coach pays back by bank and sets the order and membership by hand. | 🟡 with 2b |

---

## 7. Accounts and support ✅

- **Forgot password:** the link works once, for 1 hour. "Forgot password" shows the same message for any email, so nobody can find out who is a member.
- **Too many wrong passwords:** 5 in a row lock the account for 15 minutes. The coach can unlock it on the member page › Login tab by clearing "Locked until".
- **Log her out everywhere:** member page › Login › "Logged in on" → delete the rows. Resetting the password also logs out all other devices.
- **Change her email:** the coach edits it on the member page (she logs in with the new email).
- **Admin users:** Admin › Admin users. Each person has their own login; Payload locks the account after 5 wrong tries.

---

## 8. Emails the system sends

| Email | To | When | Status |
|---|---|---|---|
| Welcome + "create your password" link | client | after a paid order | ✅ |
| Set / reset password link | client | "Forgot password" | ✅ |
| New contact message | team | contact form | ✅ (also saved in Inbox) |
| New newsletter subscriber | team | footer sign-up | ✅ (also saved in Inbox) |
| Bank transfer received / approved / rejected | client + team | bank transfer flow | 🟡 |
| Freeze confirmed | client | freeze approved | 🟡 |
| Branded HTML design for all of the above | — | — | 🟡 |
| **Actually delivering** the emails | — | needs a Resend key + domain | ⛔ (until then they are printed in the server log) |

---

## 9. Data and privacy

- **What's stored:**
  - members: contact details, profile answers, measurements, check-ins, daily water and sleep, workout ticks, meal plan
  - orders and memberships
  - contact messages and newsletter emails
- **What's not stored:**
  - card details: Stripe keeps them
  - passwords: only a scrambled hash
  - reset links and login tokens: only hashes
- **Visit statistics:** only "page X was viewed N times on day Y". No cookies, no IP addresses. They are counted on the live site only.
- **Cookies:**
  - `ftf_session`: member login
  - `ftf_region`: chosen country
  - `payload-token`: admin login
  - No tracking cookies, so no cookie banner is needed.
- **Who can see what:**
  - Members only ever see their own data.
  - Only admin users can open `/admin` and Payload's API.

---

## 10. Developer workflow

### 10a. Everyday development ✅
```
cd app
npm run dev                     # http://localhost:3000  (admin: /admin)
```
- **Content:** change it in `/admin`, not in code.
- **Code:** edit, check in the browser, then `npx tsc --noEmit` and `npm run lint`.
- **Logs:** prefixed by area: `[checkout]`, `[stripe-webhook]`, `[orders]`, `[auth]`, `[dashboard:…]`, `[stats]`.

### 10b. Changing the database structure ✅
1. Edit a file in `src/payload/collections` or `src/payload/globals`.
2. Run `npm run migrate:create -- what-changed`, then **read the SQL** it generates.
3. If a table is renamed or merged: first add the new structure and copy the data, then remove the old one in a second migration (see `merge_admin_content`).
4. Run `npm run migrate`, then `npm run generate:types`, then restart `npm run dev`.

### 10c. Version control 🟡
- Use a private GitHub repo.
- Commit small, clear changes.
- Never commit `.env.local` (it is already ignored).

### 10d. Deploying (free hosting plan) ⛔ accounts / 🟡 setup
```
GitHub (main branch)
   │  push
   ▼
Oracle Cloud VM, Singapore (always free)
   ├── git pull → npm ci → npm run migrate → npm run build → restart (PM2)
   ├── uploads stored on the server disk (app/media) + backed up
   └── Node app on port 3000
   ▲
Cloudflare (free): DNS, HTTPS, CDN, country header for prices, email forwarding
   ▲
fattofitwithz.com   (DNS moved from Wix)
```
- **Secrets on the server:** an `.env` file containing:
  - `DATABASE_URL` and `PAYLOAD_SECRET`
  - Stripe live keys, with `ALLOW_LIVE_PAYMENTS=true`
  - `STRIPE_WEBHOOK_SECRET`
  - `RESEND_API_KEY` and `EMAIL_FROM`
  - `NEXT_PUBLIC_SITE_URL=https://fattofitwithz.com`
- **Stripe webhook:** add `https://fattofitwithz.com/api/webhooks/stripe` in the Stripe dashboard with these events:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.expired`
  - `charge.refunded`

### 10e. Keeping it running 🟡
- **Backups:**
  - Neon's built-in restore window
  - a weekly `pg_dump` of the database
  - a weekly copy of `app/media`
- **Monitoring:**
  - a free uptime monitor (for example UptimeRobot) on `/` and `/admin/login`
  - Oracle's idle-server rule is avoided by normal traffic and the monitor's checks
- **Updates:**
  - Payload and Next.js minor updates every month: update, migrate, build, check
  - Ubuntu security updates run automatically

---

## 11. Launch checklist

1. ⛔ Accounts:
   - Oracle Cloud and Cloudflare
   - Resend (with the domain verified)
   - Stripe live, or a PK gateway
   - DNS access at Wix
2. ⛔ Content:
   - effective date for the legal pages, one public email address
   - pricing confirmed, freeze and upgrade rules
   - e-book PDF, vector logo, photo consents
3. 🟡 Build:
   - bank transfer flow
   - private files (diet-plan PDFs and e-books)
   - freeze request
   - branded emails
   - change password
4. 🟡 Server set-up, then deploy and run `migrate` + `seed` on the live database, then create the admin account.
5. Test on the live site:
   - a real low-value payment, then refund it
   - password reset email
   - contact form
   - redirects from all old Shopify URLs
6. Switch DNS → Lighthouse + site audit → Google Search Console (submit `sitemap.xml`).
7. Cancel Shopify (and Wix, if it's only used for the domain) after one stable week.
