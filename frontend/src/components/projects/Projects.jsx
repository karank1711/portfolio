import { Link } from 'react-router-dom';
import { EmptyNote } from '@/components/common/StateMessage.jsx';
import { Reveal } from '@/components/common/Reveal.jsx';
import { Section } from '@/components/common/Container.jsx';
import { SectionHeading } from '@/components/common/SectionHeading.jsx';
import { ProjectCard } from '@/components/projects/ProjectCard.jsx';

export function Projects({ projects = [], showViewAll = false }) {
  return (
    <Section id="projects">
      <Reveal>
        <SectionHeading
          eyebrow="My projects"
          title="Selected Work"
          action={showViewAll && projects.length ? (
            <Link to="/projects" className="text-sm text-muted underline-offset-4 transition hover:text-ink hover:underline">
              View all projects
            </Link>
          ) : null}
        />
      </Reveal>
      {projects.length === 0 ? <EmptyNote>Projects will appear here once they are published.</EmptyNote> : (
        <div>
          {projects.map((project, index) => (
            <Reveal key={project.id || project.slug} delay={Math.min(index * 0.05, 0.2)}>
              <ProjectCard project={project} index={index} />
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  );
}
