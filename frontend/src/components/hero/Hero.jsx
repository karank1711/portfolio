import { Button } from '@/components/common/Button.jsx';
import { Container } from '@/components/common/Container.jsx';
import { EmptyNote } from '@/components/common/StateMessage.jsx';
import { ProfileMedia } from '@/components/hero/ProfileMedia.jsx';
import { RoleRotator } from '@/components/hero/RoleRotator.jsx';
import { SocialIcon } from '@/components/common/SocialIcon.jsx';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion.js';
import { initials } from '@/utils/format.js';
import { resumeHref } from '@/utils/resume.js';
import { isExternal, socialHref } from '@/utils/social.js';

export function Hero({ profile, about, socialLinks = [], resume }) {
  const resumeUrl = resumeHref(resume);
  const reduce = usePrefersReducedMotion();
  if (!profile?.fullName && !profile?.shortIntro) {
    return (
      <section className="py-24">
        <Container>
          <EmptyNote>Profile details will appear here once they are added in the admin panel.</EmptyNote>
        </Container>
      </section>
    );
  }

  // Extract all titles entered in Professional Title (one per line)
  const professionalTitles = (profile.professionalTitle || '')
    .split('\n')
    .map((t) => t.trim())
    .filter(Boolean);

  // Use professionalTitles as the primary source, falling back to roles
  const roles = professionalTitles.length > 0
    ? professionalTitles
    : (profile.roles?.length ? profile.roles : []);

  const caption = about?.currentEducation || roles[0] || '';

  return (
    <section className="overflow-x-clip pb-2 sm:pb-3 md:pb-5 pt-6 sm:pt-12 md:pt-20">
      <Container>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3.5 sm:gap-8 md:gap-12 lg:gap-16">
          <div className={`min-w-0 ${reduce ? '' : 'hero-enter'}`}>
            <p className="text-xs sm:text-sm text-muted">Hi, I&apos;m</p>
            <h1 className="mt-1 sm:mt-2 max-w-3xl font-serif text-2xl min-[360px]:text-3xl min-[480px]:text-4xl sm:text-5xl lg:text-6xl leading-[1.08] sm:leading-[1.05] text-ink">
              {profile.fullName}
            </h1>
            <RoleRotator roles={roles} />
            {profile.shortIntro ? (
              <p className="mt-2.5 sm:mt-5 max-w-xl text-xs min-[360px]:text-sm sm:text-base leading-relaxed text-muted sm:text-lg">
                {profile.shortIntro}
              </p>
            ) : null}
            <div className="mt-4 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
              <Button href="/projects" size="hero">View Projects</Button>
              <Button href="/contact" variant="secondary" size="hero">Contact Me</Button>
              {resumeUrl ? (
                <Button href={resumeUrl} variant="secondary" target="_blank" rel="noreferrer" size="hero">
                  View Resume
                </Button>
              ) : null}
            </div>
            {socialLinks.length ? (
              <ul className="mt-3.5 sm:mt-8 flex flex-wrap gap-1.5 sm:gap-2">
                {socialLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={socialHref(link)}
                      aria-label={link.label || link.platform}
                      className="grid h-7 w-7 sm:h-9 sm:w-9 place-items-center rounded-full border border-line text-muted transition hover:border-ink hover:text-ink"
                      {...(isExternal(link) ? { target: '_blank', rel: 'noreferrer' } : {})}
                    >
                      <SocialIcon platform={link.platform} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <figure className="relative shrink-0 mt-5 min-[360px]:mt-7 sm:mt-10 md:mt-14 lg:mt-16 w-[105px] min-[360px]:w-[118px] min-[400px]:w-[138px] min-[480px]:w-[165px] sm:w-[220px] md:w-[280px] lg:w-[330px] xl:w-[340px]">
            <span className="pointer-events-none absolute -right-1 top-4 sm:top-8 h-12 w-12 sm:h-20 sm:w-20 rounded-full bg-soft hidden sm:block" aria-hidden />
            <div className="relative rounded-[1.2rem] sm:rounded-[1.6rem] border border-line bg-elevated p-1.5 sm:p-2 shadow-lift">
              {profile.profileMediaUrl || profile.profileImageUrl ? (
                <ProfileMedia
                  mediaType={profile.profileMediaType || 'image'}
                  mediaUrl={profile.profileMediaType === 'video' ? profile.profileMediaUrl : (profile.profileImageUrl || profile.profileMediaUrl)}
                  imageUrl={profile.profileImageUrl}
                  alt={profile.fullName}
                />
              ) : (
                <div className="relative flex aspect-square items-center justify-center rounded-[0.9rem] sm:rounded-[1.2rem] bg-surface">
                  <span className="font-serif text-2xl sm:text-5xl text-ink">{initials(profile.fullName)}</span>
                </div>
              )}
            </div>
            {caption ? (
              <figcaption className="mt-2 sm:mt-3 text-center text-[10px] sm:text-xs text-muted leading-tight">
                {caption}
              </figcaption>
            ) : null}
          </figure>
        </div>
      </Container>
    </section>
  );
}
