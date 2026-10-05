import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProjectCover } from '@/components/projects/ProjectCover.jsx';
import { normalizeProject, projectNumber } from '@/data/projects.js';

const VISIBLE_TECHNOLOGIES = 4;

export function ProjectCard({ project, index = 0 }) {
  const item = normalizeProject(project);
  const technologies = item.technologies.slice(0, VISIBLE_TECHNOLOGIES);

  return (
    <article className="group grid items-center gap-6 border-b border-line py-10 last:border-b-0 md:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] md:gap-12 md:py-14">
      <Link to={`/projects/${item.slug}`} className="block min-w-0">
        {item.coverImage ? (
          <ProjectCover src={item.coverImage} alt={item.title} zoom />
        ) : (
          <div className="flex aspect-video items-end rounded-2xl bg-surface p-6">
            <span className="font-serif text-3xl text-ink">{item.title}</span>
          </div>
        )}
      </Link>

      <div className="min-w-0">
        <p className="text-xs tracking-[0.18em] text-faint">{projectNumber(index)}</p>
        <h3 className="mt-2 font-serif text-3xl leading-tight text-ink md:text-4xl">
          <Link to={`/projects/${item.slug}`} className="transition hover:text-accent">{item.title}</Link>
        </h3>
        {item.shortDescription ? (
          <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-muted">{item.shortDescription}</p>
        ) : null}
        {technologies.length ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <li key={tech} className="rounded-full border border-line bg-bg px-2.5 py-1 text-xs text-muted">{tech}</li>
            ))}
          </ul>
        ) : null}
        <Link to={`/projects/${item.slug}`} className="mt-5 inline-flex items-center gap-1.5 text-sm text-ink transition hover:text-accent">
          View Details
          <ArrowRight size={15} aria-hidden />
        </Link>
      </div>
    </article>
  );
}
