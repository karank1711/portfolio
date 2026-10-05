import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export function Modal({ open, title, onClose, children, footer, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close dialog" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title} className={`relative max-h-[92vh] w-full overflow-auto border border-line bg-elevated p-5 ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-serif text-2xl text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="text-sm text-muted hover:text-ink">Close</button>
        </div>
        {children}
        {footer ? <div className="mt-5 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl text-ink">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="border border-dashed border-line px-5 py-12 text-center">
      <h2 className="font-serif text-2xl text-ink">{title}</h2>
      {body ? <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingBlock() {
  return <div className="h-40 animate-pulse border border-line bg-surface motion-reduce:animate-none" />;
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="border border-line px-5 py-10 text-center">
      <p className="text-sm text-ink">{message}</p>
      {onRetry ? <button type="button" onClick={onRetry} className="mt-3 text-sm text-accent">Try again</button> : null}
    </div>
  );
}
