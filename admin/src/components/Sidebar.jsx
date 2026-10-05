import {
  Award,
  Briefcase,
  FileDown,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Share2,
  UserRound,
  Layers3,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  {
    label: 'Portfolio',
    children: [
      { to: '/profile', label: 'Profile', icon: UserRound },
      { to: '/about', label: 'About', icon: FileText },
      { to: '/skills', label: 'Skills', icon: Layers3 },
      { to: '/experience', label: 'Experience', icon: Briefcase },
      { to: '/education', label: 'Education', icon: GraduationCap },
      { to: '/projects', label: 'Projects', icon: FolderKanban },
      { to: '/achievements', label: 'Achievements', icon: Award },
      { to: '/resume', label: 'Resume', icon: FileDown },
      { to: '/social', label: 'Social Links', icon: Share2 },
    ],
  },
  { to: '/messages', label: 'Messages', icon: Mail },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ open, collapsed, onNavigate }) {
  const { logout } = useAuth();
  return (
    <>
      <button type="button" className={`fixed inset-0 z-30 bg-ink/40 lg:hidden ${open ? '' : 'hidden'}`} aria-label="Close menu" onClick={onNavigate} />
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-elevated transition-transform lg:static ${collapsed ? 'lg:w-[4.75rem]' : 'lg:w-64'} ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex h-16 items-center border-b border-line px-4">
          <span className="font-serif text-xl text-ink">{collapsed ? 'P' : 'Portfolio'}</span>
        </div>
        <nav className="flex-1 overflow-auto px-3 py-4" aria-label="Admin">
          {NAV.map((item) => (
            item.children ? (
              <div key={item.label} className="mb-4">
                <p className={`px-2 pb-2 text-[11px] uppercase tracking-[0.16em] text-faint ${collapsed ? 'lg:sr-only' : ''}`}>{item.label}</p>
                <div className="grid gap-1">
                  {item.children.map((child) => <SideLink key={child.to} item={child} collapsed={collapsed} onNavigate={onNavigate} />)}
                </div>
              </div>
            ) : (
              <div key={item.to} className="mb-1">
                <SideLink item={item} collapsed={collapsed} onNavigate={onNavigate} />
              </div>
            )
          ))}
        </nav>
        <button type="button" onClick={logout} className="m-3 flex items-center gap-3 border border-line px-3 py-2 text-sm text-muted hover:text-ink">
          <LogOut size={16} />
          <span className={collapsed ? 'lg:sr-only' : ''}>Logout</span>
        </button>
      </aside>
    </>
  );
}

function SideLink({ item, collapsed, onNavigate }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={item.label}
      onClick={onNavigate}
      className={({ isActive }) => `relative flex items-center gap-3 px-2 py-2 text-sm ${isActive ? 'bg-surface text-ink before:absolute before:bottom-2 before:left-0 before:top-2 before:w-0.5 before:bg-accent' : 'text-muted hover:text-ink'}`}
    >
      <Icon size={16} />
      <span className={collapsed ? 'lg:sr-only' : ''}>{item.label}</span>
    </NavLink>
  );
}
