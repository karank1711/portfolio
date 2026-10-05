export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-surface motion-reduce:animate-none ${className}`} />;
}

export function EmptyNote({ children }) {
  return <p className="rounded-2xl border border-dashed border-line px-5 py-8 text-sm leading-relaxed text-muted">{children}</p>;
}

export function StateMessage({ title, body, action }) {
  return (
    <div className="mx-auto max-w-lg border border-line bg-elevated px-6 py-12 text-center">
      <h1 className="font-serif text-3xl text-ink">{title}</h1>
      {body ? <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
