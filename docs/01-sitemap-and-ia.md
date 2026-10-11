# 01 — Sitemap & Information Architecture

## 1. Primary navigation (header, desktop and mobile drawer)

The order is exact. Labels are as shown. The active item is underlined (Dawn `header__active-menu-item`).

| # | Label | URL | Notes |
|---|---|---|---|
| 1 | Home | `/` | |
| 2 | About | `/pages/about-us` | |
| 3 | Programs | `/pages/programs` | Not the product collection, a custom pricing page |
| 4 | How It Works | `/pages/how-it-works` | |
| 5 | Testimonial | `/pages/transformations` | The label is singular, the page title is "Transformation/Testimonial" |
| 6 | FAQ | `/pages/faq` | |
| 7 | Contact | `/pages/contact` | |

Header icons: **account** only. Search, cart and the country selector are **hidden with CSS** (`display:none!important`) even though Dawn still renders them. The cart is therefore not reachable from the UI.

## 2. Footer navigation (homepage only, see issue list)

**Quick Links:** About Us → `/pages/about-us` · Testimonials → `/pages/transformations` · Refund, Cancellation & Freeze Policy → `/pages/refund-cancellation-freeze-policy` · Privacy Policy → `/pages/privacy-policy` · Terms of Services → `/pages/terms-services`

**Contact Us:** `mailto:info@fattofitwithz.com`, WhatsApp `https://wa.me/19176952569`

**Social:** Facebook `https://www.facebook.com/profile.php?id=61550961720812` · Instagram `https://www.instagram.com/fat_to_fitwithz?r=nametag` · YouTube `https://www.youtube.com/@zainebdanishnutritionist` · TikTok `https://www.tiktok.com/@fat_to_fitwithz?_r=1&_t=ZS-9A1l3omIwJL`

## 3. Full URL inventory

### Content pages (CMS "pages")

| URL | Title (H1) | Built with | In nav? | Last modified | Rebuild priority |
|---|---|---|---|---|---|
| `/` | (logo is the only H1) | Dawn image banner + 7 custom sections | ✓ | — | P0 |
| `/pages/about-us` | About Us | Rich text (RTE) with inline pink styles | ✓ | 2026-10-02 | P0 |
| `/pages/programs` | Programs | Custom HTML in page body (same component as homepage) | ✓ | 2026-10-02 | P0 |
| `/pages/how-it-works` | How It Works | Rich text | ✓ | 2026-10-02 | P0 |
| `/pages/transformations` | Transformation/Testimonial | Custom HTML/CSS/JS in page body | ✓ | 2026-10-02 | P0 |
| `/pages/faq` | FAQ (hidden; visual H1 "How Can We Help?") | Custom HTML, native `<details>` accordions | ✓ | 2026-10-02 | P0 |
| `/pages/contact` | Contact (hidden; visual H1 "We're Here to Help") | Custom HTML + Dawn contact-form section (shows twice, see issues) | ✓ | 2026-10-02 | P0 |
| `/pages/desi-weight-loss-recipes` | Desi Weight Loss Recipes | PDF.js renders a 14 MB PDF to canvases | ✗ (orphan) | 2026-09-28 | P1 (needs a decision: public or members-only) |
| `/pages/member-dashboard` | Member Dashboard | Custom Liquid section; login gate; logged-in UI not public | ✗ | 2026-09-29 | P1 (new build) |
| `/pages/privacy-policy` | PRIVACY POLICY | Rich text | footer | 2026-10-02 | P0 |
| `/pages/refund-cancellation-freeze-policy` | REFUND, CANCELLATION & FREEZE POLICY | Rich text | footer | 2026-10-02 | P0 |
| `/pages/terms-services` | Terms & Services | Rich text | footer | 2026-10-02 | P0 |
| `/pages/data-sharing-opt-out` | Your Privacy Choices | Shopify auto-generated (US privacy) | ✗ | 2026-10-02 | P2 |

### Commerce templates (stock Dawn)

| URL | Purpose | Notes |
|---|---|---|
| `/products/fat-to-fit-basic-plan` | Kickstart Program | Handle doesn't match the name (legacy) |
| `/products/fat-to-fit-standard-plan` | Fat Loss Program (2 variants) | Legacy handle |
| `/products/fat-to-fit-premium-plan` | Diabetes Control Program | Legacy handle, misleading ("premium") |
| `/products/health-concerns-programs` | Health Concerns Program | Title plural "Programs" on product, singular on cards |
| `/products/total-transformation-program` | Total Transformation Program | |
| `/products/premium-signature-transformation` | Premium Signature Transformation | |
| `/collections/all` | All 6 products, Dawn grid with filters (availability, price) and sort | Not linked anywhere |
| `/collections/frontpage` | "Home page" collection (1 product) | Not linked |
| `/cart` | Dawn cart page | Unreachable from UI (cart icon hidden) |
| `/search` | Dawn search | Search icon hidden |
| `/blogs/news` | Empty blog "News" | In sitemap, no posts |
| `/account`, `/account/login`, `/account/register` | Redirect to `shopify.com/78685077659/account` (new customer accounts) | |
| `/customer_authentication/redirect` | Login redirect used by "Log in" links | |
| `/policies/privacy-policy` | Shopify-generated privacy policy (separate from the custom page!) | Two privacy policies exist |
| `/policies/refund-policy`, `/terms-of-service`, `/shipping-policy`, `/contact-information` | **404** | Not configured in Shopify settings |
| any unknown | 404 page: "404 / Page not found / Continue shopping" | |

### Machine/SEO endpoints present

`/sitemap.xml` (index → products, pages, collections, blogs, agentic discovery), `/robots.txt` (Shopify default), `/agents.md`, `/.well-known/ucp`, `/products.json`, `/collections.json`, `/products/{handle}.js|.json`, `/meta.json`, `/cart.js`. These are Shopify platform features. Only `sitemap.xml` and `robots.txt` need equivalents on our stack.

## 4. Site map diagram

```
Home (/)
├── About (/pages/about-us)
├── Programs (/pages/programs) ──"CHOOSE PROGRAM"──► [should be] /products/{program}
│                                                      └─► Cart ─► Checkout ─► Account / Member Dashboard
├── How It Works (/pages/how-it-works)
├── Testimonial (/pages/transformations) ──► Instagram posts/reels (external)
├── FAQ (/pages/faq) ──► WhatsApp
├── Contact (/pages/contact) ──► contact form, WhatsApp
├── Member Dashboard (/pages/member-dashboard)  [login-gated, orphan]
├── Desi Weight Loss Recipes (/pages/desi-weight-loss-recipes)  [orphan]
└── Legal (footer): Privacy · Refund/Cancellation/Freeze · Terms · (Your Privacy Choices)
```

## 5. Intended user journey (as stated on How It Works)

1. Choose Your Program → 2. Join (registration + payment) → 3. Get Your Plan (access member resources) → 4. Follow & Stay Consistent → 5. Get Ongoing Support.

On the live site the chain breaks at step 2 (the program buttons point to expired preview links). Steps 3–5 depend on the unfinished Member Dashboard plus manual WhatsApp/email work by the coach.

## 6. Cross-link map (every internal CTA)

| From | CTA text | Target |
|---|---|---|
| Home › How it works card 01 | About Us → | `/pages/about-us` |
| Home › card 02 | Start Your Plan → | `/pages/programs` |
| Home › card 03 | How It Works → | `/pages/how-it-works` |
| Home › card 04 | Your Transformation → | `/pages/transformations` |
| Home / Programs › each program card | CHOOSE PROGRAM | ⚠ `shopifypreview.com/products_preview?preview_key=…` (must become `/products/{handle}`) |
| Home › testimonials | Watch on Instagram (×9), View More Testimonials on Instagram | Instagram reels / profile |
| Home › FAQ box | CHAT ON WHATSAPP | `wa.me/19176952569?text=Hi Fat To Fit With Z, I have a question about your programs.` |
| Home › hero banner | "Get Started" button | Hidden with CSS, `aria-disabled`, no href |
| About / How It Works | "EXPLORE OUR PROGRAMS" | ⚠ Plain heading, **not a link** |
| Testimonials page | READ CLIENT REVIEW 01–02, WATCH TESTIMONIAL 01–09 | Instagram |
| Testimonials page | EXPLORE OUR PROGRAMS | `/pages/programs` |
| FAQ page | CHAT ON WHATSAPP | `wa.me/19176952569` |
| Contact page | Chat on WhatsApp (×3) | `wa.me/19176952569` |
| Member Dashboard (logged out) | LOGIN TO MY ACCOUNT | `/customer_authentication/redirect?locale=en&region_country=PK` |
