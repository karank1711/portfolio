import { useEffect, useState } from 'react';
import { Button } from '@/components/Button.jsx';
import { ErrorState, LoadingBlock, PageHeader } from '@/components/Modal.jsx';
import { useConfirm } from '@/context/ConfirmContext.jsx';
import { useToast } from '@/context/ToastContext.jsx';
import { api } from '@/services/api.js';

export default function ResumePage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [resume, setResume] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function load() {
    setStatus('loading');
    try {
      setResume(await api('/resume'));
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  useEffect(() => { load(); }, []);

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const data = new FormData();
    data.append('resume', file);
    try {
      setResume(await api('/resume', { method: 'POST', formData: data }));
      toast.success('Resume uploaded');
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function remove() {
    const yes = await confirm({ title: 'Delete resume', body: 'The download button will disappear from the public site.', confirmLabel: 'Delete' });
    if (!yes) return;
    try {
      await api('/resume', { method: 'DELETE' });
      setResume(null);
      toast.success('Resume deleted');
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (status === 'loading') return <LoadingBlock />;
  if (status === 'error') return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="max-w-xl">
      <PageHeader title="Resume" description="Upload a PDF. The public site links to the current file." />
      <div className="border border-line bg-elevated p-5">
        {resume?.fileUrl ? (
          <div className="mb-4">
            <p className="text-sm text-ink">{resume.fileName || 'resume.pdf'}</p>
            <a href={resume.fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-accent">Open current resume</a>
          </div>
        ) : <p className="mb-4 text-sm text-muted">No resume uploaded.</p>}
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer bg-accent px-3 py-2 text-sm text-accent-ink">
            {resume?.fileUrl ? 'Replace resume' : 'Upload resume'}
            <input type="file" accept="application/pdf" className="sr-only" onChange={upload} />
          </label>
          {resume?.fileUrl ? <Button variant="danger" onClick={remove}>Delete</Button> : null}
        </div>
      </div>
    </div>
  );
}
