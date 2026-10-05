import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/common/Button.jsx';
import { Container } from '@/components/common/Container.jsx';
import { Reveal } from '@/components/common/Reveal.jsx';
import { ProjectCover } from '@/components/projects/ProjectCover.jsx';
import { normalizeProject } from '@/data/projects.js';

export function ProjectDetails({ project, number, previous, next }) {
  const item = normalizeProject(project);
  const reduce = useReducedMotion();
  const entrance = reduce ? {} : {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  };
  const previousView = previous ? normalizeProject(previous) : null;
  const nextView = next ? normalizeProject(next) : null;
  const showChallenges = item.challenges.length > 0 || item.solutions.length > 0;

  return (
    <motion.article {...entrance}>
      <Container className="py-12 md:py-16">
        <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-ink">
          <ArrowLeft size={15} aria-hidden />
          Back to Projects
        </Link>

        <header className="mt-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.18em] text-faint">
            {[number, item.category].filter(Boolean).join(' · ')}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-5xl md:text-6xl">{item.title}</h1>
          {item.shortDescription ? (
            <p className="mt-5 text-lg leading-relaxed text-muted">{item.shortDescription}</p>
          ) : null}
          {item.liveUrl || item.githubUrl ? (
            <div className="mt-7 flex flex-wrap gap-3">
              {item.liveUrl ? <Button href={item.liveUrl} target="_blank" rel="noreferrer">Live Project</Button> : null}
              {item.githubUrl ? <Button href={item.githubUrl} variant="secondary" target="_blank" rel="noreferrer">GitHub</Button> : null}
            </div>
          ) : null}
        </header>

        {item.coverImage ? (
          <div className="mt-10">
            <ProjectCover src={item.coverImage} alt={item.title} />
          </div>
        ) : null}

        <div className="mx-auto mt-14 max-w-3xl space-y-14">
          {item.description ? (
            <Reveal>
              <SectionTitle>Overview</SectionTitle>
              <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-muted">{item.description}</p>
            </Reveal>
          ) : null}

          {item.features.length ? (
            <Reveal>
              <SectionTitle>Key Features</SectionTitle>
              <ul className="mt-4 space-y-3">
                {item.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-relaxed text-muted">
                    <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          {item.technologies.length ? (
            <Reveal>
              <SectionTitle>Technologies Used</SectionTitle>
              <ul className="mt-4 flex flex-wrap gap-2">
                {item.technologies.map((tech) => (
                  <li key={tech} className="rounded-full border border-line bg-elevated px-3 py-1.5 text-xs text-ink">{tech}</li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          {item.developmentDetails ? (
            <Reveal>
              <SectionTitle>Development Details</SectionTitle>
              <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-muted">{item.developmentDetails}</p>
            </Reveal>
          ) : null}

          {showChallenges ? (
            <Reveal>
              <SectionTitle>Challenges & Solutions</SectionTitle>
              {item.challenges.length ? <PointList label="Challenges" items={item.challenges} /> : null}
              {item.solutions.length ? <PointList label="Solutions" items={item.solutions} /> : null}
            </Reveal>
          ) : null}
        </div>

        {item.images.length ? (
          <Reveal className="mt-14">
            <SectionTitle>Screenshots</SectionTitle>
            <div className="mt-5 grid gap-5">
              {item.images.map((image) => (
                <div key={image.id || image.url} className="flex justify-center overflow-hidden rounded-2xl bg-surface p-3">
                  <img
                    src={image.url}
                    alt={image.alt || item.title}
                    loading="lazy"
                    className="h-auto max-h-[70vh] w-auto max-w-full"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        ) : null}

        {previousView || nextView ? (
          <nav className="mt-16 grid gap-4 border-t border-line pt-8 sm:grid-cols-2" aria-label="More projects">
            {previousView ? (
              <Link to={`/projects/${previousView.slug}`} className="group rounded-2xl border border-line px-5 py-4 transition hover:border-ink">
                <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-faint">
                  <ArrowLeft size={13} aria-hidden />
                  Previous
                </span>
                <span className="mt-2 block font-serif text-2xl text-ink">{previousView.title}</span>
              </Link>
            ) : <span />}
            {nextView ? (
              <Link to={`/projects/${nextView.slug}`} className="rounded-2xl border border-line px-5 py-4 transition hover:border-ink sm:text-right">
                <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-faint">
                  Next
                  <ArrowRight size={13} aria-hidden />
                </span>
                <span className="mt-2 block font-serif text-2xl text-ink">{nextView.title}</span>
              </Link>
            ) : null}
          </nav>
        ) : null}
      </Container>
    </motion.article>
  );
}

function SectionTitle({ children }) {
  return <h2 className="font-serif text-3xl text-ink">{children}</h2>;
}

function PointList({ label, items }) {
  return (
    <div className="mt-5">
      <p className="text-xs uppercase tracking-[0.16em] text-faint">{label}</p>
      <ul className="mt-3 space-y-2">
        {items.map((entry) => (
          <li key={entry} className="text-sm leading-relaxed text-muted">{entry}</li>
        ))}
      </ul>
    </div>
  );
}
