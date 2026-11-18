import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/common/Button.jsx';
import { Container } from '@/components/common/Container.jsx';
import { Skeleton, StateMessage } from '@/components/common/StateMessage.jsx';
import { ProjectDetails } from '@/components/projects/ProjectDetails.jsx';
import { usePortfolio } from '@/context/PortfolioContext.jsx';
import { projectNumber } from '@/data/projects.js';
import { getProject } from '@/services/portfolio.js';

export default function ProjectPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const preview = params.get('preview') || '';
  const { data } = usePortfolio();

  // Instant render from PortfolioContext if project is already loaded
  const cached = useMemo(() => {
    if (preview) return null;
    return data?.projects?.find((item) => item.slug === slug) || null;
  }, [data?.projects, slug, preview]);

  const [project, setProject] = useState(cached);
  const [status, setStatus] = useState(() => (cached ? 'ready' : 'loading'));
  const [error, setError] = useState('');

  // Update immediately when slug changes if cached version exists
  useEffect(() => {
    if (cached) {
      setProject(cached);
      setStatus('ready');
    }
  }, [cached]);

  useEffect(() => {
    let active = true;
    if (!cached) {
      setStatus('loading');
    }

    getProject(slug, preview)
      .then((next) => {
        if (!active) return;
        setProject(next);
        setStatus('ready');
      })
      .catch((err) => {
        if (!active) return;
        if (!cached) {
          setError(err.message || 'Project not found');
          setStatus('error');
        }
      });

    return () => {
      active = false;
    };
  }, [slug, preview, cached]);

  if (status === 'loading') {
    return (
      <Container className="py-16">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-6 h-14 w-2/3" />
        <Skeleton className="mt-8 aspect-[16/8]" />
      </Container>
    );
  }

  if (status === 'error' || !project) {
    return (
      <div className="px-5 py-24">
        <StateMessage title="Project not found" body={error || 'This project is not available.'} action={<Button href="/projects">Back to Projects</Button>} />
      </div>
    );
  }

  const projects = data?.projects || [];
  const index = projects.findIndex((item) => item.slug === project.slug);
  const description = project.shortDescription || project.detailedDescription || project.name;

  return (
    <>
      <Helmet>
        <title>{project.name}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={project.name} />
        <meta property="og:description" content={description} />
        {project.coverImageUrl ? <meta property="og:image" content={project.coverImageUrl} /> : null}
        {project.coverImageUrl ? <link rel="preload" as="image" href={project.coverImageUrl} fetchpriority="high" /> : null}
      </Helmet>
      <ProjectDetails
        project={project}
        number={index >= 0 ? projectNumber(index) : ''}
        previous={index > 0 ? projects[index - 1] : null}
        next={index >= 0 && index < projects.length - 1 ? projects[index + 1] : null}
      />
    </>
  );
}
