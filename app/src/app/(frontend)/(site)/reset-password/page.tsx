/**
 * /reset-password?token=...           - the link from the "Forgot password" email
 * /reset-password?token=...&welcome=1 - first password after paying (welcome email, order page, dashboard)
 */
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/AuthForms";
import { isPasswordLinkValid } from "@/lib/auth/passwords.server";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Set your password",
  path: "/reset-password",
  description: "Choose a password for your Fat To Fit With Z member dashboard.",
  noIndex: true,
});

type PageProps = { searchParams: Promise<{ token?: string; welcome?: string }> };

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token = "", welcome } = await searchParams;
  const firstTime = welcome === "1";
  const valid = await isPasswordLinkValid(token);

  return (
    <section className="section bg-gradient-to-b from-blush to-bg">
      <div className="container-site">
        <div className="mb-8 text-center">
          <p className="kicker">{firstTime ? "Welcome" : "Members"}</p>
          <h1 className="mt-3 text-[clamp(32px,5vw,48px)]">
            {firstTime ? "Create" : "Set"} your <span className="script">password</span>
          </h1>
          {firstTime ? <p className="lead mx-auto mt-3 max-w-[520px]">Choose a password for your member area. You&apos;ll go straight to your dashboard.</p> : null}
        </div>
        {valid ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="card mx-auto max-w-[440px] p-7 text-center sm:p-9">
            <p className="text-[15px]">This link has expired or was already used.</p>
            <Link href="/forgot-password" className="btn mt-6">Get a new link</Link>
          </div>
        )}
      </div>
    </section>
  );
}
