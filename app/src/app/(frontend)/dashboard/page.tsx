/**
 * /dashboard - member home, built to be quick on a phone:
 *   1. "Your next step": ONE clear thing to do now (pay, fill in her profile, today's workout...)
 *   2. her program with a progress bar (day X of Y)
 *   3. messages from the coach
 *   4. big shortcut tiles: profile, follow-up, workouts, e-books, coach, help
 * Diet plans and day-to-day coaching happen on WhatsApp.
 */
import Image from "next/image";
import Link from "next/link";
import { getClientMessages, getDashboardData } from "@/lib/members.server";
import { getEbooks, whatsappLink } from "@/lib/content";
import { AlertCircle, ArrowRight, Check, Clipboard, Lock, Megaphone, Pause, PlayCircle, Sparkle, WhatsAppIcon } from "@/components/ui/Icons";
import { formatDate } from "@/lib/dates";
import { daysBetween, todayIso } from "@/lib/freeze";
import { createMyPasswordAction } from "./actions";

export const metadata = { title: "Home" };

const longDate = (iso: string) => formatDate(iso, "long");
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Today in her 4-week workout plan: week 1-4 (repeats), day 1-6 (Mon-Sat), Sunday = rest. */
function todaysWorkout(startDate: string) {
  const today = todayIso();
  const week = (Math.floor(Math.max(0, daysBetween(startDate, today)) / 7) % 4) + 1;
  const weekday = new Date(`${today}T12:00:00Z`).getUTCDay();
  return { week, day: weekday, dayName: DAY_NAMES[weekday], rest: weekday === 0 };
}

type Step = { title: string; text: string; href: string; cta: string; external?: boolean };

/** A big shortcut tile. lock: "join" = no running program, "paused" = frozen by the coach. */
function Tile({ href, icon, title, text, done, lock, external }: { href: string; icon: React.ReactNode; title: string; text: string; done?: boolean; lock?: "join" | "paused" | null; external?: boolean }) {
  const className = "card card-hover flex min-h-[132px] flex-col gap-2 p-4 sm:p-5";
  const body = (
    <>
      <span className="flex items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-brand/15 text-brand-dark">{icon}</span>
        {lock ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2 py-0.5 text-[11px] font-semibold text-muted">
            {lock === "paused" ? <Pause className="h-3 w-3" /> : <Lock className="h-3 w-3" />} {lock === "paused" ? "Paused" : "Locked"}
          </span>
        ) : done ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-ink">
            <Check className="h-3 w-3" /> Done
          </span>
        ) : null}
      </span>
      <span className="font-display text-lg leading-tight font-semibold sm:text-xl">{title}</span>
      <span className="text-[13px] leading-snug text-muted sm:text-sm">{text}</span>
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{body}</a>
  ) : (
    <Link href={href} className={className}>{body}</Link>
  );
}

export default async function DashboardHome() {
  const [{ member, program, firstDayForm, followUps, ebooks: owned, pendingOrder, needsPassword }, onSale, coachHref] = await Promise.all([
    getDashboardData(),
    getEbooks(),
    whatsappLink("Hi coach! I have a question."),
  ]);
  const messages = await getClientMessages(member.id); // admin > Reminders & announcements
  const paused = program?.paused ?? false;
  const active = program?.active ?? false;
  const lock = active ? null : paused ? "paused" : "join";
  const workout = active && program ? todaysWorkout(program.startDate) : null;

  // Progress through the program
  const totalDays = program ? Math.max(1, daysBetween(program.startDate, program.endDate)) : 1;
  const dayNow = program ? Math.min(totalDays, Math.max(1, daysBetween(program.startDate, todayIso()) + 1)) : 0;
  const daysLeft = program ? Math.max(0, daysBetween(todayIso(), program.endDate)) : 0;

  // 1. The one next step
  const step: Step | null = pendingOrder
    ? { title: "Finish your payment", text: `Order ${pendingOrder.reference} · ${pendingOrder.total}. Everything unlocks as soon as it's confirmed.`, href: pendingOrder.path, cta: "See how to pay" }
    : paused
      ? null // the paused notice below explains it
      : !active
        ? { title: program ? "Your program has ended" : "Start your journey", text: "Choose a program and everything here unlocks as soon as you pay.", href: "/programs", cta: "Choose a program" }
        : !firstDayForm
          ? { title: "Fill in your Personal Wellness Profile", text: "Your coach needs it to prepare your diet plan. It takes about 5 minutes.", href: "/dashboard/first-day", cta: "Start now" }
          : workout?.rest
            ? { title: "Sunday: rest day", text: "No workout today. Drink water, sleep well, and send a follow-up if your coach asked for one.", href: "/dashboard/follow-up", cta: "Send a follow-up" }
            : { title: `Today's workout: week ${workout?.week}, ${workout?.dayName}`, text: "Press play and follow along. It's marked done when you finish.", href: `/dashboard/library?week=${workout?.week}`, cta: "Start workout" };

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-4 sm:gap-5">
      <h1 className="sr-only">My account</h1>

      {step ? (
        <section className="card flex flex-col gap-4 border-brand bg-gradient-to-br from-blush to-blush-2 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="kicker">Your next step</p>
            <p className="mt-1 font-display text-2xl leading-tight sm:text-3xl">{step.title}</p>
            <p className="mt-1.5 text-[15px] text-muted">{step.text}</p>
          </div>
          <Link href={step.href} className="btn w-full flex-none sm:w-auto">
            {step.cta} <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      ) : null}

      {paused ? (
        <section role="status" className="card flex items-start gap-4 border-brand bg-blush p-5">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-brand text-ink">
            <Pause className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-xl">Your program is paused</p>
            <p className="mt-1 text-[15px] text-muted">
              {program?.pausedUntil
                ? `It restarts by itself on ${longDate(program.pausedUntil)}, and your end date has moved forward, so you don't lose any days.`
                : "It restarts when your coach turns it back on. The paused days are added to your end date, so you don't lose any days."}{" "}
              Want to restart sooner? Message your coach.
            </p>
          </div>
        </section>
      ) : null}

      {program && (active || paused) ? (
        <section className="card p-5" aria-label="Your program">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-display text-xl font-semibold">{program.name}</p>
            <p className="text-sm text-muted">
              {paused ? "Paused" : `Day ${dayNow} of ${totalDays}`} · {daysLeft} days left
            </p>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-blush" role="progressbar" aria-valuemin={0} aria-valuemax={totalDays} aria-valuenow={dayNow} aria-label="Program progress">
            <div className="h-full rounded-full bg-brand" style={{ width: `${Math.round((dayNow / totalDays) * 100)}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted">
            {longDate(program.startDate)} – {longDate(program.endDate)}
          </p>
        </section>
      ) : null}

      {needsPassword ? (
        <form action={createMyPasswordAction} className="card flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
          <p className="text-[15px]">
            <b className="font-semibold">Create a password</b> <span className="text-muted">to log in on your other devices.</span>
          </p>
          <button type="submit" className="btn btn-ghost btn-sm">Create password</button>
        </form>
      ) : null}

      {messages.length ? (
        <section aria-labelledby="coach-messages" className="card p-5 sm:p-6">
          <h2 id="coach-messages" className="flex items-center gap-2 text-xl text-brand-dark sm:text-2xl">
            <Megaphone className="h-5 w-5" /> From your coach
          </h2>
          <ul className="mt-2 divide-y divide-line">
            {messages.map((m) => (
              <li key={m.id} className="py-3">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {m.title}
                  {m.isReminder ? <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold tracking-wide text-ink uppercase">For you</span> : null}
                </p>
                <p className="mt-1 text-[15px] whitespace-pre-line text-muted">{m.message}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Shortcuts: 2 per row on phones, 3 on bigger screens */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <Tile
          href={lock ? (lock === "paused" ? coachHref : "/programs") : "/dashboard/first-day"}
          external={lock === "paused"}
          icon={<Clipboard className="h-5 w-5" />}
          title="Wellness Profile"
          text={firstDayForm ? `Sent ${longDate(firstDayForm.updatedAt)}` : "Tell your coach about you"}
          done={Boolean(firstDayForm)}
          lock={lock}
        />
        <Tile
          href={lock ? (lock === "paused" ? coachHref : "/programs") : "/dashboard/follow-up"}
          external={lock === "paused"}
          icon={<Clipboard className="h-5 w-5" />}
          title="Follow-up"
          text={followUps[0] ? `Last: ${longDate(followUps[0].createdAt)}, ${followUps[0].weightKg} kg` : "Send your weekly progress"}
          lock={lock}
        />
        <Tile
          href={lock ? (lock === "paused" ? coachHref : "/programs") : `/dashboard/library${workout ? `?week=${workout.week}` : ""}`}
          external={lock === "paused"}
          icon={<PlayCircle className="h-5 w-5" />}
          title="Workouts"
          text="4-week home plan, 6 sessions a week"
          lock={lock}
        />
        <Tile href={coachHref} external icon={<WhatsAppIcon className="h-5 w-5" />} title="Your coach" text="Questions? Message on WhatsApp" />
        <Tile href="/dashboard/issues" icon={<AlertCircle className="h-5 w-5" />} title="Need help?" text="Report a problem with the site" />
        {owned.length === 0 && onSale.length ? (
          <Tile href="/ebook" icon={<Sparkle className="h-5 w-5" />} title="Recipe e-books" text={`${onSale.length} e-book${onSale.length > 1 ? "s" : ""}, lower price for members`} />
        ) : null}
      </div>

      {owned.length ? (
        <section className="card p-5 sm:p-6" aria-labelledby="my-ebooks">
          <h2 id="my-ebooks" className="text-xl text-brand-dark sm:text-2xl">Your e-books</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {owned.map((e) => (
              <li key={e.slug} className="flex items-center gap-3 rounded-[12px] bg-blush p-3">
                {e.cover ? <Image src={e.cover.src} alt="" width={44} height={62} className="h-[62px] w-11 flex-none rounded object-cover" /> : null}
                <div className="min-w-0 flex-1">
                  <p className="leading-tight font-semibold">{e.title}</p>
                  {e.driveLink ? (
                    <a href={e.driveLink} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm font-semibold text-brand-dark underline">Open the e-book</a>
                  ) : (
                    <p className="mt-1 text-sm text-muted">Your coach will send the link on WhatsApp.</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {onSale.some((e) => !owned.some((o) => o.slug === e.slug)) ? (
            <Link href="/ebook" className="mt-3 inline-block text-sm text-brand-dark underline">See our other e-books</Link>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
