/** Thin row of highlights under the hero (static numbers - counters were not approved). */
const ITEMS = [
  { big: "5+", small: "years coaching" },
  { big: "Worldwide", small: "online coaching" },
  { big: "6", small: "programs" },
  { big: "68", small: "desi recipes" },
  { big: "−36 kg", small: "top result" },
];

export function TrustStrip() {
  return (
    <div className="container-site">
      <ul aria-label="Highlights" className="flex flex-wrap justify-center gap-x-10 gap-y-2.5 border-y border-line py-5.5 text-sm text-muted">
        {ITEMS.map((item) => (
          <li key={item.small}>
            <b className="mr-1.5 font-display text-[22px] font-medium text-ink">{item.big}</b>
            {item.small}
          </li>
        ))}
      </ul>
    </div>
  );
}
