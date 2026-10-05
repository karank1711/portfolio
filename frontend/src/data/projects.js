function list(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [value];
}

export function normalizeProject(project) {
  if (!project) return null;
  return {
    id: project.id,
    slug: project.slug,
    title: project.title || project.name || '',
    coverImage: project.coverImage || project.coverImageUrl || '',
    shortDescription: project.shortDescription || '',
    description: project.description || project.detailedDescription || '',
    technologies: list(project.technologies),
    features: list(project.features),
    developmentDetails: project.developmentDetails || '',
    challenges: list(project.challenges),
    solutions: list(project.solutions),
    githubUrl: project.githubUrl || '',
    liveUrl: project.liveUrl || '',
    images: list(project.images),
    category: project.category || '',
  };
}

export function projectNumber(index) {
  return String(index + 1).padStart(2, '0');
}
