/** "How it works" - 4 steps joined by a line that draws itself (approved animation #6). */
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  { title: "Choose your plan", text: "Pick the program that fits your goals and region." },
  { title: "Share your story", text: "Goals, routine, food preferences and any health conditions." },
  { title: "Follow & check in", text: "Your diet plan, recorded workouts and weekly check-ins." },
  { title: "See results", text: "Plans adjust as you progress, with support all the way." },
];

export function StepsSection() {
  return (
    <section className="section" id="how">
      <div className="container-site">
        <SectionHeading kicker="How it works" title="Four steps to a" highlight="healthier you" />
        <ol className="relative grid grid-cols-2 gap-5 md:grid-cols-4">
          {/* The line sits behind the numbers on desktop; Reveal adds `reveal-play` to draw it. */}
          <Reveal className="absolute top-[31px] right-[7%] left-[7%] hidden h-0.5 md:block" as="div">
            <svg className="step-line block h-0.5 w-full" viewBox="0 0 1000 2" preserveAspectRatio="none" aria-hidden="true">
              <line x1="0" y1="1" x2="1000" y2="1" stroke="var(--color-rose)" strokeWidth="2" />
            </svg>
          </Reveal>
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative flex flex-col items-center gap-2.5 text-center">
              <span className="grid h-15.5 w-15.5 place-items-center rounded-full border border-gold bg-bg font-display text-2xl text-brand shadow-[0_0_0_8px_var(--color-blush)]">
                {i + 1}
              </span>
              <h3 className="text-xl">{step.title}</h3>
              <p className="max-w-[26ch] text-[14.5px] text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
