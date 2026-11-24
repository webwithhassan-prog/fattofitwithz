/**
 * Payment details (admin > Website > Payment details): how clients pay while card payments are off.
 *
 *   Pakistan:      bank transfer (Meezan Bank) and JazzCash / Easypaisa, shown on the order page
 *                  after checkout with the order number to use as the payment reference.
 *   Other countries: the order page sends her to WhatsApp, where the coach arranges the payment.
 *
 * She then sends the payment screenshot on WhatsApp. The coach opens admin > Orders & payments,
 * sets the order to "Paid", and her program starts (src/payload/collections/Orders.ts).
 * Read by the website through getPaymentSettings() in src/lib/content.ts.
 */
import type { GlobalConfig } from "payload";
import { revalidateGlobalAfterChange } from "../hooks/revalidateSite";

export const Payments: GlobalConfig = {
  slug: "payments",
  label: "Payment details",
  admin: {
    group: false, // hidden from the menu (2026-11-25, kept simple); open it from admin Overview > More
    description: "The bank and JazzCash / Easypaisa details clients see after placing an order. Changes show on the website straight away.",
  },
  hooks: { afterChange: [revalidateGlobalAfterChange] },
  fields: [
    {
      name: "cardPayments",
      type: "checkbox",
      label: "Card payments with Stripe",
      defaultValue: false,
      admin: { description: "Leave unticked until Stripe is set up (it also needs the Stripe keys in Netlify). While off, everyone pays with the options below." },
    },
    {
      type: "collapsible",
      label: "Pakistan: bank transfer",
      fields: [
        { name: "bankEnabled", type: "checkbox", label: "Show bank transfer", defaultValue: true },
        { name: "bankLogo", type: "upload", relationTo: "media", label: "Bank logo", admin: { description: "Optional, e.g. the Meezan Bank logo. A wide PNG with a transparent or white background looks best." } },
        {
          type: "row",
          fields: [
            { name: "bankName", type: "text", label: "Bank name" },
            { name: "bankAccountTitle", type: "text", label: "Account title" },
            { name: "bankBranch", type: "text", label: "Branch code" },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "bankAccountNumber", type: "text", label: "Account number" },
            { name: "bankIban", type: "text", label: "IBAN" },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Pakistan: JazzCash / Easypaisa",
      fields: [
        { name: "walletEnabled", type: "checkbox", label: "Show JazzCash / Easypaisa", defaultValue: true },
        {
          type: "row",
          fields: [
            { name: "jazzcashLogo", type: "upload", relationTo: "media", label: "JazzCash logo" },
            { name: "easypaisaLogo", type: "upload", relationTo: "media", label: "Easypaisa logo" },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "walletNumber", type: "text", label: "Mobile number" },
            { name: "walletAccountName", type: "text", label: "Account name" },
          ],
        },
      ],
    },
    {
      name: "instructions",
      type: "textarea",
      label: "Steps shown under the details (Pakistan)",
      defaultValue:
        "Send the exact amount and write your order number in the payment reference. Then send us a screenshot of the payment on WhatsApp. Your program starts as soon as we confirm it, usually within a few hours.",
      admin: { rows: 3 },
    },
    {
      name: "otherCountriesText",
      type: "textarea",
      label: "Text for other countries",
      defaultValue: "We'll confirm your order and send you a secure way to pay on WhatsApp. Your program starts as soon as the payment is confirmed.",
      admin: { rows: 3 },
    },
  ],
};
