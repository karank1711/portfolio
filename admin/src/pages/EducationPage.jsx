import { useState } from 'react';
import { Button } from '@/components/Button.jsx';
import { Field, TextArea, TextInput } from '@/components/Field.jsx';
import { EmptyState, ErrorState, LoadingBlock, Modal, PageHeader } from '@/components/Modal.jsx';
import { SortableList } from '@/components/SortableList.jsx';
import { useConfirm } from '@/context/ConfirmContext.jsx';
import { useToast } from '@/context/ToastContext.jsx';
import { useResource } from '@/hooks/useResource.js';
import { api } from '@/services/api.js';

const blank = { institution: '', degree: '', specialization: '', startYear: '', endYear: '', grade: '', description: '' };

function payload(item) {
  return {
    institution: item.institution,
    degree: item.degree,
    specialization: item.specialization || '',
    startYear: Number(item.startYear),
    endYear: item.endYear || '',
    grade: item.grade || '',
    description: item.description || '',
  };
}

export default function EducationPage() {
  const { items, setItems, status, error, reload } = useResource('/education');
  const toast = useToast();
  const confirm = useConfirm();
  const [editing, setEditing] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function persistOrder(next) {
    const previous = items;
    setItems(next);
    try {
      setItems(await api('/education/reorder', { method: 'PATCH', body: { ids: next.map((item) => item.id) } }));
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
        ? await api(`/education/${editing.id}`, { method: 'PUT', body: payload(editing) })
        : await api('/education', { method: 'POST', body: payload(editing) });
      if (logoFile) {
        const data = new FormData();
        data.append('logo', logoFile);
        await api(`/education/${saved.id}/logo`, { method: 'POST', formData: data });
      }
      setEditing(null);
      setLogoFile(null);
      toast.success('Education saved');
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    const yes = await confirm({ title: 'Delete education', body: `Remove ${item.institution}?`, confirmLabel: 'Delete' });
    if (!yes) return;
    await api(`/education/${item.id}`, { method: 'DELETE' }).then(() => {
      toast.success('Education deleted');
      reload();
    }).catch((err) => toast.error(err.message));
  }

  if (status === 'loading') return <LoadingBlock />;
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />;

  return (
    <div>
      <PageHeader title="Education" description="Leave the end year empty if the program is still in progress." action={<Button onClick={() => { setLogoFile(null); setEditing(blank); }}>Add education</Button>} />
      {items.length === 0 ? <EmptyState title="No education yet" /> : (
        <SortableList items={items} onReorder={persistOrder} renderItem={(item) => (
          <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
            <div>
              <p className="text-sm text-ink">{item.institution}</p>
              <p className="text-xs text-faint">{item.degree}{item.specialization ? ` · ${item.specialization}` : ''}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setLogoFile(null); setEditing(item); }}>Edit</Button>
              <Button variant="danger" onClick={() => remove(item)}>Delete</Button>
            </div>
          </div>
        )} />
      )}
      <Modal open={Boolean(editing)} title={editing?.id ? 'Edit education' : 'Add education'} onClose={() => setEditing(null)} wide footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" form="education-form" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button></>}>
        {editing ? (
          <form id="education-form" onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <Field label="Institution"><TextInput required value={editing.institution} onChange={(event) => setEditing({ ...editing, institution: event.target.value })} /></Field>
            <Field label="Degree"><TextInput required value={editing.degree} onChange={(event) => setEditing({ ...editing, degree: event.target.value })} /></Field>
            <Field label="Specialization"><TextInput value={editing.specialization || ''} onChange={(event) => setEditing({ ...editing, specialization: event.target.value })} /></Field>
            <Field label="Grade / CGPA"><TextInput value={editing.grade || ''} onChange={(event) => setEditing({ ...editing, grade: event.target.value })} /></Field>
            <Field label="Start year"><TextInput required type="number" min="1950" max="2100" value={editing.startYear} onChange={(event) => setEditing({ ...editing, startYear: event.target.value })} /></Field>
            <Field label="End year"><TextInput type="number" min="1950" max="2100" value={editing.endYear || ''} onChange={(event) => setEditing({ ...editing, endYear: event.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Description"><TextArea value={editing.description || ''} onChange={(event) => setEditing({ ...editing, description: event.target.value })} /></Field></div>
            <div className="sm:col-span-2">
              <Field label="Institution logo"><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setLogoFile(event.target.files?.[0] || null)} /></Field>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
