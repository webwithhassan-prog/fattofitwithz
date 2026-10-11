/**
 * Small crypto helpers for member login. Nothing secret is stored in plain text:
 * passwords are hashed with scrypt, and reset links / session tokens are stored as SHA-256 hashes.
 */
import "server-only";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const KEY_LENGTH = 64;

/**
 * Turns a password into "scrypt$<salt>$<hash>" (both base64url). A new random salt every time,
 * so two members with the same password still get different hashes.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password.normalize("NFKC"), salt, KEY_LENGTH);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  const [algorithm, saltText, hashText] = (stored ?? "").split("$");
  if (algorithm !== "scrypt" || !saltText || !hashText) return false;
  const expected = Buffer.from(hashText, "base64url");
  const actual = await scryptAsync(password.normalize("NFKC"), Buffer.from(saltText, "base64url"), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** A long random secret (256 bits) for session cookies and reset links. */
export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Tokens are long and random, so a plain SHA-256 is enough to store them safely. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
