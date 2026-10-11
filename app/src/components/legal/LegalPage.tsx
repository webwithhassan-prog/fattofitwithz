/** Shared layout for Privacy, Refund and Terms pages: title, effective date, table of contents, text. */
import type { LegalDoc } from "@/lib/legal.server";

/** Turns "1. Refund Policy" into "refund-policy" for in-page links. */
function anchorId(text: string) {
  return text
    .toLowerCase()
    .replace(/^\d+\.\s*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toTitleCase(text: string) {
  return text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bAnd\b/g, "and");
}

export function LegalPage({ doc }: { doc: LegalDoc }) {
  const headings = doc.blocks.filter((b) => b.type === "h2");
  // Placeholder from the client's draft: shown clearly so it is not forgotten before launch.
  const datePending = !doc.effectiveDate || doc.effectiveDate.includes("[");

  return (
    <section className="section">
      <div className="container-site grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="On this page" className="text-sm">
            <p className="kicker mb-3">On this page</p>
            <ol className="space-y-2 text-muted">
              {headings.map((h) => (
                <li key={h.text}>
                  <a href={`#${anchorId(h.text)}`} className="hover:text-brand">
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
        <article className="prose-site max-w-[70ch]">
          <h1 className="text-[clamp(34px,4.5vw,50px)]">{toTitleCase(doc.title)}</h1>
          <p className={`mt-3 text-sm ${datePending ? "text-[#8a5300]" : "text-muted"}`}>
            Effective date: {datePending ? "to be confirmed" : doc.effectiveDate}
          </p>
          {doc.blocks.map((block, i) => {
            if (block.type === "h2") {
              return (
                <h2 key={i} id={anchorId(block.text)} className="scroll-mt-24">
                  {block.text}
                </h2>
              );
            }
            if (block.type === "ul") {
              return (
                <ul key={i}>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }
            return <p key={i}>{block.text}</p>;
          })}
        </article>
      </div>
    </section>
  );
}
