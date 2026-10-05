import { textLines } from '@/utils/format.js';

export function DetailText({ text, className = '' }) {
  const lines = textLines(text);
  if (!lines.length) return null;
  if (lines.length === 1) {
    return <p className={`text-sm leading-relaxed text-muted ${className}`}>{lines[0]}</p>;
  }
  return (
    <ul className={`space-y-2 text-sm leading-relaxed text-muted ${className}`}>
      {lines.map((line) => (
        <li key={line} className="flex gap-2.5">
          <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-faint" aria-hidden />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}
