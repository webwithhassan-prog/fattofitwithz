/** The recorded 4-week workout plan (YouTube videos) shown in the member dashboard. */
import type { CollectionConfig } from "payload";
import { contentHooks } from "../hooks/revalidateSite";

export const WorkoutSessions: CollectionConfig = {
  slug: "workout-sessions",
  labels: { singular: "Workout recording", plural: "Workout recordings" },
  defaultSort: "week",
  admin: {
    useAsTitle: "workout",
    defaultColumns: ["workout", "week", "day", "youtubeUrl"],
    group: "Website",
    pagination: { defaultLimit: 50 },
    description: "The recorded YouTube workouts on the member dashboard. Six per week (Monday to Saturday); day 1 = Monday.",
  },
  hooks: contentHooks,
  fields: [
    {
      type: "row",
      fields: [
        { name: "week", type: "number", required: true, min: 1, max: 12 },
        { name: "day", type: "number", required: true, min: 1, max: 6 },
      ],
    },
    { name: "workout", type: "text", required: true, label: "Workout name" },
    {
      name: "youtubeUrl",
      type: "text",
      required: true,
      label: "YouTube link",
      admin: { description: "e.g. https://youtu.be/dGyVLPcUcs8" },
    },
  ],
};
