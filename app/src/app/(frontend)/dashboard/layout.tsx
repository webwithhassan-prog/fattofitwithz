/**
 * Member area layout. Only for logged-in members: visitors who aren't logged in
 * are sent to /login (getDashboardData -> requireMember). Not indexed by search engines.
 */
import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardData } from "@/lib/members.server";

export const metadata: Metadata = {
  title: { default: "My account", template: "%s | My account" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { member } = await getDashboardData();
  return (
    <DashboardShell firstName={member.firstName} initial={(member.fullName || member.email).charAt(0).toUpperCase()}>
      {children}
    </DashboardShell>
  );
}
