import { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar.jsx';
import { Topbar } from '@/components/Topbar.jsx';
import { useAuth } from '@/context/AuthContext.jsx';

const TITLES = {
  '/': 'Dashboard',
  '/profile': 'Profile',
  '/about': 'About',
  '/skills': 'Skills',
  '/experience': 'Experience',
  '/education': 'Education',
  '/projects': 'Projects',
  '/projects/new': 'New project',
  '/achievements': 'Achievements',
  '/resume': 'Resume',
  '/social': 'Social links',
  '/messages': 'Messages',
  '/settings': 'Settings',
};

export function AdminLayout() {
  const { status } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('admin.sidebar') === 'collapsed');

  if (status === 'loading') {
    return <div className="grid min-h-screen place-items-center text-sm text-muted">Loading admin…</div>;
  }
  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const title = TITLES[location.pathname] || (location.pathname.includes('/projects/') ? 'Edit project' : 'Admin');

  function toggleCollapse() {
    setCollapsed((value) => {
      localStorage.setItem('admin.sidebar', value ? 'open' : 'collapsed');
      return !value;
    });
  }

  return (
    <div className="min-h-screen bg-bg lg:flex">
      <Sidebar open={open} collapsed={collapsed} onNavigate={() => setOpen(false)} />
      <div className="min-w-0 flex-1">
        <Topbar title={title} onMenu={() => setOpen(true)} onCollapse={toggleCollapse} />
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
