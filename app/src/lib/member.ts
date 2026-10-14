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

/** Answers for "How much water do you drink a day?" (both forms). 1 glass is about 250 ml. */
export const WATER_INTAKE = ["Less than 1 litre", "1 to 2 litres", "2 to 3 litres", "More than 3 litres"] as const;

/** Answers for "How many hours do you sleep?" (both forms). */
export const SLEEP_HOURS = ["Less than 5 hours", "5 to 6 hours", "7 to 8 hours", "More than 8 hours"] as const;

export type MeasurementKey = (typeof MEASUREMENT_FIELDS)[number]["key"];

/** Body measurements in cm, as strings while being typed ("" = not filled in yet). All 7 are required. */
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
  waterIntake: string;
  sleepHours: string;
  measurements: Measurements;
  notes: string;
};

/** A follow-up form (sent whenever the coach asks, usually weekly). */
export type FollowUpFormData = {
  weightKg: string;
  mood: "great" | "good" | "okay" | "tired" | "low" | "";
  waterIntake: string;
  sleepHours: string;
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
  /** true while her program is running today: between the start and end date, not cancelled, not paused */
  active: boolean;
  /** true while the coach has frozen (paused) it; her forms and workouts are locked meanwhile (lib/freeze.ts) */
  paused: boolean;
  /** YYYY-MM-DD the paused program restarts by itself, or null (no date yet / not paused) */
  pausedUntil: string | null;
};

export type DashboardData = {
  member: { id: number; email: string; firstName: string; fullName: string; phone: string };
  /** null = she has never bought a program */
  program: MemberProgram | null;
  firstDayForm: { id: number; updatedAt: string; data: FirstDayFormData } | null;
  followUps: { id: number; createdAt: string; weightKg: number; mood: string }[];
  /** Did she buy the e-book? (the link itself comes from getEbook()) */
  hasEbook: boolean;
  /** Workout videos she has finished, as "week-day" keys, e.g. "1-3" = week 1, day 3 */
  workoutsDone: string[];
};

/** Key for one workout video in workoutsDone: "1-3" = week 1, day 3. */
export const workoutKey = (week: number, day: number) => `${week}-${day}`;

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
  waterIntake: "",
  sleepHours: "",
  measurements: EMPTY_MEASUREMENTS,
  notes: "",
};

export const EMPTY_FOLLOW_UP_FORM: FollowUpFormData = { weightKg: "", mood: "", waterIntake: "", sleepHours: "", measurements: EMPTY_MEASUREMENTS, notes: "" };

/** Topics a client can choose on "Report an issue" (also the options in admin > Client issues). */
export const ISSUE_TOPICS = ["Payment", "Login / account", "Forms", "Workout videos", "Diet plan", "Other"] as const;
