"use server";

/**
 * "Report an issue" (/dashboard/issues): saves the client's problem in admin > Client issues.
 * Any logged-in client can report one (a program is not needed, e.g. for payment problems).
 */
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getPayloadClient } from "@/lib/payload.server";
import { getCurrentMember } from "@/lib/auth/session.server";
import { ISSUE_TOPICS } from "@/lib/member";

export type ReportIssueState = { ok?: boolean; error?: string };

const IssueInput = z.object({
  topic: z.enum(ISSUE_TOPICS, { error: "Please choose what the problem is about" }),
  message: z.string().trim().min(10, "Please describe the problem in a few words (10+ characters)").max(2000, "Please keep it under 2000 characters"),
});

export async function reportIssue(_previous: ReportIssueState, formData: FormData): Promise<ReportIssueState> {
  const member = await getCurrentMember();
  if (!member) return { error: "Your login has expired. Please refresh the page and log in again." };

  const parsed = IssueInput.safeParse({ topic: formData.get("topic"), message: formData.get("message") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const payload = await getPayloadClient();
    await payload.create({ collection: "client-issues", data: { member: member.id, topic: parsed.data.topic, message: parsed.data.message, status: "open" } });
  } catch (error) {
    console.error("[dashboard:issues] Could not save the issue:", error);
    return { error: "We couldn't send it. Please try again, or message us on WhatsApp." };
  }
  revalidatePath("/dashboard/issues");
  return { ok: true };
}
