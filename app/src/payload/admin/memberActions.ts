"use server";

/**
 * "Unlock now" on a client's Login tab in admin (src/payload/admin/LoginStatus.tsx).
 * Clears the 15-minute lock after 5 wrong passwords, so she can try again straight away.
 * Only a logged-in admin may use it.
 */
import { headers } from "next/headers";
import { getPayloadClient } from "../../lib/payload.server";

type Result = { ok: true } | { ok: false; error: string };

export async function unlockMember(id: number): Promise<Result> {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) return { ok: false, error: "Please log in to the admin panel again." };
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "Client not found." };
  try {
    await payload.update({ collection: "members", id, data: { failedLogins: 0, lockedUntil: null } });
    return { ok: true };
  } catch (error) {
    console.error(`[members] Could not unlock member ${id}:`, error);
    return { ok: false, error: "Couldn't unlock. Please refresh the page and try again." };
  }
}
