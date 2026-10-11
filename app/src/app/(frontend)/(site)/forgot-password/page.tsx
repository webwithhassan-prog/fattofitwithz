/** /forgot-password - email a link to set a new password (also used to create the first one). */
import { ForgotPasswordForm } from "@/components/auth/AuthForms";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Forgot password",
  path: "/forgot-password",
  description: "Get a link to set a new password for your Fat To Fit With Z member dashboard.",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <section className="section bg-gradient-to-b from-blush to-bg">
      <div className="container-site">
        <div className="mb-8 text-center">
          <p className="kicker">Members</p>
          <h1 className="mt-3 text-[clamp(32px,5vw,48px)]">
            Forgot your <span className="script">password?</span>
          </h1>
        </div>
        <ForgotPasswordForm />
      </div>
    </section>
  );
}
