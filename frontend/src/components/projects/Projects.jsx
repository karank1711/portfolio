import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import { EmptyNote } from '@/components/common/StateMessage.jsx';
import { Reveal } from '@/components/common/Reveal.jsx';
import { Section } from '@/components/common/Container.jsx';
import { SectionHeading } from '@/components/common/SectionHeading.jsx';
import { ProjectCard } from '@/components/projects/ProjectCard.jsx';

function ProjectRevealItem({ children, index = 0 }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  // Initially show only the first project (index === 0)
  const [isVisible, setIsVisible] = useState(() => index === 0 || Boolean(reduce));

  useEffect(() => {
    if (isVisible || reduce || !ref.current) return;

    const el = ref.current;
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
          observer.disconnect();
        }
      },
      {
        root: null,
        // Natural threshold: reveals when entering viewport from below
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.1,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible, reduce]);

  if (reduce || index === 0) {
    return <div>{children}</div>;
  }

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1), transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: isVisible ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

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
            <ProjectRevealItem key={project.id || project.slug} index={index}>
              <ProjectCard project={project} index={index} priority={index === 0} />
            </ProjectRevealItem>
          ))}
        </div>
      )}
    </Section>
  );
}
