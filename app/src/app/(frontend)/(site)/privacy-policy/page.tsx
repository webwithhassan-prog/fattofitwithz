import { LegalPage } from "@/components/legal/LegalPage";
import { getLegalDoc } from "@/lib/legal.server";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  path: "/privacy-policy",
  description: "How Fat To Fit With Z collects, uses and protects your personal, health and payment information.",
});

export default async function PrivacyPolicyPage() {
  const doc = await getLegalDoc("privacy-policy");
  return <LegalPage doc={doc} />;
}
