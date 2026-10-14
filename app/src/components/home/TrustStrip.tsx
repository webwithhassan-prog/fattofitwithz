/**
 * Highlights under the hero. Numbers count up from 0 when they scroll into view (CountUp).
 * Phones: small centred cards, 3 on top and 2 below. Desktop: one row of 5.
 * Change the figures here.
 */
import { CountUp } from "@/components/ui/CountUp";
import { Award, Globe, Layers, TrendingDown, Users } from "@/components/ui/Icons";

type Item = { Icon: (p: { className?: string }) => React.ReactNode; label: string; text?: string; value?: number; prefix?: string; suffix?: string };

const ITEMS: Item[] = [
  { Icon: Award, value: 5, label: "Years of experience" },
  { Icon: Globe, text: "Global", label: "Wellness community" },
  { Icon: Layers, value: 6, label: "Signature programs" },
  { Icon: Users, value: 2000, suffix: "+", label: "Real transformations" },
  { Icon: TrendingDown, value: 36, prefix: "−", suffix: " kg", label: "Best result" },
];

export function TrustStrip() {
  return (
    <div className="container-site relative z-10 -mt-2">
      <ul
        aria-label="Highlights"
        className="grid grid-cols-6 gap-2 rounded-[20px] border border-line bg-card p-2 shadow-[0_24px_50px_-34px_rgba(214,51,159,0.55)] sm:gap-3 sm:p-3 md:grid-cols-5 md:gap-0 md:divide-x md:divide-line md:p-4"
      >
        {ITEMS.map(({ Icon, label, ...item }, i) => (
          <li
            key={label}
            className={`flex min-w-0 flex-col items-center gap-1 rounded-[14px] bg-blush/60 px-1.5 py-2.5 text-center md:col-span-1 md:flex-row md:gap-3 md:bg-transparent md:px-4 md:py-1 md:text-left ${i < 3 ? "col-span-2" : "col-span-3"}`}
          >
            <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-brand/15 text-brand-dark md:h-10 md:w-10">
              <Icon className="h-4 w-4 md:h-5 md:w-5" />
            </span>
            <span className="min-w-0">
              <b className="block font-display text-[20px] leading-none font-semibold text-ink md:text-[24px]">
                {item.text ?? <CountUp value={item.value ?? 0} prefix={item.prefix} suffix={item.suffix} />}
              </b>
              <span className="mt-1 block text-[11.5px] leading-tight font-medium text-muted md:text-[13px]">{label}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
