# 08 — SEO, Accessibility & Performance

## 1. SEO: current state per page

| Page | `<title>` | Meta description | H1(s) | Problem |
|---|---|---|---|---|
| Home | "Fat To Fit With Z." | **none** | logo `<h1>` with no text (image alt only) | No description, no keyword in title, hero text locked in an image |
| About | About Us – Fat To Fit With Z. | auto-generated from body ("FAT TO FIT WITH Z Helping Women…") | About Us | Auto descriptions |
| Programs | Programs – … | "Choose Your Program Select your country…" | Programs | Thin title |
| How It Works | How It Works – … | auto | How It Works | |
| Testimonials | Transformation/Testimonial – … | auto | **2 H1s** | |
| FAQ | FAQ – … | auto | **3 H1s** (hidden "FAQ", hero, "General Questions") | No FAQPage schema |
| Contact | Contact – … | auto | **2 H1s** | |
| Recipes | Desi Weight Loss Recipes – … | **"Loading recipes..."** | 1 | Zero indexable content (canvas only) |
| Member Dashboard | Member Dashboard – … | none | 1 | Should be `noindex`, but it's in the sitemap |
| Legal pages | ALL-CAPS titles | "Effective Date: [Insert Date]…" | 1 | Placeholder text in descriptions |
| Products | {Program} – … | auto from description | 1 | Main image has no alt (1 per page); legacy slugs |
| Collections / cart / search / blog | Dawn defaults | none | | Thin pages indexed (`/collections/frontpage`, empty `/blogs/news` in the sitemap) |

Other findings:
- `og:description` / `twitter:description` on the homepage = "Fat To Fit With Z." (no real description). `og:image` = the logo padded to 1200×628 on white.
- No favicon is configured (browser default icon shown).
- `theme-color` meta is empty.
- Organization JSON-LD `sameAs` has 9 empty strings.
- No `LocalBusiness`, `Person` (founder), `FAQPage`, `Service`/`Offer`, `BreadcrumbList` or `Review` schema.
- Canonicals point at `6x06mr-b1.myshopify.com`. The real domain is not connected, so **nothing is ranking yet**, which means there are few SEO migration risks.
- `robots.txt` is the Shopify default; the sitemap lists all pages including member-dashboard and the orphan recipes page.

## 2. SEO: rebuild targets

**URL plan + 301 redirects** (keep the old paths working in case links have been shared on social):

| Old | New |
|---|---|
| `/pages/about-us` | `/about` |
| `/pages/programs` | `/programs` |
| `/pages/how-it-works` | `/how-it-works` |
| `/pages/transformations` | `/testimonials` (or `/transformations`) |
| `/pages/faq` | `/faq` |
| `/pages/contact` | `/contact` |
| `/pages/privacy-policy`, `/policies/privacy-policy` | `/privacy-policy` |
| `/pages/refund-cancellation-freeze-policy` | `/refund-policy` |
| `/pages/terms-services` | `/terms` |
| `/pages/data-sharing-opt-out` | `/privacy-choices` (or drop) |
| `/pages/member-dashboard` | `/dashboard` (noindex, auth) |
| `/pages/desi-weight-loss-recipes` | `/dashboard/resources/recipes` (or `/recipes`) |
| `/products/fat-to-fit-basic-plan` | `/programs/kickstart` |
| `/products/fat-to-fit-standard-plan` | `/programs/fat-loss` |
| `/products/fat-to-fit-premium-plan` | `/programs/diabetes-control` |
| `/products/health-concerns-programs` | `/programs/health-concerns` |
| `/products/total-transformation-program` | `/programs/total-transformation` |
| `/products/premium-signature-transformation` | `/programs/premium-signature` |
| `/collections/*`, `/cart`, `/search`, `/blogs/news` | `/programs` (or 410 for search/blog) |
| `/account*` | `/login` / `/dashboard` |

**Per-page metadata** (editable in CMS; write the copy with the client, primary market women in PK, GCC and the diaspora):
- **Home title:** "Online Nutrition & Fitness Coaching for Women | Fat To Fit With Z". Description ≤155 chars.
- **Program pages:** "{Program} – {duration} Online Coaching for Women | Fat To Fit With Z".
- Real H1s, a single H1 per page, logical H2/H3.
- **JSON-LD:** Organization (+ socials), WebSite, Person (Zaineb Danish, `jobTitle`, `alumniOf` if supplied), Service + Offer per program (price per region currency), FAQPage on /faq and the homepage FAQ, BreadcrumbList.
- Favicon set (32, 180 apple-touch, 192/512 manifest) generated from a cropped logo; `theme-color #FF65C5`; proper OG image 1200×630 designed with the hero.
- `sitemap.xml` without auth/thin pages; `robots.txt` disallowing `/dashboard`, `/api`, `/checkout`.
- Image alts for the hero, product images and founder photos (currently the generic "Fat to Fit With Z").
- Content opportunity: recipes as HTML pages; blog on PCOS, diabetes diet, desi weight loss (high-intent local keywords).
- **Health content (YMYL):** show the coach's credentials, add the medical disclaimer on program pages, and date the legal pages.

## 3. Accessibility audit (WCAG 2.1 AA): issues to avoid in the rebuild

| # | Issue | Where |
|---|---|---|
| A1 | White on #FF65C5 ≈ 2.6:1 contrast (fails 4.5:1) | All pink buttons, whole footer, badges, step numbers |
| A2 | Hero text is an image with `alt=""` | Home |
| A3 | Text as small as 9–10px | Home step cards on mobile (p 10px, buttons 9px), footer copyright 10–11px, founder badge role 8–9px |
| A4 | Tap targets under 44px | Slider dots (8px), step buttons 31px tall on mobile, footer social 35px |
| A5 | Slider dots have no `aria-label` | Testimonials carousel (hard-coded dots) |
| A6 | Carousels are not announced, have no swipe (except the founder slider), and content is hidden off-screen while still focusable | All sliders |
| A7 | FAQ accordion buttons have no `aria-expanded`/`aria-controls` | Home FAQ |
| A8 | Heading order broken: H1s inside content, H2 inside `<summary>`, H4 used for paragraphs, `<h3>` wrapping a form label | FAQ, Contact, About, legal pages |
| A9 | Duplicate `id="ContactForm"` (2 forms) | Contact |
| A10 | Link text "Chat on WhatsApp" repeated with no context, and opens a new tab without warning | Many |
| A11 | No `prefers-reduced-motion` handling | All animations |
| A12 | Mobile drawer focus trap is Dawn's (fine). Custom dashboard drawer: unknown | Dashboard |
| A13 | Language `en` only. Fine. | |
| A14 | Instagram iframes untitled | Home |

Target: Lighthouse a11y ≥ 95, axe with zero serious issues.

## 4. Performance: current observations

- Homepage HTML is **210 KB** (all CSS and JS inlined in sections; Dawn ships ~20 deferred scripts and component CSS).
- **Hero PNG 1.75 MB** (served as WebP by the Shopify CDN with srcset, but the source is heavy).
- **Founder PNGs 0.9–1.5 MB each**; the first one is `loading="eager"` even though it is far below the fold.
- Step illustrations are PNGs of 100–360 KB each, rendered at ~300px.
- **9 Instagram embeds** on the homepage (each pulls MBs of JS/iframe), plus `embed.js` processed 3 times.
- 14 MB recipe PDF rendered client-side with pdf.js (heavy on mobile data).
- Fonts: Assistant 400/700 only, so the 800/900 weights the CSS asks for are synthesised by the browser.
- No analytics scripts (good for speed today).

**Rebuild budget:**
- LCP < 2.0s on 4G
- CLS < 0.05
- INP < 200ms
- Homepage JS < 100 KB gz before embeds
- every image through an image pipeline (AVIF/WebP, responsive sizes)
- hero preloaded
- everything below the fold lazy
- Instagram as facades
- self-hosted fonts with `font-display: swap` and a subset

## 5. Security & privacy notes

- **Paid content is public:** the recipe e-book is downloadable without login. Member resources must use auth plus signed URLs.
- Testimonial photos are health-related personal data. Keep consent records.
- Contact and intake forms collect health information. Store it encrypted at rest, restrict access to coach/admin roles, and add a retention policy (the privacy policy §8 promises "as long as reasonably necessary").
- Add rate-limiting and a captcha to the forms. Add CSP headers. Load third-party scripts only after consent.
