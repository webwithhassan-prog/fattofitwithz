import Link from "next/link";
import { getDashboardData } from "@/lib/members.server";
import { getEbook } from "@/lib/content";
import { durationLabel } from "@/lib/pricing";
import { logOut } from "../actions";

export const metadata = { title: "Settings" };

const formatDate = (isoDay: string) =>
  new Date(`${isoDay}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default async function SettingsPage() {
  const [{ member, program, hasEbook }, ebook] = await Promise.all([getDashboardData(), getEbook()]);
  return (
    <div className="mx-auto flex max-w-[800px] flex-col gap-5">
      <h1 className="text-3xl">Settings</h1>
      <section className="card p-6">
        <h2 className="mb-3 text-xl text-brand">Membership</h2>
        {program ? (
          <dl className="grid grid-cols-[140px_1fr] gap-y-2 text-[15px]">
            <dt className="text-muted">Program</dt>
            <dd>{program.name}</dd>
            <dt className="text-muted">Duration</dt>
            <dd>{durationLabel(program.months)}</dd>
            <dt className="text-muted">Started</dt>
            <dd>{formatDate(program.startDate)}</dd>
            <dt className="text-muted">{program.active ? "Ends" : "Ended"}</dt>
            <dd>{formatDate(program.endDate)}</dd>
          </dl>
        ) : (
          <p className="text-[15px] text-muted">
            You haven&apos;t joined a program yet. <Link href="/programs" className="text-brand underline">Choose a program</Link>.
          </p>
        )}
        <p className="mt-4 text-sm text-muted">
          Need to pause? Freezes follow our <Link href="/refund-policy" className="text-brand underline">Refund, Cancellation &amp; Freeze Policy</Link>. Message us on WhatsApp.
        </p>
      </section>
      {hasEbook ? (
        <section className="card p-6">
          <h2 className="mb-3 text-xl text-brand">E-book</h2>
          {ebook.driveLink ? (
            <a href={ebook.driveLink} target="_blank" rel="noopener noreferrer" className="btn btn-sm">Open {ebook.title}</a>
          ) : (
            <p className="text-[15px] text-muted">Your coach will send the link on WhatsApp.</p>
          )}
        </section>
      ) : null}
      <section className="card p-6">
        <h2 className="mb-3 text-xl text-brand">Account</h2>
        <dl className="grid grid-cols-[140px_1fr] gap-y-2 text-[15px]">
          <dt className="text-muted">Email</dt>
          <dd className="break-all">{member.email}</dd>
          <dt className="text-muted">WhatsApp</dt>
          <dd>{member.phone || "—"}</dd>
        </dl>
        <p className="mt-3 text-sm text-muted">To change your email or number, message us on WhatsApp. Forgot your password? Use &quot;Forgot password&quot; on the login page.</p>
        <form action={logOut} className="mt-5">
          <button type="submit" className="btn btn-ghost btn-sm">Log out</button>
        </form>
      </section>
    </div>
  );
}
