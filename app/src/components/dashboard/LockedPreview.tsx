/**
 * Shows a section of the member area as a faded, non-clickable preview with a lock message:
 *   - no program (or it ended): "Join a program to unlock this" + Choose a program
 *   - program paused by the coach (frozen, see lib/freeze.ts): "Your program is paused" + Message your coach
 * Once her program is running, the page renders the real section instead.
 */
import Link from "next/link";
import { Lock, Pause, WhatsAppIcon } from "@/components/ui/Icons";
import { whatsappLink } from "@/lib/content";
import { formatDate } from "@/lib/dates";
import type { MemberProgram } from "@/lib/member";

type Props = { children: React.ReactNode; message?: string; program?: MemberProgram | null };

export async function LockedPreview({ children, message = "Join a program to unlock this", program }: Props) {
  const paused = program?.paused ?? false;
  const coachHref = paused ? await whatsappLink("Hi coach! I'd like to restart my program.") : "";

  return (
    <div className="relative">
      {/* inert: the preview can't be clicked, typed into or reached with the keyboard */}
      <div inert aria-hidden="true" className="pointer-events-none max-h-[640px] overflow-hidden opacity-45 blur-[1.5px] select-none">
        {children}
      </div>
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="card max-w-[380px] p-6 text-center shadow-[0_18px_40px_-18px_rgba(80,20,40,0.45)]">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand text-ink">
            {paused ? <Pause className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          </span>
          {paused ? (
            <>
              <p className="mt-3 font-display text-2xl">Your program is paused</p>
              <p className="mt-2 text-sm text-muted">
                {program?.pausedUntil ? `It opens again on ${formatDate(program.pausedUntil, "long")}.` : "It opens again when your coach restarts it."} Want to start sooner? Message your coach.
              </p>
              <a href={coachHref} target="_blank" rel="noopener noreferrer" className="btn mt-5">
                <WhatsAppIcon className="h-4.5 w-4.5" /> Message your coach
              </a>
            </>
          ) : (
            <>
              <p className="mt-3 font-display text-2xl">{message}</p>
              <p className="mt-2 text-sm text-muted">Everything here opens as soon as your payment is complete.</p>
              <Link href="/programs" className="btn mt-5">Choose a program</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
