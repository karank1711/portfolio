import { Download, GraduationCap, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/common/Button.jsx';
import { EmptyNote } from '@/components/common/StateMessage.jsx';
import { Reveal } from '@/components/common/Reveal.jsx';
import { Section } from '@/components/common/Container.jsx';
import { SectionHeading } from '@/components/common/SectionHeading.jsx';

export function About({ about, profile, resume }) {
  const highlights = about?.highlights || [];
  const hasContent = about && (about.summary || about.personalIntro || about.currentEducation || highlights.length);
  const facts = [
    profile?.location ? { icon: MapPin, label: 'Location', value: profile.location } : null,
    about?.currentEducation ? { icon: GraduationCap, label: 'Degree', value: about.currentEducation } : null,
    profile?.email ? { icon: Mail, label: 'Email', value: profile.email, href: `mailto:${profile.email}` } : null,
    profile?.phone ? { icon: Phone, label: 'Phone', value: profile.phone, href: `tel:${profile.phone}` } : null,
    ...highlights.map((item) => ({ label: item.label, value: item.value })),
  ].filter((item) => item?.value);

  return (
    <Section id="about">
      {!hasContent && facts.length === 0 ? (
        <>
          <SectionHeading eyebrow="About me" title="About" />
          <EmptyNote>An introduction will appear here once it is saved in the admin panel.</EmptyNote>
        </>
      ) : (
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.75fr)] lg:items-center lg:gap-14">
          <Reveal>
            <SectionHeading eyebrow="About me" title="About" />
            <div className="-mt-4 max-w-2xl space-y-5 text-base leading-relaxed text-muted">
              {about?.summary ? <p className="font-serif text-2xl leading-snug text-ink">{about.summary}</p> : null}
              {about?.personalIntro ? <p className="whitespace-pre-wrap">{about.personalIntro}</p> : null}
            </div>
            {resume?.fileUrl ? (
              <div className="mt-8">
                <Button href={resume.fileUrl} variant="secondary" target="_blank" rel="noreferrer">
                  <Download size={15} aria-hidden />
                  Download Resume
                </Button>
              </div>
            ) : null}
          </Reveal>
          {facts.length ? (
            <Reveal delay={0.08}>
              <aside className="rounded-2xl border border-line bg-elevated p-5 sm:p-6">
                <dl className="space-y-5">
                  {facts.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={`${item.label}-${item.value}`} className="flex gap-3">
                        {Icon ? (
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-soft text-accent">
                            <Icon size={16} aria-hidden />
                          </span>
                        ) : null}
                        <div className="min-w-0">
                          <dt className="text-[11px] uppercase tracking-[0.16em] text-faint">{item.label}</dt>
                          <dd className="mt-1 text-sm leading-relaxed text-ink">
                            {item.href ? <a href={item.href} className="hover:underline">{item.value}</a> : item.value}
                          </dd>
                        </div>
                      </div>
                    );
                  })}
                </dl>
              </aside>
            </Reveal>
          ) : null}
        </div>
      )}
    </Section>
  );
}
