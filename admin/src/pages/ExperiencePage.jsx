import { useState } from 'react';
import { Button } from '@/components/Button.jsx';
import { Field, SelectInput, TagInput, TextArea, TextInput } from '@/components/Field.jsx';
import { EmptyState, ErrorState, LoadingBlock, Modal, PageHeader } from '@/components/Modal.jsx';
import { SortableList } from '@/components/SortableList.jsx';
import { useConfirm } from '@/context/ConfirmContext.jsx';
import { useToast } from '@/context/ToastContext.jsx';
import { useResource } from '@/hooks/useResource.js';
import { api } from '@/services/api.js';
import { EMPLOYMENT, labelFor } from '@/utils/options.js';

const blank = {
  company: '',
  role: '',
  employmentType: 'full_time',
  startDate: '',
  endDate: '',
  location: '',
  description: '',
  technologies: [],
  isCurrent: false,
};

function payload(item) {
  return {
    company: item.company,
    role: item.role,
    employmentType: item.employmentType,
    startDate: item.startDate || '',
    endDate: item.isCurrent ? '' : (item.endDate || ''),
    location: item.location || '',
    description: item.description || '',
    technologies: item.technologies || [],
    isCurrent: Boolean(item.isCurrent),
  };
}

export default function ExperiencePage() {
  const { items, setItems, status, error, reload } = useResource('/experience');
  const toast = useToast();
  const confirm = useConfirm();
  const [editing, setEditing] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function persistOrder(next) {
    const previous = items;
    setItems(next);
    try {
      setItems(await api('/experience/reorder', { method: 'PATCH', body: { ids: next.map((item) => item.id) } }));
    } catch (err) {
      setItems(previous);
      toast.error(err.message);
    }
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = editing.id
        ? await api(`/experience/${editing.id}`, { method: 'PUT', body: payload(editing) })
        : await api('/experience', { method: 'POST', body: payload(editing) });
      if (logoFile) {
        const data = new FormData();
        data.append('logo', logoFile);
        await api(`/experience/${saved.id}/logo`, { method: 'POST', formData: data });
      }
      setEditing(null);
      setLogoFile(null);
      toast.success('Experience saved');
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    const yes = await confirm({ title: 'Delete experience', body: `Remove ${item.role} at ${item.company}?`, confirmLabel: 'Delete' });
    if (!yes) return;
    try {
      await api(`/experience/${item.id}`, { method: 'DELETE' });
      toast.success('Experience deleted');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function removeLogo() {
    try {
      const saved = await api(`/experience/${editing.id}/logo`, { method: 'DELETE' });
      setEditing(saved);
      toast.success('Logo removed');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (status === 'loading') return <LoadingBlock />;
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />;

  return (
    <div>
      <PageHeader title="Experience" description="Roles appear as a timeline, in the order you set here." action={<Button onClick={() => { setLogoFile(null); setEditing(blank); }}>Add experience</Button>} />
      {items.length === 0 ? <EmptyState title="No experience yet" /> : (
        <SortableList items={items} onReorder={persistOrder} renderItem={(item) => (
          <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
            <div className="flex items-center gap-3">
              {item.companyLogoUrl ? <img src={item.companyLogoUrl} alt="" className="h-8 w-8 object-contain" /> : null}
              <div>
                <p className="text-sm text-ink">{item.role}</p>
                <p className="text-xs text-faint">{item.company} · {labelFor(EMPLOYMENT, item.employmentType)}{item.isCurrent ? ' · Current' : ''}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setLogoFile(null); setEditing(item); }}>Edit</Button>
              <Button variant="danger" onClick={() => remove(item)}>Delete</Button>
            </div>
          </div>
        )} />
      )}
      <Modal open={Boolean(editing)} title={editing?.id ? 'Edit experience' : 'Add experience'} onClose={() => setEditing(null)} wide footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" form="experience-form" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button></>}>
        {editing ? (
          <form id="experience-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <Field label="Company"><TextInput required value={editing.company} onChange={(event) => setEditing({ ...editing, company: event.target.value })} /></Field>
            <Field label="Role"><TextInput required value={editing.role} onChange={(event) => setEditing({ ...editing, role: event.target.value })} /></Field>
            <Field label="Employment type">
              <SelectInput value={editing.employmentType} onChange={(event) => setEditing({ ...editing, employmentType: event.target.value })}>
                {EMPLOYMENT.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Location"><TextInput value={editing.location || ''} onChange={(event) => setEditing({ ...editing, location: event.target.value })} /></Field>
            <Field label="Start date"><TextInput type="date" value={editing.startDate || ''} onChange={(event) => setEditing({ ...editing, startDate: event.target.value })} /></Field>
            {editing.isCurrent ? <div /> : (
              <Field label="End date"><TextInput type="date" value={editing.endDate || ''} onChange={(event) => setEditing({ ...editing, endDate: event.target.value })} /></Field>
            )}
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input type="checkbox" checked={Boolean(editing.isCurrent)} onChange={(event) => setEditing({ ...editing, isCurrent: event.target.checked })} />
              Current position
            </label>
            <div className="sm:col-span-2">
              <Field label="Description"><TextArea value={editing.description || ''} onChange={(event) => setEditing({ ...editing, description: event.target.value })} /></Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Technologies"><TagInput value={editing.technologies || []} onChange={(technologies) => setEditing({ ...editing, technologies })} /></Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Company logo" hint="JPEG, PNG, WebP, or AVIF under 5 MB.">
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setLogoFile(event.target.files?.[0] || null)} />
              </Field>
              {editing.companyLogoUrl ? <Button variant="ghost" onClick={removeLogo}>Remove current logo</Button> : null}
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
