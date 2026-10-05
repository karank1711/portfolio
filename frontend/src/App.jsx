import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout.jsx';
import { HomePage } from '@/pages/HomePage.jsx';
import { SectionPage } from '@/pages/SectionPage.jsx';
import { Skeleton } from '@/components/common/StateMessage.jsx';
import { NAV_ITEMS } from '@/utils/navigation.js';

const ProjectPage = lazy(() => import('@/pages/ProjectPage.jsx'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage.jsx'));

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        {NAV_ITEMS.filter((item) => item.path !== '/').map((item) => (
          <Route key={item.path} path={item.path} element={<SectionPage name={item.id} />} />
        ))}
        <Route
          path="/projects/:slug"
          element={(
            <Suspense fallback={<div className="mx-auto max-w-page px-5 py-28"><Skeleton className="h-80" /></div>}>
              <ProjectPage />
            </Suspense>
          )}
        />
        <Route
          path="*"
          element={(
            <Suspense fallback={null}>
              <NotFoundPage />
            </Suspense>
          )}
        />
      </Route>
    </Routes>
  );
}
