import { lazy, Suspense } from 'react';
import { Hero } from '@/components/hero/Hero.jsx';
import { PortfolioGate } from '@/pages/PortfolioGate.jsx';

const HomeBelowFold = lazy(() => import('@/pages/HomeBelowFold.jsx'));

function BelowFoldFallback() {
  return <div className="mx-auto max-w-page px-5 py-16" aria-hidden />;
}

export function HomePage() {
  return (
    <PortfolioGate>
      {(data) => (
        <>
          <Hero profile={data.profile} about={data.about} socialLinks={data.socialLinks || []} resume={data.resume} />
          <Suspense fallback={<BelowFoldFallback />}>
            <HomeBelowFold data={data} />
          </Suspense>
        </>
      )}
    </PortfolioGate>
  );
}
