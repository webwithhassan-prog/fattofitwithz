/** /reset-password?token=... - the link from the "Forgot password" or welcome email. */
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

type PageProps = { searchParams: Promise<{ token?: string }> };

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token = "" } = await searchParams;
  const valid = await isPasswordLinkValid(token);

  return (
    <section className="section bg-gradient-to-b from-blush to-bg">
      <div className="container-site">
        <div className="mb-8 text-center">
          <p className="kicker">Members</p>
          <h1 className="mt-3 text-[clamp(32px,5vw,48px)]">
            Set your <span className="script">password</span>
          </h1>
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
