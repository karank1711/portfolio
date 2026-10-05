import { useEffect, useState } from 'react';
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
  const [status, setStatus] = useState('loading');
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setStatus('loading');
    getProject(slug, preview)
      .then((next) => {
        if (!active) return;
        setProject(next);
        setStatus('ready');
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Project not found');
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [slug, preview]);

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
