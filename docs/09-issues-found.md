# 09 — Defects & Issues Found on the Live Site

Severity: 🔴 broken / revenue-impacting · 🟠 significant · 🟡 minor/polish. **None of these should be carried into the rebuild.**

## Functional

| # | Sev | Issue | Evidence |
|---|---|---|---|
| F1 | 🔴 | All 6 "CHOOSE PROGRAM" buttons (Home + Programs page) link to `ryokwpssiwpa40re-78685077659.shopifypreview.com/products_preview?preview_key=…`. Preview links expire, so **buyers cannot reach the products**. | `reference/html/home.html`, `pages_programs.html` |
| F2 | 🔴 | Regional prices are display-only. Checkout charges USD, so a PK visitor sees "Rs. 4,000" and pays $15. | `reference/js/home.js`; `shop-meta.json` currency USD |
| F3 | 🔴 | The footer exists only on the homepage. Every other page has no footer, no legal links, no contact details. | grep `ftf-footer` = homepage only |
| F4 | 🟠 | The Testimonials page slider arrows do nothing (no script), so only 3 of the 9 transformations are visible. | Verified in the browser: transform stays `none` after clicking |
| F5 | 🟠 | Contact page renders **two** contact forms (custom + Dawn default), both with `id="ContactForm"`. | Verified in the browser: both visible |
| F6 | 🟠 | The custom contact form gives no success/error feedback after submit. | Form posts to `/contact#ContactForm` with no message element |
| F7 | 🟠 | The cart icon is hidden by CSS, and so is the search, so a user who adds a program to the cart cannot find the cart again except through the notification popover. | Header style override |
| F8 | 🟠 | The Member Dashboard is not linked anywhere (not in the nav or the account menu), and its logged-in content is unknown or unfinished. | `/pages/member-dashboard` |
| F9 | 🟠 | The paid "Recipe E-Book" PDF is publicly accessible (unlinked page + public CDN URL), 14 MB. | `/pages/desi-weight-loss-recipes` |
| F10 | 🟡 | The homepage testimonials carousel has 7 hard-coded dots but 9 slides on mobile (1 per view), so the last 2 positions have no dot. | `home.js` part 2 |
| F11 | 🟡 | The hero "Get Started" button is hidden and has no link. The hero has no clickable CTA. | image_banner section |
| F12 | 🟡 | "EXPLORE OUR PROGRAMS" on About and How It Works is a heading, not a link. | RTE content |
| F13 | 🟡 | The product page shows "Couldn't load pickup availability" and a quantity selector on a digital service. | Dawn product template |
| F14 | 🟡 | The country price selector resets to USA on every page load; no persistence or geo-detection. | `home.js` |
| F15 | 🟡 | The FAQ item "How often will my progressbe checked?" is broken markup (plain text, not an accordion). | `pages_faq` |
| F16 | 🟡 | Shopify policy URLs `/policies/refund-policy`, `/terms-of-service`, `/shipping-policy`, `/contact-information` return 404, and a second, auto-generated `/policies/privacy-policy` exists. | curl |
| F17 | 🟡 | Empty blog `/blogs/news` and the thin `/collections/frontpage` are indexed in the sitemap. | sitemap |
| F19 | 🔴 | Fat Loss **4-month** display prices on the live site don't match the client's pricing sheet in 6 regions (CA, UAE, QA, IN, PK, AU), e.g. Pakistan Rs 13,600 vs sheet Rs 12,500. | `pricing_sheet.pdf` vs `home.js` (see 05) |
| F20 | 🟡 | Workout plan PDF: Week 3 Day 4 and Day 5 link the same video; Week 4 Day 3 and Day 4 link the same video. | `seed/workouts-4-week.json` warnings |
| F21 | 🟡 | Two Instagram transformation posts in the client's list (DaYP7krsqU4, DZUofzCsSDa) are not on the site. | `fat_to_fit_instagram_links_v2.pdf` |
| F22 | 🟡 | The site hosts an older 14 MB recipe PDF; the client has a newer edition (v3, 21 MB, 68 recipes). | `some more data/desi-weightloss-recipes-3.pdf` |
| F23 | 🟠 | Transformation images are mixed aspect ratios (9:16 posters, squares, 560×612), but the site forces them into 1:1 `object-fit:cover`, so poster headlines and client quotes are cropped off. | `assets/original/transformation-*` |
| F24 | 🟠 | The site overlays its own BEFORE (left) / AFTER (right) pills, but most images already carry baked-in labels (duplicated). In **transformation-08 the slimmer photo appears on the LEFT**, so the overlay may label it backwards. **Verify with the client.** | visual check |
| F25 | 🟠 | Card "98 → 62 KG • −36 KG" uses a poster ("Pallvi's Powerful Postpartum Transformation") whose client message says *"lost near about 10 kg"*. Verify the weight label. | transformation-02 |
| F26 | 🟡 | Transformation posters include client first names and screenshots of private chats, so explicit written consent is needed. One image (transformation-07, "Diet Transformation") shows a male client on a women-focused site; confirm it should be shown. | visual check |
| F18 | 🟡 | The brand domain fattofitwithz.com points to Wix and returns 404, while the footer email uses that domain. | curl (server: Pepyaka) |

## Content / copy

| # | Sev | Issue |
|---|---|---|
| C1 | 🟠 | All 3 legal pages show "Effective Date: [Insert Date]". |
| C2 | 🟠 | Two different contact emails: info@fattofitwithz.com (footer) vs fattofitwithz@gmail.com (legal). |
| C3 | 🟠 | Premium Signature costs the same as Total Transformation ($69) despite being the premium tier, and "6 months minimum" suggests monthly pricing. Needs clarification. |
| C4 | 🟡 | Homepage "How it works" has 4 steps; the How It Works page has 5, with different names. |
| C5 | 🟡 | Brand name spelled 5+ ways (Fat To Fit With Z. / Fat to Fit With Z / FAT TO FIT WITH Z / Fat ToFit / FAT-TO-FITWITHZ). |
| C6 | 🟡 | "Health Concerns **Programs**" (product title) vs "Program" elsewhere. |
| C7 | 🟡 | Nav label "Testimonial" (singular); page H1 "Transformation/Testimonial". |
| C8 | 🟡 | Typos: "W e're", "progressbe", "Terms of Services". |
| C9 | 🟡 | Footer "©️ 2025" while the site launched in Sep 2026; the emoji © renders inconsistently. |
| C10 | 🟡 | Product descriptions contain mis-encoded bullets (`â€¢`) in the data. |
| C11 | 🟡 | Legal bullet lists flattened into one line ("- Name - Email address - …"). |
| C12 | 🟡 | All RTE body text is bold (written as `<h4><strong>`). |
| C13 | 🟡 | Product handles don't match the names (`fat-to-fit-premium-plan` = Diabetes Control). |
| C14 | 🟡 | Variant labels "2 Month" / "4 Month" (should be plural). |
| C15 | 🟡 | "Your Privacy Choices" page describes ad-partner data sharing that doesn't actually happen (no pixels installed). |
| C16 | 🟡 | The founder's name doesn't appear on the About page, and the About page has no photo. |

## Design / UX

| # | Sev | Issue |
|---|---|---|
| D1 | 🟠 | Hero copy is baked into the image, so on mobile it becomes unreadably small (~148px tall banner). |
| D2 | 🟠 | Two button colours (#D82F68 on Dawn buttons vs #FF65C5 custom) and two fonts (Assistant vs Arial). |
| D3 | 🟠 | Programs page slider is squeezed into a ~726px narrow container. |
| D4 | 🟡 | Logo PNG has ~60% transparent padding, so the logo looks tiny in the header. |
| D5 | 🟡 | Home FAQ answers (19px) are larger than the questions (~15–16px). |
| D6 | 🟡 | Home step cards rely on absolute positioning. Mobile text is 10px and buttons 9px; card 03 is mirrored differently on mobile. |
| D7 | 🟡 | Sections have 0–16px vertical spacing, so blocks feel cramped against each other. |
| D8 | 🟡 | Product images are screenshots of the pricing cards (show $27 only for Fat Loss, USD only). |
| D9 | 🟡 | Instagram cards are forced to a fixed 680px height (cropping or white space depending on the post). |
| D10 | 🟡 | No favicon. |
| D11 | 🟡 | Three different "pink-dark" hover colours (#C91652, #B7194A, #E94DB0, #FF3FB7). |

## Accessibility, SEO, performance

See [08](08-seo-a11y-performance.md): contrast failures, missing meta descriptions, multiple H1s, empty `sameAs`, 9 Instagram iframes, 1–1.7 MB PNGs, etc.

## Platform/process

| # | Issue |
|---|---|
| P1 | All custom code is pasted into theme sections and page bodies (no version control). Programs markup and JS are duplicated in 2 places. |
| P2 | No analytics or conversion tracking installed. |
| P3 | Payment gateway setup unknown or possibly not done (`shopify_pay_enabled_card_brands: []`). |
