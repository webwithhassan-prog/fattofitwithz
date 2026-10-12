"use server";

/**
 * "Mark as sent" / "Undo" buttons on admin > Diet plans to send.
 * Only a logged-in admin may use them (checked here, not trusted from the page).
 */
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getPayloadClient } from "../../lib/payload.server";

export async function setDietPlanSent(formData: FormData): Promise<void> {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) throw new Error("[diet-plans] Not logged in to the admin panel.");

  const id = Number(formData.get("formId"));
  const sent = formData.get("sent") === "1";
  if (!id) throw new Error("[diet-plans] Missing first day form id.");

  // "reviewed" is the "Diet plan sent" tick on the first day form
  await payload.update({ collection: "first-day-forms", id, data: { reviewed: sent } });
  revalidatePath("/admin/diet-plans");
}
