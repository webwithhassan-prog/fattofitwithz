/** /signup - create a free account (no purchase needed). Already logged in? Straight to the dashboard. */
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/auth/AuthForms";
import { getCurrentMember } from "@/lib/auth/session.server";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Create an account",
  path: "/signup",
  description: "Create your free Fat To Fit With Z account. Join a program any time to unlock your forms and workouts.",
  noIndex: true,
});

export default async function SignUpPage() {
  if (await getCurrentMember()) redirect("/dashboard");
  return (
    <section className="section bg-gradient-to-b from-blush to-bg">
      <div className="container-site">
        <div className="mb-8 text-center">
          <p className="kicker">Members</p>
          <h1 className="mt-3 text-[clamp(32px,5vw,48px)]">
            Create your <span className="script">account</span>
          </h1>
          <p className="lead mx-auto mt-3">Free to create. Join a program any time to unlock your forms and workout library.</p>
        </div>
        <SignUpForm />
      </div>
    </section>
  );
}
