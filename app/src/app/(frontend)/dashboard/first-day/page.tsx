/** /dashboard/first-day - the first day form (filled in once after joining; can be updated). */
import { LockedPreview } from "@/components/dashboard/LockedPreview";
import { FirstDayForm } from "@/components/dashboard/FirstDayForm";
import { getDashboardData } from "@/lib/members.server";
import { getSettings } from "@/lib/content";
import { EMPTY_FIRST_DAY_FORM } from "@/lib/member";

export const metadata = { title: "First day form" };

export default async function FirstDayPage() {
  const [{ member, program, firstDayForm }, settings] = await Promise.all([getDashboardData(), getSettings()]);
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-5">
      <h1 className="text-3xl">First day form</h1>
      {program?.active ? (
        <FirstDayForm
          initial={firstDayForm?.data ?? { ...EMPTY_FIRST_DAY_FORM, fullName: member.fullName }}
          savedId={firstDayForm?.id ?? null}
          whatsappUrl={settings.contact.whatsappUrl}
        />
      ) : (
        <LockedPreview>
          <FirstDayForm
          initial={firstDayForm?.data ?? { ...EMPTY_FIRST_DAY_FORM, fullName: member.fullName }}
          savedId={firstDayForm?.id ?? null}
          whatsappUrl={settings.contact.whatsappUrl}
        />
        </LockedPreview>
      )}
    </div>
  );
}
