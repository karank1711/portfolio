import { NavLink } from 'react-router-dom';
import { Container } from '@/components/common/Container.jsx';
import { Mark } from '@/components/common/Mark.jsx';
import { usePortfolio } from '@/context/PortfolioContext.jsx';
import { initials } from '@/utils/format.js';
import { NAV_ITEMS } from '@/utils/navigation.js';
import { isExternal, socialHref } from '@/utils/social.js';

const headingClass = 'text-[11px] font-medium uppercase tracking-[0.18em] text-faint';
const linkClass = 'text-sm text-muted transition hover:text-ink';

export function Footer() {
  const { data } = usePortfolio();
  const profile = data?.profile;
  const name = profile?.fullName || 'Portfolio';
  const year = new Date().getFullYear();
  const roles = (profile?.roles || []).filter(Boolean);
  const tagline = roles.length ? roles.join(' | ') : profile?.professionalTitle || '';
  const socialOrder = ['github', 'linkedin'];
  const socials = (data?.socialLinks || [])
    .filter((link) => link.platform !== 'email' && socialHref(link))
    .slice()
    .sort((a, b) => {
      const rank = (platform) => {
        const index = socialOrder.indexOf(platform);
        return index === -1 ? socialOrder.length : index;
      };
      return rank(a.platform) - rank(b.platform);
    });
  const quickLinks = [
    data?.resume?.fileUrl
      ? { id: 'resume', label: 'Resume', href: data.resume.fileUrl, external: true }
      : null,
    ...socials.map((link) => ({
      id: link.id,
      label: link.label || `${link.platform || 'Link'}`.replace(/^./, (letter) => letter.toUpperCase()),
      href: socialHref(link),
      external: isExternal(link),
    })),
  ].filter(Boolean);

  return (
    <footer className="border-t border-line">
      <Container className="py-14 md:py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-12 md:gap-y-14 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-x-12 lg:gap-y-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <Mark letters={initials(name)} />
              <p className="font-serif text-xl text-ink">{name}</p>
            </div>
            {tagline ? <p className="mt-4 text-sm text-ink">{tagline}</p> : null}
            {profile?.shortIntro ? (
              <p className="mt-2 text-sm leading-relaxed text-muted">{profile.shortIntro}</p>
            ) : null}
          </div>

          <nav aria-label="Footer" className="min-w-0">
            <p className={headingClass}>Navigate</p>
            <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2.5 min-[400px]:grid-cols-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => `text-sm transition hover:text-ink ${isActive ? 'text-ink' : 'text-muted'}`}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {quickLinks.length ? (
            <div className="min-w-0">
              <p className={headingClass}>Quick links</p>
              <ul className="mt-4 space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      className={`group inline-flex items-center gap-1.5 ${linkClass}`}
                      {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    >
                      {link.label}
                      <span aria-hidden className="text-faint transition group-hover:text-ink">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="min-w-0">
            <p className={headingClass}>Contact</p>
            <div className="mt-4 space-y-2.5 text-sm">
              {profile?.email ? (
                <a href={`mailto:${profile.email}`} className={`block break-words ${linkClass}`}>
                  {profile.email}
                </a>
              ) : null}
              {profile?.phone ? (
                <a href={`tel:${profile.phone}`} className={`block ${linkClass}`}>
                  {profile.phone}
                </a>
              ) : null}
              {profile?.location ? <p className="text-muted">{profile.location}</p> : null}
            </div>
          </div>
        </div>
      </Container>
      <div className="border-t border-line">
        <Container className="py-5 text-xs text-faint">
          © {year} {name}. All rights reserved.
        </Container>
      </div>
    </footer>
  );
}
