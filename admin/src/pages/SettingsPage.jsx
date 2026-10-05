import { useState } from 'react';
import { Button } from '@/components/Button.jsx';
import { Field, TextInput } from '@/components/Field.jsx';
import { PageHeader } from '@/components/Modal.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useToast } from '@/context/ToastContext.jsx';
import { api } from '@/services/api.js';

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name || '');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  async function saveName(event) {
    event.preventDefault();
    setSavingName(true);
    try {
      const updated = await api('/auth/me', { method: 'PATCH', body: { name } });
      setUser(updated);
      toast.success('Name updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingName(false);
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    setSavingPassword(true);
    try {
      await api('/auth/password', { method: 'POST', body: passwords });
      setPasswords({ currentPassword: '', newPassword: '' });
      toast.success('Password updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="grid max-w-xl gap-8">
      <PageHeader title="Settings" description="Account details for this admin panel. Portfolio content is edited in the sections to the left." />
      <form onSubmit={saveName} className="grid gap-4 border border-line bg-elevated p-5">
        <h2 className="font-serif text-2xl">Account</h2>
        <Field label="Email"><TextInput value={user?.email || ''} disabled /></Field>
        <Field label="Display name"><TextInput required value={name} onChange={(event) => setName(event.target.value)} /></Field>
        <div><Button type="submit" disabled={savingName}>{savingName ? 'Saving…' : 'Save name'}</Button></div>
      </form>
      <form onSubmit={savePassword} className="grid gap-4 border border-line bg-elevated p-5">
        <h2 className="font-serif text-2xl">Password</h2>
        <Field label="Current password"><TextInput type="password" required autoComplete="current-password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} /></Field>
        <Field label="New password" hint="At least 8 characters, with a letter and a number."><TextInput type="password" required autoComplete="new-password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} /></Field>
        <div><Button type="submit" disabled={savingPassword}>{savingPassword ? 'Updating…' : 'Update password'}</Button></div>
      </form>
    </div>
  );
}
