/**
 * DEMO CLIENT for showing the member area (everything unlocked).
 *
 *   npx payload run src/payload/seed/demo-client.ts          create (or reset) the demo client
 *   npx payload run src/payload/seed/demo-client.ts remove   delete it and everything it has
 *   npx payload run src/payload/seed/demo-client.ts fix-form refresh only the sample forms (keeps the password)
 *
 * Creates demo.client@fattofitwithz.com with an active 6-month Total Transformation membership,
 * a filled first day form, one follow-up and a welcome reminder. A new random password is made
 * each time and written to app/demo-client-login.txt (that file is git-ignored; share it privately).
 * NOTE: the website and the live site share one database, so this account also works on the live site.
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { getPayload } from "payload";
import config from "@payload-config";

const EMAIL = "demo.client@fattofitwithz.com";
const OUT = path.resolve(process.cwd(), "demo-client-login.txt");
const DAY = 24 * 60 * 60 * 1000;

// Same password format as src/lib/auth/crypto.server.ts (that file is server-only, so it can't load here)
const scryptAsync = promisify(crypto.scrypt) as (p: string, s: Buffer, k: number) => Promise<Buffer>;
async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const hash = await scryptAsync(password.normalize("NFKC"), salt, 64);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

/** Sample answers. Option values must match the form exactly (src/components/dashboard/FirstDayForm.tsx). */
const DEMO_FIRST_DAY_FORM = {
  reviewed: true, fullName: "Demo Client", age: "29", height: "5'4\" (163 cm)", currentWeightKg: 74, goalWeightKg: 62,
  gender: "Female", maritalStatus: "Married", student: "No", diet: "Non-Vegetarian", smoking: "No",
  medicalConditions: "Yes", medicalDetails: "PCOS", allergies: "No", allergyDetails: "", likes: "Daal, chicken karahi, fruit chaat", dislikes: "Karela",
  waterIntake: "1 to 2 litres", sleepHours: "5 to 6 hours",
  chest: 96, waist: 86, hips: 102, thigh: 58, arm: 30, shoulder: 39, calf: 36,
  notes: "This is a demo form: these answers show how the first day form looks once a client fills it in.",
};

const DEMO_FOLLOW_UP = {
  weightKg: 72.5, mood: "good" as const, waterIntake: "2 to 3 litres", sleepHours: "7 to 8 hours", reviewed: true,
  chest: 95, waist: 84, hips: 100, thigh: 57, arm: 29.5, shoulder: 39, calf: 35.5,
  notes: "Demo follow-up: feeling more energetic.",
};

const payload = await getPayload({ config });
const existing = await payload.find({ collection: "members", where: { email: { equals: EMAIL } }, limit: 1, depth: 0 });

// "fix-form": only refresh the demo forms (keeps the account and its password)
if (process.argv.includes("fix-form")) {
  const demo = existing.docs[0];
  if (!demo) throw new Error("[demo-client] No demo client yet: run without arguments first.");
  await payload.update({ collection: "first-day-forms", where: { member: { equals: demo.id } }, data: DEMO_FIRST_DAY_FORM });
  await payload.update({ collection: "follow-up-forms", where: { member: { equals: demo.id } }, data: DEMO_FOLLOW_UP });
  console.log("[demo-client] demo forms refreshed");
  process.exit(0);
}
// Deleting the member also deletes her forms, memberships, issues and reminders (Members beforeDelete hook).
if (existing.docs[0]) await payload.delete({ collection: "members", id: existing.docs[0].id });

if (process.argv.includes("remove")) {
  if (fs.existsSync(OUT)) fs.unlinkSync(OUT);
  console.log("[demo-client] removed");
  process.exit(0);
}

const password = crypto.randomBytes(9).toString("base64url");
const member = await payload.create({
  collection: "members",
  data: { email: EMAIL, fullName: "Demo Client", phone: "+92 300 0000000", passwordHash: await hashPassword(password), passwordSetAt: new Date().toISOString(), coachNotes: "Demo account for showing the member area." },
});

const program = (await payload.find({ collection: "programs", where: { slug: { equals: "total-transformation" } }, limit: 1, depth: 0 })).docs[0];
if (!program) throw new Error("[demo-client] Program total-transformation not found");
const start = new Date(Date.now() - 7 * DAY);
const end = new Date(start.getTime() + 182 * DAY);
const midday = (d: Date) => `${d.toISOString().slice(0, 10)}T12:00:00.000Z`;
await payload.create({ collection: "memberships", data: { member: member.id, program: program.id, startDate: midday(start), endDate: midday(end), status: "active", notes: "Demo membership" } });

await payload.create({
  collection: "first-day-forms",
  data: {
    ...DEMO_FIRST_DAY_FORM,
    member: member.id,
  },
});
await payload.create({ collection: "follow-up-forms", data: { ...DEMO_FOLLOW_UP, member: member.id } });
await payload.create({ collection: "announcements", data: { audience: "one", member: member.id, title: "Welcome to your member area", message: "This is a demo account: everything here is unlocked so you can see what clients get." } });

fs.writeFileSync(OUT, `Demo client login (member area)\nWebsite: https://fattofitwithz.com/login\nEmail: ${EMAIL}\nPassword: ${password}\n`);
console.log(`[demo-client] ready: ${EMAIL} (member ${member.id}). Login details saved to ${OUT}`);
process.exit(0);
