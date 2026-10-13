/**
 * Highlights under the hero. Numbers count up when they scroll into view (CountUp).
 * Change the figures here.
 */
import { CountUp } from "@/components/ui/CountUp";
import { Award, Globe, Layers, TrendingDown, Users } from "@/components/ui/Icons";

type Item = { Icon: (p: { className?: string }) => React.ReactNode; label: string; text?: string; value?: number; prefix?: string; suffix?: string };

const ITEMS: Item[] = [
  { Icon: Award, value: 5, suffix: "", label: "Years of experience" },
  { Icon: Globe, text: "Global", label: "Wellness community" },
  { Icon: Layers, value: 6, suffix: "", label: "Signature programs" },
  { Icon: Users, value: 2000, suffix: "+", label: "Real transformations" },
  { Icon: TrendingDown, value: 36, prefix: "−", suffix: " kg", label: "Best result" },
];

export function TrustStrip() {
  return (
    <div className="container-site relative z-10 -mt-2">
      <ul
        aria-label="Highlights"
        className="grid grid-cols-2 gap-3 rounded-[22px] border border-line bg-card p-3 shadow-[0_24px_50px_-34px_rgba(214,51,159,0.55)] sm:p-4 md:grid-cols-5 md:gap-0 md:divide-x md:divide-line"
      >
        {ITEMS.map(({ Icon, label, ...item }, i) => (
          <li key={label} className={`flex min-w-0 flex-col items-start gap-2 rounded-[16px] bg-blush/60 p-3.5 sm:flex-row sm:items-center sm:gap-3 md:bg-transparent md:px-4 ${i === ITEMS.length - 1 ? "col-span-2 md:col-span-1" : ""}`}>
            <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-brand/15 text-brand-dark">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <b className="block font-display text-[24px] leading-none font-semibold text-ink">
                {item.text ?? <CountUp value={item.value ?? 0} prefix={item.prefix} suffix={item.suffix} />}
              </b>
              <span className="mt-1 block text-[13px] leading-tight font-medium text-muted">{label}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
