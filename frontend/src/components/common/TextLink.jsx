import { ArrowUpRight } from 'lucide-react';

export function TextLink({ href, children, external = false, className = '' }) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-1 text-sm text-ink underline-offset-4 transition hover:underline ${className}`}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {children}
      {external ? <ArrowUpRight size={14} aria-hidden /> : null}
    </a>
  );
}
