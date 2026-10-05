import { useState } from 'react';
import { Button } from '@/components/Button.jsx';
import { Field, SelectInput, TextInput } from '@/components/Field.jsx';
import { EmptyState, ErrorState, LoadingBlock, Modal, PageHeader } from '@/components/Modal.jsx';
import { SortableList } from '@/components/SortableList.jsx';
import { useConfirm } from '@/context/ConfirmContext.jsx';
import { useToast } from '@/context/ToastContext.jsx';
import { useResource } from '@/hooks/useResource.js';
import { api } from '@/services/api.js';
import { PLATFORMS, labelFor } from '@/utils/options.js';

const blank = { platform: 'github', label: '', url: '', isEnabled: true };

export default function SocialPage() {
  const { items, setItems, status, error, reload } = useResource('/social-links');
  const toast = useToast();
  const confirm = useConfirm();
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  async function persistOrder(next) {
    const previous = items;
    setItems(next);
    try {
      setItems(await api('/social-links/reorder', { method: 'PATCH', body: { ids: next.map((item) => item.id) } }));
    } catch (err) {
      setItems(previous);
      toast.error(err.message);
    }
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const body = { platform: editing.platform, label: editing.label || '', url: editing.url, isEnabled: Boolean(editing.isEnabled) };
      if (editing.id) await api(`/social-links/${editing.id}`, { method: 'PUT', body });
      else await api('/social-links', { method: 'POST', body });
      setEditing(null);
      toast.success('Link saved');
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    const yes = await confirm({ title: 'Delete link', body: 'Remove this social link?', confirmLabel: 'Delete' });
    if (!yes) return;
    try {
      await api(`/social-links/${item.id}`, { method: 'DELETE' });
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (status === 'loading') return <LoadingBlock />;
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />;

  return (
    <div>
      <PageHeader title="Social links" description="Shown in the hero, contact section, and footer." action={<Button onClick={() => setEditing(blank)}>Add link</Button>} />
      {items.length === 0 ? <EmptyState title="No links yet" /> : (
        <SortableList items={items} onReorder={persistOrder} renderItem={(item) => (
          <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
            <div className="min-w-0">
              <p className="text-sm text-ink">{item.label || labelFor(PLATFORMS, item.platform)}</p>
              <p className="truncate text-xs text-faint">{item.url}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => api(`/social-links/${item.id}`, { method: 'PATCH', body: { isEnabled: !item.isEnabled } }).then(reload).catch((err) => toast.error(err.message))}>{item.isEnabled ? 'Visible' : 'Hidden'}</Button>
              <Button variant="secondary" onClick={() => setEditing(item)}>Edit</Button>
              <Button variant="danger" onClick={() => remove(item)}>Delete</Button>
            </div>
          </div>
        )} />
      )}
      <Modal open={Boolean(editing)} title={editing?.id ? 'Edit link' : 'Add link'} onClose={() => setEditing(null)} footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" form="social-form" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button></>}>
        {editing ? (
          <form id="social-form" onSubmit={save} className="grid gap-4">
            <Field label="Platform">
              <SelectInput value={editing.platform} onChange={(event) => setEditing({ ...editing, platform: event.target.value })}>
                {PLATFORMS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </SelectInput>
            </Field>
            <Field label="Label"><TextInput value={editing.label || ''} onChange={(event) => setEditing({ ...editing, label: event.target.value })} /></Field>
            <Field label={editing.platform === 'email' ? 'Email' : 'URL'}><TextInput required value={editing.url} onChange={(event) => setEditing({ ...editing, url: event.target.value })} /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(editing.isEnabled)} onChange={(event) => setEditing({ ...editing, isEnabled: event.target.checked })} /> Show on the portfolio</label>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
