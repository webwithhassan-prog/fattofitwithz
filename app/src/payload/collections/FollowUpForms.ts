/**
 * Follow-up forms: the client sends one whenever the coach asks (usually weekly):
 * her weight, how she feels, water, sleep, measurements and notes.
 * Filled in on the website (/dashboard/follow-up). The coach reads it here and replies on WhatsApp.
 */
import type { CollectionConfig } from "payload";

const text = (name: string, label: string) => ({ name, label, type: "text" as const });
const cm = (name: string, label: string) => ({ name, label, type: "number" as const, min: 0, max: 300 });

export const FollowUpForms: CollectionConfig = {
  slug: "follow-up-forms",
  labels: { singular: "Follow-up form", plural: "Follow-up forms" },
  defaultSort: "-createdAt",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "member", "mood", "reviewed", "createdAt"],
    group: "Clients",
    pagination: { defaultLimit: 50 },
    description: "Progress updates from clients. Read them, reply on WhatsApp, then tick \"Reviewed\".",
  },
  hooks: {
    beforeChange: [
      // Readable title for lists, e.g. "Ayesha Khan · 68.5 kg"
      async ({ data, req }) => {
        const memberId = typeof data.member === "object" ? data.member?.id : data.member;
        const member = memberId ? await req.payload.findByID({ collection: "members", id: memberId, depth: 0, req }) : null;
        data.title = `${member?.displayName ?? "Client"} · ${data.weightKg ?? "?"} kg`;
        return data;
      },
    ],
  },
  fields: [
    { name: "title", type: "text", admin: { hidden: true } },
    {
      name: "reviewed",
      type: "checkbox",
      label: "Reviewed",
      defaultValue: false,
      admin: { position: "sidebar", description: "Tick after you've read it and replied." },
    },
    { name: "member", type: "relationship", relationTo: "members", required: true, index: true, admin: { position: "sidebar" } },
    {
      type: "row",
      fields: [
        { name: "weightKg", type: "number", label: "Weight (kg)", required: true, min: 30, max: 250 },
        {
          name: "mood",
          type: "select",
          label: "How she feels",
          options: [
            { label: "Great", value: "great" },
            { label: "Good", value: "good" },
            { label: "Okay", value: "okay" },
            { label: "Tired", value: "tired" },
            { label: "Low", value: "low" },
          ],
        },
      ],
    },
    { type: "row", fields: [text("waterIntake", "Water a day"), text("sleepHours", "Sleep a night")] },
    {
      type: "collapsible",
      label: "Measurements (cm)",
      fields: [
        { type: "row", fields: [cm("chest", "Chest"), cm("waist", "Waist"), cm("hips", "Hips"), cm("thigh", "Thigh")] },
        { type: "row", fields: [cm("arm", "Arm"), cm("shoulder", "Shoulder"), cm("calf", "Calf")] },
      ],
    },
    { name: "notes", type: "textarea", label: "How the week went / questions" },
  ],
};
