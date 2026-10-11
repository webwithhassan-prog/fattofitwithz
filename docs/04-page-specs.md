# 04 — Page Specifications

Section order, layout and behaviour per page. Copy is summarised here; the **full verbatim copy** is in `reference/content/<page>.md` and [05-content-inventory.md](05-content-inventory.md). Component references (C1…C14) point to [03-components.md](03-components.md).

All pages: Header (C1) at the top. Footer (C2) **should** be on every page; today it is homepage-only.

---

## 1. Home `/`

| # | Section | Spec |
|---|---|---|
| 1 | **Hero banner** | Full-width image `hero-banner.png` (1998×787; aspect kept via padding-bottom 39.39% on all breakpoints, so it shrinks to ~148px tall on a 375px phone). **All hero text is inside the image:** "Your Health in *Safe Hands.*" (navy + pink script, brush underline), *"Personalized fitness programs, expert guidance and real results — all in one place."*, and 4 icon features (Personalized Programs · Nutrition Guidance · Expert Support · Real Transformations); right side is a photo of the coach at a desk. `alt=""`. A Dawn "Get Started" button exists but is hidden with CSS and has no link. Fade-in on load. **Rebuild:** live HTML text over a photo (left text / right photo; stacked on mobile), real H1 "Your Health in Safe Hands.", a working "Get Started" CTA → Programs, and the 4 features as an icon row. Use a responsive `<picture>` with an art-directed mobile crop. |
| 2 | **How it works** | Eyebrow "HOW IT WORKS" (35px pink, ls 4px) → italic H2 "Simple Steps to a Healthier You" → 2×2 step cards (C6): 01 Choose Your **Plan** / "Pick the program that fits your goals." / [About Us →]; 02 Get Your **Plan** / "We create a personalized plan just for you." / [Start Your Plan →]; 03 Follow & **Track** / "Follow the plan, track your progress easily." / [How It Works →] (mirrored); 04 See **Results** / "Stay consistent and see real results." / [Your Transformation →] → ♡ divider. Section padding 45/20/10px. |
| 3 | **Choose Your Program** | Program slider with country price selector (C5), 6 cards, 3 visible. |
| 4 | **What Our Clients Say** | Eyebrow "REAL PEOPLE. REAL EXPERIENCES." (17px, 900, **gradient text** #FF65C5→#ED1970→#FF65C5) → H2 "What Our Clients **Say**" (40px) → *"Hear directly from our clients about their experiences, progress and journey with Fat to Fit With Z."* → carousel of 9 Instagram reel embeds (C8), 3 visible → dots → button "View More Testimonials on Instagram" → instagram.com/fat_to_fitwithz. Font Arial in this section. |
| 5 | **Transformations That Inspire** | Eyebrow "REAL PEOPLE. **REAL RESULTS.**" (24px, 900) → H2 "Transformations That **Inspire**" (30px Arial) → *"Our members are achieving their goals and living healthier, happier lives."* → looping slider of 9 before/after cards (C7), 3 visible → generated dots. |
| 6 | **FAQ + WhatsApp** | 2-column grid 1.25fr / .75fr (stacked on mobile). Left: bordered box, H2 "FREQUENTLY ASKED QUESTIONS" (28px pink uppercase), 5 accordion items (single-open, C9): How does the program work? · Do I need gym equipment? · Can I follow the diet if I have allergies? · Can I cancel anytime? · How will I get support?. Right: "Have Questions?" WhatsApp box (C10). Note: the FAQ answer text is 19px, larger than the 15–16px question text, which looks inverted. |
| 7 | **Founder Message** | C11. |
| 8 | **Footer** | C2. |

Section paddings (custom liquid wrappers): How it works 0, Programs 0, Testimonials 0?, Transformations 16px, FAQ 8/12px, Founder 12px, Footer 0 (×0.75 on mobile).

---

## 2. Programs `/pages/programs`

- Dawn page shell with visible H1 "Programs" (narrow container ~726px!), then the **same Program component (C5)** pasted into the page body.
- Because it sits inside `page-width--narrow`, the slider is cramped on desktop. **Rebuild:** full-width layout.
- Has its own copy of the price JS (`reference/js/pages_programs.js`, identical to the homepage).
- **Rebuild additions** (recommended, the client should confirm):
  - a comparison table (duration, follow-ups, e-book, workouts, health-condition support)
  - a "Not sure which program?" WhatsApp CTA
  - the FAQ snippet
  - the medical disclaimer line

---

## 3. About `/pages/about-us`

Narrow RTE page, H1 "About Us". Content blocks, each a pink H2 label + bold paragraph(s):
1. **FAT TO FIT WITH Z** (pink italic) — "Helping Women Build Healthier, Stronger & More Sustainable Lifestyles" + platform description (2 paragraphs).
2. **OUR MISSION** — "…help women achieve their health and fitness goals without extreme restrictions…"
3. **ABOUT THE COACH** — "I am a passionate Nutrition Professional and Certified Fitness Coach…"
4. **QUALIFICATIONS** — B.Sc.; Master's Degree in Dietetics; Advanced Qualification in Clinical Nutrition; Professional Certification in Hormonal Health & Hormonal Imbalance Management; Certified Fitness Coach.
5. **AREAS OF EXPERTISE** — 7 bullets (Clinical Nutrition & Dietetics; Weight Management — Healthy Loss & Gain; PCOS & Hormonal Health; Diabetes & Blood Sugar; Cholesterol & Fatty Liver; Uric Acid & Menopause; Lifestyle Modification & Fitness Coaching).
6. **OUR APPROACH** — 2 sentences.
7. **"Our goal is to help women develop sustainable routines that combine:"** — Balanced nutrition · Regular movement · Consistency · Healthy lifestyle habits · Personalized support.
8. **A HEALTHIER LIFESTYLE STARTS WITH THE RIGHT GUIDANCE** — paragraph.
9. **START YOUR JOURNEY** — "Choose the program that fits your goals…"
10. **EXPLORE OUR PROGRAMS** — heading only, not a link ⚠.

No images on the page. **Rebuild:**
- a designed About page: coach photo (reuse the founder images); mission and approach blocks; qualifications as badges or cards; expertise as an icon grid
- a CTA button to Programs
- the founder's name (Zaineb Danish), which appears on the homepage but not on About

---

## 4. How It Works `/pages/how-it-works`

Narrow RTE page. Intro "HOW FAT TO FIT WITH Z WORKS" + subheading/paragraph, then 5 steps (pink H2 "01 — CHOOSE YOUR PROGRAM", "02 — JOIN FAT TO FIT WITH Z", "03 — GET YOUR PLAN", "04 — FOLLOW & STAY CONSISTENT", "05 — GET ONGOING SUPPORT", each with a 1–2 line description), then **"YOUR JOURNEY"**, a vertical flow of the 5 step names separated by pink "↓" glyphs, then "READY TO START?" + line + "EXPLORE OUR PROGRAMS" (not a link ⚠).
Note: the homepage shows **4** steps with different names than this page's **5** steps. Align them, or keep both on purpose.
**Rebuild:** numbered timeline/stepper component (vertical on mobile, horizontal on desktop), with the CTA as a real button.

---

## 5. Testimonials `/pages/transformations`

Visible Dawn H1 "Transformation/Testimonial" (rename to "Transformations & Testimonials") followed by custom content `#ftf-page`:
1. **Hero** (padding 70/20/60, centred): H1 "REAL PEOPLE. REAL RESULTS." (42px pink) · H2 "Transformations That Inspire" (25px pink) · p *"Real journeys. Real progress. Real results. Discover the transformations of people who trusted Fat To Fit With Z and committed to changing their lives."* ⚠ Two H1s on the page.
2. **OUR TRANSFORMATIONS** (34px pink) + *"Our members are achieving their goals and living healthier, happier lives."* → slider of the same 9 before/after cards (larger: stars 30px, badges 45px tall), 3 / 2 / 1 per view. ⚠ **The arrows do nothing**: no script is attached to this page (verified in the browser), so only the first 3 cards can be seen.
3. **Client experiences panel** (bg #FAF5F7, rounded): eyebrow "REAL CLIENT EXPERIENCES" · H2 "More Than Just Transformations" · intro · **CLIENT REVIEWS**: 2 pink pill buttons "READ CLIENT REVIEW 01/02" (Instagram posts) · **VIDEO TESTIMONIALS**: "Hear directly from clients about their journeys and experiences." + 9 outline pill buttons "WATCH TESTIMONIAL 01–09" (Instagram reels).
4. **Final CTA**: H2 "YOUR JOURNEY CAN START TODAY" + paragraph + pink pill "EXPLORE OUR PROGRAMS" → `/pages/programs`.

**Rebuild:**
- show all transformations as a responsive grid (better than a slider on a dedicated page), with a lightbox
- turn video testimonials into thumbnail cards (facade embeds) instead of 9 bare buttons
- turn the 2 written reviews into quote cards (needs the review text and screenshots from the client)
- add Review/AggregateRating schema only if the reviews are genuine and on-page

---

## 6. FAQ `/pages/faq`

Dawn H1 hidden with CSS. Custom `#ftf-faq-page` (font Arial):
1. **Hero** (gradient #FFF7FA→#FFF→#FFEAF1, padding 80px): eyebrow "FREQUENTLY ASKED QUESTIONS" · H1 "How Can We **Help?**" (52px) · sub *"Find answers to common questions about our programs, memberships, workouts, diet plans, payments and support."*
2. **Category "General Questions"** (H1 28px ⚠, should be H2) — 10 items
3. **"Membership FAQs"** — 6 items (marked up as a plain H2 *inside* the list rather than as a category title, so it looks inconsistent)
4. **"Payments & Support"** — 8 items (one question, *"How often will my progressbe checked?"*, has a typo and broken markup: it is rendered as plain text, not an accordion)
5. **"Still have questions?"** item, then **Support band** (bg #FFF6F9, padding 70px): H2 "Still Have Questions?" · *"W e're here to help…"* (typo "W e're") · pill "CHAT ON WHATSAPP".

Accordions: native `<details>`, border 1px #EEE, radius 14px, 12px gap, question 16px/700 with padding 20/60/20/22, pink "+" right (27px), answer 15px/1.75 #666. Max width 950px.
All 25 Q&As are in 05. **Rebuild:** category tabs or anchor chips at the top, search/filter, FAQPage JSON-LD, single accordion component.

---

## 7. Contact `/pages/contact`

Dawn H1 hidden. Custom `#ftf-contact-page` (Arial), then **a second, stock Dawn contact form section below it** (visible, see issues).
1. **Hero** (gradient, padding 85px): eyebrow "GET IN TOUCH" · H1 "We're Here to **Help**" (54px) · *"Have a question about our programs, membership, payments, or your account? Get in touch with the FAT TO FIT WITH Z team."*
2. **Contact grid** (max 1100px, 0.9fr / 1.1fr, gap 45px; stacks ≤800px):
   - **Left info panel** (bg #FFF6FB, radius 24px, padding 38px): H2 "Contact Us" (32px pink) + intro; 3 items with 46px pink circle icons: **W** WhatsApp Support / "Chat with our team directly on WhatsApp." / link; **?** Have Questions? / "…fitness, nutrition, program, and membership-related questions."; **✓** Program Support / "Need help choosing a program?…". Then a white **WhatsApp box** (radius 18px, border #F1D6DF): "Chat With Us" / "For the fastest assistance…" / pill "CHAT ON WHATSAPP".
   - **Right form card** (white, border #EEE, radius 24px, shadow): H2 "Send Us a Message" (32px pink) / "Fill out the form below and our team will get back to you." / form (C13): Name + Email in 2 columns, then Phone / WhatsApp, Subject select, Message, full-width pink pill "SEND MESSAGE". Inputs radius 10px, padding 13/14px, labels 13px/700.
3. **Bottom CTA band** (gradient #FF65C5→#FF3FB7, white, padding 70px): H2 "Prefer WhatsApp?" (38px) · *"For quick assistance, chat directly with the FAT TO FIT WITH Z team on WhatsApp."* · white pill "CHAT ON WHATSAPP".
4. ⚠ **Duplicate Dawn form** (Name, Email*, Phone number, Comment, "Send"). Remove it.

**Rebuild extras:** show the email address too; add a response-time promise ("We reply within 24h"); add a success message after submit (Shopify shows a banner via `?contact_posted=true` on the Dawn form only, and the custom form has no feedback at all).

---

## 8. Desi Weight Loss Recipes `/pages/desi-weight-loss-recipes` (orphan)

H1 "Desi Weight Loss Recipes", "Loading recipes…" text, then PDF.js 3.11.174 (from cdnjs) renders **every page** of `desi-weight-loss-recipes.pdf` (14.3 MB, ~101 pages per the code comment) to `<canvas>`, full width, no toolbar. Renders the first 3 pages immediately, the rest lazily (IntersectionObserver, rootMargin 1200px), DPR capped at 2. Error states: "Unable to load the recipe pages." / "…Please refresh the page."
**Content:** this appears to be the "Exclusive Recipe E-Book with detailed recipes and calorie counts" promised in the Total Transformation Program, yet it is publicly reachable.
**Rebuild decision needed:**
- **(a)** move it behind member login as a dashboard resource (recommended), or
- **(b)** make it a public lead magnet gated by email capture.

In both cases: serve it from protected storage with signed URLs, and consider converting the recipes into real HTML recipe pages (SEO value, Recipe schema).

---

## 9. Member Dashboard `/pages/member-dashboard` (⚠ largely unbuilt: NEW BUILD)

**What's live:** Dawn H1 "Member Dashboard" + an empty RTE + a custom section. If the visitor is not logged in it shows the login gate card (C14). The logged-in markup is rendered server-side only for customers, so it is not visible to us.
**What the JS tells us about the intended logged-in UI** (`reference/js/pages_member-dashboard.js`):
- Container `#ftf-dashboard` with a **sidebar** `#ftf-sidebar`, a mobile **menu button** `#ftf-menu-button` and an **overlay** `#ftf-overlay` (the sidebar becomes an off-canvas drawer ≤750px)
- Nav items `[data-page]` and content panes `[data-content]`, switched client-side; the active pane is reflected in the URL hash (`#dashboard` default; unknown hash falls back to dashboard). In-content links `[data-page-link]` also switch panes.

**What the FAQ promises members get** (the requirements baseline):
- Personalized diet plan
- Recorded workout sessions / workout plan
- E-books and guides
- Progress tracking forms
- Weekly check-in forms
- Daily meal submission forms
- Important program updates
- Membership validity / access period per program
- Freeze and upgrade requests

**Proposed dashboard sections (to validate with the client):**

| Pane | Member sees | Coach/admin needs |
|---|---|---|
| Dashboard | Welcome, current program, start/end dates, days remaining, next check-in due, latest announcements | — |
| My Diet Plan | Current plan (PDF or structured meals), history of versions | Upload/edit plan per client |
| Workouts | Video library filtered by program (recorded sessions), live session schedule/links | Upload videos, assign to programs |
| E-Books | Downloads allowed by program (Recipe e-book, Nutrition & Lifestyle e-book) | Assign resources to programs |
| Weekly Check-in | Form: weight, measurements, progress photos, adherence, notes | Review queue, reply/feedback |
| Meal Log | Daily meal submission (photo + text) | Review/comment |
| Progress | Charts of weight and measurements over time, before/after photos | — |
| Membership | Plan, validity, request freeze, upgrade, invoices | Approve freezes (extend end date) |
| Support | WhatsApp link, message the coach | — |

This is the single largest piece of new work. See 06 for the data model and 10 for phasing.

---

## 10. Legal pages

| Page | Content structure |
|---|---|
| Privacy Policy `/pages/privacy-policy` | "Effective Date: [Insert Date]" ⚠, intro, 12 numbered sections (Information We May Collect; How We Use; Payment Information; Sharing; Health & Dietary Information; Cookies; Data Security; Data Retention; Your Rights → fattofitwithz@gmail.com; Third-Party Services; Changes; Contact) |
| Refund, Cancellation & Freeze `/pages/refund-cancellation-freeze-policy` | Effective date placeholder ⚠, 10 sections (Refund Policy (non-refundable once activated); Change of Mind; Duplicate Payments; Technical Issues; Freeze Policy; Cancellation; Workout Session Changes; Program Results; Exceptional Circumstances; Queries) |
| Terms & Services `/pages/terms-services` | Effective date placeholder ⚠, 15 sections (Our Services; Eligibility (adults); Health & Medical Disclaimer; Workout Participation; Nutrition Services; Program & Account Access (non-transferable); Sessions & Recordings; IP; Payments; Cancellation/Refunds; Technical Requirements; User Conduct; Results Disclaimer; Changes; Contact) |
| Your Privacy Choices `/pages/data-sharing-opt-out` | Shopify-generated US-privacy opt-out text (mentions advertising partners and GPC). **Not accurate for our stack.** Rewrite or drop based on the actual tracking we add. |
| Shopify `/policies/privacy-policy` | Separate auto-generated Shopify policy. Drop it, keep one privacy policy. |

The bullet lists in the legal text are flattened into single lines ("- Name - Email address - …"). **Rebuild:**
- a proper list layout
- a sticky table of contents
- a real effective date
- one contact email
- a checkbox to accept Terms + Refund policy at checkout (the policy text says "By purchasing a program, you acknowledge…")

---

## 11. Product pages `/products/{handle}` (stock Dawn)

Layout: Dawn main-product, with the gallery (1 image = card screenshot, zoom modal) on the left and info on the right:
- vendor "Fat ToFit" (typo, missing space)
- title
- price with compare-at strikethrough and a "Sale" badge
- variant radio pills (Fat Loss only: "2 Month" / "4 Month")
- quantity selector (pointless for a coaching program)
- "Add to cart"
- "Couldn't load pickup availability" (error text visible)
- description (body HTML)
- Share button

Then an empty "disclosures" section and "You may also like" related products (Shopify recommendations, limit 4).
Product JSON-LD: `ProductGroup` + `Product` variants with `Offer` (USD, InStock), category "Fitness & Workout Programs", brand "Fat ToFit".
⚠ Descriptions in the product data contain mojibake bullets `â€¢` (mis-encoded "•"). The storefront renders them correctly, but the export doesn't, so clean them on import.
**Rebuild as a "Program detail" page:**
- hero with name, duration and price in the selected country
- the duration selector (Fat Loss)
- "Main benefits" ✓ list
- "Who is this program for?"
- "How the program works"
- what's included (e-book, follow-ups)
- testimonials strip and FAQ
- a sticky "Join now" button → checkout

Remove the quantity field, the pickup-availability text and the "Share" clutter.

---

## 12. Collection, cart, search, blog, 404

| Page | Today | Rebuild |
|---|---|---|
| `/collections/all` | Dawn grid of 6 product cards with filter (availability, price $0–69) and sort (9 options) | Not needed; redirect to `/programs` |
| `/collections/frontpage` | 1 product | Redirect to `/programs` |
| `/cart` | Dawn cart: "Your cart is empty", Continue shopping, "Have an account? Log in to check out faster", estimated total, Check out | Most likely replaced by **direct single-program checkout** (one program per order). Keep a cart only if multi-buy is required. |
| `/search` | Dawn search | Not needed (small site) |
| `/blogs/news` | Empty "News" | Optional future blog (the FAQ and recipe content would be good SEO). Don't ship an empty blog. |
| 404 | "404 / Page not found / Continue shopping" → /collections/all | Branded 404 with links to Home, Programs, Contact, WhatsApp |
