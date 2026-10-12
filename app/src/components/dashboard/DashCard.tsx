/** Card used for every dashboard section: icon + title in the header, content below. */
type Props = {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export function DashCard({ title, icon, action, children, className = "", id }: Props) {
  return (
    <section id={id} className={`card scroll-mt-24 p-5 sm:p-6 ${className}`} aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3.5">
        <h2 id={id ? `${id}-title` : undefined} className="flex items-center gap-2.5 text-[22px] text-brand-dark">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-blush text-brand-dark">{icon}</span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
