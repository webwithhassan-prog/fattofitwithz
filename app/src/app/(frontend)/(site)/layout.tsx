/**
 * Layout for all public pages: header, footer, floating WhatsApp button (+ profile / back-to-top above it),
 * the site-wide structured data (Organization + WebSite) and the visit counter for the admin dashboard.
 * The member dashboard has its own layout in src/app/(frontend)/dashboard/layout.tsx.
 */
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { FloatingButtons } from "@/components/layout/FloatingButtons";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { getSettings } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { nav } = await getSettings();
  return (
    <>
      <JsonLd data={[await organizationSchema(), websiteSchema()]} />
      <Header nav={nav} />
      <main id="main">{children}</main>
      <Footer />
      <WhatsAppButton />
      <FloatingButtons />
      <PageViewTracker />
    </>
  );
}
