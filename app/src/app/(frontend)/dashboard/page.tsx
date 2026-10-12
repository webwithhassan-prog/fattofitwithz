/**
 * /dashboard - member home: her program, messages from the coach, the two forms, the recorded library and the e-book.
 * Diet plans and day-to-day coaching happen on WhatsApp.
 */
import Link from "next/link";
import { getClientMessages, getDashboardData } from "@/lib/members.server";
import { getEbook, whatsappLink } from "@/lib/content";
import { Lock, Megaphone, WhatsAppIcon } from "@/components/ui/Icons";
import { formatDate } from "@/lib/dates";

export const metadata = { title: "Home" };

const longDate = (iso: string) => formatDate(iso, "long");

function Card({ title, text, href, cta, locked }: { title: string; text: string; href: string; cta: string; locked?: boolean }) {
  return (
    <div className={`card flex flex-col gap-3 p-6 ${locked ? "bg-blush/40" : ""}`}>
      <h2 className="flex items-center justify-between gap-2 text-2xl text-brand-dark">
        {title}
        {locked ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 font-sans text-xs font-medium text-muted">
            <Lock className="h-3.5 w-3.5" /> Locked
          </span>
        ) : null}
      </h2>
      <p className="text-[15px] text-muted">{text}</p>
      {locked ? (
        <Link href="/programs" className="btn btn-ghost btn-sm mt-auto w-max">Choose a program to unlock</Link>
      ) : (
        <Link href={href} className="btn btn-sm mt-auto w-max">{cta}</Link>
      )}
    </div>
  );
}

export default async function DashboardHome() {
  const [{ member, program, firstDayForm, followUps, hasEbook }, ebook, coachHref] = await Promise.all([
    getDashboardData(),
    getEbook(),
    whatsappLink("Hi coach! I have a question."),
  ]);
  const messages = await getClientMessages(member.id); // admin > Reminders & announcements
  const locked = !program?.active;

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
      <h1 className="sr-only">My account</h1>

      <section className="card flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-blush to-blush-2 p-6">
        {program ? (
          <div>
            <p className="kicker">{program.active ? "Your program" : "Your last program"}</p>
            <p className="mt-1 font-display text-3xl">{program.name}</p>
            <p className="mt-1 text-sm text-muted">
              {longDate(program.startDate)} – {longDate(program.endDate)}
              {program.active ? "" : " (ended)"}
            </p>
          </div>
        ) : (
          <div>
            <p className="font-display text-3xl">You haven&apos;t joined a program yet</p>
            <p className="mt-1 text-sm text-muted">Here&apos;s everything you get. Choose a program and it all unlocks as soon as you pay.</p>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {!program?.active ? <Link href="/programs" className="btn">Choose a program</Link> : null}
          <a href={coachHref} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            <WhatsAppIcon className="h-4.5 w-4.5" /> Message your coach
          </a>
        </div>
      </section>

      {messages.length ? (
        <section aria-labelledby="coach-messages" className="card p-6">
          <h2 id="coach-messages" className="flex items-center gap-2 text-2xl text-brand-dark">
            <Megaphone className="h-5 w-5" /> From your coach
          </h2>
          <ul className="mt-3 divide-y divide-line">
            {messages.map((m) => (
              <li key={m.id} className="py-3">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {m.title}
                  {m.isReminder ? <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold tracking-wide text-ink uppercase">Reminder</span> : null}
                </p>
                <p className="mt-1 text-[15px] whitespace-pre-line text-muted">{m.message}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <Card
          title="First day form"
          text={firstDayForm ? `Sent on ${longDate(firstDayForm.updatedAt)}. You can update it any time.` : "Tell your coach about you, your food and your health, so she can prepare your diet plan."}
          href="/dashboard/first-day"
          cta={firstDayForm ? "View or update" : "Fill it in now"}
          locked={locked}
        />
        <Card
          title="Follow-up form"
          text={followUps[0] ? `Last sent on ${longDate(followUps[0].createdAt)} (${followUps[0].weightKg} kg).` : "Send your progress whenever your coach asks (usually weekly)."}
          href="/dashboard/follow-up"
          cta="Send a follow-up"
          locked={locked}
        />
        <Card title="Recorded library" text="Your 4-week home workout plan: six sessions a week." href="/dashboard/library" cta="Watch workouts" locked={locked} />
        {ebook.enabled || hasEbook ? (
          <div className="card flex flex-col gap-3 p-6">
            <h2 className="text-2xl text-brand-dark">E-book</h2>
            <p className="text-[15px] text-muted">{ebook.title}</p>
            {hasEbook ? (
              ebook.driveLink ? (
                <a href={ebook.driveLink} target="_blank" rel="noopener noreferrer" className="btn btn-sm mt-auto w-max">Open the e-book</a>
              ) : (
                <p className="mt-auto text-sm text-muted">Your coach will send the link on WhatsApp.</p>
              )
            ) : (
              <Link href="/ebook" className="btn btn-ghost btn-sm mt-auto w-max">Get the e-book</Link>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
