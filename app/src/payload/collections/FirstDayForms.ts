/**
 * The "first day form": the client fills it in once, after joining a program.
 * Her answers about herself, food, health and body measurements. One per member; she can update it.
 * Filled in on the website (/dashboard/first-day). The coach reads it here and sends the diet plan on WhatsApp.
 */
import type { CollectionConfig } from "payload";

const text = (name: string, label: string) => ({ name, label, type: "text" as const });
const cm = (name: string, label: string) => ({ name, label, type: "number" as const, min: 0, max: 300 });

export const FirstDayForms: CollectionConfig = {
  slug: "first-day-forms",
  labels: { singular: "First day form", plural: "First day forms" },
  defaultSort: "-updatedAt",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "member", "reviewed", "updatedAt"],
    group: "Clients",
    pagination: { defaultLimit: 50 },
    description: "Filled in by each client after joining. Read it, send her diet plan on WhatsApp, then tick \"Diet plan sent\".",
  },
  hooks: {
    beforeChange: [
      // Readable title for lists, e.g. "Ayesha Khan · 70 kg → 64 kg"
      ({ data }) => {
        const goal = data.goalWeightKg ? ` → ${data.goalWeightKg} kg` : "";
        data.title = `${data.fullName || "Client"} · ${data.currentWeightKg ?? "?"} kg${goal}`;
        return data;
      },
    ],
  },
  fields: [
    { name: "title", type: "text", admin: { hidden: true } },
    {
      // Stored as "reviewed" in the database; shown as "Diet plan sent" (admin > Diet plans to send lists the unticked ones).
      name: "reviewed",
      type: "checkbox",
      label: "Diet plan sent",
      defaultValue: false,
      admin: { position: "sidebar", description: "Tick after you've sent her diet plan on WhatsApp." },
    },
    { name: "member", type: "relationship", relationTo: "members", required: true, unique: true, index: true, admin: { position: "sidebar" } },
    {
      type: "collapsible",
      label: "About her",
      fields: [
        { type: "row", fields: [text("fullName", "Full name"), text("age", "Age"), text("height", "Height")] },
        {
          type: "row",
          fields: [
            { name: "currentWeightKg", label: "Current weight (kg)", type: "number", min: 30, max: 250 },
            { name: "goalWeightKg", label: "Goal weight (kg)", type: "number", min: 30, max: 250 },
          ],
        },
        { type: "row", fields: [text("gender", "Gender"), text("maritalStatus", "Marital status"), text("student", "Student?")] },
      ],
    },
    {
      type: "collapsible",
      label: "Food & health",
      fields: [
        { type: "row", fields: [text("diet", "Diet"), text("smoking", "Smoking")] },
        { type: "row", fields: [text("waterIntake", "Water a day"), text("sleepHours", "Sleep a night")] },
        { type: "row", fields: [text("medicalConditions", "Medical conditions?"), text("medicalDetails", "Details")] },
        { type: "row", fields: [text("allergies", "Allergies?"), text("allergyDetails", "Details")] },
        { type: "row", fields: [text("likes", "Foods she likes"), text("dislikes", "Foods she dislikes")] },
      ],
    },
    {
      type: "collapsible",
      label: "Measurements (cm)",
      fields: [
        { type: "row", fields: [cm("chest", "Chest"), cm("waist", "Waist"), cm("hips", "Hips"), cm("thigh", "Thigh")] },
        { type: "row", fields: [cm("arm", "Arm"), cm("shoulder", "Shoulder"), cm("calf", "Calf")] },
      ],
    },
    { name: "notes", type: "textarea", label: "Anything else she wants you to know" },
  ],
};
