/** What every server action returns, so forms can show a clear message either way. */
export type ActionResult = { ok: true } | { ok: false; error: string };
