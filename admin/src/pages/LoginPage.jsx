import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button.jsx';
import { Field, TextInput } from '@/components/Field.jsx';
import { useAuth } from '@/context/AuthContext.jsx';

export default function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [show, setShow] = useState(false);

  if (status === 'authenticated') return <Navigate to={location.state?.from || '/'} replace />;

  async function onSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden border-r border-line bg-surface p-12 lg:flex lg:flex-col lg:justify-between">
        <p className="font-serif text-3xl text-ink">Portfolio</p>
        <p className="max-w-sm font-serif text-4xl leading-tight text-ink">A quiet place to keep your work current.</p>
      </div>
      <div className="flex items-center justify-center px-5 py-16">
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          <h1 className="font-serif text-4xl text-ink">Sign in</h1>
          <p className="mt-2 text-sm text-muted">Manage the public portfolio from here.</p>
          <div className="mt-8 grid gap-4">
            <Field label="Email">
              <TextInput type="email" autoComplete="username" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </Field>
            <Field label="Password">
              <TextInput type={show ? 'text' : 'password'} autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            </Field>
            <button type="button" className="w-fit text-xs text-muted" onClick={() => setShow((value) => !value)}>
              {show ? 'Hide password' : 'Show password'}
            </button>
            {error ? <p className="text-sm text-accent">{error}</p> : null}
            <Button type="submit" disabled={submitting || status === 'loading'}>{submitting ? 'Signing in…' : 'Sign in'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
