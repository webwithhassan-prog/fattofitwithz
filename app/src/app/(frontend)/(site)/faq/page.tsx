/** /faq - all 25 questions in three groups, with FAQPage structured data. */
import { FaqList } from "@/components/home/FaqList";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { getFaqs, whatsappLink } from "@/lib/content";
import { breadcrumbSchema, buildMetadata, faqSchema } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Frequently Asked Questions",
  path: "/faq",
  description:
    "Answers about Fat To Fit With Z programs, membership, diet plans, home workouts, payments, freezing your package and support.",
});

const GROUPS = [
  { id: "general", title: "General questions" },
  { id: "membership", title: "Membership" },
  { id: "payments-support", title: "Payments & support" },
] as const;

export default async function FaqPage() {
  const faqs = await getFaqs();
  const whatsappHref = await whatsappLink();
  // Search engines get the answer text including bullet points.
  const schemaItems = faqs.map((f) => ({
    question: f.question,
    answer: [f.answer, f.bullets.join(", "), f.answerAfterList].filter(Boolean).join(" "),
  }));

  return (
    <>
      <JsonLd data={[faqSchema(schemaItems), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }])]} />
      <section className="section bg-gradient-to-b from-blush to-bg">
        <div className="container-site">
          <SectionHeading
            as="h1"
            kicker="Frequently asked questions"
            title="How can we"
            highlight="help?"
            lead="Find answers about our programs, memberships, workouts, diet plans, payments and support."
          />
          <nav aria-label="FAQ sections" className="mb-10 flex flex-wrap justify-center gap-2.5">
            {GROUPS.map((g) => (
              <a key={g.id} href={`#${g.id}`} className="chip hover:border-brand hover:text-brand-dark">
                {g.title}
              </a>
            ))}
          </nav>
          {GROUPS.map((g) => (
            <div key={g.id} id={g.id} className="mb-12 scroll-mt-24">
              <h2 className="mx-auto mb-4 max-w-[760px] text-[28px]">{g.title}</h2>
              <FaqList items={faqs.filter((f) => f.category === g.id)} />
            </div>
          ))}
        </div>
      </section>

      <section className="section bg-blush text-center">
        <div className="container-site">
          <h2 className="text-[clamp(28px,4vw,40px)]">
            Still have <span className="script">questions?</span>
          </h2>
          <p className="lead mx-auto mt-4">
            We&apos;re here to help with programs, memberships, payments or your account.
          </p>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn mt-6">
            <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
