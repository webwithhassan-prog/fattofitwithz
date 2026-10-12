/** /contact - contact details, WhatsApp and the contact form (one form, with feedback). */
import { ContactForm } from "@/components/forms/ContactForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSettings, whatsappLink } from "@/lib/content";
import { breadcrumbSchema, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact Us",
  path: "/contact",
  description:
    "Questions about programs, membership, payments or your account? Message Fat To Fit With Z on WhatsApp or send us a message.",
});

export default async function ContactPage() {
  const s = await getSettings();
  const whatsappHref = await whatsappLink();
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <section className="section bg-gradient-to-b from-blush to-bg">
        <div className="container-site">
          <SectionHeading
            as="h1"
            kicker="Get in touch"
            title="We're here to"
            highlight="help"
            lead="Have a question about our programs, membership, payments or your account? Message us and the team will get back to you."
          />
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col gap-5 rounded-[24px] bg-blush p-8">
              <h2 className="text-[28px] text-brand-dark">Contact details</h2>
              <div>
                <h3 className="text-lg">WhatsApp (fastest)</h3>
                <p className="text-muted">Chat with our team directly.</p>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn mt-3">
                  <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
                </a>
                <p className="mt-2 text-sm text-muted">+1 (917) 695-2569</p>
              </div>
              <div>
                <h3 className="text-lg">Email</h3>
                <a href={`mailto:${s.contact.publicEmail}`} className="text-brand-dark underline">
                  {s.contact.publicEmail}
                </a>
              </div>
              <div>
                <h3 className="text-lg">Need help choosing a program?</h3>
                <p className="text-muted">Tell us your goal and any health conditions and we&apos;ll recommend the right fit.</p>
              </div>
            </div>
            <div className="card p-8">
              <h2 className="mb-1 text-[28px] text-brand-dark">Send us a message</h2>
              <p className="mb-6 text-muted">Fill out the form and our team will get back to you.</p>
              <ContactForm subjects={s.contactSubjects} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
