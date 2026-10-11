# Asset Inventory

## `original/`: downloaded from the live Shopify store

| File | Original name on Shopify CDN | Size | Used on | Notes |
|---|---|---|---|---|
| logo.png | logo__2_-removebg-preview.png | 53 KB, 500×500 | Header (80px), OG image | Heavy transparent padding; prefer `client-supplied/logo-cropped.png` or an SVG |
| hero-banner.png | ChatGPT_Image_Sep_28_2026_05_10_42_PM.png | 1.75 MB, 1998×787 | Home hero | Text baked in; AI-generated composite. Rebuild with live text + the gallery-p01 photo |
| how-step-01-choose-plan.png | 1.png | 289 KB | Home step 01 | Notebook "Your Goals Matter" + pink bottle |
| how-step-02-get-plan.png | 2.png | 270 KB | Home step 02 | Phone showing a plan |
| how-step-03-follow-track.png | 3.png | 359 KB | Home step 03 | Dumbbells + bottle "Small Steps Big Changes" |
| how-step-04-see-results.png | 4.png | 98 KB | Home step 04 | Growth chart |
| founder-slide-1/2/3.png | 5.png, 6.png, 9.png | 0.9–1.5 MB | Founder slider | Convert to WebP/AVIF |
| transformation-01…05 | 62_to_54.jpg, 98_to_62.jpg, 95_to_75.jpg, 71_to_61.png, 65_to_55.png | 0.1–0.9 MB | Home + Testimonials | Before/after composites with weight data |
| transformation-06…09.jpg | WhatsApp_Image_2026-09-28_at_13.29.39_1.jpg, …13.29.40_2.jpg, …13.29.39_2.jpg, …13.29.39.jpg | 0.1–0.2 MB | Home + Testimonials | No weight data |
| faq-whatsapp-support.jpg | WhatsApp_Image_2026-09-25_at_15.46.43.jpg | 72 KB | Home "Have Questions?" box | |
| product-*.png (6) | Screenshot2026-09-29at12.39.42PM.png … | 65–94 KB, 722×888 | Product pages | Screenshots of the pricing cards; replace with designed images |
| desi-weight-loss-recipes.pdf | Desi_Weight_Loss_Recipes_Shopify.pdf | 14.3 MB | Recipes page | Older edition; superseded by v3 |

## `client-supplied/`: from the client's "some more data" folder

| File | Notes |
|---|---|
| logo-original-1536.png | High-res logo (transparent, padded) |
| logo-cropped.png | Auto-cropped 610×613; use until an SVG arrives |
| desi-weightloss-recipes-v3.pdf | New edition: 101 pp, 68 recipes, 21 MB, © Zaineb Danish 2026 (members-only / paid) |
| gallery/gallery-p01…p12-1.jpg | 12 professional photos of the coach (office, portraits, events, awards); see 11 §1 for the usage plan |
| gallery-contact-sheet.jpg | Thumbnail overview of all 12 |
| pricing_sheet.pdf | Source of truth for prices |
| FAT_TO_FIT_WITH_Z_Programs.pdf | Canonical program copy |
| Fat_to_fitwithz_FAQs (2).pdf | Canonical FAQ |
| fat_to_fit_instagram_links_v2.pdf | Instagram testimonial links |
| Workout_Recorded_Sessions_4_Weeks.pdf | 4-week workout plan (YouTube links) |

## Image pipeline for the rebuild
Convert everything to AVIF and WebP at widths 480 / 768 / 1200 / 1920; serve with `next/image`. Strip EXIF (privacy) from the transformation and gallery photos. Keep the originals in R2 as the master copies.
