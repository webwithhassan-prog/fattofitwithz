# 03 — Global & Reusable Components

Each component lists the **current behaviour** (to match) and **rebuild notes** (what to improve). Exact CSS lives in `reference/css/` and exact JS in `reference/js/`.

---

## C1. Header (site-wide)

**Structure (desktop ≥990px):** sticky white bar with a 1px bottom border. Logo on the left (80px wide), inline nav next to it ("middle-left" layout), account icon on the far right.
**Mobile (<750px):** custom grid `"heading left-icons icons"` with columns `auto 1fr auto`: **logo on the left, hamburger next to it, account icon on the right**. Dawn's default (hamburger left, logo centred) is overridden.
**Tablet (750–989px):** Dawn drawer, hamburger visible.

| Property | Value |
|---|---|
| Sticky mode | `on-scroll-up`: hides when scrolling down, reappears when scrolling up |
| Padding | 10px 3rem (mobile and tablet); 20px top and bottom ≥990px |
| Logo | `logo.png` (500×500 PNG, transparent, pink circle "FAT-TO-FITWITHZ"), rendered at 80px wide. The artwork has huge transparent padding, so the visible logo looks tiny (~40px). **Crop the asset** or supply an SVG. |
| Logo markup | Wrapped in `<h1>` on every page (Dawn home behaviour). Rebuild: `<h1>` only on content, logo is a link. |
| Nav items | Home, About, Programs, How It Works, Testimonial, FAQ, Contact. Font Assistant ~14px, colour #121212, active item underlined. |
| Hidden by CSS | search icon and modal, cart icon, desktop country/currency selector, drawer country selector. **Don't build these** unless the cart is reinstated (see 06). |
| Account icon | Shopify `<shopify-account>` web component. Opens a sign-in popover (passwordless email code). Rebuild: link to `/account` or open the login modal. |
| Mobile drawer | Slides from the left below the header, lists the 7 links vertically (large tap targets), close by tapping the × or the hamburger again. |
| Cart notification | Dawn "Item added to your cart" popover (View cart / Check out / Continue shopping). Only reachable from product pages. |
| Structured data | Organization JSON-LD with logo and **9 empty `sameAs` strings** (fix: add the 4 social URLs); WebSite JSON-LD with a SearchAction. |

---

## C2. Footer (⚠ currently HOMEPAGE ONLY; rebuild as site-wide)

Pink (`#FF65C5`) full-width block. Implemented as a homepage custom section; Dawn's real footer group was removed.

**Main area:** padding 60/35/50px, container 1200px, grid `1.35fr 1fr 1fr 1.15fr`, gap 50px.

| Column | Content |
|---|---|
| Brand | CSS logo: a 62px white-outlined circle with "FAT / TO / FIT" (9px, 800) plus the text "Fat to Fit" (23px, 800) / "WITH Z" (10px, ls 2px). Description (13px, white 92%): *"Personalized nutrition, fitness and lifestyle guidance designed to help you build healthier habits and achieve sustainable results."* Then 4 social circles (35px, 1px white 75% border, 16px icon) for Facebook, Instagram, YouTube, TikTok; hover turns them white with a pink icon and lifts 2px. |
| Quick Links (h3 15px uppercase) | About Us · Testimonials · Refund, Cancellation & Freeze Policy · Privacy Policy · Terms of Services (13px, hover shifts 4px right) |
| Contact Us | h4 "HAVE QUESTIONS?" · text *"We're here to help! Chat with us on WhatsApp or email us anytime."* · email link `info@fattofitwithz.com` (bold) · white button with WhatsApp icon "CHAT ON WHATSAPP" (radius 7px, pink text 11px) |
| Stay Updated | Text *"Subscribe to get updates, fitness tips and program information."* · inline email field plus white "JOIN" button inside a 1px white 70% bordered box (max-w 300px). Posts to Shopify `/contact` with `form_type=customer`, which creates a customer with marketing consent. |

**Bottom bar:** 1px white 25% top border, min-h 58px, centred 11px text: `©️ 2025 Fat to Fit With Z. All rights reserved. — Powered by 10X` (10X links to `https://www.tenx.com.pk/`).
**Responsive:** ≤900px 2 columns with the brand spanning full width; ≤749px padding 45/22/40px; ≤480px 1 column.
**Rebuild:** make it site-wide; a dynamic year; drop the emoji ©️; add success and error states to the newsletter; consider "Your Privacy Choices" and Contact links; fix the contrast (see 02).

---

## C3. Section heading pattern

Eyebrow (pink, uppercase, letter-spaced) → H2 (dark + pink keyword span) → muted paragraph, centred, max-width ~650–680px. Used on: How it works, Programs, Testimonials, Transformations, Contact hero, FAQ hero. Build one `<SectionHeading eyebrow title highlight subtitle align>` component.

---

## C4. Carousel / slider (4 instances: one generic component)

All four are hand-rolled `translateX` sliders with the same logic: compute card width plus the CSS gap, move by `index × (cardWidth + gap)`, and recompute on resize (debounced 100–150ms).

| Instance | Visible cards (desktop / tablet / mobile) | Arrows | Dots | Loop? | Other |
|---|---|---|---|---|---|
| Programs (`#ftf-programs`) | 3 / 2 (≤990) / 1 (≤650) | pink circles 42px, `‹ ›`, disabled at ends (opacity .35) | generated, one per position (`cards − visible + 1`) | No | Card min-h 485px |
| Testimonials (Instagram reels) | 3 / 3 / 1 (≤749) | white circles 46px, pink glyph, disabled at ends (opacity .25) | **7 hard-coded dots** (bug: 9 slides on mobile) | No | Each card is an Instagram embed fixed at 680px tall plus a 54px "Watch on Instagram" bar |
| Transformations | 3 / 2 / 1 (≤749) | white circles 46px, 1px #E2E2E2 | generated | **Yes** (wraps around) | Card hover lift |
| Founder images | 1 (crossfade) | white chevron circles 46px inside the image, ±18px from edge | none, uses a "1 / 3" counter pill top-right | Yes | Keyboard ←/→ on the section, touch swipe ≥50px |

**Rebuild:** one accessible carousel (e.g. Embla or Swiper, or CSS scroll-snap plus buttons) supporting:
- touch swipe on every instance (only the founder slider has it today)
- `aria-roledescription="carousel"`, labelled arrows, dots as buttons with `aria-label` and `aria-current`
- keyboard support
- no autoplay (matches today)
- reduced motion

---

## C5. Program card + country price selector (★ core business component)

Used on the Home page and the Programs page (duplicated code).

**Header:** H2 "Choose Your **Program**" (35px); sub *"Select your **country** to view the program pricing available in your region."*
**Selector:** label "Country" + `<select id="ftf-country">` (min-w 200px, h 46px, radius 8px, 1px #DDD, pink focus). Options in order: USA / Global (default), Canada, UAE, Saudi Arabia, Qatar, India, Pakistan, Australia.
**Behaviour:** on change, replace the text of each `[data-price-program]`. Fat Loss shows `"{2-month} | {4-month}"`. There is **no persistence** and **no geo-detection**; it always resets to USA on load.
**Card anatomy** (white, 1px #E8E8E8, radius 18px, padding 30/25/27px, shadow 0 8px 28px rgba(0,0,0,.07), column flex):
1. Title H3 23px/800
2. Duration pill: bg #FFF0F5, text #C91652, 13px/700, radius 30px
3. Price: 32px/800 pink
4. "Main Benefits" (or "Covers" for Health Concerns), 18px/900
5. ✓ list: 16px/800 #555, pink ✓ bullets, 10px gap
6. Full-width "CHOOSE PROGRAM" button pushed to the bottom (`margin-top:auto`), radius 8px, hover #C91652

The full price matrix and benefit lists are in [05-content-inventory.md](05-content-inventory.md#programs--prices).

**Rebuild notes:**
- Drive cards from product data (CMS or DB), not hard-coded HTML, so the homepage and Programs page share one source.
- The button must go to the product page or straight to checkout for that program/variant. Fat Loss needs a 2-month / 4-month choice.
- Decide whether regional prices are **display-only** (as today) or **actually charged** in local currency (see 06 §3). Persist the chosen country (cookie) and optionally pre-select it by IP geolocation.
- Show the compare-at (strikethrough) prices that exist in the product data but aren't shown on cards today (e.g. $15 ~~$20~~).

---

## C6. "How it works" step card (homepage)

2×2 grid (2 columns even on mobile), gap 18px (12px mobile). Card: h 285px (270 ≤900, 225 mobile), bg #FFFAFD, 1px #F1DCE6, radius 22px.
- **Number tab** hanging from the top-left: 62×62px (48 mobile), pink, radius `0 0 32px 32px`, white 21px/800 "01–04".
- **Copy** absolutely positioned at top 70px, left 25px, width 44%. H3 27px/800 navy #182638 with a pink keyword on line 2; p 14px #3C4855.
- **Illustration** absolutely bottom-right (~53–56% wide, 94% tall, `object-fit:contain`). **Card 03 is mirrored**: image on the left, copy and button on the right (mobile: button moves back to the left).
- **Pill button** bottom-left: 150×42px pink, 13px/700, text plus a "→" span.
- Followed by the ♡ heart divider.
**Rebuild:** use flex/grid instead of absolute positioning (the current layout is fragile: 10px text and 9px buttons on mobile are too small, below the 16px / 44px guidance). Consider a 1-column layout on mobile.

---

## C7. Transformation (before/after) card

Square image (aspect 1:1, cover) with two pills top-left and top-right: **BEFORE** (dark rgba(37,37,37,.88)) and **AFTER** (pink), 11px/800 uppercase, radius 30px. Below (min-h 112px): 5 pink ★ (21px) and either a **weight badge** (pink pill "62 → 54 KG • −8 KG", 14px/800) or a **"Before & After" badge** (white, pink 2px border) when there is no weight data.
Note: the BEFORE/AFTER pills are overlaid on a composite image that already contains both photos, so the labels assume the before photo is on the left.
**Data fields:** image, alt, startKg?, endKg?, rating (always 5), caption?. The loss is derived (start − end).

---

## C8. Instagram testimonial card

`<blockquote class="instagram-media" data-instgrm-permalink=… data-instgrm-version="14">` plus `instagram.com/embed.js`. The script calls `instgrm.Embeds.process()` at 0.5s, 1.5s and 3s. Height is forced to 680px. A pink "Watch on Instagram" bar sits below.
**Rebuild:** use a lightweight facade. Show a poster thumbnail with a play icon and load the embed (or link out) on click, because 9 Instagram iframes are very heavy and block rendering. Reel URLs are in 05.

---

## C9. FAQ accordions (2 variants: unify)

| Variant | Where | Behaviour |
|---|---|---|
| Home FAQ | Homepage, left column | `<button>` + `+`; **only one open at a time**; `+` rotates 45° and turns pink; answer shown/hidden via `display` |
| FAQ page | `/pages/faq` | Native `<details><summary>`; several can be open; "+" pseudo-element right; 14px radius bordered items |

**Rebuild:** a single `<Accordion single|multiple>` with `aria-expanded` and `aria-controls`, a smooth height animation, and FAQPage JSON-LD. The FAQ page currently puts `<h2>` inside `<summary>` and `<h4>` for answers. Use semantic `<h3>` + `<p>` instead.

---

## C10. WhatsApp CTA

- Number: **+1 (917) 695-2569** → `https://wa.me/19176952569`
- Homepage FAQ box uses a prefilled message: `?text=Hi%20Fat%20To%20Fit%20With%20Z%2C%20I%20have%20a%20question%20about%20your%20programs.`
- Appears in: home FAQ box, footer, contact page (3×), FAQ page.
- **Home "Have Questions?" box:** right column of the FAQ split, min-h 285px, radius 81px. Support photo (`faq-whatsapp-support.jpg`) anchored bottom-right at 70% width; overlay text on the left: "HAVE QUESTIONS?" (28px pink 800), *"We're here to help! Chat with us on WhatsApp anytime."* (20.5px), button "CHAT ON WHATSAPP" (190px wide, WhatsApp icon).
- **Rebuild:** keep the WhatsApp number in a single config value. Optionally add a floating WhatsApp button site-wide (a common pattern for this market; the client should confirm).

---

## C11. Founder message block

2-column grid: image card (h 585px, rounded, crossfade slider of 3 photos, counter "1 / 3", prev/next chevrons, **badge** overlapping bottom-right: white card "Fat to Fit With Z" (16px/800) / "FOUNDER" (9px uppercase)) plus a content column (eyebrow "Founder Message" 25px pink → H2 "Meet Zaineb Danish" 44px → "Founder & Nutrition Professional" pink 16px → 4 paragraphs 15px/1.85 #666 with bold dark highlights → 1px divider → "Zaineb Danish" 20px/800 + "Founder, Fat to Fit With Z" 13px).
Tablet ≤1000: grid 0.9fr/1.1fr, image 520px. Mobile: stacked (image first, 500px, 430px ≤480).

---

## C12. Rich-text page shell (About, How It Works, Legal)

Dawn `page-width--narrow` (~726px), H1 page title (`h0` size, fade-in), RTE body. The client's content uses **H2 (pink, bold) for section labels and H4 (bold) for paragraphs**, so every paragraph is bold. **Rebuild:** a proper long-form layout. Keep the pink section labels as styled H2s, but render body copy as normal-weight paragraphs and bullets as real `<ul>` lists. Add a "Explore our programs" button where the copy says "EXPLORE OUR PROGRAMS".

---

## C13. Forms

| Form | Fields | Submits to (today) | Rebuild |
|---|---|---|---|
| Contact (custom) | Name* (text), Email* (email), Phone / WhatsApp (tel), Subject (select: General Question, Program Information, Membership, Payment, Account Support, Other), Message* (textarea) | Shopify `/contact` (`form_type=contact`), which emails the store owner | API route → email (Resend/SES) + store in DB; spam protection (honeypot / Turnstile); success and error states; optional WhatsApp deep-link alternative |
| Contact (Dawn duplicate) | Name, Email*, Phone number, Comment | same | **Remove** |
| Newsletter (footer) | Email* | Shopify `/contact` `form_type=customer` (creates a subscribed customer) | Email-marketing provider (Mailchimp, Klaviyo, Brevo) or DB table; double opt-in; consent text |
| Country selector | select | client-side only | Persist the choice |
| Search (hidden) | q | `/search` | Not needed |

---

## C14. Login gate card (Member Dashboard, logged out)

Centred card (max 520px) in a 60vh flex area: 🔐 icon, H2 "Please Log In", grey text *"Please log in to your Fat to Fit account to access your client dashboard."*, pink button "LOGIN TO MY ACCOUNT". See 04 §9 for the logged-in dashboard.
