/** The "page not found" screen with header and footer, so visitors aren't stranded. Used by both 404 files. */
import Link from "next/link";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { getSettings } from "@/lib/content";

export async function NotFoundContent() {
  const { nav } = await getSettings();
  return (
    <>
      <Header nav={nav} />
      <main id="main" className="section bg-gradient-to-b from-blush to-bg text-center">
        <div className="container-site max-w-[640px]">
          <p className="kicker">Error 404</p>
          <h1 className="mt-3 text-[clamp(34px,5vw,54px)]">
            This page took a <span className="script">rest day</span>
          </h1>
          <p className="lead mx-auto mt-4">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn">Go to the homepage</Link>
            <Link href="/programs" className="btn btn-ghost">See programs</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
