import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Mark } from '@/components/common/Mark.jsx';
import { ThemeToggle } from '@/components/common/ThemeToggle.jsx';
import { usePortfolio } from '@/context/PortfolioContext.jsx';
import { useScrolled } from '@/hooks/useScrollSpy.js';
import { initials } from '@/utils/format.js';
import { NAV_ITEMS } from '@/utils/navigation.js';

const linkClass = ({ isActive }) => `relative whitespace-nowrap text-[13px] transition after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:bg-accent after:transition-transform ${isActive ? 'text-ink after:scale-x-100' : 'text-muted after:scale-x-0 hover:text-ink hover:after:scale-x-100'}`;

export function Navbar() {
  const { data } = usePortfolio();
  const location = useLocation();
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const name = data?.profile?.fullName || 'Portfolio';

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className={`sticky top-0 z-40 border-b transition ${scrolled || open ? 'border-line bg-bg/90 backdrop-blur-md' : 'border-transparent bg-bg/75 backdrop-blur-md'}`}>
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-5 sm:px-8">
        <NavLink to="/" end className="flex min-w-0 items-center gap-2.5 text-ink">
          <Mark letters={initials(name)} />
          <span className="truncate font-serif text-lg leading-none">{name}</span>
        </NavLink>

        <nav className="hidden items-center gap-3.5 lg:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="rounded-full" />
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line lg:hidden"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-line bg-bg px-5 py-3 lg:hidden" aria-label="Mobile">
          <div className="mx-auto flex max-w-page flex-col">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `border-b border-line py-3 text-base last:border-b-0 ${isActive ? 'text-ink' : 'text-muted'}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
