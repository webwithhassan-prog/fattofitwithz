"use client";

/** The "Report an issue" form on /dashboard/issues. Sends to reportIssue (dashboard/issues/actions.ts). */
import { useActionState } from "react";
import { reportIssue, type ReportIssueState } from "@/app/(frontend)/dashboard/issues/actions";
import { ISSUE_TOPICS } from "@/lib/member";

const START: ReportIssueState = {};

export function ReportIssueForm() {
  const [state, formAction, pending] = useActionState(reportIssue, START);
  return (
    <form action={formAction} className="card flex flex-col gap-4 p-6">
      <p className="text-[15px] text-muted">Something not working? Tell us here and your coach will reply on this page.</p>
      <div>
        <label htmlFor="issue-topic" className="field-label">What is it about?</label>
        <select id="issue-topic" name="topic" required defaultValue="" className="field-input">
          <option value="" disabled>Choose one</option>
          {ISSUE_TOPICS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="issue-message" className="field-label">Describe the problem</label>
        <textarea id="issue-message" name="message" required rows={5} maxLength={2000} className="field-input" placeholder="e.g. The video for week 2, day 3 doesn't play on my phone." />
      </div>
      {state.error ? <p role="alert" className="text-sm text-brand-dark">{state.error}</p> : null}
      {state.ok ? <p role="status" className="rounded-lg bg-blush px-3 py-2 text-sm">Thank you, we got it. Your coach will reply here soon.</p> : null}
      <button type="submit" className="btn w-full sm:w-max" disabled={pending}>
        {pending ? "Sending…" : "Send to my coach"}
      </button>
    </form>
  );
}
