import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/Button.jsx';
import { EmptyState, ErrorState, LoadingBlock, PageHeader } from '@/components/Modal.jsx';
import { SortableList } from '@/components/SortableList.jsx';
import { useConfirm } from '@/context/ConfirmContext.jsx';
import { useToast } from '@/context/ToastContext.jsx';
import { useResource } from '@/hooks/useResource.js';
import { api, siteUrl } from '@/services/api.js';
import { inputClass } from '@/utils/options.js';

export default function ProjectsPage() {
  const { items, setItems, status, error, reload } = useResource('/projects');
  const toast = useToast();
  const confirm = useConfirm();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [projectStatus, setProjectStatus] = useState('all');

  const categories = useMemo(() => [...new Set(items.map((item) => item.category).filter(Boolean))], [items]);
  const filtered = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchesCategory = category === 'all' || item.category === category;
    const matchesStatus = projectStatus === 'all' || item.status === projectStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });
  const canReorder = !search.trim() && category === 'all' && projectStatus === 'all';

  async function persistOrder(next) {
    const previous = items;
    setItems(next);
    try {
      setItems(await api('/projects/reorder', { method: 'PATCH', body: { ids: next.map((item) => item.id) } }));
    } catch (err) {
      setItems(previous);
      toast.error(err.message);
    }
  }

  async function remove(project) {
    const yes = await confirm({ title: 'Delete project', body: `Remove ${project.name}? This also deletes its images.`, confirmLabel: 'Delete' });
    if (!yes) return;
    try {
      await api(`/projects/${project.id}`, { method: 'DELETE' });
      toast.success('Project deleted');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function toggleFeatured(project) {
    try {
      await api(`/projects/${project.id}`, { method: 'PATCH', body: { isFeatured: !project.isFeatured } });
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function preview(project) {
    try {
      const data = await api(`/projects/${project.id}/preview-token`, { method: 'POST' });
      window.open(siteUrl(`/projects/${data.slug}?preview=${data.token}`), '_blank', 'noopener');
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (status === 'loading') return <LoadingBlock />;
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />;

  return (
    <div>
      <PageHeader title="Projects" description="Published projects appear on the public site. Clear filters before reordering." action={<Link to="/projects/new"><Button>Add project</Button></Link>} />
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <input className={inputClass} placeholder="Search projects" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className={inputClass} value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className={inputClass} value={projectStatus} onChange={(event) => setProjectStatus(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="planned">Planned</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      {filtered.length === 0 ? <EmptyState title="No projects" body="Add a project, or change the filters." /> : canReorder ? (
        <SortableList items={filtered} onReorder={persistOrder} renderItem={(project) => <ProjectRow project={project} onPreview={preview} onFeatured={toggleFeatured} onDelete={remove} />} />
      ) : (
        <div className="grid gap-2">
          {filtered.map((project) => (
            <div key={project.id} className="border border-line bg-elevated"><ProjectRow project={project} onPreview={preview} onFeatured={toggleFeatured} onDelete={remove} /></div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectRow({ project, onPreview, onFeatured, onDelete }) {
  return (
    <div className="flex flex-col gap-3 px-3 py-3 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {project.coverImageUrl ? <img src={project.coverImageUrl} alt="" className="h-12 w-16 object-cover" /> : <div className="h-12 w-16 bg-surface" />}
        <div className="min-w-0">
          <p className="truncate text-sm text-ink">{project.name}</p>
          <p className="text-xs text-faint">{project.category || 'Uncategorized'} · {(project.technologies || []).slice(0, 4).join(', ')}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="border border-line px-2 py-1">{project.isFeatured ? 'Featured' : 'Standard'}</span>
        <span className="border border-line px-2 py-1">{project.isPublished ? 'Published' : 'Draft'}</span>
        <span className="border border-line px-2 py-1">{project.status}</span>
        <Link to={`/projects/${project.id}/edit`} className="border border-line px-2 py-1 text-ink">Edit</Link>
        <button type="button" className="border border-line px-2 py-1" onClick={() => onPreview(project)}>Preview</button>
        <button type="button" className="border border-line px-2 py-1" onClick={() => onFeatured(project)}>{project.isFeatured ? 'Unfeature' : 'Feature'}</button>
        <button type="button" className="border border-accent/40 px-2 py-1 text-accent" onClick={() => onDelete(project)}>Delete</button>
      </div>
    </div>
  );
}
