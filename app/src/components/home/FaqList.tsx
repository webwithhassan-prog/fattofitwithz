/**
 * FAQ accordion using native <details>/<summary>: works without JavaScript,
 * is keyboard accessible, and the text is always in the HTML for search engines.
 */
type Item = { question: string; answer: string; bullets?: string[]; answerAfterList?: string };

export function FaqList({ items }: { items: Item[] }) {
  return (
    <div className="mx-auto max-w-[760px] border-t border-line">
      {items.map((item) => (
        <details key={item.question} className="group border-b border-line">
          <summary className="relative cursor-pointer list-none py-5 pr-10 font-display text-xl [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden="true"
              className="absolute top-1/2 right-1 -translate-y-1/2 font-body text-[26px] font-light text-brand-dark transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="max-w-[62ch] pb-5 text-muted">
            <p>{item.answer}</p>
            {item.bullets?.length ? (
              <ul className="mt-2.5 ml-5 list-disc space-y-1">
                {item.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : null}
            {item.answerAfterList ? <p className="mt-2.5">{item.answerAfterList}</p> : null}
          </div>
        </details>
      ))}
    </div>
  );
}
