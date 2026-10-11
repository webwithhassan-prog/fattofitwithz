import { LegalPage } from "@/components/legal/LegalPage";
import { getLegalDoc } from "@/lib/legal.server";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms of Service",
  path: "/terms",
  description: "Terms of Service for Fat To Fit With Z programs, workout sessions, nutrition services and the website.",
});

export default async function TermsPage() {
  const doc = await getLegalDoc("terms-and-services");
  return <LegalPage doc={doc} />;
}
