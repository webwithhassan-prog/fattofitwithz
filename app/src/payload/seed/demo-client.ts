/**
 * DEMO CLIENT for showing the member area (everything unlocked).
 *
 *   npx payload run src/payload/seed/demo-client.ts          create (or reset) the demo client
 *   npx payload run src/payload/seed/demo-client.ts remove   delete it and everything it has
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

const payload = await getPayload({ config });
const existing = await payload.find({ collection: "members", where: { email: { equals: EMAIL } }, limit: 1, depth: 0 });
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
    member: member.id, reviewed: true, fullName: "Demo Client", age: "29", height: "5'4\"", currentWeightKg: 74, goalWeightKg: 62,
    gender: "Female", maritalStatus: "Married", student: "No", diet: "Non-vegetarian", smoking: "No",
    medicalConditions: "Yes", medicalDetails: "PCOS", allergies: "No", likes: "Daal, chicken karahi, fruit chaat", dislikes: "Karela",
    waist: 86, hips: 102, notes: "This is a demo form.",
  },
});
await payload.create({ collection: "follow-up-forms", data: { member: member.id, weightKg: 72.5, mood: "good", reviewed: true, notes: "Demo follow-up: feeling more energetic." } });
await payload.create({ collection: "announcements", data: { audience: "one", member: member.id, title: "Welcome to your member area", message: "This is a demo account: everything here is unlocked so you can see what clients get." } });

fs.writeFileSync(OUT, `Demo client login (member area)\nWebsite: https://fattofitwithz.com/login\nEmail: ${EMAIL}\nPassword: ${password}\n`);
console.log(`[demo-client] ready: ${EMAIL} (member ${member.id}). Login details saved to ${OUT}`);
process.exit(0);
