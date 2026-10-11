# Fat To Fit With Z — Rebuild Documentation

Source site analysed: **https://6x06mr-b1.myshopify.com/** (Shopify, analysed 2026-10-06)
Purpose: everything needed to rebuild this site on our own stack with no loss of content, design, or behaviour, and to fix the defects found along the way.

## What the site is

"Fat To Fit With Z." is an online **women's nutrition and fitness coaching business** run by **Zaineb Danish** (Nutrition Professional / Certified Fitness Coach, based in Lahore, Pakistan). It sells **6 coaching programs** (digital services, no shipping) priced in USD, shows **per-country display prices** (8 regions), and drives most contact through **WhatsApp**. A **Member Dashboard** for logged-in clients is partially built.

| Fact | Value |
|---|---|
| Platform | Shopify, theme **Dawn 16.0.0** (theme id 159120195739), heavily overridden with "Custom Liquid" sections |
| Store id / name | 78685077659 / "Fat To Fit With Z." |
| Store currency | USD (`${{amount}}`), markets: Pakistan (default), United States, Canada |
| Products | 6 published (1 with 2 variants), all `requires_shipping:false`, `taxable:false` |
| Collections | 1 ("Home page" / `frontpage`, holds 1 product) |
| Pages | 12 CMS pages (+ home, product, collection, cart, search, blog, 404 templates) |
| Blog | `/blogs/news`, empty |
| Customer accounts | Shopify "new customer accounts" (hosted at shopify.com, passwordless) |
| Analytics | None (only Shopify's built-in web-pixels manager) |
| Contact | WhatsApp **+1 917 695 2569**, email `info@fattofitwithz.com` (footer) and `fattofitwithz@gmail.com` (policies) |
| Socials | Facebook, Instagram `@fat_to_fitwithz`, YouTube `@zainebdanishnutritionist`, TikTok `@fat_to_fitwithz` |
| Agency credit | "Powered by 10X" → tenx.com.pk |

## Document index

| # | Document | What it covers |
|---|---|---|
| 01 | [Sitemap & information architecture](01-sitemap-and-ia.md) | Every URL, navigation, templates, what is linked from where |
| 02 | [Design system](02-design-system.md) | Colours, typography, spacing, radii, shadows, buttons, breakpoints, motion |
| 03 | [Global components](03-components.md) | Header, mobile drawer, footer, sliders, accordions, country price selector, cards, WhatsApp CTA |
| 04 | [Page specifications](04-page-specs.md) | Section-by-section spec of every page, desktop and mobile |
| 05 | [Content inventory](05-content-inventory.md) | All copy, programs, prices, FAQs, testimonials, legal text locations |
| 06 | [Data model & commerce](06-data-model-and-commerce.md) | Products, variants, regional pricing, checkout, customers, memberships, forms, entities to build |
| 07 | [Integrations & functionality](07-integrations.md) | WhatsApp, Instagram embeds, PDF viewer, email, newsletter, auth, payments |
| 08 | [SEO, accessibility & performance](08-seo-a11y-performance.md) | Current state, URL/redirect plan, what to fix |
| 09 | [Defects & issues found](09-issues-found.md) | Every bug and inconsistency on the live site (do **not** copy these) |
| 10 | [Rebuild plan, stack & acceptance checklist](10-rebuild-plan.md) | **Recommended stack**, project structure, phases and effort, pricing logic, open questions, QA checklist |
| 11 | [Client-supplied data](11-client-supplied-data.md) | Analysis of the "some more data" folder: pricing sheet, programs PDF, FAQs, Instagram links, 4-week workouts, recipe e-book v3, photo gallery, logo |
| 12 | [Enhancements, animations & themes](12-enhancements-and-themes.md) | 4 theme directions (Bubbles, Waves, Blossom, Energy), 18 animations, new features (quiz, calculators, dashboard, PWA) |
| 13 | [Approved design & build decisions](13-approved-design-decisions.md) | **Decision log:** Blossom theme + 8 animations approved; hero, programs, recommended and founder carousels; Stripe test-mode checkout |
| 14 | [How everything works (full workflow)](14-workflows.md) | **Start here for operations:** visitor to client, onboarding, the client's routine, the coach's admin routine, membership lifecycle, emails, privacy, developer and deploy workflow, launch checklist |
| 15 | [Handoff: continue next week](15-handoff-next-week.md) | **Read first:** the simplification change: what is done, the remaining steps, and a ready-to-paste prompt to continue |
| — | [Asset inventory](assets/README.md) | Every image/PDF downloaded or supplied, with original names and usage |
| — | `seed/` | **Ready-to-import JSON:** `programs.json`, `pricing.json` (8 regions × 5 durations), `faqs.json` (25 + 5 home), `testimonials.json`, `workouts-4-week.json`, `settings.json`, `hero-banners.json`, `founder-messages.json` |
| — | [Theme Studio](https://claude.ai/artifact/HEWMiCSygMEx9RD8qxotj8) (`theme-studio/theme-studio.html`) | Interactive approval page: 4 live theme previews, 12 animation toggles, real regional prices, saves the approved direction |
| — | [Blossom Homepage](https://claude.ai/artifact/SA8HT9ysvE5c7uFcYhNjFj) (`theme-studio/blossom-homepage.html`) | Approved-theme homepage preview with all carousels and the checkout flow; saves feedback to `decisions/homepage` |
| — | `reference/content/legal-clean/` | Clean Privacy, Refund/Cancellation/Freeze and Terms texts (supplied by the client) |

## Reference material (raw extracts)

`reference/` holds the raw material behind these docs, so developers can check any pixel value or line of copy:

- `reference/html/` — cleaned `<main>` markup of every page (styles and scripts stripped out)
- `reference/css/` — every page's custom CSS, verbatim (e.g. `home.css` has all 7 homepage sections)
- `reference/js/` — every custom script, verbatim (sliders, price table, FAQ, founder slider, PDF viewer, dashboard)
- `reference/content/` — plain-text/markdown copy of every page
- `reference/data/` — Shopify JSON exports: `products.json`, `pages.json`, `collections.json`, `shop-meta.json`, a product JSON-LD sample
- `assets/original/` — all media files, renamed descriptively

## Top findings (read before estimating)

1. **Almost nothing on the site is real Shopify theme UI.** The homepage, Programs, FAQ, Contact and Testimonials pages are hand-written HTML/CSS/JS pasted into "Custom Liquid" sections and page bodies. Rebuilding is mostly front-end component work; the commerce part is small (6 products).
2. **"CHOOSE PROGRAM" buttons are broken in production.** They link to `shopifypreview.com` preview URLs, which expire, instead of the product pages. Country-specific prices are **display-only**: checkout always charges USD.
3. **The footer only appears on the homepage.** Every other page has no footer, so no legal links and no contact details.
4. **The Member Dashboard is a stub.** Logged-out users see a login prompt. The logged-in UI (sidebar, hash-routed tabs) exists only in JS and its content is not public. This is the largest **new build** item and needs a requirements session with the client.
5. **Legal pages say "Effective Date: [Insert Date]"** and use a different email from the footer.
6. **The paid "Recipe E-Book" (14 MB PDF) is public**, on an unlinked page, at a public CDN URL.

7. **The live 4-month prices are wrong in 6 of 8 regions** compared with the client's pricing sheet (e.g. Pakistan Rs 13,600 vs Rs 12,500). Pricing is by **duration**, with standard and discounted rates.
8. The client has more assets than the site uses: 12 professional photos (including press and award events), a new 68-recipe e-book (v3), a 4-week workout plan and 2 extra transformations.

See [09-issues-found.md](09-issues-found.md) for the full list (40+ items).

**Recommended stack:** Next.js 15 + TypeScript + Tailwind v4 + shadcn/ui + Motion, Payload CMS 3 on Postgres, Better Auth (email OTP), Stripe + a Pakistani gateway + bank transfer, Resend, Cloudflare R2, hosted on Vercel. Details and alternatives are in [10](10-rebuild-plan.md).

## The code

The website lives in [`../app`](../app/README.md) (Next.js 16 + Payload CMS + Neon). Built: all public pages, Stripe test-mode checkout, SEO/GEO, member accounts with a dashboard that saves to the database, and the admin panel with an Overview dashboard. See [14](14-workflows.md) for how it all works and [13](13-approved-design-decisions.md) for the decision log.
