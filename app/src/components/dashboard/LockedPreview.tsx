/**
 * Shows a section of the member area as a faded, non-clickable preview with a lock message,
 * for accounts without an active program. Once she pays, the page renders the real section instead.
 */
import Link from "next/link";
import { Lock } from "@/components/ui/Icons";

export function LockedPreview({ children, message = "Join a program to unlock this" }: { children: React.ReactNode; message?: string }) {
  return (
    <div className="relative">
      {/* inert: the preview can't be clicked, typed into or reached with the keyboard */}
      <div inert aria-hidden="true" className="pointer-events-none max-h-[640px] overflow-hidden opacity-45 blur-[1.5px] select-none">
        {children}
      </div>
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="card max-w-[380px] p-6 text-center shadow-[0_18px_40px_-18px_rgba(80,20,40,0.45)]">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand text-ink">
            <Lock className="h-5 w-5" />
          </span>
          <p className="mt-3 font-display text-2xl">{message}</p>
          <p className="mt-2 text-sm text-muted">Everything here opens as soon as your payment is complete.</p>
          <Link href="/programs" className="btn mt-5">Choose a program</Link>
        </div>
      </div>
    </div>
  );
}
