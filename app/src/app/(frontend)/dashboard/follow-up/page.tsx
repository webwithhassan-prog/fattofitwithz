/** /dashboard/follow-up - send a follow-up form, and see the ones sent before. */
import { LockedPreview } from "@/components/dashboard/LockedPreview";
import { FollowUpForm } from "@/components/dashboard/FollowUpForm";
import { getDashboardData } from "@/lib/members.server";
import { getSettings } from "@/lib/content";
import { formatDate } from "@/lib/dates";

export const metadata = { title: "Follow-up form" };

export default async function FollowUpPage() {
  const [{ member, program, followUps }, settings] = await Promise.all([getDashboardData(), getSettings()]);
  if (!program?.active) {
    return (
      <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
        <h1 className="text-3xl">Follow-up form</h1>
        <LockedPreview program={program}>
          <FollowUpForm whatsappUrl={settings.contact.whatsappUrl} name={member.fullName || member.email} />
        </LockedPreview>
      </div>
    );
  }
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
      <h1 className="text-3xl">Follow-up form</h1>
      <FollowUpForm whatsappUrl={settings.contact.whatsappUrl} name={member.fullName || member.email} />
      {followUps.length ? (
        <section className="card p-6">
          <h2 className="mb-3 text-xl text-brand-dark">Sent before</h2>
          <ul className="divide-y divide-line">
            {followUps.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 py-2.5 text-[15px]">
                <span>{formatDate(f.createdAt)} · {f.weightKg} kg</span>
                <a href={`/api/forms/image?form=follow-up&id=${f.id}&download=1`} className="text-sm text-brand-dark underline">Save image</a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
