/**
 * Member area: shared types and form field lists.
 * Safe to use in both server and browser code (no database access here).
 * Loading a member's data happens in ./members.server.ts; saving in app/(frontend)/dashboard/actions.ts.
 */

export const MEASUREMENT_FIELDS = [
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "hips", label: "Hips" },
  { key: "thigh", label: "Thigh" },
  { key: "arm", label: "Arm" },
  { key: "shoulder", label: "Shoulder" },
  { key: "calf", label: "Calf" },
] as const;

export type MeasurementKey = (typeof MEASUREMENT_FIELDS)[number]["key"];

/** Body measurements in cm, as strings while being typed ("" = not filled in). */
export type Measurements = Record<MeasurementKey, string>;

/** The first day form (filled in once after joining; can be updated). */
export type FirstDayFormData = {
  fullName: string;
  age: string;
  height: string;
  currentWeightKg: string;
  goalWeightKg: string;
  gender: "Female" | "Other" | "";
  maritalStatus: string;
  student: "Yes" | "No" | "";
  diet: "Vegetarian" | "Non-Vegetarian" | "";
  smoking: "Yes" | "No" | "";
  medicalConditions: "Yes" | "No" | "";
  medicalDetails: string;
  allergies: "Yes" | "No" | "";
  allergyDetails: string;
  likes: string;
  dislikes: string;
  measurements: Measurements;
  notes: string;
};

/** A follow-up form (sent whenever the coach asks, usually weekly). */
export type FollowUpFormData = {
  weightKg: string;
  mood: "great" | "good" | "okay" | "tired" | "low" | "";
  measurements: Measurements;
  notes: string;
};

export const MOODS = [
  { id: "great", label: "Great", emoji: "😄" },
  { id: "good", label: "Good", emoji: "🙂" },
  { id: "okay", label: "Okay", emoji: "😐" },
  { id: "tired", label: "Tired", emoji: "😩" },
  { id: "low", label: "Low", emoji: "😔" },
] as const;

export type MemberProgram = {
  name: string;
  slug: string;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  endDate: string;
  months: number;
  /** true while today is between the start and end date (and it isn't cancelled) */
  active: boolean;
};

export type DashboardData = {
  member: { id: number; email: string; firstName: string; fullName: string; phone: string };
  /** null = she has never bought a program */
  program: MemberProgram | null;
  firstDayForm: { id: number; updatedAt: string; data: FirstDayFormData } | null;
  followUps: { id: number; createdAt: string; weightKg: number; mood: string }[];
  /** Did she buy the e-book? (the link itself comes from getEbook()) */
  hasEbook: boolean;
};

export const EMPTY_MEASUREMENTS: Measurements = { chest: "", waist: "", hips: "", thigh: "", arm: "", shoulder: "", calf: "" };

export const EMPTY_FIRST_DAY_FORM: FirstDayFormData = {
  fullName: "",
  age: "",
  height: "",
  currentWeightKg: "",
  goalWeightKg: "",
  gender: "",
  maritalStatus: "",
  student: "",
  diet: "",
  smoking: "",
  medicalConditions: "",
  medicalDetails: "",
  allergies: "",
  allergyDetails: "",
  likes: "",
  dislikes: "",
  measurements: EMPTY_MEASUREMENTS,
  notes: "",
};

export const EMPTY_FOLLOW_UP_FORM: FollowUpFormData = { weightKg: "", mood: "", measurements: EMPTY_MEASUREMENTS, notes: "" };
