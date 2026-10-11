# 02 — Design System

The live site mixes two systems:
- **(a)** Dawn theme settings (font Assistant, button colour `#D82F68`, square corners)
- **(b)** hand-written custom CSS (brand pink `#FF65C5`, Arial in places, rounded pills)

Most visible UI is (b). This document records **both as they exist today** and then proposes **normalised tokens** for the rebuild. Values are taken from `reference/css/*.css` and the Dawn `:root` variables.

## 1. Colour

### 1.1 Brand palette (as used)

| Token (proposed) | Hex | Where it's used today | Count in CSS |
|---|---|---|---|
| `--brand-pink` | **#FF65C5** | Primary brand: headings, prices, buttons, badges, footer background, stars, dots | 53+ |
| `--brand-pink-hover` | #E94DB0 | Founder section hover (`--pink-dark`) | |
| `--brand-pink-strong` | #FF3FB7 | Contact page hover, contact bottom gradient end | |
| `--brand-pink-deep` | #C91652 | Programs `--ftf-pink-dark`: duration pill text, button hover | |
| `--theme-button` | #D82F68 (rgb 216,47,104) | Dawn `--color-button` (only on Dawn buttons: product page "Add to cart", cart, contact "Send") | |
| `--error` | #C91F55 | Recipe PDF error text | |
| `--pink-50` | #FFF0F5 | Duration pill background | |
| `--pink-25` | #FFFAFD / #FFF6FB / #FFF7FA / #FFF6F9 | Card backgrounds (How-it-works card, contact info panel, FAQ support band) | |
| `--pink-border` | #F1DCE6 / #F1D6DF | Pink-tinted borders | |
| `--hero-gradient` | `linear-gradient(135deg,#FFF7FC 0%,#FFFFFF 55%,#FFEAF7 100%)` | Contact/FAQ hero (FAQ uses #FFF7FA→#FFF→#FFEAF1) | |
| `--cta-gradient` | `linear-gradient(135deg,#FF65C5,#FF3FB7)` | Contact bottom CTA band | |

### 1.2 Neutrals

| Token | Hex | Use |
|---|---|---|
| `--ink` | #121212 (Dawn foreground), #151515, #171717, #182638 (navy, How-it-works titles), #252525 | Headings/body |
| `--text-muted` | #666 / #555 / #3C4855 / #444 / #777 | Paragraphs |
| `--border` | #E8E8E8 / #EEEEEE / #EDEDED / #ECECEC / #DDD | Card and input borders |
| `--dot-idle` | #D7D7D7 / #D8D8D8 / #DDD | Slider dots |
| `--surface` | #FFFFFF | All section backgrounds (Dawn `--spacing-sections-desktop:0`, all scheme-1 white) |
| `--surface-alt` | #F5F5F5 (image placeholder), #FAF5F7 (testimonial experiences panel) | |
| `--overlay-dark` | rgba(37,37,37,.88) | "BEFORE" photo label |

**Normalise to:** `pink-500 #FF65C5`, `pink-600 #E94DB0` (hover), `pink-700 #C91652` (text on light pink), `pink-50 #FFF0F5`, `pink-25 #FFF7FB`, `ink-900 #171717`, `ink-700 #333`, `ink-500 #666`, `line #E8E8E8`. Drop `#D82F68` so every button uses one pink.

⚠ **Contrast:** white text on `#FF65C5` measures ≈2.6:1 and **fails WCAG AA** for normal text, and that pair is used on every button and on the whole footer. For the rebuild, either darken the button pink (for example `#D6249A`, about 4.5:1 with white) while keeping `#FF65C5` for decoration, or use dark text on pink. The client has to sign this off.

### 1.3 Dawn colour schemes (configured but only scheme-1 used)

| Scheme | Background | Foreground | Button / text |
|---|---|---|---|
| 1 (used everywhere) | #FFFFFF | #121212 | #D82F68 / #FFFFFF |
| 2 | #F3F3F3 | #121212 | #121212 / #F3F3F3 |
| 3 | #242833 | #FFFFFF | #FFFFFF / #000000 |
| 4 | #121212 | #FFFFFF | #FFFFFF / #121212 |
| 5 | #334FB4 | #FFFFFF | #FFFFFF / #334FB4 |

Schemes 2–5 are Dawn defaults and unused. No need to port them.

## 2. Typography

| Context | Family | Notes |
|---|---|---|
| Dawn globally (body, headings, nav, product page) | **Assistant** (served from fonts.shopifycdn.com), weights 400 / 700; headings weight 400 | `--font-body-scale:1`, `--font-heading-scale:1` |
| Custom sections | inherit → Assistant, **except**: Transformations heading `Arial`, Contact page and FAQ page root `Arial, Helvetica, sans-serif` | Inconsistent, so pick one |
| Hero banner | Text is **baked into the image** (geometric sans + pink script "Safe Hands.") | Must be re-created as live text |

**Recommendation:** Load Assistant (Google Fonts, 400/500/600/700/800/900) as the single family. Weight 800–900 is used constantly in the custom CSS, but Shopify only served 400/700, so the browser currently fakes the bold. Add a script accent font (for example "Kaushan Script" or "Dancing Script") only if the hero's script line is rebuilt as text.

### 2.1 Type scale actually used (desktop → mobile)

| Role | Desktop | Mobile | Weight | Example |
|---|---|---|---|---|
| Hero H1 (contact/FAQ) | 54px / 52px, lh 1.08 | 40px / 38px | 800 | "We're Here to Help" |
| Founder title | 44px, lh 1.12, ls −1px | 34px (≤480: 30px) | 800 | "Meet Zaineb Danish" |
| Testimonials page hero H1 | 42px | 31px | 800, pink | "REAL PEOPLE. REAL RESULTS." |
| Section eyebrow (big) | 35px, ls 4px | 14px, ls 2.5px | 800, pink | "HOW IT WORKS" |
| Section H2 | 35px (Programs), 30px (Transformations), 28px (FAQ) | 30 / 25 / 20px | 800 | "Choose Your **Program**" |
| Section subtitle | 28px italic 500 (How it works), 28px 500 (Programs sub) | 25px / 13px | | "Simple Steps to a Healthier You" |
| Card title | 27px (How), 23px (Program) | 17px / 21px | 800 | |
| Price | 32px, lh 1 | 29px | 800, pink | "$27 \| $49" |
| Body | 14–16px, lh 1.5–1.85 | 10–14px | 400–500 | |
| Small eyebrow | 13px, ls 2px uppercase | 11px | 800 | "GET IN TOUCH" |
| Button | 12–14px uppercase | 9–15.5px | 700–800 | "CHOOSE PROGRAM" |
| Footer body | 13px, lh 1.7–1.75 | 12px | | |
| Footer copyright | 11px | 10px | 500 | |

Pattern used everywhere: **two-tone headings**, dark text plus a pink `<span>` keyword ("Choose Your **Program**", "What Our Clients **Say**", "Transformations That **Inspire**", "How Can We **Help?**", "We're Here to **Help**").

## 3. Spacing & layout

| Token | Value |
|---|---|
| Dawn page width | 120rem (1200px), `page-width--narrow` for CMS pages (~726px content) |
| Custom container widths | 1100px (How it works, contact), 1150px (home FAQ), 1200px (footer), 1250px (transformations, founder), 1320px (programs slider), 950px (FAQ page), 850px (hero copy) |
| Section vertical spacing | Dawn `--spacing-sections-desktop: 0`; custom sections use 0–16px padding (×0.75 on mobile) plus internal padding (45px top on How it works, 60/50px on footer) |
| Side gutters | 20–35px desktop, 10–18px mobile, 8px ≤400px |
| Grid gaps | 18px (How cards), 22px (program cards), 24px (transformation cards), 26px (FAQ split), 45px (contact grid), 50px (footer cols) |

**Rebuild:** use a 4/8px scale (4, 8, 12, 16, 24, 32, 48, 64, 80) and two containers: `content 1200px` and `narrow 760px`. Section padding 64px desktop / 40px mobile. This is a deliberate clean-up; the current spacing is very tight (sections butt against each other).

## 4. Radii, borders, shadows

| Element | Radius | Border | Shadow |
|---|---|---|---|
| How-it-works card | 22px (17px mobile) | 1px #F1DCE6 | 0 5px 18px rgba(255,101,197,.08) |
| Step number tab | 0 0 32px 32px (a "hanging tab" shape) | — | — |
| Program card | 18px | 1px #E8E8E8 | 0 8px 28px rgba(0,0,0,.07) |
| Transformation card | 18px | 1px #ECECEC | hover: 0 12px 32px rgba(0,0,0,.11) + translateY(−5px) |
| Contact panels | 24px (20px mobile) | form: 1px #EEE | 0 10px 35px rgba(0,0,0,.06) |
| FAQ page item | 14px | 1px #EEE | |
| Home FAQ box | 8px | 1px #EDEDED | |
| Home WhatsApp box | 81px (!) | — | |
| Founder image | ~24px (20px mobile, 17px ≤480) | | |
| Inputs | 10px (contact), 8px (country select) | 1px #DDD, focus border pink | |
| Pills / badges / most buttons | 24–30px (full pill) | | |
| Program "CHOOSE PROGRAM" button | 8px | | |
| Footer WhatsApp / newsletter | 7px | | |
| Dawn buttons and inputs | 0px (square) | 1px | |
| Arrow buttons and social icons | 50% | 1px #E2E2E2 / rgba(255,255,255,.75) | 0 5px 18px rgba(0,0,0,.18) |

## 5. Buttons (consolidate into 3 variants)

| Variant | Spec today | Used for |
|---|---|---|
| **Primary pill** | bg #FF65C5, white, 700–800, 13–14px uppercase, padding 12–15px × 22–32px, radius 30px, hover darker pink + translateY(−1/−2px) | WhatsApp CTAs, Send Message, Explore programs, View more on Instagram |
| **Primary block** | same colours, radius 8px, full width, min-h 48px | CHOOSE PROGRAM |
| **Outline pill** | white bg, 1px #FF65C5 border, #333 text → hover pink fill | Watch Testimonial 01–09 |
| **Inverse pill** | white bg, pink text | Footer WhatsApp, contact bottom CTA, newsletter JOIN |
| **Icon circle** | 42–46px circle (36–40px mobile), pink or white bg, "‹ ›" glyph or chevron SVG, disabled at opacity .25–.35 | All slider arrows |
| **Dot pager** | 8×8 circle #D7D7D7 → active 23–25×8 pill pink, 7–8px gap | All sliders |

## 6. Iconography & decorative elements

- Unicode glyphs instead of icons: `→` (card buttons), `‹ ›` (arrows), `✓` (benefit bullets, pink, weight 900), `★` (5 pink stars), `♡` (heart divider), `+` (FAQ toggle, rotates 45° to an ×), `↓` (journey arrows on How It Works), `🔐` (dashboard login), `W` / `?` / `✓` letters in circles (contact page icons).
- Inline SVGs: WhatsApp logo, Facebook, Instagram, YouTube, TikTok, chevrons (founder slider).
- **Heart divider:** a centred ♡ (30px) flanked by two 180px curved lines (`border-top:2px solid pink; border-radius:50%`); 75px lines on mobile.
- Rebuild: use one icon set (e.g. Lucide) plus brand SVGs for the socials and WhatsApp. Keep the ♡ divider as a component.

## 7. Breakpoints in use

| Breakpoint | Used by |
|---|---|
| ≤400px | small-mobile tweaks (testimonials, transformations) |
| ≤480px | footer 1-column, founder |
| ≤600 / 650 / 700px | testimonials page, programs (1 card), FAQ page |
| ≤749px / ≥750px | **Dawn's main mobile breakpoint**, most sections |
| ≤800px | contact page |
| ≤900px | How it works card text, footer 2-col |
| ≤990px / ≥990px | Dawn desktop nav vs drawer, programs 2 cards, transformations 2 cards |
| ≤1000px | founder, testimonials page tablet |

**Rebuild:** standardise on `sm 480`, `md 750`, `lg 990`, `xl 1200`.

## 8. Motion

- Sliders: `transform: translateX()` with `transition: transform .45s ease`.
- Founder slider: crossfade `opacity .45s ease`.
- Buttons and cards: `.25s ease` colour/transform, hover lift −1 to −5px, arrow hover `scale(1.05)`.
- Dawn scroll animations: banner `animate--fade-in`, page content `animate--slide-in` (Dawn "scroll-trigger").
- FAQ: instant show/hide (`display:none` → `block`), with the `+` rotating 45°.
- **Add** `prefers-reduced-motion` fallbacks (none exist today).

## 9. Imagery style

Soft pink/white, feminine, rounded. Product images are **screenshots of the program cards** (722×888 PNG), not photography. The "how it works" art is four pink illustrated PNGs with transparent backgrounds (notebook + bottle, phone with plan, dumbbells + bottle, growth chart). Transformation images are square before/after composites. Founder images are portrait photos of the coach.
