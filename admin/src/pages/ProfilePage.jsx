import { useEffect, useState } from 'react';
import { Button } from '@/components/Button.jsx';
import { Field, TextArea, TextInput } from '@/components/Field.jsx';
import { ErrorState, LoadingBlock, PageHeader } from '@/components/Modal.jsx';
import { useToast } from '@/context/ToastContext.jsx';
import { api, uploadWithProgress } from '@/services/api.js';

const empty = {
  fullName: '',
  professionalTitle: '',
  rolesText: '',
  shortIntro: '',
  location: '',
  email: '',
  phone: '',
};

function isVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const clean = url.split('?')[0].toLowerCase();
  return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.includes('/videos/');
}

export default function ProfilePage() {
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [mediaType, setMediaType] = useState('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadState, setUploadState] = useState({
    uploading: false,
    progress: 0,
    stage: '',
  });

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
      const currentType = profile?.profileMediaType === 'video' ? 'video' : 'image';
      setMediaType(currentType);
      setMediaUrl(profile?.profileMediaUrl || profile?.profileImageUrl || '');
      setImageUrl(profile?.profileImageUrl || '');
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

  async function handleMediaTypeChange(newType) {
    setMediaType(newType);
    try {
      await api('/profile', {
        method: 'PUT',
        body: {
          fullName: form.fullName,
          professionalTitle: form.professionalTitle,
          roles: form.rolesText.split('\n').map((item) => item.trim()).filter(Boolean),
          shortIntro: form.shortIntro,
          location: form.location,
          email: form.email,
          phone: form.phone,
          profileMediaType: newType,
        },
      });
      toast.success(`Active hero media set to ${newType}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update media type');
    }
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
          profileMediaType: mediaType,
        },
      });
      if (saved.profileMediaType) setMediaType(saved.profileMediaType);
      if (saved.profileMediaUrl) setMediaUrl(saved.profileMediaUrl);
      if (saved.profileImageUrl) setImageUrl(saved.profileImageUrl);
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadMedia(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (mediaType === 'image') {
      const validImages = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
      const validExts = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
      if (!validImages.includes(file.type) && !validExts.includes(ext)) {
        toast.error('Please select a JPG, PNG, WebP, or AVIF image.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size must be under 5 MB.');
        return;
      }
    } else {
      const validVideos = ['video/mp4', 'video/webm'];
      const validExts = ['mp4', 'webm'];
      if (!validVideos.includes(file.type) && !validExts.includes(ext)) {
        toast.error('Please select an MP4 or WebM video.');
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        toast.error('Video file size must be under 25 MB.');
        return;
      }
    }

    setUploadState({
      uploading: true,
      progress: 0,
      stage: mediaType === 'video' ? 'Uploading video…' : 'Uploading image…',
    });

    const data = new FormData();
    data.append('media', file);

    try {
      const saved = await uploadWithProgress('/profile/media', data, {
        onProgress: (percent) => {
          setUploadState({
            uploading: true,
            progress: percent,
            stage: percent < 100
              ? `Uploading ${mediaType}: ${percent}%`
              : 'Processing & saving…',
          });
        },
        timeout: 300000,
      });

      setMediaUrl(saved.profileMediaUrl || '');
      setMediaType(saved.profileMediaType || mediaType);
      if (saved.profileImageUrl) setImageUrl(saved.profileImageUrl);
      toast.success(mediaType === 'video' ? 'Profile video uploaded' : 'Profile photo uploaded');
    } catch (err) {
      toast.error(err.message || 'Media upload failed');
    } finally {
      setUploadState({ uploading: false, progress: 0, stage: '' });
    }
  }

  async function removeMedia() {
    setUploadState({ uploading: true, progress: 0, stage: 'Removing…' });
    try {
      await api('/profile/media', { method: 'DELETE' });
      setMediaUrl('');
      setImageUrl('');
      toast.success(mediaType === 'video' ? 'Video removed' : 'Photo removed');
    } catch (err) {
      toast.error(err.message || 'Failed to remove media');
    } finally {
      setUploadState({ uploading: false, progress: 0, stage: '' });
    }
  }

  if (status === 'loading') return <LoadingBlock />;
  if (status === 'error') return <ErrorState message={error} onRetry={load} />;

  const isCurrentVideo = mediaType === 'video' && Boolean(mediaUrl) && isVideoUrl(mediaUrl);
  const activeImage = imageUrl || (!isVideoUrl(mediaUrl) ? mediaUrl : '');
  const isUploading = uploadState.uploading;

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-6">
      <PageHeader title="Profile" description="This is the public introduction: name, title, portrait media, and contact details." />
      
      <div className="border border-line bg-elevated p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <h3 className="text-sm font-semibold text-ink">Hero Portrait Media</h3>
            <p className="text-xs text-muted">Choose whether to display an image or video in the portfolio hero section.</p>
          </div>
          <div className="inline-flex rounded-md border border-line bg-surface p-0.5" role="tablist">
            <button
              type="button"
              role="tab"
              disabled={isUploading}
              aria-selected={mediaType === 'image'}
              className={`rounded px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${mediaType === 'image' ? 'bg-elevated text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
              onClick={() => handleMediaTypeChange('image')}
            >
              Image
            </button>
            <button
              type="button"
              role="tab"
              disabled={isUploading}
              aria-selected={mediaType === 'video'}
              className={`rounded px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${mediaType === 'video' ? 'bg-elevated text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
              onClick={() => handleMediaTypeChange('video')}
            >
              Video
            </button>
          </div>
        </div>

        {mediaType === 'image' ? (
          <div className="flex flex-wrap items-center gap-5">
            <div className="relative aspect-square h-28 w-28 overflow-hidden rounded-xl border border-line bg-surface">
              {activeImage ? (
                <img src={activeImage} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs text-faint">No image</div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className={`cursor-pointer rounded-sm border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition hover:border-ink ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
                  {isUploading ? uploadState.stage : activeImage ? 'Replace image' : 'Upload image'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={isUploading}
                    className="sr-only"
                    onChange={uploadMedia}
                  />
                </label>
                {activeImage ? (
                  <Button variant="secondary" onClick={removeMedia} disabled={isUploading}>
                    Remove
                  </Button>
                ) : null}
              </div>
              {isUploading ? (
                <div className="w-full max-w-xs space-y-1">
                  <div className="flex justify-between text-xs text-muted">
                    <span>{uploadState.stage}</span>
                    <span>{uploadState.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full bg-accent transition-all duration-200"
                      style={{ width: `${Math.max(5, uploadState.progress)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted">Supports JPG, PNG, WebP or AVIF (max 5 MB).</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-5">
            <div className="relative aspect-square h-28 w-28 overflow-hidden rounded-xl border border-line bg-surface">
              {isCurrentVideo ? (
                <video
                  src={mediaUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-center p-2 text-xs text-faint">No video uploaded</div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className={`cursor-pointer rounded-sm border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition hover:border-ink ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
                  {isUploading ? uploadState.stage : isCurrentVideo ? 'Replace video' : 'Upload video'}
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    disabled={isUploading}
                    className="sr-only"
                    onChange={uploadMedia}
                  />
                </label>
                {isCurrentVideo ? (
                  <Button variant="secondary" onClick={removeMedia} disabled={isUploading}>
                    Remove
                  </Button>
                ) : null}
              </div>
              {isUploading ? (
                <div className="w-full max-w-xs space-y-1">
                  <div className="flex justify-between text-xs text-muted">
                    <span>{uploadState.stage}</span>
                    <span>{uploadState.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
                    <div
                      className="h-full bg-accent transition-all duration-200"
                      style={{ width: `${Math.max(5, uploadState.progress)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted">Supports MP4 or WebM (max 25 MB). Video autoplays muted in a loop.</p>
              )}
            </div>
          </div>
        )}
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
      <div><Button type="submit" disabled={saving || isUploading}>{saving ? 'Saving…' : 'Save profile'}</Button></div>
    </form>
  );
}
