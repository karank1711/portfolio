import { Menu, PanelLeft } from 'lucide-react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext.jsx';
import { siteUrl } from '@/services/api.js';

export function Topbar({ title, onMenu, onCollapse }) {
  const { theme, toggle } = useTheme();
  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-line bg-bg px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <button type="button" className="inline-flex h-9 w-9 items-center justify-center border border-line lg:hidden" aria-label="Open menu" onClick={onMenu}>
          <Menu size={16} />
        </button>
        <button type="button" className="hidden h-9 w-9 items-center justify-center border border-line lg:inline-flex" aria-label="Collapse sidebar" onClick={onCollapse}>
          <PanelLeft size={16} />
        </button>
        <h1 className="font-serif text-xl text-ink">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <a href={siteUrl('/')} target="_blank" rel="noreferrer" className="hidden text-sm text-muted hover:text-ink sm:inline">View site</a>
        <button type="button" onClick={toggle} aria-label="Toggle theme" className="inline-flex h-9 w-9 items-center justify-center border border-line">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
