import { Award } from 'lucide-react';
import { DetailText } from '@/components/common/DetailText.jsx';
import { EmptyNote } from '@/components/common/StateMessage.jsx';
import { Reveal } from '@/components/common/Reveal.jsx';
import { Section } from '@/components/common/Container.jsx';
import { SectionHeading } from '@/components/common/SectionHeading.jsx';
import { TextLink } from '@/components/common/TextLink.jsx';
import { achievementType, formatMonth, isPdf } from '@/utils/format.js';

export function Achievements({ items = [] }) {
  return (
    <Section id="achievements">
      <Reveal>
        <SectionHeading eyebrow="Achievements" title="Achievements" />
      </Reveal>
      {items.length === 0 ? <EmptyNote>Achievements and certificates will appear here once they are added.</EmptyNote> : (
        <div className="space-y-4">
          {items.map((item, index) => {
            const showImage = item.certificateUrl && !isPdf(item.certificateUrl);
            return (
              <Reveal key={item.id} delay={index * 0.03}>
                <article className="rounded-2xl border border-line bg-elevated p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-soft text-accent">
                        <Award size={16} aria-hidden />
                      </span>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-faint">{achievementType(item.type)}</p>
                        <h3 className="mt-1 font-serif text-2xl leading-snug text-ink">{item.title}</h3>
                        {item.organization ? <p className="mt-1 text-sm text-muted">{item.organization}</p> : null}
                      </div>
                    </div>
                    {item.achievedOn ? (
                      <p className="rounded-full border border-line px-3 py-1 text-xs text-muted">{formatMonth(item.achievedOn)}</p>
                    ) : null}
                  </div>
                  {item.description ? <DetailText text={item.description} className="mt-4 sm:pl-[3.25rem]" /> : null}
                  {showImage || item.certificateUrl || item.verificationUrl ? (
                    <div className="mt-4 flex flex-wrap items-center gap-4 sm:pl-[3.25rem]">
                      {showImage ? (
                        <img src={item.certificateUrl} alt={`${item.title} certificate`} loading="lazy" className="max-h-28 rounded-xl border border-line bg-surface object-contain" />
                      ) : null}
                      {item.certificateUrl ? <TextLink href={item.certificateUrl} external>{isPdf(item.certificateUrl) ? 'Certificate' : 'View image'}</TextLink> : null}
                      {item.verificationUrl ? <TextLink href={item.verificationUrl} external>Verify</TextLink> : null}
                    </div>
                  ) : null}
                </article>
              </Reveal>
            );
          })}
        </div>
      )}
    </Section>
  );
}
