/** List bullet: a small soft-pink circle with a pink tick. Used for program benefits. */
export function CheckBullet() {
  return (
    <span aria-hidden="true" className="mt-[3px] grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-brand/10 text-brand-dark">
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}
