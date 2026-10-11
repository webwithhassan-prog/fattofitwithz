/**
 * Member login with email + password, and "Forgot password" links.
 *
 *   logIn(email, password)              -> member id, or a friendly error
 *   sendPasswordLink(email, ip)         -> emails a "set a new password" link (Forgot password)
 *   createPasswordLink(memberId, days)  -> a link for the welcome email after payment
 *   setPasswordWithLink(token, password)-> saves the new password, logs out other devices
 *
 * Rules (change the numbers below if needed):
 * - 5 wrong passwords in a row lock the account for 15 minutes (shown in admin > Members > Login)
 * - a reset link works once, for 1 hour (the welcome-email link works for 7 days)
 * - at most 3 reset emails per email address per hour, 10 per internet address per hour
 * - "Forgot password" shows the SAME message whether or not the email is a member,
 *   so the form can't be used to find out who is a member
 *
 * While RESEND_API_KEY is empty, emails (with the link) are printed in the terminal.
 */
import "server-only";
import { getPayloadClient } from "../payload.server";
import { sendEmail } from "../email.server";
import { absoluteUrl } from "../site";
import { hashPassword, hashToken, newToken, verifyPassword } from "./crypto.server";

export const MIN_PASSWORD_LENGTH = 8;
const MAX_WRONG_PASSWORDS = 5;
const LOCK_MINUTES = 15;
const RESET_LINK_HOURS = 1;
const MAX_RESET_EMAILS_PER_ADDRESS = 3; // per hour
const MAX_RESET_EMAILS_PER_IP = 10; // per hour

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

// ---------- log in ----------

const WRONG_LOGIN = "That email and password don't match. Try again, or use \"Forgot password\".";

export async function logIn(emailInput: string, password: string): Promise<Result<{ memberId: number }>> {
  const email = normalizeEmail(emailInput);
  const payload = await getPayloadClient();
  const { docs } = await payload.find({ collection: "members", where: { email: { equals: email } }, limit: 1, depth: 0 });
  const member = docs[0];

  // Same message for "no such member" and "wrong password".
  if (!member) return { ok: false, error: WRONG_LOGIN };

  if (member.lockedUntil && new Date(member.lockedUntil) > new Date()) {
    return { ok: false, error: `Too many wrong passwords. Please wait ${LOCK_MINUTES} minutes, or use "Forgot password".` };
  }
  if (!member.passwordHash) {
    return { ok: false, error: 'You haven\'t set a password yet. Use "Forgot password" below to create one.' };
  }

  if (!(await verifyPassword(password, member.passwordHash))) {
    const failed = (member.failedLogins ?? 0) + 1;
    const lock = failed >= MAX_WRONG_PASSWORDS;
    await payload.update({
      collection: "members",
      id: member.id,
      data: {
        failedLogins: lock ? 0 : failed,
        lockedUntil: lock ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString() : member.lockedUntil,
      },
    });
    if (lock) console.warn(`[auth] Member ${member.id} locked for ${LOCK_MINUTES} minutes after ${MAX_WRONG_PASSWORDS} wrong passwords.`);
    return { ok: false, error: lock ? `Too many wrong passwords. Please wait ${LOCK_MINUTES} minutes, or use "Forgot password".` : WRONG_LOGIN };
  }

  if (member.failedLogins || member.lockedUntil) {
    await payload.update({ collection: "members", id: member.id, data: { failedLogins: 0, lockedUntil: null } });
  }
  return { ok: true, memberId: member.id };
}

// ---------- password links ----------

/** Creates a one-time link to set a password. Used by "Forgot password" and the welcome email. */
export async function createPasswordLink(memberId: number, email: string, hoursValid: number, ip = ""): Promise<string> {
  const payload = await getPayloadClient();
  const token = newToken();
  await payload.create({
    collection: "password-resets",
    data: {
      member: memberId,
      email,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + hoursValid * 60 * 60 * 1000).toISOString(),
      ip,
    },
  });
  return absoluteUrl(`/reset-password?token=${token}`);
}

export async function sendPasswordLink(emailInput: string, ip: string): Promise<Result> {
  const email = normalizeEmail(emailInput);
  const payload = await getPayloadClient();

  // Housekeeping: links older than 8 days are useless; delete them.
  await payload.delete({ collection: "password-resets", where: { createdAt: { less_than: hoursAgo(8 * 24) } } });

  // Rate limits
  const perAddress = await payload.count({
    collection: "password-resets",
    where: { and: [{ email: { equals: email } }, { createdAt: { greater_than: hoursAgo(1) } }] },
  });
  const perIp = await payload.count({
    collection: "password-resets",
    where: { and: [{ ip: { equals: ip } }, { createdAt: { greater_than: hoursAgo(1) } }] },
  });
  if (perAddress.totalDocs >= MAX_RESET_EMAILS_PER_ADDRESS || perIp.totalDocs >= MAX_RESET_EMAILS_PER_IP) {
    return { ok: false, error: "We've already sent several emails. Please check your inbox (and spam), or try again in an hour." };
  }

  const { docs } = await payload.find({ collection: "members", where: { email: { equals: email } }, limit: 1, depth: 0 });
  if (!docs[0]) {
    console.info(`[auth] Password link requested for ${email}, but no member has that email. Nothing was sent.`);
    return { ok: true };
  }

  const link = await createPasswordLink(docs[0].id, email, RESET_LINK_HOURS, ip);
  await sendEmail({
    to: email,
    subject: "Set your Fat To Fit With Z password",
    text: [
      "Click the link below to choose a new password for your member dashboard:",
      "",
      link,
      "",
      `The link works once, for ${RESET_LINK_HOURS} hour. If you didn't ask for it, you can ignore this email.`,
      "",
      "Fat To Fit With Z",
    ].join("\n"),
  });
  return { ok: true };
}

/** Checks a link without using it up (to show the form, or "this link has expired"). */
export async function isPasswordLinkValid(token: string): Promise<boolean> {
  const payload = await getPayloadClient();
  const row = await findUsableLink(payload, token);
  return Boolean(row);
}

async function findUsableLink(payload: Awaited<ReturnType<typeof getPayloadClient>>, token: string) {
  if (!token) return null;
  const { docs } = await payload.find({
    collection: "password-resets",
    where: {
      and: [{ tokenHash: { equals: hashToken(token) } }, { usedAt: { exists: false } }, { expiresAt: { greater_than: new Date().toISOString() } }],
    },
    limit: 1,
    depth: 0,
  });
  return docs[0] ?? null;
}

export async function setPasswordWithLink(token: string, password: string): Promise<Result<{ memberId: number }>> {
  const payload = await getPayloadClient();
  const row = await findUsableLink(payload, token);
  if (!row) return { ok: false, error: 'This link has expired or was already used. Use "Forgot password" to get a new one.' };

  const memberId = typeof row.member === "object" ? row.member.id : row.member;
  await payload.update({ collection: "password-resets", id: row.id, data: { usedAt: new Date().toISOString() } });
  await payload.update({
    collection: "members",
    id: memberId,
    data: { passwordHash: await hashPassword(password), passwordSetAt: new Date().toISOString(), failedLogins: 0, lockedUntil: null },
  });
  return { ok: true, memberId };
}
