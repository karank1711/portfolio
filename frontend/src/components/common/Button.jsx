import { Link } from 'react-router-dom';

export function Button({ href, variant = 'primary', size = 'default', className = '', children, ...props }) {
  const variants = {
    primary: 'bg-accent text-accent-ink hover:opacity-90',
    secondary: 'border border-line bg-elevated text-ink hover:border-ink',
  };
  const sizes = {
    default: 'px-5 py-2.5 text-sm',
    hero: 'px-3 py-1.5 text-xs sm:px-5 sm:py-2.5 sm:text-sm',
  };
  const sizeClass = sizes[size] || sizes.default;
  const classes = `inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${variants[variant]} ${className}`;
  if (typeof href === 'string' && href.startsWith('/')) {
    return <Link to={href} className={classes} {...props}>{children}</Link>;
  }
  if (href) {
    return <a href={href} className={classes} {...props}>{children}</a>;
  }
  return <button type="button" className={classes} {...props}>{children}</button>;
}
