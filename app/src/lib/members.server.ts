/**
 * Loads what the member area shows for the logged-in member, in one place:
 * her program, her first day form, her follow-up forms and whether she bought the e-book.
 *
 * Called by the dashboard layout AND its pages in the same request; React's cache()
 * makes sure the database is only asked once.
 */
import "server-only";
import { cache } from "react";
import { getPayloadClient } from "./payload.server";
import { requireMember } from "./auth/session.server";
import { EMPTY_FIRST_DAY_FORM, MEASUREMENT_FIELDS } from "./member";
import type { DashboardData, FirstDayFormData, Measurements, MemberProgram } from "./member";
import { dayOf, freezeHasEnded, isPausedToday, todayIso } from "./freeze";
import type { Payload, Where } from "payload";
import type { FirstDayForm, Membership } from "@/payload-types";

const DAY = 24 * 60 * 60 * 1000;
const isoDay = (date: string | Date) => new Date(date).toISOString().slice(0, 10);
const str = (value: unknown) => (value === null || value === undefined ? "" : String(value));

/** Database row -> the shape the form edits (numbers become strings, empty values become ""). */
export function toFirstDayFormData(row: FirstDayForm): FirstDayFormData {
  const measurements = Object.fromEntries(MEASUREMENT_FIELDS.map(({ key }) => [key, str(row[key])])) as Measurements;
  return {
    ...EMPTY_FIRST_DAY_FORM,
    fullName: str(row.fullName),
    age: str(row.age),
    height: str(row.height),
    currentWeightKg: str(row.currentWeightKg),
    goalWeightKg: str(row.goalWeightKg),
    gender: str(row.gender) as FirstDayFormData["gender"],
    maritalStatus: str(row.maritalStatus),
    student: str(row.student) as FirstDayFormData["student"],
    diet: str(row.diet) as FirstDayFormData["diet"],
    smoking: str(row.smoking) as FirstDayFormData["smoking"],
    medicalConditions: str(row.medicalConditions) as FirstDayFormData["medicalConditions"],
    medicalDetails: str(row.medicalDetails),
    allergies: str(row.allergies) as FirstDayFormData["allergies"],
    allergyDetails: str(row.allergyDetails),
    likes: str(row.likes),
    dislikes: str(row.dislikes),
    waterIntake: str(row.waterIntake),
    sleepHours: str(row.sleepHours),
    measurements,
    notes: str(row.notes),
  };
}

/** The membership running (or paused) today, else her most recent one, else null. */
function toProgram(memberships: Membership[]): MemberProgram | null {
  const today = todayIso();
  const withProgram = memberships.filter((m) => typeof m.program === "object");
  // A paused program without a restart date stays "current" even past its end date (the days are added back on restart).
  const isCurrent = (m: Membership) =>
    m.status !== "cancelled" && dayOf(m.startDate) <= today && (dayOf(m.endDate) >= today || isPausedToday(m, today));
  const chosen = withProgram.find(isCurrent) ?? withProgram[0];
  if (!chosen || typeof chosen.program !== "object") return null;
  const paused = isCurrent(chosen) && isPausedToday(chosen, today);

  const startDate = isoDay(chosen.startDate);
  const endDate = isoDay(chosen.endDate);
  return {
    name: chosen.program.name,
    slug: chosen.program.slug,
    startDate,
    endDate,
    // Program length without the days added by freezes (a 3-month program stays "3 months")
    months: Math.max(1, Math.round((Date.parse(endDate) - Date.parse(startDate) - (chosen.daysFrozen ?? 0) * DAY) / (30.4 * DAY))),
    active: isCurrent(chosen) && !paused,
    paused,
    pausedUntil: paused && chosen.frozenUntil ? dayOf(chosen.frozenUntil) : null,
  };
}

/** Sets frozen memberships whose "Resume on" day has come back to Active (the Memberships hook fixes the end date). */
export async function restartEndedFreezes(payload: Payload, memberId?: number) {
  const where: Where = { and: [{ status: { equals: "frozen" } }, { frozenUntil: { less_than_equal: new Date().toISOString() } }, ...(memberId ? [{ member: { equals: memberId } }] : [])] };
  const { docs } = await payload.find({ collection: "memberships", where, limit: 100, depth: 0 });
  for (const m of docs) {
    if (!freezeHasEnded(m)) continue;
    await payload.update({ collection: "memberships", id: m.id, data: { status: "active" } });
    console.log(`[freeze] membership ${m.id} restarted automatically`);
  }
}

/** Her program today (running, paused, ended) or null if she never bought one. Used by pages and the form actions. */
export async function loadMemberProgram(payload: Payload, memberId: number): Promise<MemberProgram | null> {
  const find = () => payload.find({ collection: "memberships", where: { member: { equals: memberId } }, sort: "-startDate", limit: 20, depth: 1 });
  let memberships = await find();
  if (memberships.docs.some((m) => freezeHasEnded(m))) {
    await restartEndedFreezes(payload, memberId);
    memberships = await find();
  }
  return toProgram(memberships.docs);
}

export const getDashboardData = cache(async (): Promise<DashboardData> => {
  const doc = await requireMember(); // not logged in -> redirected to /login
  const payload = await getPayloadClient();

  const [program, firstDay, followUps, ebookOrders] = await Promise.all([
    loadMemberProgram(payload, doc.id),
    payload.find({ collection: "first-day-forms", where: { member: { equals: doc.id } }, limit: 1, depth: 0 }),
    payload.find({ collection: "follow-up-forms", where: { member: { equals: doc.id } }, sort: "-createdAt", limit: 50, depth: 0 }),
    payload.count({
      collection: "orders",
      where: { and: [{ ebook: { equals: true } }, { status: { equals: "paid" } }, { or: [{ member: { equals: doc.id } }, { email: { equals: doc.email } }] }] },
    }),
  ]);

  const fullName = doc.fullName ?? "";
  const form = firstDay.docs[0];
  return {
    member: { id: doc.id, email: doc.email, firstName: fullName.split(" ")[0] || "there", fullName, phone: doc.phone ?? "" },
    program,
    firstDayForm: form ? { id: form.id, updatedAt: form.updatedAt, data: toFirstDayFormData(form) } : null,
    followUps: followUps.docs.map((f) => ({ id: f.id, createdAt: f.createdAt, weightKg: f.weightKg, mood: f.mood ?? "" })),
    hasEbook: ebookOrders.totalDocs > 0,
    workoutsDone: Array.isArray(doc.workoutsDone) ? doc.workoutsDone.filter((k): k is string => typeof k === "string") : [],
  };
});

/** Reminders for her + announcements for everyone, newest first (admin > Reminders & announcements). */
export async function getClientMessages(memberId: number) {
  const payload = await getPayloadClient();
  const today = isoDay(new Date());
  const { docs } = await payload.find({
    collection: "announcements",
    where: {
      and: [
        { or: [{ audience: { equals: "everyone" } }, { member: { equals: memberId } }] },
        { or: [{ showUntil: { exists: false } }, { showUntil: { greater_than_equal: today } }] },
      ],
    },
    sort: "-createdAt",
    limit: 5,
    depth: 0,
  });
  return docs.map((d) => ({ id: d.id, title: d.title, message: d.message, isReminder: d.audience === "one", createdAt: d.createdAt }));
}

/** Issues she reported, newest first, with the coach's reply (admin > Client issues). */
export async function getClientIssues(memberId: number) {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({ collection: "client-issues", where: { member: { equals: memberId } }, sort: "-createdAt", limit: 30, depth: 0 });
  return docs.map((d) => ({ id: d.id, topic: d.topic, message: d.message, status: d.status, reply: d.reply ?? "", createdAt: d.createdAt }));
}
