"use client";

/**
 * Site header: logo, main navigation, "Join now" button and the member login link.
 * On small screens the navigation collapses into a menu toggled by the burger button.
 */
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Close, Menu } from "@/components/ui/Icons";
type NavItem = { label: string; href: string };

/** `nav` comes from Site settings in the admin panel (passed in by the site layout). */
export function Header({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  // Remember WHICH page the menu was opened on: after navigating, the menu is closed automatically.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const menuOpen = menuOpenOn === pathname;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="header-scroll sticky top-0 z-40 border-b border-line/70 bg-bg/90 backdrop-blur">
      {/* Thin pink bar that fills as you scroll down the page (CSS only, see .scroll-progress) */}
      <span aria-hidden="true" className="scroll-progress" />
      <div className="container-site flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 font-display text-base whitespace-nowrap text-ink sm:text-[19px]">
          <Image src="/images/logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-full bg-white" loading="eager" />
          Fat To Fit With Z
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex gap-7 text-[15px] text-muted">
            {nav.slice(1).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="transition-colors hover:text-brand-dark aria-[current=page]:text-brand-dark"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-none items-center gap-2">
          <Link href="/dashboard" className="hidden text-sm text-muted hover:text-brand-dark sm:inline">
            Member login
          </Link>
          <Link href="/programs" className="btn btn-sm px-3 whitespace-nowrap sm:px-4">
            Join now
          </Link>
          <button
            type="button"
            className="icon-btn lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpenOn(menuOpen ? null : pathname)}
          >
            {menuOpen ? <Close /> : <Menu />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-line bg-bg lg:hidden">
          <ul className="container-site flex flex-col py-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="block py-3 text-lg aria-[current=page]:text-brand-dark"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/dashboard" className="block py-3 text-lg text-muted">
                Member login
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
