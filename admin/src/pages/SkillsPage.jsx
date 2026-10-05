import { useState } from 'react';
import { Button } from '@/components/Button.jsx';
import { Field, TextInput } from '@/components/Field.jsx';
import { EmptyState, ErrorState, LoadingBlock, Modal, PageHeader } from '@/components/Modal.jsx';
import { SortableList } from '@/components/SortableList.jsx';
import { useConfirm } from '@/context/ConfirmContext.jsx';
import { useToast } from '@/context/ToastContext.jsx';
import { useResource } from '@/hooks/useResource.js';
import { api } from '@/services/api.js';

const blank = { name: '', category: '', isEnabled: true };

export default function SkillsPage() {
  const { items, setItems, status, error, reload } = useResource('/skills');
  const toast = useToast();
  const confirm = useConfirm();
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  async function persistOrder(next) {
    const previous = items;
    setItems(next);
    try {
      setItems(await api('/skills/reorder', { method: 'PATCH', body: { ids: next.map((item) => item.id) } }));
    } catch (err) {
      setItems(previous);
      toast.error(err.message);
    }
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const body = { name: editing.name, category: editing.category, isEnabled: editing.isEnabled };
      if (editing.id) await api(`/skills/${editing.id}`, { method: 'PUT', body });
      else await api('/skills', { method: 'POST', body });
      setEditing(null);
      toast.success('Skill saved');
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(skill) {
    const yes = await confirm({ title: 'Delete skill', body: `Remove ${skill.name}?`, confirmLabel: 'Delete' });
    if (!yes) return;
    try {
      await api(`/skills/${skill.id}`, { method: 'DELETE' });
      toast.success('Skill deleted');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function toggle(skill) {
    try {
      await api(`/skills/${skill.id}`, { method: 'PATCH', body: { isEnabled: !skill.isEnabled } });
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (status === 'loading') return <LoadingBlock />;
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />;

  return (
    <div>
      <PageHeader title="Skills" description="Drag to set the public order. Disabled skills stay hidden on the site." action={<Button onClick={() => setEditing(blank)}>Add skill</Button>} />
      {items.length === 0 ? <EmptyState title="No skills yet" body="Add the first category and skill." /> : (
        <SortableList items={items} onReorder={persistOrder} renderItem={(skill) => (
          <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
            <div>
              <p className="text-sm text-ink">{skill.name}</p>
              <p className="text-xs text-faint">{skill.category}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => toggle(skill)}>{skill.isEnabled ? 'Enabled' : 'Disabled'}</Button>
              <Button variant="secondary" onClick={() => setEditing(skill)}>Edit</Button>
              <Button variant="danger" onClick={() => remove(skill)}>Delete</Button>
            </div>
          </div>
        )} />
      )}
      <Modal
        open={Boolean(editing)}
        title={editing?.id ? 'Edit skill' : 'Add skill'}
        onClose={() => setEditing(null)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" form="skill-form" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        )}
      >
        {editing ? (
          <form id="skill-form" onSubmit={save} className="grid gap-4">
            <Field label="Name"><TextInput required value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} /></Field>
            <Field label="Category"><TextInput required value={editing.category} onChange={(event) => setEditing({ ...editing, category: event.target.value })} list="skill-categories" /></Field>
            <datalist id="skill-categories">
              {[...new Set(items.map((item) => item.category))].map((category) => <option key={category} value={category} />)}
            </datalist>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.isEnabled} onChange={(event) => setEditing({ ...editing, isEnabled: event.target.checked })} />
              Show on the portfolio
            </label>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
