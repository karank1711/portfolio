import { DetailText } from '@/components/common/DetailText.jsx';
import { EmptyNote } from '@/components/common/StateMessage.jsx';
import { Reveal } from '@/components/common/Reveal.jsx';
import { Section } from '@/components/common/Container.jsx';
import { SectionHeading } from '@/components/common/SectionHeading.jsx';
import { employmentLabel, formatRange } from '@/utils/format.js';

export function Experience({ items = [] }) {
  return (
    <Section id="experience">
      <Reveal>
        <SectionHeading eyebrow="My experience" title="Experience" />
      </Reveal>
      {items.length === 0 ? <EmptyNote>Experience will appear here once it is added.</EmptyNote> : (
        <ol className="space-y-4">
          {items.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.04}>
              <li className="rounded-2xl border border-line bg-elevated p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full border border-accent bg-bg" aria-hidden />
                    <div>
                      <h3 className="font-serif text-2xl text-ink">{item.role}</h3>
                      <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                        {item.companyLogoUrl ? (
                          <img src={item.companyLogoUrl} alt="" className="h-5 w-5 object-contain" />
                        ) : null}
                        <span>
                          {item.company}
                          {employmentLabel(item.employmentType) ? ` · ${employmentLabel(item.employmentType)}` : ''}
                          {item.location ? ` · ${item.location}` : ''}
                        </span>
                      </p>
                    </div>
                  </div>
                  <p className="rounded-full border border-line px-3 py-1 text-xs text-muted">
                    {formatRange(item.startDate, item.endDate, item.isCurrent)}
                  </p>
                </div>
                {item.description ? <DetailText text={item.description} className="mt-4 pl-5" /> : null}
                {item.technologies?.length ? (
                  <ul className="mt-4 flex flex-wrap gap-2 pl-5">
                    {item.technologies.map((tech) => (
                      <li key={tech} className="rounded-full border border-line bg-bg px-2.5 py-1 text-xs text-muted">{tech}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            </Reveal>
          ))}
        </ol>
      )}
    </Section>
  );
}
