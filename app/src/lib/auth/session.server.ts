/**
 * Member sessions ("stay logged in for 30 days") after logging in with email + password.
 *
 * The browser keeps a random token in the httpOnly cookie "ftf_session" (JavaScript can't read it).
 * The database keeps only a hash of that token (admin > System > Member logins).
 *
 *   await startSession(memberId)   after a correct password (server action)
 *   await getCurrentMember()       the logged-in member, or null
 *   await requireMember()          same, but sends visitors who aren't logged in to /login
 *   await endSession()             log out (server action)
 *   await endAllSessions(memberId) log out everywhere (after a password reset)
 */
import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPayloadClient } from "../payload.server";
import { hashToken, newToken } from "./crypto.server";
import type { Member as MemberDoc } from "@/payload-types";

export const SESSION_COOKIE = "ftf_session";
/**
 * A second, harmless cookie the BROWSER can read (the session cookie can't be read by scripts):
 * it only holds her first initial, so the static pages can show a "My account" button / profile icon.
 * It proves nothing: the member pages always check the real session.
 */
export const MEMBER_HINT_COOKIE = "ftf_member";
const SESSION_DAYS = 30;

export async function startSession(memberId: number): Promise<void> {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const userAgent = (await headers()).get("user-agent")?.slice(0, 200) ?? "";

  const payload = await getPayloadClient();
  await payload.create({
    collection: "member-sessions",
    data: { member: memberId, tokenHash: hashToken(token), expiresAt: expiresAt.toISOString(), userAgent },
  });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS only on the live site; localhost is plain http
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  const member = await payload.findByID({ collection: "members", id: memberId, depth: 0 }).catch(() => null);
  const initial = (member?.fullName || member?.email || "M").trim().charAt(0).toUpperCase();
  (await cookies()).set(MEMBER_HINT_COOKIE, initial, { httpOnly: false, sameSite: "lax", path: "/", expires: expiresAt });
}

/** The logged-in member's database row, or null. Looked up once per request. */
export const getCurrentMember = cache(async (): Promise<MemberDoc | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: "member-sessions",
    where: { tokenHash: { equals: hashToken(token) } },
    limit: 1,
    depth: 1, // include the member
  });
  const session = docs[0];
  if (!session) return null;

  if (new Date(session.expiresAt) < new Date()) {
    await payload.delete({ collection: "member-sessions", id: session.id });
    return null;
  }
  return typeof session.member === "object" ? session.member : null;
});

/** Use at the top of every member page and action. */
export async function requireMember(): Promise<MemberDoc> {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  return member;
}

export async function endSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const payload = await getPayloadClient();
    await payload.delete({ collection: "member-sessions", where: { tokenHash: { equals: hashToken(token) } } });
  }
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(MEMBER_HINT_COOKIE);
}

/** Logs the member out on every device (used after her password is reset). */
export async function endAllSessions(memberId: number): Promise<void> {
  const payload = await getPayloadClient();
  await payload.delete({ collection: "member-sessions", where: { member: { equals: memberId } } });
}
