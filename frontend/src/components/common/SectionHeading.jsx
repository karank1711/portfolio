export function SectionHeading({ eyebrow, title, intro, action }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4 md:mb-12">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-faint">
            <span className="h-px w-6 bg-current" aria-hidden />
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-3 font-serif text-4xl leading-tight text-ink md:text-5xl">{title}</h2>
        {intro ? <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{intro}</p> : null}
      </div>
      {action || null}
    </div>
  );
}
