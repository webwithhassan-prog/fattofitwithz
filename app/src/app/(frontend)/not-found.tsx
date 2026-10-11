/** Shown when a page calls notFound(), e.g. /programs/unknown-program. */
import { NotFoundContent } from "@/components/layout/NotFoundContent";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return <NotFoundContent />;
}
