"use server";

/**
 * Server actions behind the member login pages:
 *   logInAction           /login            email + password
 *   forgotPasswordAction  /forgot-password  emails a "set a new password" link
 *   resetPasswordAction   /reset-password   saves the new password and logs her in
 *   signUpAction          /signup           creates an account (no purchase needed)
 * The rules (lockout, link lifetime, rate limits) live in ./passwords.server.ts.
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logIn, MIN_PASSWORD_LENGTH, normalizeEmail, sendPasswordLink, setPasswordWithLink } from "./passwords.server";
import { hashPassword } from "./crypto.server";
import { getPayloadClient } from "../payload.server";
import { endAllSessions, startSession } from "./session.server";
import { safeNextPath } from "./safe-next";

export type AuthFormState = { error?: string; info?: string; email?: string };

const Email = z.email("Please enter a valid email address");
const NewPassword = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`)
  .max(128, "That password is too long (128 characters max)");

/** Visitor's internet address, used only for rate limiting. */
async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

export async function logInAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const emailText = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const email = Email.safeParse(emailText);
  if (!email.success) return { email: emailText, error: email.error.issues[0].message };
  if (!password) return { email: emailText, error: "Please enter your password" };

  try {
    const result = await logIn(email.data, password);
    if (!result.ok) return { email: emailText, error: result.error };
    await startSession(result.memberId);
  } catch (error) {
    console.error("[login] Login failed:", error);
    return { email: emailText, error: "Something went wrong. Please try again in a minute." };
  }
  redirect(safeNextPath(formData.get("next"))); // outside try/catch: redirect() works by throwing
}

export async function forgotPasswordAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const emailText = String(formData.get("email") ?? "").trim();
  const email = Email.safeParse(emailText);
  if (!email.success) return { email: emailText, error: email.error.issues[0].message };

  try {
    const result = await sendPasswordLink(email.data, await clientIp());
    if (!result.ok) return { email: emailText, error: result.error };
  } catch (error) {
    console.error("[forgot-password] Could not send the link:", error);
    return { email: emailText, error: "We couldn't send the email right now. Please try again in a minute." };
  }
  return {
    email: emailText,
    info: "If this email has a membership, we've sent a link to set a new password. Check your spam folder too.",
  };
}

export async function resetPasswordAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const token = String(formData.get("token") ?? "");
  const password = NewPassword.safeParse(String(formData.get("password") ?? ""));
  if (!password.success) return { error: password.error.issues[0].message };
  if (password.data !== String(formData.get("confirm") ?? "")) return { error: "The two passwords don't match" };

  try {
    const result = await setPasswordWithLink(token, password.data);
    if (!result.ok) return { error: result.error };
    await endAllSessions(result.memberId); // log out any other device that was logged in
    await startSession(result.memberId);
  } catch (error) {
    console.error("[reset-password] Could not save the password:", error);
    return { error: "Something went wrong. Please try again in a minute." };
  }
  redirect("/dashboard");
}

const SignUp = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  email: Email,
  phone: z.string().trim().min(7, "Please enter your WhatsApp number").max(30),
  password: NewPassword,
});

/** /signup: anyone can create an account (no purchase needed). Logs her in and opens her dashboard. */
export async function signUpAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const emailText = String(formData.get("email") ?? "").trim();
  const parsed = SignUp.safeParse({
    fullName: formData.get("fullName") ?? "",
    email: emailText,
    phone: formData.get("phone") ?? "",
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) return { email: emailText, error: parsed.error.issues[0].message };
  const { fullName, phone, password } = parsed.data;
  const email = normalizeEmail(parsed.data.email);

  try {
    const payload = await getPayloadClient();
    const existing = await payload.find({ collection: "members", where: { email: { equals: email } }, limit: 1, depth: 0 });
    if (existing.docs[0]) {
      return { email: emailText, error: 'This email already has an account. Please log in (or use "Forgot password").' };
    }
    const member = await payload.create({
      collection: "members",
      data: { email, fullName, phone, passwordHash: await hashPassword(password), passwordSetAt: new Date().toISOString() },
    });
    await startSession(member.id);
  } catch (error) {
    console.error("[signup] Could not create the account:", error);
    return { email: emailText, error: "Something went wrong. Please try again in a minute." };
  }
  redirect("/dashboard");
}
