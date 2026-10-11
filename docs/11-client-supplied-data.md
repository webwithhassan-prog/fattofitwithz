# 11 — Client-Supplied Data ("some more data" folder)

Analysed 2026-10-06. Originals are in `docs/some more data/`; copies, extractions and crops are in `docs/assets/client-supplied/`; machine-readable versions are in `docs/seed/`.

| File | What it is | What we did with it | Seed file |
|---|---|---|---|
| `FAT_TO_FIT_WITH_Z_Programs.pdf` (4 pp) | "Professional Nutrition & Fitness Portfolio": About Me, qualifications and expertise, programs overview table (name / focus area / duration), detailed specs for all 6 programs | Treated as the **canonical program copy**. It adds a **"Focus area"** one-liner per program (useful for cards and comparison tables) and a 6th Kickstart benefit ("Improved energy levels and structured daily routine") plus a different Kickstart summary than Shopify. | `seed/programs.json` |
| `pricing_sheet.pdf` (1 p) | International Pricing & Discount Sheet: 8 regions × 5 durations, standard vs discounted | **Source of truth for prices.** Found 6 mismatches on the live site (4-month column). | `seed/pricing.json` |
| `Fat_to_fitwithz_FAQs (2).pdf` (4 pp) | All 25 FAQs in 3 groups (General 1–10, Membership 11–16, Payments & Support 17–25) | Canonical FAQ text; fixes the live site's broken Q20 ("progress be checked") | `seed/faqs.json` |
| `fat_to_fit_instagram_links_v2.pdf` (1 p) | 13 categorised Instagram links: 2 Transformation posts, 9 Video testimonials, 2 Client reviews | **2 transformation posts are new** (not on the site): `p/DaYP7krsqU4`, `p/DZUofzCsSDa` | `seed/testimonials.json` |
| `Workout_Recorded_Sessions_4_Weeks.pdf` (4 pp) | 4-week recorded workout plan: 6 days/week (Yoga & Stretches, Upper Body, Lower Body, Cardio, Abs & Belly, Full Body), one YouTube link per day = 24 sessions | Structured into week/day/video. **2 duplicate links** found (W3 D4=D5, W4 D3=D4). This shows the **Member Dashboard "Workouts" pane** needs a week → day → video structure. | `seed/workouts-4-week.json` |
| `desi-weightloss-recipes-3.pdf` (101 pp, 21 MB) | **New edition** of the recipe e-book: "Desi Weightloss Recipes — A 1200 kcal a day plan", First Edition 2026, © Zaineb Danish. 68 recipes. | Catalogued below. Copied as `assets/client-supplied/desi-weightloss-recipes-v3.pdf`. | — |
| `PDF Gallery_20260908_163121.pdf` (12 pp) | 12 professional photos of the coach | Extracted to `assets/client-supplied/gallery/gallery-p01…p12-1.jpg` (1080–1620px), contact sheet `gallery-contact-sheet.jpg` | — |
| `logo.png` (1536×1536) | Higher-resolution logo (pink ring + "FAT-TO-FITWITHZ") on a transparent background with large padding | Auto-cropped to `assets/client-supplied/logo-cropped.png` (610×613). Still a raster image, so **request an SVG / vector** from the designer. | — |

Legal texts pasted in chat are saved with proper lists at `reference/content/legal-clean/` (privacy-policy, refund-cancellation-freeze-policy, terms-and-services). All still say **"Effective Date: [Insert Date]"**.

---

## 1. Gallery photos: usage plan

| File | Scene | Suggested use |
|---|---|---|
| gallery-p01 | Coach at an office desk, black abaya, laptop (the same shoot as the hero) | Hero (live-text version), About hero |
| gallery-p02 | Office desk, floral dupatta, certificates on the wall | About → "About the coach" (the certificates support credibility) |
| gallery-p03 / p04 / p08 | Outdoor standing portraits, garden café | Founder slider, Contact page, testimonials CTA |
| gallery-p05 | Desk in a classic interior, typing | How It Works, step 2 "Get your plan" |
| gallery-p06 | Holding a fruit platter | Programs / nutrition section, recipe e-book promo |
| gallery-p07 | Pink outfit holding a tablet | Member Dashboard promo ("track your progress"), app-like section |
| gallery-p09 | Speaking with a mic beside a "Stronger Every Day" roll-up banner | **"Talks & Events"** strip on About |
| gallery-p10 / p12 | Receiving a shield/award on stage (Lahore Press Club) | **"Recognition"** section: strong trust signal |
| gallery-p11 | At a podium, Lahore Press Club | Talks & Events |

**Copy found on the event banner (p09)**, usable as marketing copy once the client approves:
- "Stronger **Every Day**"
- "Live workouts. Personalized diet. Sustainable lifestyle."
- "Right plan. Right support. Better you."
- **"5+ YRS of serving transformations"** (a trust stat)
- "Zaineb Danish — Health Coach & Nutritionist"
- **Live Workout Sessions:** Fun & Effective Workouts · For All Fitness Levels · Real-time Guidance · Stay Motivated · Build Strength & Endurance
- **Personalized Diet Plans:** Tailored to Your Goals · Balanced & Sustainable · Easy to Follow · Nourish Your Body · Healthy Habits, Lasting Results
- "Expert Guidance · Personal Support"

> Note: the banner advertises **live** workout sessions, while the site and FAQ talk about **recorded** sessions, and the Terms mention both. Ask the client whether live sessions are offered and in which programs.

---

## 2. Recipe e-book v3: structure

**Front matter:** cover (Thyroid / PCOS / Diabetes / Hypertension / Uric acid / Budget friendly badges) · title page · "Your Coach" letter · Welcome · How to use this book (4 rules + daily shape 400/400/400 kcal) · Medical note · Portion size guide · Protein portion guide · Measuring without a scale (palm / fist / cupped hand / thumb) · The desi pantry · Zaineb's multigrain flour blend · Contents.

| # | Chapter | Recipes | kcal | Examples |
|---|---|---|---|---|
| 01 | Breakfast | 9 | ≈400/day | Multigrain Bread & Egg Omelette, Oats Porridge, Besan Chilla with Mint Chutney, Shami Kabab with Multigrain Bread, Low-Calorie Stuffed Methi Paratha |
| 02 | Lunch | 12 | ≈400/day | Daal Chawal, Chicken Karahi with Roti, Chicken Pulao, Mutton Shinwari, Chana Pulao, Chicken Shawarma |
| 03 | Protein-Rich Cheelas | 5 | 300–340/serving | Ragi Vegetable Cheela, Moong Dal Cheela, Paneer Stuffed Besan Cheela |
| 04 | Vegetarian Dinner | 12 | ≈400/day | Dal Karela, Paneer Bhurji, Moong Dal Khichdi, Soya Chunks Curry, Rajma Rice |
| 05 | Non-Vegetarian Dinner | 10 | ≈400/day | Chicken Biryani (Low-Cal), Air-Fried Pepperoni Pizza, Chicken Chilli Dry, Chicken Macaroni |
| 06 | Healthy Snacks | 10 | 100–180 each | Roasted Chickpea Chaat, Roasted Makhana, Chicken Tikka Bites |
| 07 | Detox Waters | 10 | 5–18/litre | Lemon & Mint, Cucumber & Lemon, Coriander Seed |

Back matter: a sample 7-day week, a recipe index, and a closing page. Each recipe page has tags (High Protein, PCOS, Diabetes…), prep and cook time, kcal at the stated portion, and "Z's tip".

**Opportunities:**
1. **Sell it as a standalone digital product** (e.g. $9–12 / Rs 1,500), as a low-cost entry before the programs. The rebuild should support a "digital product" type with instant secure download.
2. **Lead magnet:** offer 5 free recipes as an HTML mini-collection in exchange for an email.
3. **SEO:** publish a few recipes as HTML pages with `Recipe` schema ("low calorie chicken karahi", "PCOS friendly breakfast desi").
4. **Members:** full e-book inside the dashboard, with a searchable recipe browser filtered by tag and meal (it is structured enough to turn into data later).

The old public page (`/pages/desi-weight-loss-recipes`) should **not** be carried over as a public 21 MB PDF.

---

## 3. Impact on the rebuild

- **Pricing model:** implement `price = f(region, durationMonths)` plus compare-at. Programs reference durations, not prices.
- **Program cards:** add the "Focus area" line; show ~~standard~~ discounted; Fat Loss shows both durations.
- **Member Dashboard (phase 2):** the workout library must model *program → week → day → session (video)*. The 4-week plan is the first dataset. It is currently YouTube-hosted, so decide between embedding unlisted YouTube (fast, but leak-prone) and private video hosting.
- **Testimonials:** add the 2 new transformation posts (ask the client for the images).
- **About page:** use the gallery, add Recognition / Talks & Events and the "5+ years" stat.
- **Digital products:** the e-book becomes a sellable SKU (a new entity, or reuse Program with `type: "digital"`).

## 4. Still needed from the client

| Item | Why |
|---|---|
| Vector logo (SVG/AI) | Crisp header, favicon, footer |
| Nutrition & Lifestyle E-Book (Premium Signature) | Promised in the program, not supplied |
| Images for the 2 new Instagram transformations | Gallery |
| Written consent for all transformation photos | Legal (health data) |
| Text and screenshots of the 2 client reviews | On-site social proof |
| Effective date + single contact email for legal pages | Compliance |
| Payment methods per country | Checkout build |
| Whether live sessions exist (banner vs site) | Accurate program copy |
| Freeze rules per package (max days, how many times) | Membership logic |
| Domain/DNS access (fattofitwithz.com is on Wix) | Launch |
| Shopify admin access (orders, customers, dashboard template code) | Migration |
