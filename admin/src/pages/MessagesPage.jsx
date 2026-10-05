import { useEffect, useState } from 'react';
import { Button } from '@/components/Button.jsx';
import { EmptyState, ErrorState, LoadingBlock, PageHeader } from '@/components/Modal.jsx';
import { useConfirm } from '@/context/ConfirmContext.jsx';
import { useToast } from '@/context/ToastContext.jsx';
import { api } from '@/services/api.js';
import { inputClass } from '@/utils/options.js';

export default function MessagesPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [active, setActive] = useState(null);

  async function load() {
    setStatus('loading');
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (unreadOnly) params.set('unread', 'true');
      const query = params.toString();
      setItems(await api(`/messages${query ? `?${query}` : ''}`));
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  useEffect(() => { load(); }, [unreadOnly]);

  async function openMessage(message) {
    setActive(message);
    if (!message.isRead) {
      try {
        const updated = await api(`/messages/${message.id}`, { method: 'PATCH', body: { isRead: true } });
        setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        setActive(updated);
      } catch (err) {
        toast.error(err.message);
      }
    }
  }

  async function toggleRead(message) {
    try {
      const updated = await api(`/messages/${message.id}`, { method: 'PATCH', body: { isRead: !message.isRead } });
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      if (active?.id === updated.id) setActive(updated);
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function remove(message) {
    const yes = await confirm({ title: 'Delete message', body: 'This cannot be undone.', confirmLabel: 'Delete' });
    if (!yes) return;
    try {
      await api(`/messages/${message.id}`, { method: 'DELETE' });
      setActive(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function markAll() {
    try {
      await api('/messages/read-all', { method: 'PATCH' });
      toast.success('All messages marked read');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      <PageHeader title="Messages" description="Messages sent from the public contact form." action={<Button variant="secondary" onClick={markAll}>Mark all read</Button>} />
      <form className="mb-4 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); load(); }}>
        <input className={inputClass} placeholder="Search name or email" value={search} onChange={(event) => setSearch(event.target.value)} />
        <Button variant={unreadOnly ? 'primary' : 'secondary'} onClick={() => setUnreadOnly((value) => !value)}>{unreadOnly ? 'Showing unread' : 'All messages'}</Button>
        <Button type="submit" variant="secondary">Search</Button>
      </form>
      {status === 'loading' ? <LoadingBlock /> : null}
      {status === 'error' ? <ErrorState message={error} onRetry={load} /> : null}
      {status === 'ready' && items.length === 0 ? <EmptyState title="No messages" body="New contact form submissions will show up here." /> : null}
      {status === 'ready' && items.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="grid gap-2">
            {items.map((message) => (
              <button type="button" key={message.id} onClick={() => openMessage(message)} className={`border px-4 py-3 text-left ${active?.id === message.id ? 'border-ink bg-elevated' : 'border-line'}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-ink">{message.name}</p>
                  <span className="text-xs text-faint">{message.isRead ? 'Read' : 'Unread'}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{message.email}</p>
                <p className="mt-2 line-clamp-2 text-sm text-muted">{message.message}</p>
              </button>
            ))}
          </div>
          <article className="border border-line bg-elevated p-5">
            {active ? (
              <>
                <p className="text-xs uppercase tracking-[0.14em] text-faint">{new Date(active.createdAt).toLocaleString()}</p>
                <h2 className="mt-2 font-serif text-3xl text-ink">{active.name}</h2>
                <a href={`mailto:${active.email}`} className="mt-1 inline-block text-sm text-accent">{active.email}</a>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted">{active.message}</p>
                <div className="mt-5 flex gap-2">
                  <Button variant="secondary" onClick={() => toggleRead(active)}>{active.isRead ? 'Mark unread' : 'Mark read'}</Button>
                  <Button variant="danger" onClick={() => remove(active)}>Delete</Button>
                </div>
              </>
            ) : <p className="text-sm text-muted">Select a message to read it.</p>}
          </article>
        </div>
      ) : null}
    </div>
  );
}
