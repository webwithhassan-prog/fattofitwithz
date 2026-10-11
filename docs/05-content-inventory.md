# 05 — Content Inventory

The verbatim copy of every page is in `reference/content/*.md` (generated from the live HTML). Product descriptions are also in `reference/data/products.json` (`body_html`). This document lists the **structured content** that should become CMS or database records in the rebuild, and flags copy problems.

## Programs & prices

### Catalogue (source: Shopify product data)

| # | Program (display name) | Shopify title | Current handle → **proposed slug** | Duration | Price USD | Compare-at USD | Shopify product / variant id |
|---|---|---|---|---|---|---|---|
| 1 | Kickstart Program | Kickstart Program | `fat-to-fit-basic-plan` → **`kickstart`** | 1 month | **15** | 20 | 9376592887963 / 49635073523867 |
| 2a | Fat Loss Program (2 months) | Fat Loss Program — "2 Month" | `fat-to-fit-standard-plan` → **`fat-loss`** | 2 months | **27** | 40 | 9376597573787 / 49670850707611 |
| 2b | Fat Loss Program (4 months) | Fat Loss Program — "4 Month" | (same) | 4 months | **49** | 80 | 9376597573787 / 49670850740379 |
| 3 | Diabetes Control Program | Diabetes Control Program | `fat-to-fit-premium-plan` → **`diabetes-control`** | 3 months | **39** | 60 | 9376598196379 / 49634460532891 |
| 4 | Health Concerns Program | Health Concerns **Programs** (typo) | `health-concerns-programs` → **`health-concerns`** | 3 months | **39** | 60 | 9383139213467 / 49670945833115 |
| 5 | Total Transformation Program | Total Transformation Program | `total-transformation-program` → **`total-transformation`** | 6 months | **69** | 120 | 9383142424731 / 49671002390683 |
| 6 | Premium Signature Transformation | Premium Signature Transformation | `premium-signature-transformation` → **`premium-signature`** | 6 months minimum | **69** | 120 | 9383145111707 / 49671055868059 |

All are: vendor "Fat ToFit", no SKU, no product type, no tags, `requires_shipping:false`, `taxable:false`, always available (no inventory tracking), one image each (a 722×888 screenshot of the program card).

⚠ **Pricing questions for the client:**
- Total Transformation and Premium Signature cost the same ($69) although Premium is positioned higher. Is the Premium price **per month** ("6 months minimum" suggests a recurring or monthly fee)?
- Are the compare-at prices real "was" prices (consumer-law risk if not)?
- $69 for 6 months: confirm these are the full program prices.

### Regional display prices (hard-coded in JS today)

| Region (select value) | Kickstart | Fat Loss 2M | Fat Loss 4M | Diabetes | Health Concerns | Total Transformation | Premium Signature |
|---|---|---|---|---|---|---|---|
| USA / Global (`usa`, default) | $15 | $27 | $49 | $39 | $39 | $69 | $69 |
| Canada (`canada`) | CAD 21 | CAD 38 | CAD 69 | CAD 54 | CAD 54 | CAD 95 | CAD 95 |
| UAE (`uae`) | AED 55 | AED 99 | AED 179 | AED 145 | AED 145 | AED 255 | AED 255 |
| Saudi Arabia (`saudi`) | SAR 55 | SAR 100 | SAR 185 | SAR 145 | SAR 145 | SAR 260 | SAR 260 |
| Qatar (`qatar`) | QAR 55 | QAR 99 | QAR 179 | QAR 145 | QAR 145 | QAR 255 | QAR 255 |
| India (`india`) | ₹1,499 | ₹2,299 | ₹4,699 | ₹3,299 | ₹3,299 | ₹5,999 | ₹5,999 |
| Pakistan (`pakistan`) | Rs. 4,000 | Rs. 7,000 | Rs. 13,600 | Rs. 9,999 | Rs. 9,999 | Rs. 18,500 | Rs. 18,500 |
| Australia (`australia`) | AUD 22 | AUD 40 | AUD 70 | AUD 58 | AUD 58 | AUD 102 | AUD 102 |

These are **psychological local prices, not FX conversions**. India and Pakistan are deliberately discounted (₹1,499 ≈ $18; Rs 4,000 ≈ $14). Store them as explicit per-region price records, not computed from a rate.

### ★ Source of truth: client pricing sheet (`assets/client-supplied/pricing_sheet.pdf`)

The client's "International Pricing & Discount Sheet" shows that **price depends on duration, not on program**:
- 1 month = Kickstart
- 2 / 4 months = Fat Loss
- 3 months = Diabetes Control and Health Concerns
- 6 months = Total Transformation and Premium Signature

Each cell has a **standard (strikethrough) rate** and a **discounted rate**.

| Region | 1 Month | 2 Months | 3 Months | 4 Months | 6 Months |
|---|---|---|---|---|---|
| USA / Global | ~~$20~~ **$15** | ~~$40~~ **$27** | ~~$60~~ **$39** | ~~$80~~ **$49** | ~~$120~~ **$69** |
| Canada | ~~CAD 28~~ **CAD 21** | ~~CAD 56~~ **CAD 38** | ~~CAD 83~~ **CAD 54** | ~~CAD 111~~ **CAD 68** | ~~CAD 166~~ **CAD 95** |
| UAE | ~~AED 75~~ **AED 55** | ~~AED 150~~ **AED 99** | ~~AED 220~~ **AED 145** | ~~AED 295~~ **AED 180** | ~~AED 440~~ **AED 255** |
| Saudi Arabia | ~~SAR 75~~ **SAR 55** | ~~SAR 150~~ **SAR 100** | ~~SAR 225~~ **SAR 145** | ~~SAR 300~~ **SAR 185** | ~~SAR 450~~ **SAR 260** |
| Qatar | ~~QAR 75~~ **QAR 55** | ~~QAR 145~~ **QAR 99** | ~~QAR 220~~ **QAR 145** | ~~QAR 290~~ **QAR 180** | ~~QAR 435~~ **QAR 255** |
| India | ~~₹1,900~~ **₹1,499** | ~~₹3,800~~ **₹2,299** | ~~₹5,700~~ **₹3,299** | ~~₹7,600~~ **₹4,199** | ~~₹11,500~~ **₹5,999** |
| Pakistan | ~~Rs. 5,500~~ **Rs. 4,000** | ~~Rs. 11,000~~ **Rs. 7,000** | ~~Rs. 16,500~~ **Rs. 9,999** | ~~Rs. 22,000~~ **Rs. 12,500** | ~~Rs. 33,000~~ **Rs. 18,500** |
| Australia | ~~AUD 28~~ **AUD 22** | ~~AUD 56~~ **AUD 40** | ~~AUD 84~~ **AUD 58** | ~~AUD 112~~ **AUD 72** | ~~AUD 168~~ **AUD 102** |

⚠ **The live site's 4-month (Fat Loss 4M) prices differ from the sheet in 6 of 8 regions:**

| Region | Sheet | Live site |
|---|---|---|
| Canada | CAD 68 | CAD 69 |
| UAE | AED 180 | AED 179 |
| Qatar | QAR 180 | QAR 179 |
| India | ₹4,199 | ₹4,699 |
| Pakistan | Rs. 12,500 | Rs. 13,600 |
| Australia | AUD 72 | AUD 70 |

USA and Saudi Arabia match, and all other durations match. **The rebuild uses the sheet** (`seed/pricing.json`); the client should confirm.

This also answers the "compare-at" question: strikethrough prices are the standard rates, so show them on cards as ~~standard~~ **discounted**. Premium Signature uses the 6-month price ($69) per the sheet, so it is not monthly. It is still worth confirming with the client that the premium tier really costs the same as Total Transformation.

### Card copy (short benefits shown on the cards)

| Program | Benefits label | Bullets |
|---|---|---|
| Kickstart | Main Benefits | Personalized nutrition guidance · Sustainable weight-management approach · Improved eating habits and portion control · Guided workouts and accountability · Practical long-term consistency strategies |
| Fat Loss | Main Benefits | Focused fat-loss strategy · Progressive strength training · Targeted workouts for a toned physique · Structured professionally guided workouts · Regular dietitian-led follow-ups · Progress-focused nutrition adjustments |
| Diabetes Control | Main Benefits | Personalized diet plans · Practical home-based meals · Nutrition strategies for insulin sensitivity · Guidance to minimize blood sugar spikes · Regular progress monitoring · Professionally guided workouts |
| Health Concerns | **Covers** | Hormonal Imbalance / PCOS / Thyroid · Menopause · Metabolic / Fatty Liver / Cholesterol · Uric Acid · Personalized nutrition plans · Structured guided workouts |
| Total Transformation | Main Benefits | Complete body transformation · Personalized nutrition · Progressive strength training · Support for health and lifestyle concerns · Regular progress tracking · Exclusive Recipe E-Book included |
| Premium Signature | Main Benefits | Highly personalized transformation strategy · Calculated calorie and nutritional guidance · Focused fat loss and body shaping · Progressive professionally guided workouts · One-to-one follow-ups and monitoring · Exclusive Nutrition & Lifestyle E-Book |

### Long descriptions (product pages)

Each product's `body_html` has the same structure, so model it as fields:
`title`, `duration`, `summary`, `covers[]` (Health Concerns only), `mainBenefits[]` (full-length versions), `whoIsItFor`, `howItWorks`, `includes[]` (e-books).
Example (Fat Loss):
- **summary:** "A structured fat-loss program focused on reducing body fat, improving body composition, and creating a visibly fitter, stronger, and more toned physique through nutrition and progressive training."
- **whoIsItFor:** "Women who are specifically looking to lose body fat, reduce measurements, improve body shape, increase strength…"
- **howItWorks:** "Your calorie requirements and deficit are calculated…"

Full text for all 6: `reference/content/products_*.md` or `reference/data/products.json`. ⚠ The JSON contains mis-encoded characters (`â€¢` → "•", `â€”` → "—", `â€™` → "'"). Fix these on import.

## Testimonials

### Before/after transformations (9; used on Home and Testimonials page)

| # | Image file | Alt (home) | Badge |
|---|---|---|---|
| 1 | transformation-01-62-to-54kg.jpg | Real client transformation from 62kg to 54kg | 62 → 54 KG • −8 KG |
| 2 | transformation-02-98-to-62kg.jpg | …98kg to 62kg | 98 → 62 KG • −36 KG |
| 3 | transformation-03-95-to-75kg.jpg | …95kg to 75kg | 95 → 75 KG • −20 KG |
| 4 | transformation-04-71-to-61kg.png | …71kg to 61kg | 71 → 61 KG • −10 KG |
| 5 | transformation-05-65-to-55kg.png | …65kg to 55kg | 65 → 55 KG • −10 KG |
| 6–9 | transformation-06…09.jpg | Real client before and after transformation | "Before & After" (no weights) |

Every card shows 5 stars. **Client consent:** confirm written consent exists for every photo (health data of identifiable people), and add the "results vary" disclaimer next to the gallery (the Terms §13 already says testimonials are not guarantees).

### Instagram video testimonials (reels)

Home carousel order: C-2gvd4Igmg, C8Cwu-xIejF, C7Wuv7foFBb, C60uZN9IKWV, C6JAVpJIFhy, C6D6WH5IvHc, C6CHH87oNbS, C5KGkSbyGmX, DYmLRlMMByG ("Video 1 moved to last").
Testimonials page order (WATCH TESTIMONIAL 01–09): DYmLRlMMByG, C-2gvd4Igmg, C8Cwu-xIejF, C7Wuv7foFBb, C60uZN9IKWV, C6JAVpJIFhy, C6D6WH5IvHc, C6CHH87oNbS, C5KGkSbyGmX.
URL pattern: `https://www.instagram.com/reel/{id}/`. Strip the `?igsi=` tracking parameters.

### Written client reviews (Instagram posts)

- Review 01: `https://www.instagram.com/p/DYMeHz5DPGa/`
- Review 02: `https://www.instagram.com/p/DXt74AsjJ_w/`

Ask the client for the review text and screenshots so they can be shown on-site.

## FAQs

### Homepage FAQ (5)

1. How does the program work?
2. Do I need gym equipment?
3. Can I follow the diet if I have allergies?
4. Can I cancel anytime?
5. How will I get support?

### FAQ page (24 + closing)

- **General Questions (10):** What is FAT TO FIT WITH Z? · Who can join the programs? (8 bullets) · Are the programs suitable for beginners? · Do I need a gym membership? (5 bullets) · How does the customized diet plan work? · Do I have to eat special or expensive foods? · Is the diet plan the same for everyone? · Do you prescribe supplements or recommend specific brands? · Do I need to submit medical lab reports to join? · What types of workouts are included? (7 bullets)
- **Membership FAQs (6):** What do I get with my membership? (8 bullets) · What are the e-books included? · How do I access my membership? · How long will I have access? · Can I freeze my package or membership? · Can I upgrade my membership?
- **Payments & Support (8):** How can I make a payment? · Is my payment secure? · What kind of support will I receive? · How often will my progress be checked? (broken markup and typo "progressbe") · How quickly will I see results? · What happens if I cannot follow the plan perfectly? · Can I join from another country? · Is this a medical service?
- **Closing:** "Still have questions?" + support band.

Verbatim answers: `reference/content/pages_faq.md`. Homepage FAQ answers: `reference/content/home.md`. Model as an `faq` collection with fields `question, answer(rich), category, showOnHome, order`.

## Founder

- **Name:** Zaineb Danish. **Titles:** "Founder & Nutrition Professional"; About page: "Nutrition Professional and Certified Fitness Coach".
- **Message (4 paragraphs):** in `reference/content/home.md` § Founder Message.
- **Photos:** founder-slide-1/2/3.png.
- **Qualifications and expertise:** About page (see 04 §3).

## Global copy & settings (one config file)

| Key | Value |
|---|---|
| Brand name | Fat To Fit With Z (variants on site: "Fat to Fit With Z", "FAT TO FIT WITH Z", "Fat To Fit With Z.", "Fat ToFit", "FAT-TO-FITWITHZ"). **Pick one.** |
| Tagline (footer) | Personalized nutrition, fitness and lifestyle guidance designed to help you build healthier habits and achieve sustainable results. |
| Hero headline | Your Health in Safe Hands. |
| Hero sub | Personalized fitness programs, expert guidance and real results — all in one place. |
| Hero features | Personalized Programs · Nutrition Guidance · Expert Support · Real Transformations |
| WhatsApp | +19176952569 |
| WhatsApp default message | Hi Fat To Fit With Z, I have a question about your programs. |
| Public email | info@fattofitwithz.com |
| Legal / privacy email | fattofitwithz@gmail.com (⚠ unify) |
| Location | Lahore, Pakistan |
| Socials | see 01 §2 |
| Copyright | © {year} Fat to Fit With Z. All rights reserved. |
| Credit | Powered by 10X (tenx.com.pk). Confirm whether to keep this credit. |
| Target audience | Women (all copy is women-focused) |

## Legal

Privacy Policy, Refund/Cancellation/Freeze, Terms & Services: verbatim in `reference/content/pages_privacy-policy.md`, `pages_refund-cancellation-freeze-policy.md`, `pages_terms-services.md`. All three have **"Effective Date: [Insert Date]"**. The client or a lawyer must supply a date and review the text (health data processing, GDPR/UK for international clients, Pakistan PECA).

## Copy fixes to apply during migration

| Where | Current | Fix |
|---|---|---|
| Product vendor | "Fat ToFit" | "Fat To Fit With Z" |
| Product title | "Health Concerns Programs" | "Health Concerns Program" |
| Nav | "Testimonial" | "Testimonials" |
| Testimonials H1 | "Transformation/Testimonial" | "Transformations & Testimonials" |
| FAQ | "How often will my progressbe checked?" | "How often will my progress be checked?" (and make it an accordion item) |
| FAQ support band | "W e're here to help." | "We're here to help." |
| Footer | "Terms of Services" | "Terms of Service" (page title says "Terms & Services") |
| Footer | "©️ 2025" | dynamic current year |
| Variant names | "2 Month", "4 Month" | "2 Months", "4 Months" |
| About / How it works | "EXPLORE OUR PROGRAMS" as a heading | a button linking to /programs |
| Product descriptions | mojibake `â€¢` | proper characters, and real `<ul>` lists |
| Legal | "[Insert Date]" | a real date |
