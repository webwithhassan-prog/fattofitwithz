"use server";

/**
 * Server actions for the member area: the two forms, and logging out.
 *
 * Each save:
 *   1. checks who is logged in (never trusts an id sent by the browser),
 *   2. checks she has a program (the forms are part of every program),
 *   3. validates the answers with zod and writes them to the database,
 *   4. returns the saved form's id, so the page can show the "save image / send on WhatsApp" step.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getPayloadClient } from "@/lib/payload.server";
import { endSession, getCurrentMember } from "@/lib/auth/session.server";
import { MEASUREMENT_FIELDS } from "@/lib/member";

export type SaveFormResult = { ok: true; id: number } | { ok: false; error: string };

const NOT_LOGGED_IN: SaveFormResult = { ok: false, error: "Your login has expired. Please refresh the page and log in again." };
const SAVE_FAILED: SaveFormResult = { ok: false, error: "We couldn't save your form. Please check your connection and try again." };
const NO_PROGRAM: SaveFormResult = { ok: false, error: "The forms open after you join a program." };

const invalid = (error: z.ZodError): SaveFormResult => ({ ok: false, error: error.issues[0]?.message ?? "Please check the form." });

// ---------- shared field rules ----------

const cm = z.union([z.literal(""), z.coerce.number().min(10, "Measurements are in cm (10–250)").max(250, "Measurements are in cm (10–250)")]);
const Measurements = z.object(Object.fromEntries(MEASUREMENT_FIELDS.map(({ key }) => [key, cm])) as Record<(typeof MEASUREMENT_FIELDS)[number]["key"], typeof cm>);
const kg = (label: string) => z.coerce.number({ error: `Please enter your ${label}` }).min(30, `${label} looks wrong (30–250 kg)`).max(250, `${label} looks wrong (30–250 kg)`);
const yesNo = z.enum(["Yes", "No"], { error: "Please answer every Yes / No question" });

/** "" -> null for the database, numbers stay numbers */
const measurementsForDb = (m: z.infer<typeof Measurements>) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v === "" ? null : v]));

type MemberContext =
  | { error: SaveFormResult }
  | { error?: undefined; member: NonNullable<Awaited<ReturnType<typeof getCurrentMember>>>; payload: Awaited<ReturnType<typeof getPayloadClient>> };

async function memberWithProgram(): Promise<MemberContext> {
  const member = await getCurrentMember();
  if (!member) return { error: NOT_LOGGED_IN };
  const payload = await getPayloadClient();
  const memberships = await payload.count({ collection: "memberships", where: { and: [{ member: { equals: member.id } }, { status: { not_equals: "cancelled" } }] } });
  if (memberships.totalDocs === 0) return { error: NO_PROGRAM };
  return { member, payload };
}

// ---------- first day form ----------

const FirstDayInput = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  age: z.string().min(1, "Please choose your age").max(3),
  height: z.string().min(1, "Please choose your height").max(30),
  currentWeightKg: kg("current weight"),
  goalWeightKg: z.union([z.literal(""), kg("goal weight")]),
  gender: z.enum(["Female", "Other"], { error: "Please choose your gender" }),
  maritalStatus: z.string().min(1, "Please choose your marital status").max(30),
  student: yesNo,
  diet: z.enum(["Vegetarian", "Non-Vegetarian"], { error: "Please choose your diet preference" }),
  smoking: yesNo,
  medicalConditions: yesNo,
  medicalDetails: z.string().trim().max(300),
  allergies: yesNo,
  allergyDetails: z.string().trim().max(300),
  likes: z.string().trim().min(1, "Please tell us foods you like").max(300),
  dislikes: z.string().trim().min(1, "Please tell us foods you dislike").max(300),
  measurements: Measurements,
  notes: z.string().trim().max(2000, "Notes are too long (2000 characters max)"),
});

export async function saveFirstDayForm(input: unknown): Promise<SaveFormResult> {
  const parsed = FirstDayInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const ctx = await memberWithProgram();
  if (ctx.error) return ctx.error;
  const { member, payload } = ctx;

  const { measurements, goalWeightKg, ...rest } = parsed.data;
  const data = { ...rest, goalWeightKg: goalWeightKg === "" ? null : goalWeightKg, ...measurementsForDb(measurements), member: member.id };

  try {
    // One first day form per member: update it if she fills it in again.
    const existing = await payload.find({ collection: "first-day-forms", where: { member: { equals: member.id } }, limit: 1, depth: 0 });
    const saved = existing.docs[0]
      ? await payload.update({ collection: "first-day-forms", id: existing.docs[0].id, data: { ...data, reviewed: false } })
      : await payload.create({ collection: "first-day-forms", data });
    // Keep her name on the account in step with the form.
    if (member.fullName !== rest.fullName) await payload.update({ collection: "members", id: member.id, data: { fullName: rest.fullName } });
    revalidatePath("/dashboard", "layout");
    return { ok: true, id: saved.id };
  } catch (error) {
    console.error(`[dashboard:first-day] member ${member.id}:`, error);
    return SAVE_FAILED;
  }
}

// ---------- follow-up form ----------

const FollowUpInput = z.object({
  weightKg: kg("weight"),
  mood: z.enum(["great", "good", "okay", "tired", "low", ""]),
  measurements: Measurements,
  notes: z.string().trim().max(2000, "Notes are too long (2000 characters max)"),
});

export async function saveFollowUpForm(input: unknown): Promise<SaveFormResult> {
  const parsed = FollowUpInput.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const ctx = await memberWithProgram();
  if (ctx.error) return ctx.error;
  const { member, payload } = ctx;

  const { measurements, mood, ...rest } = parsed.data;
  try {
    const saved = await payload.create({
      collection: "follow-up-forms",
      data: { ...rest, mood: mood || null, ...measurementsForDb(measurements), member: member.id },
    });
    revalidatePath("/dashboard", "layout");
    return { ok: true, id: saved.id };
  } catch (error) {
    console.error(`[dashboard:follow-up] member ${member.id}:`, error);
    return SAVE_FAILED;
  }
}

// ---------- log out ----------

export async function logOut(): Promise<void> {
  await endSession();
  redirect("/login?loggedOut=1");
}
