import { inputClass } from '@/utils/options.js';

export function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-ink">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-faint">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs text-accent">{error}</span> : null}
    </label>
  );
}

export function TextInput(props) {
  return <input className={inputClass} {...props} />;
}

export function TextArea(props) {
  return <textarea className={`${inputClass} min-h-28 resize-y`} {...props} />;
}

export function SelectInput({ children, ...props }) {
  return <select className={inputClass} {...props}>{children}</select>;
}

export function TagInput({ value = [], onChange, placeholder = 'Type and press Enter' }) {
  function commit(raw) {
    const next = raw.split(',').map((item) => item.trim()).filter(Boolean);
    if (!next.length) return;
    const merged = [...value];
    next.forEach((item) => {
      if (!merged.includes(item)) merged.push(item);
    });
    onChange(merged);
  }

  return (
    <div className={`${inputClass} flex min-h-11 flex-wrap items-center gap-2`}>
      {value.map((tag) => (
        <button
          type="button"
          key={tag}
          className="bg-surface px-2 py-0.5 text-xs text-ink"
          onClick={() => onChange(value.filter((item) => item !== tag))}
        >
          {tag} ×
        </button>
      ))}
      <input
        className="min-w-[8rem] flex-1 bg-transparent outline-none"
        placeholder={placeholder}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            commit(event.currentTarget.value);
            event.currentTarget.value = '';
          }
          if (event.key === 'Backspace' && !event.currentTarget.value) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={(event) => {
          if (!event.currentTarget.value) return;
          commit(event.currentTarget.value);
          event.currentTarget.value = '';
        }}
      />
    </div>
  );
}
