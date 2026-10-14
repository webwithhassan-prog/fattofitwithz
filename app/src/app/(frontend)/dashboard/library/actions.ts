"use server";

/**
 * Saves the "Done" badge on a workout video in the Recorded library, for the logged-in member.
 * Called automatically when she finishes a video, or when she taps "Mark as done" / "Done".
 * Stored on her account (members.workoutsDone), so it shows on every device.
 */
import { getCurrentMember } from "@/lib/auth/session.server";
import { getPayloadClient } from "@/lib/payload.server";
import { LIMITS, rateLimit } from "@/lib/rate-limit.server";

export async function setWorkoutDone(key: string, done: boolean): Promise<{ ok: boolean }> {
  if (!/^\d{1,2}-\d$/.test(key)) return { ok: false }; // "week-day", e.g. "1-3"
  const member = await getCurrentMember();
  if (!member) return { ok: false };
  const limited = await rateLimit(LIMITS.workoutDone, `member:${member.id}`);
  if (!limited.ok) return { ok: false };

  const current = Array.isArray(member.workoutsDone) ? member.workoutsDone.filter((k): k is string => typeof k === "string") : [];
  const next = done ? [...new Set([...current, key])] : current.filter((k) => k !== key);
  try {
    const payload = await getPayloadClient();
    await payload.update({ collection: "members", id: member.id, data: { workoutsDone: next } });
    return { ok: true };
  } catch (error) {
    console.error(`[workouts] member ${member.id}, video ${key}:`, error);
    return { ok: false };
  }
}
