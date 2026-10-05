import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from '@/components/footer/Footer.jsx';
import { Navbar } from '@/components/navbar/Navbar.jsx';
import { usePortfolio } from '@/context/PortfolioContext.jsx';

export function PublicLayout() {
  const { data } = usePortfolio();
  const { pathname } = useLocation();
  const profile = data?.profile;
  const siteUrl = import.meta.env.VITE_SITE_URL || '';
  const title = profile?.fullName ? `${profile.fullName} · Portfolio` : 'Portfolio';
  const description = profile?.shortIntro || profile?.professionalTitle || 'Personal portfolio';
  const sameAs = (data?.socialLinks || []).map((link) => link.url).filter((url) => url?.startsWith('http'));
  const jsonLd = profile?.fullName ? {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.fullName,
    jobTitle: profile.professionalTitle,
    email: profile.email || undefined,
    address: profile.location || undefined,
    url: siteUrl || undefined,
    image: profile.profileImageUrl || undefined,
    sameAs,
  } : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-bg text-ink">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        {siteUrl ? <meta property="og:url" content={siteUrl} /> : null}
        {profile?.profileImageUrl ? <meta property="og:image" content={profile.profileImageUrl} /> : null}
        <meta name="twitter:card" content="summary_large_image" />
        {jsonLd ? <script type="application/ld+json">{JSON.stringify(jsonLd)}</script> : null}
      </Helmet>
      <button
        type="button"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-elevated focus:px-3 focus:py-2"
        onClick={() => document.getElementById('main')?.focus()}
      >
        Skip to content
      </button>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
