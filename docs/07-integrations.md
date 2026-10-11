# 07 — Integrations & Functionality

| # | Integration | Today | Rebuild recommendation |
|---|---|---|---|
| 1 | **WhatsApp** | Plain `wa.me/19176952569` links (one with a prefilled text). No WhatsApp Business API. | Keep the deep links from config. Optional: floating button; per-page prefilled messages (e.g. "I'm interested in the Fat Loss Program"); click tracking as an analytics event. |
| 2 | **Instagram embeds** | `instagram.com/embed.js` + 9 `<blockquote class="instagram-media">` on the homepage, re-processed at 0.5/1.5/3s | Facade pattern: a static thumbnail (download the reel covers) with a click-to-load embed or a link out. Avoids ~9 heavy iframes, layout shift and third-party cookies before consent. |
| 3 | **PDF.js** | cdnjs pdf.js 3.11.174 renders the 14 MB recipe PDF to canvas | If kept as a PDF: serve from protected storage (members) and use a light viewer or a plain download. Better: convert the recipes to HTML pages. |
| 4 | **Email (transactional)** | Shopify notifications (order confirmation, contact form to the owner) | Transactional provider (Resend, Postmark or SES): order receipt, welcome + onboarding form link, contact auto-reply + admin notify, check-in reminders, membership expiry reminders. |
| 5 | **Newsletter** | Shopify customer marketing consent | Provider (Brevo, Mailchimp or Klaviyo) or our own DB + export; double opt-in. |
| 6 | **Authentication** | Shopify new customer accounts (passwordless email OTP, hosted on shopify.com), `<shopify-account>` header widget | Our own auth with email OTP / magic link (matches today's UX) plus optional Google sign-in; roles member / coach / admin. |
| 7 | **Payments** | Shopify Checkout, USD; gateway unknown (see 06) | Stripe (multi-currency cards, international) + a local PK option (e.g. Safepay, PayFast, JazzCash/Easypaisa, or manual bank transfer with proof upload). Webhooks create the Order and Membership. |
| 8 | **Analytics** | None (only Shopify's built-in pixel manager). No GA4, no Meta Pixel, no TikTok Pixel. | Add GA4 (or Plausible) + Meta Pixel + TikTok Pixel (the client advertises on IG/TikTok), behind a consent banner. Events: view_program, select_region, begin_checkout, purchase, whatsapp_click, contact_submit, newsletter_signup. |
| 9 | **Cookie consent / privacy** | Shopify-managed; "Your Privacy Choices" page (US) | Consent banner (needed once pixels exist); keep a privacy-choices page if targeting the US. |
| 10 | **Shopify Standard Events / UCP / agents.md** | Platform features (agent commerce endpoints) | Not needed. |
| 11 | **Search** | Dawn predictive search (hidden) | Not needed. |
| 12 | **Product recommendations** | Dawn "You may also like" | Replace with a curated "Compare programs" / "Other programs" strip. |
| 13 | **Localization** | Shopify Markets PK/US/CA, USD only, English only | Region selector + geo-IP (Cloudflare/Vercel headers) for prices. English only, unless the client wants Urdu. |
| 14 | **Video hosting (members)** | Unknown (dashboard not public) | Bunny Stream, Vimeo or Mux with signed playback for recorded workouts (prevents sharing, per Terms §6 and §8). |
| 15 | **File storage** | Shopify Files CDN (public) | S3 / R2 / Supabase storage; public bucket for site images, private bucket + signed URLs for member resources. |
| 16 | **Admin/CMS** | Shopify admin + theme editor | A headless CMS (Sanity, Payload or Strapi) or a custom admin for: programs, prices, testimonials, FAQs, pages, settings; plus a coach console for members, check-ins, resources and freezes. |

## Custom JS behaviours to re-implement (from `reference/js/`)

| Script | Behaviour | File |
|---|---|---|
| Programs slider + regional prices | Visible cards by width (3 / 2 / 1 at >990 / ≤990 / ≤650); arrows disabled at the ends; generated dots; price-table swap on select change; Fat Loss "x \| y" format; resets to USA | `home.js` part 1, `pages_programs.js` |
| Instagram carousel | 3 / 1 visible (≤749); fixed 7 dots; re-runs `instgrm.Embeds.process()` | `home.js` part 2 |
| Transformations slider | 3 / 2 / 1; **loops**; generated dots; translate3d | `home.js` part 3 |
| Home FAQ | Single-open accordion; re-init on `shopify:section:load` | `home.js` part 4 |
| Founder slider | Crossfade; counter; ←/→ keys; swipe ≥50px; wraps | `home.js` part 5 |
| Recipe PDF viewer | pdf.js lazy page render | `pages_desi-weight-loss-recipes.js` |
| Member dashboard shell | Sidebar panes by `data-page`/`data-content`, hash sync, mobile drawer + overlay, auto-close >750px | `pages_member-dashboard.js` |
| Testimonials page slider | **Missing.** Arrows have no handler. | — |
