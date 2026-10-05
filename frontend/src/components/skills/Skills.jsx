import {
  BarChart3,
  Brain,
  ChevronRight,
  Cloud,
  Code2,
  Database,
  Layers,
  LineChart,
  Server,
  ShieldCheck,
  Terminal,
  Wrench,
} from 'lucide-react';
import { EmptyNote } from '@/components/common/StateMessage.jsx';
import { Reveal } from '@/components/common/Reveal.jsx';
import { Section } from '@/components/common/Container.jsx';
import { SectionHeading } from '@/components/common/SectionHeading.jsx';

const THEMES = [
  {
    match: ['frontend', 'front-end'],
    icon: Code2,
    card: 'border-sky-200/90 bg-sky-50/80 [[data-theme=dark]_&]:border-sky-400/20 [[data-theme=dark]_&]:bg-sky-400/[0.07]',
    badge: 'bg-sky-100 text-sky-700 [[data-theme=dark]_&]:bg-sky-400/15 [[data-theme=dark]_&]:text-sky-300',
    chip: 'border-sky-200/80 bg-white/80 text-sky-950 [[data-theme=dark]_&]:border-sky-400/20 [[data-theme=dark]_&]:bg-white/[0.04] [[data-theme=dark]_&]:text-sky-100',
  },
  {
    match: ['backend', 'back-end'],
    icon: Server,
    card: 'border-emerald-200/90 bg-emerald-50/80 [[data-theme=dark]_&]:border-emerald-400/20 [[data-theme=dark]_&]:bg-emerald-400/[0.07]',
    badge: 'bg-emerald-100 text-emerald-700 [[data-theme=dark]_&]:bg-emerald-400/15 [[data-theme=dark]_&]:text-emerald-300',
    chip: 'border-emerald-200/80 bg-white/80 text-emerald-950 [[data-theme=dark]_&]:border-emerald-400/20 [[data-theme=dark]_&]:bg-white/[0.04] [[data-theme=dark]_&]:text-emerald-100',
  },
  {
    match: ['database', 'databases'],
    icon: Database,
    card: 'border-violet-200/90 bg-violet-50/80 [[data-theme=dark]_&]:border-violet-400/20 [[data-theme=dark]_&]:bg-violet-400/[0.07]',
    badge: 'bg-violet-100 text-violet-700 [[data-theme=dark]_&]:bg-violet-400/15 [[data-theme=dark]_&]:text-violet-300',
    chip: 'border-violet-200/80 bg-white/80 text-violet-950 [[data-theme=dark]_&]:border-violet-400/20 [[data-theme=dark]_&]:bg-white/[0.04] [[data-theme=dark]_&]:text-violet-100',
  },
  {
    match: ['programming', 'language'],
    icon: Terminal,
    card: 'border-orange-200/90 bg-orange-50/70 [[data-theme=dark]_&]:border-orange-400/20 [[data-theme=dark]_&]:bg-orange-400/[0.07]',
    badge: 'bg-orange-100 text-orange-700 [[data-theme=dark]_&]:bg-orange-400/15 [[data-theme=dark]_&]:text-orange-300',
    chip: 'border-orange-200/80 bg-white/80 text-orange-950 [[data-theme=dark]_&]:border-orange-400/20 [[data-theme=dark]_&]:bg-white/[0.04] [[data-theme=dark]_&]:text-orange-100',
  },
  {
    match: ['ai', 'machine learning', 'ml'],
    icon: Brain,
    card: 'border-pink-200/90 bg-pink-50/80 [[data-theme=dark]_&]:border-pink-400/20 [[data-theme=dark]_&]:bg-pink-400/[0.07]',
    badge: 'bg-pink-100 text-pink-700 [[data-theme=dark]_&]:bg-pink-400/15 [[data-theme=dark]_&]:text-pink-300',
    chip: 'border-pink-200/80 bg-white/80 text-pink-950 [[data-theme=dark]_&]:border-pink-400/20 [[data-theme=dark]_&]:bg-white/[0.04] [[data-theme=dark]_&]:text-pink-100',
  },
  {
    match: ['visual', 'chart', 'bi'],
    icon: BarChart3,
    card: 'border-blue-200/90 bg-blue-50/80 [[data-theme=dark]_&]:border-blue-400/20 [[data-theme=dark]_&]:bg-blue-400/[0.07]',
    badge: 'bg-blue-100 text-blue-700 [[data-theme=dark]_&]:bg-blue-400/15 [[data-theme=dark]_&]:text-blue-300',
    chip: 'border-blue-200/80 bg-white/80 text-blue-950 [[data-theme=dark]_&]:border-blue-400/20 [[data-theme=dark]_&]:bg-white/[0.04] [[data-theme=dark]_&]:text-blue-100',
  },
  {
    match: ['analytic', 'data'],
    icon: LineChart,
    card: 'border-teal-200/90 bg-teal-50/80 [[data-theme=dark]_&]:border-teal-400/20 [[data-theme=dark]_&]:bg-teal-400/[0.07]',
    badge: 'bg-teal-100 text-teal-700 [[data-theme=dark]_&]:bg-teal-400/15 [[data-theme=dark]_&]:text-teal-300',
    chip: 'border-teal-200/80 bg-white/80 text-teal-950 [[data-theme=dark]_&]:border-teal-400/20 [[data-theme=dark]_&]:bg-white/[0.04] [[data-theme=dark]_&]:text-teal-100',
  },
  {
    match: ['tool'],
    icon: Wrench,
    card: 'border-slate-200/90 bg-slate-50/80 [[data-theme=dark]_&]:border-slate-400/20 [[data-theme=dark]_&]:bg-slate-400/[0.07]',
    badge: 'bg-slate-100 text-slate-700 [[data-theme=dark]_&]:bg-slate-400/15 [[data-theme=dark]_&]:text-slate-300',
    chip: 'border-slate-200/80 bg-white/80 text-slate-950 [[data-theme=dark]_&]:border-slate-400/20 [[data-theme=dark]_&]:bg-white/[0.04] [[data-theme=dark]_&]:text-slate-100',
  },
  {
    match: ['auth', 'security'],
    icon: ShieldCheck,
    card: 'border-amber-200/90 bg-amber-50/70 [[data-theme=dark]_&]:border-amber-400/20 [[data-theme=dark]_&]:bg-amber-400/[0.07]',
    badge: 'bg-amber-100 text-amber-700 [[data-theme=dark]_&]:bg-amber-400/15 [[data-theme=dark]_&]:text-amber-300',
    chip: 'border-amber-200/80 bg-white/80 text-amber-950 [[data-theme=dark]_&]:border-amber-400/20 [[data-theme=dark]_&]:bg-white/[0.04] [[data-theme=dark]_&]:text-amber-100',
  },
  {
    match: ['deploy', 'cloud'],
    icon: Cloud,
    card: 'border-cyan-200/90 bg-cyan-50/80 [[data-theme=dark]_&]:border-cyan-400/20 [[data-theme=dark]_&]:bg-cyan-400/[0.07]',
    badge: 'bg-cyan-100 text-cyan-700 [[data-theme=dark]_&]:bg-cyan-400/15 [[data-theme=dark]_&]:text-cyan-300',
    chip: 'border-cyan-200/80 bg-white/80 text-cyan-950 [[data-theme=dark]_&]:border-cyan-400/20 [[data-theme=dark]_&]:bg-white/[0.04] [[data-theme=dark]_&]:text-cyan-100',
  },
];

const FALLBACK = [
  THEMES[0],
  THEMES[1],
  THEMES[2],
  THEMES[3],
];

function themeFor(category, index) {
  const key = category.toLowerCase();
  return THEMES.find((theme) => theme.match.some((word) => key.includes(word))) || FALLBACK[index % FALLBACK.length];
}

export function Skills({ skills = [] }) {
  const groups = new Map();
  skills.forEach((skill) => {
    const list = groups.get(skill.category) || [];
    list.push(skill);
    groups.set(skill.category, list);
  });
  const categories = [...groups.entries()];

  return (
    <Section id="skills">
      <Reveal>
        <SectionHeading
          eyebrow="My skills"
          title="Technologies & Tools"
          intro="A blend of frontend, backend, AI/ML and other modern technologies that I use to build scalable and user-friendly solutions."
        />
      </Reveal>

      {categories.length === 0 ? (
        <EmptyNote>Skills will appear here once they are added.</EmptyNote>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categories.map(([category, items], index) => {
            const theme = themeFor(category, index);
            const Icon = theme.icon || Layers;
            return (
              <Reveal key={category} delay={Math.min(index * 0.04, 0.24)}>
                <article className={`group h-full rounded-2xl border p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift motion-reduce:transform-none sm:p-5 ${theme.card}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${theme.badge}`}>
                        <Icon size={16} aria-hidden />
                      </span>
                      <h3 className="text-sm font-medium leading-snug text-ink">{category}</h3>
                    </div>
                    <ChevronRight size={16} className="mt-2 shrink-0 text-faint transition duration-300 group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden />
                  </div>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {items.map((skill) => (
                      <li
                        key={skill.id}
                        className={`rounded-full border px-2.5 py-1 text-xs leading-none transition duration-200 hover:brightness-95 [[data-theme=dark]_&]:hover:brightness-110 ${theme.chip}`}
                      >
                        {skill.name}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}
    </Section>
  );
}
