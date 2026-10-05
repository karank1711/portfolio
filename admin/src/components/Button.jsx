const variants = {
  primary: 'bg-accent text-accent-ink hover:opacity-90',
  secondary: 'border border-line bg-elevated text-ink hover:border-ink',
  danger: 'border border-accent/40 text-accent hover:bg-soft',
  ghost: 'text-muted hover:text-ink',
};

export function Button({ variant = 'primary', className = '', type = 'button', children, ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
