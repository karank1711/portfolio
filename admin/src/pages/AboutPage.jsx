import { useEffect, useState } from 'react';
import { Button } from '@/components/Button.jsx';
import { Field, TextArea, TextInput } from '@/components/Field.jsx';
import { ErrorState, LoadingBlock, PageHeader } from '@/components/Modal.jsx';
import { useToast } from '@/context/ToastContext.jsx';
import { api } from '@/services/api.js';

export default function AboutPage() {
  const toast = useToast();
  const [form, setForm] = useState({
    summary: '',
    personalIntro: '',
    currentEducation: '',
    highlights: [],
  });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setStatus('loading');
    try {
      const about = await api('/about');
      setForm({
        summary: about?.summary || '',
        personalIntro: about?.personalIntro || '',
        currentEducation: about?.currentEducation || '',
        highlights: about?.highlights || [],
      });
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  useEffect(() => { load(); }, []);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await api('/about', {
        method: 'PUT',
        body: {
          ...form,
          highlights: form.highlights.filter((item) => item.label.trim() && item.value.trim()),
        },
      });
      toast.success('About section saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') return <LoadingBlock />;
  if (status === 'error') return <ErrorState message={error} onRetry={load} />;

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-5">
      <PageHeader title="About" description="The longer introduction shown beneath the hero." />
      <Field label="Summary"><TextArea name="summary" value={form.summary} onChange={update} /></Field>
      <Field label="Personal introduction"><TextArea name="personalIntro" value={form.personalIntro} onChange={update} /></Field>
      <Field label="Current education"><TextInput name="currentEducation" value={form.currentEducation} onChange={update} /></Field>
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink">Highlights</p>
          <Button variant="secondary" onClick={() => setForm((current) => ({ ...current, highlights: [...current.highlights, { label: '', value: '' }] }))}>Add highlight</Button>
        </div>
        {form.highlights.map((item, index) => (
          <div key={index} className="grid gap-2 border border-line p-3 sm:grid-cols-[160px_minmax(0,1fr)_auto]">
            <TextInput aria-label="Highlight label" value={item.label} onChange={(event) => {
              const highlights = [...form.highlights];
              highlights[index] = { ...item, label: event.target.value };
              setForm((current) => ({ ...current, highlights }));
            }} />
            <TextInput aria-label="Highlight value" value={item.value} onChange={(event) => {
              const highlights = [...form.highlights];
              highlights[index] = { ...item, value: event.target.value };
              setForm((current) => ({ ...current, highlights }));
            }} />
            <Button variant="ghost" onClick={() => setForm((current) => ({ ...current, highlights: current.highlights.filter((_, itemIndex) => itemIndex !== index) }))}>Remove</Button>
          </div>
        ))}
      </div>
      <div><Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save about'}</Button></div>
    </form>
  );
}
