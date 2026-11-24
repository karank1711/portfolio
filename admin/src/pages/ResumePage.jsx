import { useEffect, useState } from 'react';
import { Button } from '@/components/Button.jsx';
import { Field, TextInput } from '@/components/Field.jsx';
import { ErrorState, LoadingBlock, PageHeader } from '@/components/Modal.jsx';
import { useToast } from '@/context/ToastContext.jsx';
import { api } from '@/services/api.js';

function isGoogleDriveUrl(value) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    return host === 'drive.google.com' || host === 'docs.google.com';
  } catch {
    return false;
  }
}

export default function ResumePage() {
  const toast = useToast();
  const [fileUrl, setFileUrl] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setStatus('loading');
    try {
      const resume = await api('/resume');
      setFileUrl(resume?.fileUrl || '');
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  useEffect(() => { load(); }, []);

  async function onSubmit(event) {
    event.preventDefault();
    const nextUrl = fileUrl.trim();
    if (!nextUrl) {
      toast.error('Paste a Google Drive resume link.');
      return;
    }
    if (!isGoogleDriveUrl(nextUrl)) {
      toast.error('Enter a valid Google Drive sharing link (Anyone with the link).');
      return;
    }

    setSaving(true);
    try {
      const saved = await api('/resume', { method: 'PUT', body: { fileUrl: nextUrl } });
      if (!saved?.fileUrl) {
        throw new Error('Resume link was not saved.');
      }
      setFileUrl(saved.fileUrl);
      toast.success('Resume link saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') return <LoadingBlock />;
  if (status === 'error') return <ErrorState message={error} onRetry={load} />;

  return (
    <form onSubmit={onSubmit} className="max-w-xl">
      <PageHeader
        title="Resume"
        description="Paste a Google Drive PDF sharing link. Set access to Anyone with the link. The public site opens this URL."
      />
      <div className="border border-line bg-elevated p-5">
        <Field
          label="Google Drive resume link"
          hint="Example: https://drive.google.com/file/d/.../view?usp=sharing"
        >
          <TextInput
            name="fileUrl"
            type="url"
            inputMode="url"
            placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
            value={fileUrl}
            onChange={(event) => setFileUrl(event.target.value)}
            autoComplete="off"
          />
        </Field>
        {fileUrl ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm text-accent"
          >
            Open current resume
          </a>
        ) : (
          <p className="mt-3 text-sm text-muted">No resume link saved yet.</p>
        )}
        <div className="mt-4">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>
    </form>
  );
}
