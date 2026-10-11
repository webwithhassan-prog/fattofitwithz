# 10 — Rebuild Plan, Recommended Stack & Acceptance Checklist

> **Update 2026-10-06:** Payments v1 = **Stripe Checkout in test mode** (see [13](13-approved-design-decisions.md)). The PK gateway and bank transfer move to before launch. The theme is **Blossom**.

## 1. Recommended stack

The site is a **marketing site + small digital-commerce flow + a members area with an admin console for one coach**. It needs:
- a CMS the client can edit
- multi-region pricing
- auth
- private files and videos
- strong SEO
- rich animation

That points to one full-stack TypeScript codebase.

| Layer | Pick | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router) + React 19 + TypeScript** (16.3 in use) | SSR/SSG for SEO, server actions for forms, middleware for geo pricing, one codebase for site + dashboard + admin |
| Styling | **Tailwind CSS v4** + CSS variables (design tokens from 02) | Fast, consistent tokens; theme switching via `data-theme` |
| UI primitives | **shadcn/ui (Radix)** | Accessible accordion, dialog, tabs, select, sheet (mobile nav / dashboard drawer) |
| Animation | **Motion (Framer Motion)** for UI and scroll reveals · **Lenis** (optional smooth scroll) · **CSS/SVG** for waves and bubbles · **Lottie** (dotLottie) for small icon animations · optional **GSAP ScrollTrigger** for one or two showcase sections | See [12-enhancements](12-enhancements-and-themes.md) |
| Carousels | **Embla Carousel** | Light, swipe, accessible, loop support |
| CMS + Admin | **Payload CMS 3** (runs inside the Next.js app, Postgres) | The client edits programs, prices, FAQs, testimonials and pages; the coach console (members, check-ins, resources) is built as Payload collections with roles. No second service to host. |
| Database | **PostgreSQL** (Neon or Supabase) | Relational data: orders, memberships, check-ins |
| Auth | ~~Better Auth with email OTP~~ → **email + password with "Forgot password"** (own code in `app/src/lib/auth`; changed 2026-10-07, see 13) | The user asked for a simple login |
| Payments | **Stripe** (international cards, multi-currency prices, Apple/Google Pay) + **a Pakistani gateway** (Safepay or PayFast; JazzCash/Easypaisa wallets) + **manual bank transfer** option with proof upload | PKR buyers rarely have international cards |
| Email | **Resend** + React Email templates | Receipts, onboarding, reminders, contact notifications |
| Files | **Cloudflare R2** (S3-compatible): public bucket for site media, private bucket + signed URLs for e-books and plans | Protects paid content |
| Video (members) | **Bunny Stream** (cheap, signed URLs, good in PK/GCC) or keep unlisted YouTube for v1 | Workouts library |
| Images | `next/image` + an R2/Cloudflare image transform, AVIF/WebP | Performance |
| Analytics | **GA4 + Meta Pixel + TikTok Pixel** via a consent manager (e.g. Klaro or Cookiebot), or Plausible if privacy-first | Ads attribution |
| Forms / spam | Server actions + **Zod** validation + **Cloudflare Turnstile** | |
| Hosting | ~~Vercel + R2~~ → **Oracle Cloud Always Free (Singapore) + Cloudflare free + Neon free** (changed 2026-10-07, see 13) | The user wants $0 running costs for now |
| Monitoring | Sentry + Vercel Analytics / Speed Insights | |
| Testing | Playwright (E2E: browse → checkout → dashboard), Vitest (price logic), axe (a11y) | |

**Alternatives** (if the team prefers a stack it already uses):
- **MERN** (Express + MongoDB + React/Vite): workable, but you lose SSR/SEO unless you add Next anyway, and you must build the admin yourself.
- **Django + DRF + Next.js front-end**: strong admin out of the box; two codebases and two deployments.
- **Stay on Shopify, rebuild the theme properly:** fastest path to fixing the bugs and keeps Shopify Checkout. However, the member dashboard (check-ins, meal logs, video library) would need apps or a separate app, and the PK local gateway options are limited. Choose this only if the budget is very tight.

**Recommendation:** Next.js + Payload + Postgres + Stripe/Safepay on Vercel.

## 2. Project structure (proposed)

```
fattofit/
├─ app/
│  ├─ (site)/            page.tsx (home), about/, programs/, programs/[slug]/, how-it-works/,
│  │                     testimonials/, faq/, contact/, privacy-policy/, refund-policy/, terms/
│  ├─ (auth)/            login/, verify/
│  ├─ checkout/          [variant]/, success/, cancel/
│  ├─ dashboard/         layout.tsx (sidebar), page.tsx, diet-plan/, workouts/, ebooks/,
│  │                     check-in/, meal-log/, progress/, membership/, support/
│  ├─ (payload)/admin/   Payload admin (coach/admin)
│  └─ api/               webhooks/stripe, webhooks/safepay, contact, newsletter, revalidate
├─ collections/          Programs, ProgramVariants, Regions, Prices, Testimonials, Faqs, Pages,
│                        Users, Orders, Memberships, Freezes, IntakeForms, Resources,
│                        WorkoutSessions, CheckIns, MealLogs, Announcements, ContactMessages,
│                        Subscribers, Media, SiteSettings (global)
├─ components/           ui/ (shadcn), sections/ (Hero, HowItWorks, ProgramGrid, ...),
│                        motion/ (Reveal, Waves, Bubbles, Petals), carousel/, forms/
├─ lib/                  pricing.ts (region detect + lookup), payments/, auth.ts, email/, r2.ts
├─ seed/                 ← docs/seed/*.json imported by a seed script
└─ styles/               tokens.css, themes/*.css
```

## 3. Phases & milestones

| Phase | Scope | Deliverables | Rough effort* |
|---|---|---|---|
| **0. Decisions** | Approve the theme (see artifact), confirm prices, gateways, emails, live vs recorded sessions, recipe e-book strategy | Signed-off design direction + answers to §5 | 2–3 days |
| **1. Foundation** | Repo, Next + Payload + DB, tokens/themes, layout (header, footer, mobile nav), seed import | Running skeleton with real data | 3–4 days |
| **2. Marketing site** | Home (all sections), Programs + program detail, About (with gallery), How It Works, Testimonials, FAQ, Contact (form + email), legal pages, 404, SEO metadata + JSON-LD, sitemap, redirects | Feature-complete public site | 8–10 days |
| **3. Commerce** | Region detection + switcher, price lookup, checkout (Stripe + PK gateway + manual transfer), auth (OTP), order + membership creation, receipts, Terms acceptance, intake form | People can buy and get onboarded | 6–8 days |
| **4. Members v1** | Dashboard shell, Overview, Diet Plan (coach uploads PDF), E-books, Workouts (4-week plan), Membership (dates, freeze request), Support | Paying members get value | 6–8 days |
| **5. Members v2** | Weekly check-ins (photos, measurements), meal log, progress charts, coach review queue, announcements, reminders | Full coaching loop | 6–8 days |
| **6. Launch** | Content QA, a11y/perf pass, analytics + consent, DNS cut-over from Wix, Shopify redirects, monitoring | Live on fattofitwithz.com | 2–3 days |

*Single experienced full-stack developer; adjust for team size. Phases 1–3 + 6 (≈ 4–5 weeks) give a site that fully replaces Shopify; phases 4–5 can follow.

## 4. Pricing logic (reference implementation spec)

```
region = cookie('ftf_region') ?? geoCountryToRegion(request.geo.country) ?? 'usa'
price(variant, region) = Prices[region][variant.durationMonths]   // seed/pricing.json
display = region.format.replace('{n}', formatNumber(price.amount, region))
compareAt = same for price.compareAt (strikethrough)
checkout currency = region.currency   (if the gateway supports it; else fallback USD with notice)
```
Map countries to regions: US + all unlisted → `usa`, CA → `canada`, AE → `uae`, SA → `saudi`, QA → `qatar`, IN → `india`, PK → `pakistan`, AU → `australia`. The client may want more GCC countries (Kuwait, Bahrain, Oman) and the UK, so the model supports adding regions in the CMS.

## 5. Open questions for the client (blockers marked ●)

1. ● Confirm the pricing sheet is final (the live site shows different 4-month prices).
2. ● Charge in local currency (recommended) or USD?
3. ● Which payment methods per country? Do you already have Stripe, Safepay, JazzCash or a bank account for transfers?
4. ● Single public email: info@fattofitwithz.com (needs the domain fixed) or the Gmail address?
5. ● Effective date for legal pages; is a lawyer review needed?
6. Is Premium Signature really the same price as Total Transformation? What makes it "premium" (1-on-1 calls? frequency?)
7. Live workout sessions: offered? In which programs? (The banner says live; the site says recorded.)
8. Freeze rules: max duration, how many times, which programs.
9. Upgrade rules: pay the difference?
10. Recipe e-book: members-only, a paid standalone product, or a free lead magnet?
11. Member dashboard: which panes are must-have at launch? Who uploads diet plans (the coach only)?
12. Keep "Powered by 10X" credit?
13. Urdu version needed?
14. Floating WhatsApp button on all pages?
15. Consent for transformation photos, and the 2 new transformation images.

## 6. Acceptance checklist (QA before launch)

**Parity with the current site**
- [ ] All 7 nav pages exist with the content from 05 (copy fixes applied)
- [ ] 6 programs with correct durations, bullets and focus areas; Fat Loss has 2 durations
- [ ] 8 regions with sheet prices and strikethrough; the region persists across pages and reloads
- [ ] 9 before/after cards + the 2 new ones; 9 video testimonials; 2 reviews
- [ ] 25 FAQs on /faq (3 categories) + 5 on the homepage
- [ ] Founder section with 3 photos, About page with qualifications and expertise
- [ ] WhatsApp links everywhere use `+19176952569`, plus the prefilled message where specified
- [ ] Footer on **every** page with legal links, socials, email, newsletter
- [ ] Old URLs 301 to new ones (08 §2)

**Defects fixed (09)**
- [ ] "Choose Program" → program page / checkout (no preview links)
- [ ] One contact form, with success and error states
- [ ] Testimonials slider/grid works; all items reachable
- [ ] No placeholder "[Insert Date]"; one email
- [ ] Recipe e-book not publicly downloadable (unless the client chooses lead magnet)

**Commerce**
- [ ] Buy each program in USD and PKR (test mode); order + membership created; receipt email
- [ ] Terms/refund acceptance stored with the order
- [ ] Failed / cancelled payment handled; duplicate webhook is idempotent
- [ ] Manual bank transfer → admin approve → membership active

**Members**
- [ ] Email + password login with Forgot password; dashboard only for logged-in members; expired members see a renew prompt
- [ ] Signed URLs for e-books and plans; workout videos play
- [ ] Freeze request → admin approve → end date extended

**Quality**
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100 on Home, Programs, Program detail
- [ ] axe: 0 serious/critical issues; keyboard-only navigation works incl. carousels and dialogs
- [ ] Contrast AA on all text/buttons (pink adjusted per 02)
- [ ] `prefers-reduced-motion` disables decorative motion (bubbles, waves, parallax)
- [ ] 375px, 768px, 1280px, 1440px layouts: no horizontal scroll
- [ ] Meta title/description, OG image, favicon, JSON-LD (Organization, Person, Service/Offer, FAQPage, BreadcrumbList) validated
- [ ] sitemap.xml excludes dashboard/checkout; robots.txt correct
- [ ] Analytics events fire only after consent
- [ ] Forms rate-limited + Turnstile; CSP headers set
