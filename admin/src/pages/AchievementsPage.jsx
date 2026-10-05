import { useState } from 'react';
import { Button } from '@/components/Button.jsx';
import { Field, SelectInput, TextArea, TextInput } from '@/components/Field.jsx';
import { EmptyState, ErrorState, LoadingBlock, Modal, PageHeader } from '@/components/Modal.jsx';
import { SortableList } from '@/components/SortableList.jsx';
import { useConfirm } from '@/context/ConfirmContext.jsx';
import { useToast } from '@/context/ToastContext.jsx';
import { useResource } from '@/hooks/useResource.js';
import { api } from '@/services/api.js';
import { ACHIEVEMENT_TYPES, labelFor } from '@/utils/options.js';

const blank = { title: '', organization: '', achievedOn: '', description: '', verificationUrl: '', type: 'certification', isEnabled: true };

function payload(item) {
  return {
    title: item.title,
    organization: item.organization || '',
    achievedOn: item.achievedOn || '',
    description: item.description || '',
    verificationUrl: item.verificationUrl || '',
    type: item.type,
    isEnabled: Boolean(item.isEnabled),
  };
}

export default function AchievementsPage() {
  const { items, setItems, status, error, reload } = useResource('/achievements');
  const toast = useToast();
  const confirm = useConfirm();
  const [editing, setEditing] = useState(null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function persistOrder(next) {
    const previous = items;
    setItems(next);
    try {
      setItems(await api('/achievements/reorder', { method: 'PATCH', body: { ids: next.map((item) => item.id) } }));
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
        ? await api(`/achievements/${editing.id}`, { method: 'PUT', body: payload(editing) })
        : await api('/achievements', { method: 'POST', body: payload(editing) });
      if (file) {
        const data = new FormData();
        data.append('certificate', file);
        await api(`/achievements/${saved.id}/certificate`, { method: 'POST', formData: data });
      }
      setEditing(null);
      setFile(null);
      toast.success('Achievement saved');
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    const yes = await confirm({ title: 'Delete achievement', body: `Remove ${item.title}?`, confirmLabel: 'Delete' });
    if (!yes) return;
    try {
      await api(`/achievements/${item.id}`, { method: 'DELETE' });
      toast.success('Achievement deleted');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (status === 'loading') return <LoadingBlock />;
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />;

  return (
    <div>
      <PageHeader title="Achievements" description="Certificates can be an image or a PDF." action={<Button onClick={() => { setFile(null); setEditing(blank); }}>Add achievement</Button>} />
      {items.length === 0 ? <EmptyState title="No achievements yet" /> : (
        <SortableList items={items} onReorder={persistOrder} renderItem={(item) => (
          <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
            <div>
              <p className="text-sm text-ink">{item.title}</p>
              <p className="text-xs text-faint">{labelFor(ACHIEVEMENT_TYPES, item.type)} · {item.organization || 'No organization'} · {item.isEnabled ? 'Visible' : 'Hidden'}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { setFile(null); setEditing(item); }}>Edit</Button>
              <Button variant="danger" onClick={() => remove(item)}>Delete</Button>
            </div>
          </div>
        )} />
      )}
      <Modal open={Boolean(editing)} title={editing?.id ? 'Edit achievement' : 'Add achievement'} onClose={() => setEditing(null)} wide footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" form="achievement-form" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button></>}>
        {editing ? (
          <form id="achievement-form" onSubmit={save} className="grid gap-4">
            <Field label="Title"><TextInput required value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} /></Field>
            <Field label="Organization"><TextInput value={editing.organization || ''} onChange={(event) => setEditing({ ...editing, organization: event.target.value })} /></Field>
            <Field label="Type">
              <SelectInput value={editing.type} onChange={(event) => setEditing({ ...editing, type: event.target.value })}>
                {ACHIEVEMENT_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Date"><TextInput type="date" value={editing.achievedOn || ''} onChange={(event) => setEditing({ ...editing, achievedOn: event.target.value })} /></Field>
            <Field label="Description"><TextArea value={editing.description || ''} onChange={(event) => setEditing({ ...editing, description: event.target.value })} /></Field>
            <Field label="Verification URL"><TextInput value={editing.verificationUrl || ''} onChange={(event) => setEditing({ ...editing, verificationUrl: event.target.value })} placeholder="https://" /></Field>
            <Field label="Certificate file"><input type="file" accept="image/jpeg,image/png,image/webp,image/avif,application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} /></Field>
            {editing.certificateUrl ? <a href={editing.certificateUrl} target="_blank" rel="noreferrer" className="text-sm text-accent">View current file</a> : null}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={Boolean(editing.isEnabled)} onChange={(event) => setEditing({ ...editing, isEnabled: event.target.checked })} />
              Show on the portfolio
            </label>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
