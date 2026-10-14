/** /dashboard/library?week=2 - the recorded 4-week workout library (included with every program). */
import { LockedPreview } from "@/components/dashboard/LockedPreview";
import { RecordedSessions } from "@/components/dashboard/RecordedSessions";
import { getWorkoutSessions } from "@/lib/content";
import { getDashboardData } from "@/lib/members.server";

export const metadata = { title: "Recorded library" };

type PageProps = { searchParams: Promise<{ week?: string }> };

export default async function LibraryPage({ searchParams }: PageProps) {
  const [{ week }, { program, workoutsDone }, sessions] = await Promise.all([searchParams, getDashboardData(), getWorkoutSessions()]);
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-5">
      <div>
        <h1 className="text-3xl">Recorded library</h1>
        <p className="mt-1 text-muted">Your 4-week home workout plan. Press play on today&apos;s session; it&apos;s marked done when you finish it.</p>
      </div>
      {program?.active ? (
        <RecordedSessions sessions={sessions} initialWeek={Number(week) || 1} done={workoutsDone} />
      ) : (
        <LockedPreview message="Join a program to unlock your workouts" program={program}>
          <RecordedSessions sessions={sessions} initialWeek={1} />
        </LockedPreview>
      )}
    </div>
  );
}
