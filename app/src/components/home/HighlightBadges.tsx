/**
 * Three highlight cards on the homepage (24/7 support, 10k+ success stories, desi-food plans).
 * They used to sit under the founder photo slider, which was removed on 2026-11-24 at the
 * client's request (too many photos of her); the slider's text and photos are still saved in
 * admin > Homepage text > Founder messages, but are not shown.
 */
import { CountUp } from "@/components/ui/CountUp";
import { Headset, Star, Utensils } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";

const BADGES = [
  { Icon: Headset, title: "24/7 Support", count: 0, text: "Expert help on WhatsApp" },
  { Icon: Star, title: "Success Stories", count: 10, text: "Women who changed their lives" }, // count: 10 -> "10k+" (counts up)
  { Icon: Utensils, title: "Desi-Food Plans", count: 0, text: "Built around what you eat" },
];

export function HighlightBadges() {
  return (
    <section className="py-10 sm:py-14" aria-label="Why women choose us">
      <div className="container-site">
        <Reveal as="ul" className="stagger grid gap-2.5 sm:grid-cols-3 sm:gap-3">
          {BADGES.map(({ Icon, title, count, text }) => (
            <li key={title} className="card card-hover flex items-center gap-3 p-3 sm:gap-3.5 sm:p-4.5">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-brand text-ink shadow-[0_10px_20px_-12px_rgba(214,51,159,0.9)] sm:h-12 sm:w-12">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </span>
              <span>
                <b className="block font-display text-[19px] leading-tight font-semibold sm:text-[22px]">
                  {count ? <CountUp value={count} suffix="k+" /> : null} {title}
                </b>
                <span className="text-[13px] font-medium text-muted sm:text-sm">{text}</span>
              </span>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
