import { LegalPage } from "@/components/legal/LegalPage";
import { getLegalDoc } from "@/lib/legal.server";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Refund, Cancellation & Freeze Policy",
  path: "/refund-policy",
  description: "Refund, cancellation and package freeze rules for Fat To Fit With Z programs.",
});

export default async function RefundPolicyPage() {
  const doc = await getLegalDoc("refund-cancellation-freeze-policy");
  return <LegalPage doc={doc} />;
}
