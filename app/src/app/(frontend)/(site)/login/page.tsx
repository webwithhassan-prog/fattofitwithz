/** /login?next=/checkout... - members log in with email + password, then go to `next` (default: the dashboard). */
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/AuthForms";
import { getCurrentMember } from "@/lib/auth/session.server";
import { safeNextPath } from "@/lib/auth/safe-next";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Member login",
  path: "/login",
  description: "Log in to your Fat To Fit With Z member dashboard.",
  noIndex: true,
});

type PageProps = { searchParams: Promise<{ loggedOut?: string; next?: string }> };

export default async function LoginPage({ searchParams }: PageProps) {
  const { loggedOut, next } = await searchParams;
  const nextPath = safeNextPath(next); // e.g. back to /checkout after logging in
  if (await getCurrentMember()) redirect(nextPath);

  return (
    <section className="section bg-gradient-to-b from-blush to-bg">
      <div className="container-site">
        <div className="mb-8 text-center">
          <p className="kicker">Members</p>
          <h1 className="mt-3 text-[clamp(32px,5vw,48px)]">
            Welcome <span className="script">back</span>
          </h1>
        </div>
        <LoginForm notice={loggedOut ? "You've been logged out." : undefined} next={nextPath} />
        <p className="mt-6 text-center text-sm text-muted">
          New here? <Link href="/signup" className="text-brand-dark underline">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
