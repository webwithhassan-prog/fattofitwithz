# 06 — Data Model & Commerce

## 1. How commerce works today (Shopify)

1. A visitor sees the programs on Home or `/pages/programs` with **display prices** for the chosen region.
2. "CHOOSE PROGRAM" **should** open the product page but currently opens an expiring Shopify preview link ⚠.
3. Product page → "Add to cart" (quantity selectable) → cart notification → `/cart` → Shopify Checkout.
4. Checkout charges **USD** (store currency). Markets are PK / US / CA, but all are set to USD, so a Pakistani buyer who saw "Rs. 4,000" is charged $15.
5. **Payment gateways:** not visible publicly. `meta.json` shows `shopify_pay_enabled_card_brands: []` and Shop Pay installments off, so it is probably a manual or third-party gateway, or none yet. **Ask the client** what they use (e.g. bank transfer / JazzCash / Easypaisa for PK, Stripe or PayPal for international).
6. After purchase: there is no automated fulfilment. The coach onboards the client manually (WhatsApp/email), and the Member Dashboard is meant to deliver resources.
7. Customer accounts: Shopify new customer accounts (passwordless email OTP), with the order history shown on shopify.com.

## 2. Required capabilities for the rebuild

| Capability | Must / Should / Could |
|---|---|
| Program catalogue with variants (duration) | Must |
| Per-region pricing (8 regions, local currency labels) | Must (display); **decision**: charge in local currency? |
| Checkout for a single program (no shipping, no tax by default) | Must |
| Payment gateway(s) for PK + international | Must (client to choose) |
| Customer account creation at checkout + login (email OTP or password) | Must |
| Order confirmation email + admin notification | Must |
| Membership record created on payment (program, start, end) | Must |
| Accept Terms + Refund policy checkbox at checkout | Must |
| Intake / onboarding questionnaire after purchase (goals, weight, measurements, routine, food preferences, allergies, health conditions; see FAQ "How does the customized diet plan work?") | Should (core to the service) |
| Member Dashboard (resources, check-ins, meal logs, progress) | Should (phase 2) |
| Freeze / upgrade / renew membership | Should |
| Discount codes | Could |
| Manual-payment flow (bank transfer with proof upload, admin approval) | Could; likely needed for Pakistan |
| Recurring billing (if Premium is monthly) | Could, pending the client's answer |

## 3. Regional pricing: options

| Option | How | Pros | Cons |
|---|---|---|---|
| A. Display-only (today) | Show local prices, charge USD | Simplest | Misleading; FX mismatch; customer complaints |
| B. **Charge local currency** (recommended) | Store an explicit price per region × variant; detect region (IP + manual select, persisted in a cookie); create the checkout in that currency (Stripe supports multi-currency prices; a local PK gateway takes PKR) | Honest, matches the advertised price | More setup; a gateway is needed per currency |
| C. Show the USD price with an "≈ local" note | | Simple and honest | Loses the deliberate PK/IN discounts |

## 4. Entities

```
Program            id, slug, name, shortName, summary, whoIsItFor, howItWorks,
                   benefitsLabel ("Main Benefits"|"Covers"), cardBenefits[], fullBenefits[],
                   covers[], includes[] (e-book refs), image, order, isActive, seo{title,description}
ProgramVariant     id, programId, label ("1 Month","2 Months"…), durationMonths, isMinimum (Premium),
                   billing ("one_time"|"monthly"), legacyShopifyVariantId
Region             code (usa,canada,uae,saudi,qatar,india,pakistan,australia), label, currency (USD,CAD,AED,SAR,QAR,INR,PKR,AUD),
                   priceFormat ("$15","CAD 21","₹1,499","Rs. 4,000"), countries[] (ISO codes for geo-match), isDefault
VariantPrice       variantId, regionCode, amount, compareAtAmount?
Customer/User      id, name, email, phone/whatsapp, country, role (member|coach|admin), createdAt, marketingConsent
Order              id, userId, variantId, regionCode, currency, amount, status (pending|paid|failed|refunded),
                   gateway, gatewayRef, paidAt, termsAcceptedAt
Membership         id, userId, orderId, programId, variantId, startDate, endDate, status (pending_onboarding|active|frozen|expired|cancelled)
MembershipFreeze   id, membershipId, requestedAt, reason, startDate, endDate, status (requested|approved|rejected)
IntakeForm         id, userId, membershipId, goals, heightCm, weightKg, measurements{}, routine, activityLevel,
                   foodPreferences, allergies, healthConditions, medications, submittedAt
Resource           id, type (diet_plan|ebook|workout_video|guide), title, fileUrl/videoUrl, programIds[] or userId (personal plan), publishedAt
CheckIn            id, membershipId, weekNo, weightKg, measurements{}, photos[], adherence, notes, coachFeedback, submittedAt, reviewedAt
MealLog            id, membershipId, date, meal (breakfast|lunch|dinner|snack), photo, description, coachComment
Announcement       id, title, body, programIds[], publishedAt
ContactMessage     id, name, email, phone, subject (enum of 6), message, createdAt, handled
NewsletterSubscriber id, email, consentAt, source ("footer"), confirmedAt
Testimonial        id, type (before_after|video|review), image?, startKg?, endKg?, rating, instagramUrl?, quote?, order, showOnHome, consentOnFile
Faq                id, category (general|membership|payments), question, answer, showOnHome, order
Page (CMS)         slug, title, body(rich), seo   — about, how-it-works, legal pages
SiteSettings       whatsappNumber, whatsappDefaultMessage, publicEmail, legalEmail, socials{}, footerTagline, heroCopy{}
```

## 5. Contact & newsletter submissions (today)

- **Contact:** Shopify `POST /contact` with `form_type=contact`. Shopify emails the store's sender email. Field keys: `contact[name]`, `contact[email]`, `contact[phone]`, `contact[subject]`, `contact[body]`. Our version: store a `ContactMessage` and email the admin, with spam protection.
- **Newsletter:** `form_type=customer` + `contact[email]`, which creates a Shopify customer with marketing consent. Export existing subscribers and customers from the Shopify admin before switching.

## 6. Data to migrate from Shopify (needs admin access)

| Data | Source | Note |
|---|---|---|
| Products and variants | Admin export / `products.json` (already in `reference/data/`) | Clean the mojibake |
| Customers and newsletter subscribers | Admin → Customers → Export CSV | Includes marketing consent |
| Orders (if any) | Admin → Orders → Export | To create active memberships |
| Files (e-books, images) | Admin → Content → Files | Already downloaded what is public (`assets/original/`). Check for private files such as the Nutrition & Lifestyle e-book |
| Member Dashboard section code | Theme code editor → custom section / page template `page.member-dashboard` (template id `22504731902107`) | **Needed** to see the intended logged-in UI |
| Contact email / notification settings | Admin → Settings → Notifications | |
| Payment gateway settings | Admin → Settings → Payments | |
| Domain | `fattofitwithz.com` / `www.` currently point to **Wix** (server "Pepyaka") and return **404**; the store runs only on `6x06mr-b1.myshopify.com` | Get registrar/DNS access; check that the email MX records (info@) are not broken when DNS moves |
