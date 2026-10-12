/** /dashboard/issues - report a problem, and see earlier reports with the coach's replies. */
import { ReportIssueForm } from "@/components/dashboard/ReportIssueForm";
import { getClientIssues, getDashboardData } from "@/lib/members.server";
import { formatDate } from "@/lib/dates";

export const metadata = { title: "Report an issue" };

const STATUS = {
  open: { label: "Open", className: "bg-blush text-brand-dark" },
  "in-progress": { label: "In progress", className: "bg-[#fcefd8] text-[#8a5300]" },
  solved: { label: "Solved", className: "bg-[#e3f4ea] text-[#17643a]" },
} as const;

export default async function IssuesPage() {
  const { member } = await getDashboardData();
  const issues = await getClientIssues(member.id);

  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-5">
      <h1 className="text-3xl">Report an issue</h1>
      <ReportIssueForm />

      {issues.length ? (
        <section className="card p-6">
          <h2 className="mb-3 text-xl text-brand-dark">Your reports</h2>
          <ul className="divide-y divide-line">
            {issues.map((issue) => {
              const status = STATUS[issue.status as keyof typeof STATUS] ?? STATUS.open;
              return (
                <li key={issue.id} className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{issue.topic}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}>{status.label}</span>
                  </div>
                  <p className="mt-1 text-sm whitespace-pre-line text-muted">{issue.message}</p>
                  <p className="mt-1 text-xs text-muted">Sent {formatDate(issue.createdAt)}</p>
                  {issue.reply ? (
                    <div className="mt-3 rounded-[10px] bg-blush px-4 py-3 text-sm">
                      <b className="block text-brand-dark">Reply from your coach</b>
                      <span className="whitespace-pre-line">{issue.reply}</span>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
