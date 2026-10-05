import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/Button.jsx';
import { Field, SelectInput, TagInput, TextArea, TextInput } from '@/components/Field.jsx';
import { ErrorState, LoadingBlock } from '@/components/Modal.jsx';
import { useToast } from '@/context/ToastContext.jsx';
import { api } from '@/services/api.js';
import { PROJECT_STATUS, slugify } from '@/utils/options.js';

const empty = {
  name: '',
  slug: '',
  shortDescription: '',
  detailedDescription: '',
  featuresText: '',
  technologies: [],
  githubUrl: '',
  liveUrl: '',
  category: '',
  isFeatured: false,
  status: 'completed',
  isPublished: false,
  startDate: '',
  endDate: '',
  developmentDetails: '',
};

function fromProject(project) {
  return {
    ...empty,
    ...project,
    featuresText: (project.features || []).join('\n'),
    technologies: project.technologies || [],
    githubUrl: project.githubUrl || '',
    liveUrl: project.liveUrl || '',
    startDate: project.startDate || '',
    endDate: project.endDate || '',
  };
}

export default function ProjectEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [slugLocked, setSlugLocked] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [images, setImages] = useState([]);
  const [coverUrl, setCoverUrl] = useState('');
  const [status, setStatus] = useState(isNew ? 'ready' : 'loading');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const createdId = useRef(null);

  useEffect(() => {
    if (isNew) return undefined;
    let active = true;
    api(`/projects/id/${id}`)
      .then((project) => {
        if (!active) return;
        setForm(fromProject(project));
        setSlugLocked(true);
        setImages(project.images || []);
        setCoverUrl(project.coverImageUrl || '');
        setStatus('ready');
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
        setStatus('error');
      });
    return () => { active = false; };
  }, [id, isNew]);

  function update(event) {
    const { name, value, type, checked } = event.target;
    if (name === 'slug') setSlugLocked(true);
    setForm((current) => {
      const next = { ...current, [name]: type === 'checkbox' ? checked : value };
      if (name === 'name' && !slugLocked) next.slug = slugify(value);
      return next;
    });
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name,
        slug: form.slug,
        shortDescription: form.shortDescription,
        detailedDescription: form.detailedDescription,
        features: form.featuresText.split('\n').map((item) => item.trim()).filter(Boolean),
        technologies: form.technologies,
        githubUrl: form.githubUrl,
        liveUrl: form.liveUrl,
        category: form.category,
        isFeatured: form.isFeatured,
        status: form.status,
        isPublished: form.isPublished,
        startDate: form.startDate,
        endDate: form.endDate,
        developmentDetails: form.developmentDetails,
      };
      const existingId = id || createdId.current;
      const saved = existingId
        ? await api(`/projects/${existingId}`, { method: 'PUT', body })
        : await api('/projects', { method: 'POST', body });
      const currentId = saved.id;
      createdId.current = currentId;
      if (coverFile) {
        const data = new FormData();
        data.append('cover', coverFile);
        const withCover = await api(`/projects/${currentId}/cover`, { method: 'POST', formData: data });
        setCoverUrl(withCover.coverImageUrl || '');
        setCoverFile(null);
      }
      if (gallery.length) {
        const data = new FormData();
        gallery.forEach((file) => data.append('images', file));
        data.append('alt', form.name);
        const withImages = await api(`/projects/${currentId}/images`, { method: 'POST', formData: data });
        setImages(withImages.images || []);
        setGallery([]);
      }
      toast.success('Project saved');
      if (isNew) navigate(`/projects/${currentId}/edit`, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteCover() {
    try {
      const saved = await api(`/projects/${id}/cover`, { method: 'DELETE' });
      setCoverUrl(saved.coverImageUrl || '');
      toast.success('Cover removed');
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function deleteImage(imageId) {
    try {
      const saved = await api(`/projects/${id}/images/${imageId}`, { method: 'DELETE' });
      setImages(saved.images || []);
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function moveImage(index, direction) {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setImages(next);
    try {
      const saved = await api(`/projects/${id}/images/reorder`, { method: 'PATCH', body: { ids: next.map((image) => image.id) } });
      setImages(saved.images || next);
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (status === 'loading') return <LoadingBlock />;
  if (status === 'error') return <ErrorState message={error} />;

  return (
    <form onSubmit={onSubmit} className="grid max-w-4xl gap-8">
      <Section title="Basic information">
        <Field label="Project name"><TextInput name="name" required value={form.name} onChange={update} /></Field>
        <Field label="URL slug" hint="Used at /projects/your-slug"><TextInput name="slug" required value={form.slug} onChange={update} /></Field>
        <Field label="Category"><TextInput name="category" value={form.category} onChange={update} /></Field>
        <Field label="Short description"><TextArea name="shortDescription" value={form.shortDescription} onChange={update} /></Field>
      </Section>

      <Section title="Project media">
        {coverUrl ? <img src={coverUrl} alt="" className="mb-3 max-h-56 w-full object-cover" /> : null}
        <Field label="Cover image" hint="Shown on the project card. JPEG, PNG, WebP, or AVIF under 5 MB.">
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setCoverFile(event.target.files?.[0] || null)} />
        </Field>
        {coverUrl && !isNew ? <Button variant="ghost" onClick={deleteCover}>Remove cover</Button> : null}
        <Field label="Screenshots" hint={isNew ? 'Save the project once, then add screenshots. You can also choose files now; they upload with the first save.' : 'Up to 12 images.'}>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(event) => setGallery([...event.target.files])} />
        </Field>
        <div className="grid gap-3">
          {images.map((image, index) => (
            <div key={image.id} className="flex items-center gap-3 border border-line p-2">
              <img src={image.url} alt={image.alt || ''} className="h-16 w-24 object-cover" />
              <div className="ml-auto flex gap-2">
                <Button variant="secondary" onClick={() => moveImage(index, -1)}>Up</Button>
                <Button variant="secondary" onClick={() => moveImage(index, 1)}>Down</Button>
                <Button variant="danger" onClick={() => deleteImage(image.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Technologies">
        <TagInput value={form.technologies} onChange={(technologies) => setForm((current) => ({ ...current, technologies }))} />
      </Section>

      <Section title="Links">
        <Field label="Live URL"><TextInput name="liveUrl" value={form.liveUrl} onChange={update} placeholder="https://" /></Field>
        <Field label="GitHub URL"><TextInput name="githubUrl" value={form.githubUrl} onChange={update} placeholder="https://github.com/" /></Field>
      </Section>

      <Section title="Project details">
        <Field label="Detailed description"><TextArea name="detailedDescription" value={form.detailedDescription} onChange={update} /></Field>
        <Field label="Features" hint="One feature per line."><TextArea name="featuresText" value={form.featuresText} onChange={update} /></Field>
        <Field label="Development details"><TextArea name="developmentDetails" value={form.developmentDetails} onChange={update} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date"><TextInput type="date" name="startDate" value={form.startDate} onChange={update} /></Field>
          <Field label="End date"><TextInput type="date" name="endDate" value={form.endDate} onChange={update} /></Field>
        </div>
      </Section>

      <Section title="Display settings">
        <Field label="Status">
          <SelectInput name="status" value={form.status} onChange={update}>
            {PROJECT_STATUS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </SelectInput>
        </Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPublished" checked={form.isPublished} onChange={update} /> Published</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={update} /> Featured</label>
      </Section>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save project'}</Button>
        <Button variant="secondary" onClick={() => navigate('/projects')}>Back</Button>
      </div>
    </form>
  );
}

function Section({ title, children }) {
  return (
    <section className="grid gap-4 border border-line bg-elevated p-4 sm:p-5">
      <h2 className="font-serif text-2xl text-ink">{title}</h2>
      {children}
    </section>
  );
}
