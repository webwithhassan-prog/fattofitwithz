/** /dashboard/follow-up - send a follow-up form, and see the ones sent before. */
import { LockedPreview } from "@/components/dashboard/LockedPreview";
import { FollowUpForm } from "@/components/dashboard/FollowUpForm";
import { getDashboardData } from "@/lib/members.server";
import { getSettings } from "@/lib/content";

export const metadata = { title: "Follow-up form" };

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function FollowUpPage() {
  const [{ member, program, followUps }, settings] = await Promise.all([getDashboardData(), getSettings()]);
  if (!program?.active) {
    return (
      <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
        <h1 className="text-3xl">Follow-up form</h1>
        <LockedPreview>
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
          <h2 className="mb-3 text-xl text-brand">Sent before</h2>
          <ul className="divide-y divide-line">
            {followUps.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 py-2.5 text-[15px]">
                <span>{formatDate(f.createdAt)} · {f.weightKg} kg</span>
                <a href={`/api/forms/image?form=follow-up&id=${f.id}&download=1`} className="text-sm text-brand underline">Save image</a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
