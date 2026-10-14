"use client";

/**
 * Member area frame: sidebar navigation, a top bar with her name, and the page content.
 * Kept deliberately small: home, the two forms, the recorded library, "report an issue" and settings.
 * (Diet plans and day-to-day coaching happen on WhatsApp.)
 */
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, Clipboard, Close, Heart, Home, LogOut, Menu, PlayCircle, Settings } from "@/components/ui/Icons";
import { logOut } from "@/app/(frontend)/dashboard/actions";

const NAV = [
  { href: "/dashboard", label: "Home", Icon: Home },
  { href: "/dashboard/first-day", label: "Personal Wellness Profile", Icon: Clipboard },
  { href: "/dashboard/follow-up", label: "Follow-up form", Icon: Clipboard },
  { href: "/dashboard/library", label: "Recorded library", Icon: PlayCircle },
  { href: "/dashboard/issues", label: "Report an issue", Icon: AlertCircle },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings },
];

type Props = { firstName: string; initial: string; children: React.ReactNode };

export function DashboardShell({ firstName, initial, children }: Props) {
  const pathname = usePathname();
  // Same trick as the site header: the drawer closes itself when the page changes.
  const [drawerOpenOn, setDrawerOpenOn] = useState<string | null>(null);
  const drawerOpen = drawerOpenOn === pathname;
  const setDrawerOpen = (open: boolean) => setDrawerOpenOn(open ? pathname : null);

  // Keep the harmless "logged in" hint cookie up to date (it shows her initial on the public pages,
  // see MEMBER_HINT_COOKIE in lib/auth/session.server.ts). Also covers logins from before the cookie existed.
  useEffect(() => {
    document.cookie = `ftf_member=${encodeURIComponent(initial)}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax`;
  }, [initial]);

  const sidebar = (
    <nav aria-label="Member area" className="flex h-full flex-col gap-1.5 p-4">
      <Link href="/" className="mb-5 flex items-center gap-2.5 px-2">
        <Image src="/images/logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-full bg-white" />
        <span className="font-display text-xl text-brand-dark italic">
          Fat to Fit <span className="block text-sm not-italic text-muted">with Z</span>
        </span>
      </Link>
      {NAV.map(({ href, label, Icon }) => {
        const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[15px] text-ink transition hover:bg-blush aria-[current=page]:bg-blush aria-[current=page]:font-medium aria-[current=page]:text-brand-dark"
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
      <div className="mt-auto rounded-[14px] bg-blush p-5 text-center">
        <p className="font-display text-lg leading-snug text-brand-dark italic">Your Health in Safe Hands.</p>
        <Heart className="mx-auto mt-2 h-4 w-4 text-brand-dark" />
      </div>
      <form action={logOut}>
        <button type="submit" className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[15px] text-muted transition hover:bg-blush hover:text-brand-dark">
          <LogOut className="h-5 w-5" /> Log out
        </button>
      </form>
    </nav>
  );

  return (
    <div className="min-h-screen bg-blush/50 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-line bg-card lg:block">{sidebar}</aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Member menu">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} />
          <aside className="relative h-full w-[270px] bg-card shadow-xl">
            <button type="button" className="icon-btn absolute top-3 right-3" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
              <Close />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-card/95 px-4 py-3 backdrop-blur sm:px-6">
          <button type="button" className="icon-btn lg:hidden" aria-label="Open menu" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}>
            <Menu />
          </button>
          <p className="min-w-0 flex-1 truncate text-lg">
            Welcome, <b className="font-semibold">{firstName}!</b>
          </p>
          <Link href="/dashboard/settings" className="grid h-9 w-9 place-items-center rounded-full bg-brand font-medium text-ink" aria-label="Settings">
            {initial}
          </Link>
        </header>

        <main id="main" className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
