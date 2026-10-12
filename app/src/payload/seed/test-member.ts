/**
 * DEVELOPMENT HELPER: creates (or removes) a test member with a 2-month Fat Loss membership,
 * so the login and dashboard can be tried without a real payment.
 *
 *   npx payload run src/payload/seed/test-member.ts            create test.member@example.com
 *   npx payload run src/payload/seed/test-member.ts remove     delete it and everything it saved
 *
 * Then use "Forgot password" on /login with that email: the link is printed in the terminal.
 */
import { getPayload } from "payload";
import config from "../../payload.config";

const EMAIL = "test.member@example.com";
const DAY = 24 * 60 * 60 * 1000;

const payload = await getPayload({ config });
const existing = await payload.find({ collection: "members", where: { email: { equals: EMAIL } }, limit: 1, depth: 0 });

if (process.argv[2] === "remove") {
  const member = existing.docs[0];
  if (member) {
    for (const collection of ["first-day-forms", "follow-up-forms", "memberships", "member-sessions", "password-resets", "orders", "client-issues", "announcements"] as const) {
      await payload.delete({ collection, where: { member: { equals: member.id } } });
    }
    await payload.delete({ collection: "members", id: member.id });
    payload.logger.info(`[test-member] Removed ${EMAIL} and everything it saved.`);
  } else {
    payload.logger.info(`[test-member] ${EMAIL} does not exist.`);
  }
} else {
  const member =
    existing.docs[0] ??
    (await payload.create({ collection: "members", data: { email: EMAIL, fullName: "Test Member" } }));
  const program = (await payload.find({ collection: "programs", where: { slug: { equals: "fat-loss" } }, limit: 1 })).docs[0];
  const hasMembership = (await payload.count({ collection: "memberships", where: { member: { equals: member.id } } })).totalDocs > 0;
  if (!hasMembership) {
    const start = new Date(Date.now() - 9 * DAY); // started 9 days ago -> currently in week 2
    const end = new Date(start.getTime() + 61 * DAY);
    await payload.create({
      collection: "memberships",
      data: { member: member.id, program: program.id, startDate: start.toISOString(), endDate: end.toISOString(), status: "active" },
    });
  }
  payload.logger.info(`[test-member] Ready: ${EMAIL} (member id ${member.id}). Use "Forgot password" on /login to set a password.`);
}
