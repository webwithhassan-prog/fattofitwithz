/**
 * Membership freezes (the client sees "Your program is paused"), all the date maths in one place.
 * Used by the Memberships collection hook (admin) and by the member area.
 *
 * How it works for the coach (admin > Clients > a client > Membership > open the membership):
 *   1. The client asks on WhatsApp. Set Status = "Frozen" and, if you know it, "Resume on". Save.
 *      The freeze starts today. With "Resume on", the end date moves forward by the frozen days at once.
 *   2. While frozen, her forms and workouts are locked and her dashboard says "paused until ...".
 *   3. On the "Resume on" date it restarts by itself.
 *      To restart earlier, set Status back to "Active": the unused days come off the end date again.
 *      Without a "Resume on" date it stays frozen until you set "Active"; then the end date moves
 *      forward by the days it was frozen.
 *   Every freeze and restart is written in the membership's notes.
 */
import { TIME_ZONE, formatDate } from "./dates";

const DAY = 24 * 60 * 60 * 1000;

/** Today in Pakistan, e.g. "2026-10-13". */
export const todayIso = () => new Date().toLocaleDateString("en-CA", { timeZone: TIME_ZONE });

/** A stored date (ISO string) -> its day in Pakistan, e.g. "2026-10-13". */
export const dayOf = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TIME_ZONE });

/** "2026-10-13" + 14 days -> "2026-10-27T12:00:00.000Z" (dates are stored at 12:00 UTC). */
export const addDays = (day: string, days: number) => new Date(Date.parse(`${day}T12:00:00.000Z`) + days * DAY).toISOString();

/** Whole days from one day to another ("2026-10-13" -> "2026-10-27" = 14). */
export const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / DAY);

type FreezeFields = { status?: string | null; frozenFrom?: string | null; frozenUntil?: string | null };

/** Is this membership paused today? (Status is Frozen and the "Resume on" date hasn't come yet.) */
export function isPausedToday(m: FreezeFields, today = todayIso()): boolean {
  return m.status === "frozen" && (!m.frozenUntil || dayOf(m.frozenUntil) > today);
}

/** Has the freeze reached its "Resume on" date? Then the membership should be set back to Active. */
export function freezeHasEnded(m: FreezeFields, today = todayIso()): boolean {
  return m.status === "frozen" && !!m.frozenUntil && dayOf(m.frozenUntil) <= today;
}

/** Days the end date was already moved for a planned freeze (0 when there is no "Resume on" date). */
const plannedDays = (from: string | null, until: string | null) => (from && until ? daysBetween(from, until) : 0);

type Before = { status?: string | null; endDate: string; frozenFrom?: string | null; frozenUntil?: string | null; notes?: string | null };
/** shift = days added to (or taken off) the end date by this change; adds up in the membership's "daysFrozen" */
type Change = { endDate: string; shift: number; frozenFrom: string | null; frozenUntil: string | null; note: string | null };

/**
 * Works out the new end date and freeze fields when a membership is saved.
 * Returns null when the save doesn't freeze, restart or change the "Resume on" date.
 * Throws a readable error for a "Resume on" date that isn't after today.
 */
export function applyFreezeChange(before: Before, nextStatus: string, nextUntilIso: string | null, today = todayIso()): Change | null {
  const wasFrozen = before.status === "frozen";
  const nowFrozen = nextStatus === "frozen";
  const endDay = dayOf(before.endDate);
  const from = before.frozenFrom ? dayOf(before.frozenFrom) : null;
  const oldUntil = before.frozenUntil ? dayOf(before.frozenUntil) : null;
  const newUntil = nextUntilIso ? dayOf(nextUntilIso) : null;
  const checkUntil = () => {
    if (newUntil && newUntil <= today) throw new Error('"Resume on" must be a date after today.');
  };

  // 1. Freezing now (starts today)
  if (!wasFrozen && nowFrozen) {
    checkUntil();
    const days = plannedDays(today, newUntil);
    return {
      endDate: addDays(endDay, days),
      shift: days,
      frozenFrom: addDays(today, 0),
      frozenUntil: newUntil ? addDays(newUntil, 0) : null,
      note: `Frozen on ${formatDate(today)}${newUntil ? ` until ${formatDate(newUntil)} (${days} days); end date moved to ${formatDate(addDays(endDay, days))}` : " (no restart date yet)"}.`,
    };
  }

  // 2. Still frozen, but the "Resume on" date changed: move the end date by the difference
  if (wasFrozen && nowFrozen && newUntil !== oldUntil) {
    checkUntil();
    const start = from ?? today;
    const shift = plannedDays(start, newUntil) - plannedDays(start, oldUntil);
    const newEnd = addDays(endDay, shift);
    return {
      endDate: newEnd,
      shift,
      frozenFrom: addDays(start, 0),
      frozenUntil: newUntil ? addDays(newUntil, 0) : null,
      note: `Restart date changed to ${newUntil ? formatDate(newUntil) : "not set"}; end date now ${formatDate(newEnd)}.`,
    };
  }

  // 3. Restarting (set back to Active, or the "Resume on" date has come)
  if (wasFrozen && !nowFrozen) {
    const start = from ?? today;
    const restartDay = oldUntil && oldUntil <= today ? oldUntil : today;
    const frozenFor = Math.max(0, daysBetween(start, restartDay));
    const shift = frozenFor - plannedDays(start, oldUntil);
    const newEnd = addDays(endDay, shift);
    return {
      endDate: newEnd,
      shift,
      frozenFrom: null,
      frozenUntil: null,
      note: `Restarted on ${formatDate(restartDay)} after ${frozenFor} days frozen; end date ${formatDate(newEnd)}.`,
    };
  }

  return null;
}
