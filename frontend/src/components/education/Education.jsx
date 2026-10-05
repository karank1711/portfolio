import { GraduationCap } from 'lucide-react';
import { DetailText } from '@/components/common/DetailText.jsx';
import { EmptyNote } from '@/components/common/StateMessage.jsx';
import { Reveal } from '@/components/common/Reveal.jsx';
import { Section } from '@/components/common/Container.jsx';
import { SectionHeading } from '@/components/common/SectionHeading.jsx';
import { formatYearRange } from '@/utils/format.js';

export function Education({ items = [] }) {
  return (
    <Section id="education">
      <Reveal>
        <SectionHeading eyebrow="Education" title="Education" />
      </Reveal>
      {items.length === 0 ? <EmptyNote>Education will appear here once it is added.</EmptyNote> : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.04}>
              <article className="rounded-2xl border border-line bg-elevated p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-soft text-accent">
                      {item.logoUrl ? (
                        <img src={item.logoUrl} alt="" className="h-5 w-5 object-contain" />
                      ) : (
                        <GraduationCap size={18} aria-hidden />
                      )}
                    </span>
                    <div>
                      <h3 className="font-serif text-2xl leading-snug text-ink">
                        {item.degree}{item.specialization ? ` (${item.specialization})` : ''}
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        {item.institution}
                        {item.grade ? ` · ${item.grade}` : ''}
                      </p>
                    </div>
                  </div>
                  {formatYearRange(item.startYear, item.endYear) ? (
                    <p className="rounded-full border border-line px-3 py-1 text-xs text-muted">
                      {formatYearRange(item.startYear, item.endYear)}
                    </p>
                  ) : null}
                </div>
                {item.description ? <DetailText text={item.description} className="mt-4 sm:pl-[3.25rem]" /> : null}
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}
