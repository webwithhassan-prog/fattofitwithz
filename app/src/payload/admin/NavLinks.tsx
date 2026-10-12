"use client";

/**
 * Shortcuts at the top of the admin menu: Overview, Diet plans to send, Site photos, and the website.
 * (The lists below them come from each collection's `admin.group`.)
 */
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/diet-plans", label: "Diet plans to send" },
  { href: "/admin/site-photos", label: "Site photos" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <div className="ftf-navlinks">
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} className="ftf-navlinks__link" aria-current={pathname === link.href ? "page" : undefined}>
          {link.label}
        </Link>
      ))}
      <a href="/" target="_blank" rel="noopener noreferrer" className="ftf-navlinks__link ftf-navlinks__link--muted">
        Open website ↗
      </a>
    </div>
  );
}
