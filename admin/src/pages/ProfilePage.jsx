import { useEffect, useState } from 'react';
import { Button } from '@/components/Button.jsx';
import { Field, TextArea, TextInput } from '@/components/Field.jsx';
import { ErrorState, LoadingBlock, PageHeader } from '@/components/Modal.jsx';
import { useToast } from '@/context/ToastContext.jsx';
import { api } from '@/services/api.js';

const empty = {
  fullName: '',
  professionalTitle: '',
  rolesText: '',
  shortIntro: '',
  location: '',
  email: '',
  phone: '',
};

export default function ProfilePage() {
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [photo, setPhoto] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setStatus('loading');
    try {
      const profile = await api('/profile');
      setForm({
        fullName: profile?.fullName || '',
        professionalTitle: profile?.professionalTitle || '',
        rolesText: (profile?.roles || []).join('\n'),
        shortIntro: profile?.shortIntro || '',
        location: profile?.location || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
      });
      setPhoto(profile?.profileImageUrl || '');
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  useEffect(() => { load(); }, []);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await api('/profile', {
        method: 'PUT',
        body: {
          fullName: form.fullName,
          professionalTitle: form.professionalTitle,
          roles: form.rolesText.split('\n').map((item) => item.trim()).filter(Boolean),
          shortIntro: form.shortIntro,
          location: form.location,
          email: form.email,
          phone: form.phone,
        },
      });
      setPhoto(saved.profileImageUrl || photo);
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadPhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const data = new FormData();
    data.append('photo', file);
    try {
      const saved = await api('/profile/photo', { method: 'POST', formData: data });
      setPhoto(saved.profileImageUrl || '');
      toast.success('Photo updated');
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function removePhoto() {
    try {
      const saved = await api('/profile/photo', { method: 'DELETE' });
      setPhoto(saved?.profileImageUrl || '');
      toast.success('Photo removed');
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (status === 'loading') return <LoadingBlock />;
  if (status === 'error') return <ErrorState message={error} onRetry={load} />;

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-6">
      <PageHeader title="Profile" description="This is the public introduction: name, title, photo, and contact details." />
      <div className="flex flex-wrap items-center gap-4 border border-line bg-elevated p-4">
        {photo ? <img src={photo} alt="" className="h-24 w-20 object-cover" /> : <div className="grid h-24 w-20 place-items-center bg-surface text-xs text-faint">No photo</div>}
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer border border-line px-3 py-2 text-sm">
            Upload photo
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={uploadPhoto} />
          </label>
          {photo ? <Button variant="secondary" onClick={removePhoto}>Remove</Button> : null}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name"><TextInput name="fullName" required value={form.fullName} onChange={update} /></Field>
        <Field label="Professional title"><TextInput name="professionalTitle" value={form.professionalTitle} onChange={update} /></Field>
        <Field label="Location"><TextInput name="location" value={form.location} onChange={update} /></Field>
        <Field label="Email"><TextInput name="email" type="email" value={form.email} onChange={update} /></Field>
        <Field label="Phone"><TextInput name="phone" value={form.phone} onChange={update} /></Field>
      </div>
      <Field label="Rotating roles" hint="One role per line. These animate in the hero.">
        <TextArea name="rolesText" value={form.rolesText} onChange={update} />
      </Field>
      <Field label="Short introduction">
        <TextArea name="shortIntro" value={form.shortIntro} onChange={update} />
      </Field>
      <div><Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</Button></div>
    </form>
  );
}
