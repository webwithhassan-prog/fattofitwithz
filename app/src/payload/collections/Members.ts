/**
 * Client accounts. Created when someone signs up on the website, at checkout,
 * or by the coach here (e.g. for clients who paid another way).
 *
 * Opening a member shows everything about her in one place (tabs):
 *   Overview     name, email, WhatsApp number, private coach notes
 *   Forms        her first day form and follow-up forms
 *   Membership   her memberships and orders
 *   Login        password status, lock, and the devices she is logged in on
 *
 * Members log in on the website with email + password (src/lib/auth/passwords.server.ts).
 * This is deliberately NOT a Payload "auth" collection: members never get access to /admin.
 */
import type { CollectionConfig } from "payload";
import { normalizeEmail } from "../fields/normalizeEmail";

export const Members: CollectionConfig = {
  slug: "members",
  labels: { singular: "Member", plural: "Members" },
  defaultSort: "-createdAt",
  admin: {
    useAsTitle: "displayName",
    defaultColumns: ["displayName", "email", "phone", "createdAt"],
    listSearchableFields: ["fullName", "email", "phone"],
    group: "Clients",
    pagination: { defaultLimit: 50 },
    description: "Client accounts. Open one to see her forms, memberships and orders in one place.",
  },
  hooks: {
    beforeChange: [
      // Name shown in lists and links: her full name, or her email until she adds a name.
      ({ data, originalDoc }) => {
        const fullName = (data.fullName ?? originalDoc?.fullName ?? "").trim();
        data.displayName = fullName || data.email || originalDoc?.email;
        return data;
      },
    ],
  },
  fields: [
    { name: "displayName", type: "text", label: "Name", admin: { hidden: true } },
    {
      type: "tabs",
      tabs: [
        {
          label: "Overview",
          fields: [
            {
              type: "row",
              fields: [
                { name: "fullName", type: "text", label: "Full name" },
                {
                  name: "email",
                  type: "email",
                  required: true,
                  unique: true,
                  index: true,
                  hooks: { beforeValidate: [normalizeEmail] },
                  admin: { description: "She logs in with this email." },
                },
                { name: "phone", type: "text", label: "WhatsApp number" },
              ],
            },
            { name: "coachNotes", type: "textarea", label: "Coach notes", admin: { rows: 4, description: "Private. The member never sees this." } },
          ],
        },
        {
          label: "Forms",
          fields: [
            {
              name: "firstDayForm",
              type: "join",
              collection: "first-day-forms",
              on: "member",
              label: "First day form",
              admin: { defaultColumns: ["title", "reviewed", "updatedAt"], allowCreate: false },
            },
            {
              name: "followUpForms",
              type: "join",
              collection: "follow-up-forms",
              on: "member",
              label: "Follow-up forms",
              defaultSort: "-createdAt",
              admin: { defaultColumns: ["title", "mood", "reviewed", "createdAt"], allowCreate: false },
            },
          ],
        },
        {
          label: "Membership",
          fields: [
            {
              name: "memberships",
              type: "join",
              collection: "memberships",
              on: "member",
              label: "Memberships",
              defaultSort: "-startDate",
              admin: { defaultColumns: ["title", "status"], allowCreate: true, description: "Add one here for clients who paid another way." },
            },
            {
              name: "orders",
              type: "join",
              collection: "orders",
              on: "member",
              label: "Orders",
              defaultSort: "-createdAt",
              admin: { defaultColumns: ["orderLabel", "amount", "currency", "status", "createdAt"], allowCreate: true },
            },
          ],
        },
        {
          label: "Login",
          fields: [
            {
              name: "passwordSetAt",
              type: "date",
              label: "Password created",
              admin: {
                readOnly: true,
                date: { pickerAppearance: "dayAndTime" },
                description: 'Empty = no password yet. She can create one with "Forgot password" on the login page.',
              },
            },
            {
              type: "row",
              fields: [
                { name: "failedLogins", type: "number", defaultValue: 0, label: "Wrong passwords in a row" },
                {
                  name: "lockedUntil",
                  type: "date",
                  label: "Locked until",
                  admin: {
                    date: { pickerAppearance: "dayAndTime" },
                    description: "5 wrong passwords lock the account for 15 minutes. Clear this to unlock now.",
                  },
                },
              ],
            },
            {
              name: "sessions",
              type: "join",
              collection: "member-sessions",
              on: "member",
              label: "Logged in on",
              admin: { defaultColumns: ["userAgent", "createdAt", "expiresAt"], allowCreate: false, description: "Delete a row to log her out on that device." },
            },
            { name: "passwordHash", type: "text", admin: { hidden: true } }, // scrambled password; never shown
          ],
        },
      ],
    },
  ],
};
