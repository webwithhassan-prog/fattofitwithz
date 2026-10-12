/**
 * Site footer - shown on EVERY public page (the old Shopify site only had it on the homepage).
 */
import Link from "next/link";
import { getSettings, whatsappLink } from "@/lib/content";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, YouTubeIcon } from "@/components/ui/Icons";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

export async function Footer() {
  const s = await getSettings();
  const whatsappHref = await whatsappLink();
  const socials = [
    { label: "Instagram", href: s.social.instagram, Icon: InstagramIcon },
    { label: "Facebook", href: s.social.facebook, Icon: FacebookIcon },
    { label: "YouTube", href: s.social.youtube, Icon: YouTubeIcon },
    { label: "TikTok", href: s.social.tiktok, Icon: TikTokIcon },
  ];

  return (
    <footer className="bg-ink pt-14 pb-7 text-[#eadde1]">
      <div className="container-site">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <h2 className="mb-3.5 text-lg text-white">Fat To Fit With Z</h2>
            <p className="text-sm text-[#cdbec3]">{s.brand.footerDescription}</p>
            <ul className="mt-5 flex gap-2.5">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} (opens in a new tab)`}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/40 transition hover:bg-white hover:text-brand-dark"
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3.5 text-lg text-white">Explore</h2>
            <ul className="space-y-2 text-sm text-[#cdbec3]">
              {s.nav.slice(1).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3.5 text-lg text-white">Policies</h2>
            <ul className="space-y-2 text-sm text-[#cdbec3]">
              {s.footerLinks.slice(2).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h2 className="mt-6 mb-2 text-lg text-white">Contact</h2>
            <p className="text-sm text-[#cdbec3]">
              <a href={`mailto:${s.contact.publicEmail}`} className="hover:text-white">
                {s.contact.publicEmail}
              </a>
            </p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded bg-white px-4 py-2.5 text-xs font-semibold tracking-wide text-brand-dark uppercase"
            >
              <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </div>

          <div>
            <h2 className="mb-3.5 text-lg text-white">Stay updated</h2>
            <p className="text-sm text-[#cdbec3]">Fitness tips, desi recipes and program news.</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-9 flex flex-wrap justify-between gap-3 border-t border-[#4a3439] pt-5 text-[13px] text-[#b8a6ac]">
          <span>
            © {new Date().getFullYear()} {s.brand.legalName}. All rights reserved.
          </span>
          <span>Results vary from person to person. Not a substitute for medical advice.</span>
        </div>
      </div>
    </footer>
  );
}
