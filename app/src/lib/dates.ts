/**
 * Dates shown to clients and the coach, always in Pakistan time.
 * (Pages are made on the server, which runs in UTC: without a time zone, a form sent at
 * 2am in Lahore would show yesterday's date.)
 */
export const TIME_ZONE = "Asia/Karachi";

/** "13 Oct 2026" (month: "short") or "13 October 2026" (month: "long") */
export function formatDate(iso: string, month: "short" | "long" = "short"): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month, year: "numeric", timeZone: TIME_ZONE });
}
