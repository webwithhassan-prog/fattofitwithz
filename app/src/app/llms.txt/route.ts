/**
 * /llms.txt - a plain-language summary of the site for AI assistants (GEO).
 * Format: https://llmstxt.org . Generated from the same content as the pages (the database),
 * so it never goes out of date.
 */
import { getFaqs, getPrograms, getSettings } from "@/lib/content";
import { durationLabel } from "@/lib/pricing";
import { absoluteUrl, DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const revalidate = 3600; // rebuilt at most once an hour

export async function GET() {
  const [s, programs, allFaqs] = await Promise.all([getSettings(), getPrograms(), getFaqs()]);
  const faqs = allFaqs.slice(0, 10);

  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${DEFAULT_DESCRIPTION}`,
    "",
    `Founder: ${s.brand.founder} (${s.brand.founderTitle}), based in ${s.brand.location}. Clients join online from many countries; prices are shown in local currency for the USA, Canada, UAE, Saudi Arabia, Qatar, India, Pakistan and Australia.`,
    "",
    "## Programs",
    ...programs.map(
      (p) =>
        `- [${p.name}](${absoluteUrl(`/programs/${p.slug}`)}): ${p.focus}. Duration: ${p.durations
          .map((d) => durationLabel(d.months, d.isMinimum))
          .join(" or ")}.`,
    ),
    "",
    "## Key pages",
    `- [All programs and prices](${absoluteUrl("/programs")})`,
    `- [How it works](${absoluteUrl("/how-it-works")})`,
    `- [About the coach](${absoluteUrl("/about")})`,
    `- [Transformations and testimonials](${absoluteUrl("/testimonials")})`,
    `- [FAQ](${absoluteUrl("/faq")})`,
    `- [Contact](${absoluteUrl("/contact")})`,
    "",
    "## Frequently asked questions",
    ...faqs.map((f) => `- **${f.question}** ${f.answer}`),
    "",
    "## Contact",
    `- WhatsApp: ${s.contact.whatsappE164}`,
    `- Email: ${s.contact.publicEmail}`,
    `- Instagram: ${s.social.instagram}`,
    "",
    "Note: services are wellness and nutrition coaching, not medical treatment.",
  ];

  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
