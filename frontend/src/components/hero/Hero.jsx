import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/common/Button.jsx';
import { Container } from '@/components/common/Container.jsx';
import { EmptyNote } from '@/components/common/StateMessage.jsx';
import { SketchPortrait } from '@/components/hero/SketchPortrait.jsx';
import { RoleRotator } from '@/components/hero/RoleRotator.jsx';
import { SocialIcon } from '@/components/common/SocialIcon.jsx';
import { initials } from '@/utils/format.js';
import { isExternal, socialHref } from '@/utils/social.js';

export function Hero({ profile, about, socialLinks = [], resume }) {
  const reduce = useReducedMotion();
  if (!profile?.fullName && !profile?.shortIntro) {
    return (
      <section className="py-24">
        <Container>
          <EmptyNote>Profile details will appear here once they are added in the admin panel.</EmptyNote>
        </Container>
      </section>
    );
  }

  const roles = profile.roles?.length ? profile.roles : [profile.professionalTitle].filter(Boolean);
  const caption = about?.currentEducation || profile.professionalTitle || '';
  const motionProps = reduce ? {} : {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <section className="pb-8 pt-12 md:pb-14 md:pt-20">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,340px)] lg:gap-16">
          <motion.div {...motionProps}>
            <p className="text-sm text-muted">Hi, I&apos;m</p>
            <h1 className="mt-2 max-w-3xl font-serif text-5xl leading-[1.05] text-ink sm:text-6xl">
              {profile.fullName}
            </h1>
            <RoleRotator roles={roles} />
            {profile.shortIntro ? (
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">{profile.shortIntro}</p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/projects">View Projects</Button>
              <Button href="/contact" variant="secondary">Contact Me</Button>
              {resume?.fileUrl ? (
                <Button href={resume.fileUrl} variant="secondary" target="_blank" rel="noreferrer">
                  Download Resume
                </Button>
              ) : null}
            </div>
            {socialLinks.length ? (
              <ul className="mt-8 flex flex-wrap gap-2">
                {socialLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={socialHref(link)}
                      aria-label={link.label || link.platform}
                      className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition hover:border-ink hover:text-ink"
                      {...(isExternal(link) ? { target: '_blank', rel: 'noreferrer' } : {})}
                    >
                      <SocialIcon platform={link.platform} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </motion.div>

          <figure className="relative mx-auto w-full max-w-[280px] md:max-w-[320px] lg:max-w-[340px]">
            <span className="pointer-events-none absolute -right-1 top-8 h-20 w-20 rounded-full bg-soft" aria-hidden />
            <div className="relative rounded-[1.6rem] border border-line bg-elevated p-2 shadow-lift">
              {profile.profileImageUrl ? (
                <SketchPortrait src={profile.profileImageUrl} alt={profile.fullName} />
              ) : (
                <div className="relative flex aspect-square items-center justify-center rounded-[1.2rem] bg-surface">
                  <span className="font-serif text-5xl text-ink">{initials(profile.fullName)}</span>
                </div>
              )}
            </div>
            {caption ? (
              <figcaption className="mt-3 text-center text-xs text-muted">{caption}</figcaption>
            ) : null}
          </figure>
        </div>
      </Container>
    </section>
  );
}
