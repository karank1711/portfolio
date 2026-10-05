import { Link } from 'react-router-dom';

export function Button({ href, variant = 'primary', className = '', children, ...props }) {
  const variants = {
    primary: 'bg-accent text-accent-ink hover:opacity-90',
    secondary: 'border border-line bg-elevated text-ink hover:border-ink',
  };
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`;
  if (typeof href === 'string' && href.startsWith('/')) {
    return <Link to={href} className={classes} {...props}>{children}</Link>;
  }
  if (href) {
    return <a href={href} className={classes} {...props}>{children}</a>;
  }
  return <button type="button" className={classes} {...props}>{children}</button>;
}
