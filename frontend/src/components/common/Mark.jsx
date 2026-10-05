export function Mark({ letters = 'K', className = '' }) {
  return (
    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-[11px] font-semibold tracking-wide text-bg ${className}`} aria-hidden>
      {letters}
    </span>
  );
}
