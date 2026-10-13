/** /how-it-works - the five-step member journey as a vertical timeline. */
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Clipboard, Headset, PlayCircle, Target, Utensils } from "@/components/ui/Icons";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "How It Works",
  path: "/how-it-works",
  description:
    "How it works: choose a program, join online, get your personalized diet and workout plan, check in weekly and get ongoing support from your coach.",
});

const STEPS = [
  {
    title: "Choose your program",
    lead: "Select the program that best fits your goals.",
    text: "Pick from our programs according to your health, fitness, nutrition and lifestyle goals. Not sure? Use the goal picker on the homepage or ask us on WhatsApp.",
    Icon: Target,
  },
  {
    title: "Join Fat To Fit With Z",
    lead: "Complete registration and payment.",
    text: "Create your account and pay securely online. You get a welcome email straight away and your member area opens.",
    Icon: Clipboard,
  },
  {
    title: "Get your plan",
    lead: "Fill in your first day form, get your diet plan on WhatsApp.",
    text: "Tell your coach about your goals, routine, food and health in the first day form. Your personalized diet plan is sent to you on WhatsApp, and your recorded workouts are ready in your member area.",
    Icon: Utensils,
  },
  {
    title: "Follow & stay consistent",
    lead: "Follow your nutrition, fitness and lifestyle guidance.",
    text: "Train with the recorded home workouts and send a follow-up form whenever your coach asks.",
    Icon: PlayCircle,
  },
  {
    title: "Get ongoing support",
    lead: "Stay connected with the team throughout your journey.",
    text: "Your coach reviews your follow-ups and adjusts your plan on WhatsApp as you progress, so you keep moving toward your goals.",
    Icon: Headset,
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "How it works", path: "/how-it-works" }])} />
      <section className="section bg-gradient-to-b from-blush to-bg">
        <div className="container-site">
          <SectionHeading
            as="h1"
            kicker="How it works"
            title="A simple journey to a"
            highlight="healthier lifestyle"
            lead="Starting your fitness and wellness journey doesn't have to feel complicated. Here is exactly what happens, step by step."
          />
          <ol className="relative mx-auto max-w-[860px] border-l border-gold/60 pl-8 md:pl-12">
            {STEPS.map((step, i) => (
              <Reveal as="li" key={step.title} className="relative mb-12 last:mb-0">
                <span className="absolute top-0 -left-[49px] grid h-11 w-11 place-items-center rounded-full border border-gold bg-bg font-display text-lg text-brand-dark md:-left-[65px]">
                  {i + 1}
                </span>
                <div className="grid items-center gap-6 sm:grid-cols-[1fr_140px]">
                  <div>
                    <h2 className="text-[clamp(24px,3vw,32px)]">{step.title}</h2>
                    <p className="mt-1 font-semibold text-brand-dark">{step.lead}</p>
                    <p className="mt-3 font-medium text-ink/80">{step.text}</p>
                  </div>
                  {/* Icon (replaced the cartoon illustrations, 2026-10-13) */}
                  <span aria-hidden="true" className="hidden h-[120px] w-[120px] place-items-center justify-self-center rounded-[32px] bg-gradient-to-br from-brand/25 to-blush text-brand-dark shadow-[0_18px_36px_-22px_rgba(214,51,159,0.8)] sm:grid">
                    <step.Icon className="h-14 w-14" />
                  </span>
                </div>
              </Reveal>
            ))}
          </ol>
          <div className="mt-14 text-center">
            <h2 className="text-[clamp(26px,4vw,38px)]">
              Ready to <span className="script">start?</span>
            </h2>
            <Link href="/programs" className="btn mt-5">
              Explore our programs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
