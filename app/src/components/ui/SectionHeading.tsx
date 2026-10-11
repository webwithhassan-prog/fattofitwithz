/**
 * Standard section heading: gold-ruled kicker, two-tone title, optional lead text.
 * Pass the highlighted word(s) as `highlight` - they render in italic brand colour.
 * Example: <SectionHeading kicker="Programs" title="Choose your" highlight="program" />
 */
import { Reveal } from "./Reveal";

type Props = {
  kicker: string;
  title: string;
  highlight?: string;
  lead?: string;
  /** "h1" only for the main heading of a page; sections use "h2" (default). */
  as?: "h1" | "h2";
  align?: "center" | "left";
};

export function SectionHeading({ kicker, title, highlight, lead, as = "h2", align = "center" }: Props) {
  const Tag = as;
  const centered = align === "center";
  return (
    <Reveal className={`mb-9 flex flex-col gap-3 ${centered ? "items-center text-center" : "items-start"}`}>
      <div className={`gold-rule ${centered ? "" : "gold-rule-left"}`}>
        <span className="kicker">{kicker}</span>
      </div>
      <Tag className={as === "h1" ? "text-[clamp(34px,5vw,56px)]" : "text-[clamp(30px,4.4vw,46px)]"}>
        {title} {highlight ? <span className="script">{highlight}</span> : null}
      </Tag>
      {lead ? <p className={`lead ${centered ? "mx-auto" : ""}`}>{lead}</p> : null}
    </Reveal>
  );
}
