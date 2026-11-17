import { ApiError } from '../utils/ApiError.js';
import { getSupabase } from '../config/supabase.js';

const RULES = {
  profile: {
    mime: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'video/mp4',
      'video/webm',
    ],
    max: 25 * 1024 * 1024,
    label: 'Use a JPEG, PNG, WebP image (under 5 MB) or MP4, WebM video (under 25 MB)',
  },
  projects: {
    mime: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    max: 5 * 1024 * 1024,
    label: 'Use a JPEG, PNG, WebP, or AVIF image under 5 MB',
  },
  achievements: {
    mime: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'],
    max: 8 * 1024 * 1024,
    label: 'Use an image or PDF under 8 MB',
  },
  resume: {
    mime: ['application/pdf'],
    max: 10 * 1024 * 1024,
    label: 'Resume must be a PDF under 10 MB',
  },
};

const EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'application/pdf': 'pdf',
};

export function assertFile(bucket, file) {
  if (!file) throw new ApiError(400, 'Choose a file to upload');
  if ((!file.mimetype || file.mimetype === 'application/octet-stream') && file.originalname) {
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (ext === 'mp4') file.mimetype = 'video/mp4';
    else if (ext === 'webm') file.mimetype = 'video/webm';
    else if (ext === 'jpg' || ext === 'jpeg') file.mimetype = 'image/jpeg';
    else if (ext === 'png') file.mimetype = 'image/png';
    else if (ext === 'webp') file.mimetype = 'image/webp';
    else if (ext === 'avif') file.mimetype = 'image/avif';
    else if (ext === 'pdf') file.mimetype = 'application/pdf';
  }
  const rule = RULES[bucket];
  if (!rule || !rule.mime.includes(file.mimetype)) {
    throw new ApiError(400, rule?.label || 'Unsupported file type');
  }
  const isVideo = file.mimetype.startsWith('video/');
  const max = isVideo ? 25 * 1024 * 1024 : (bucket === 'profile' ? 5 * 1024 * 1024 : rule.max);
  if (file.size > max) {
    throw new ApiError(400, isVideo ? 'Video must be under 25 MB' : `Image must be under ${Math.round(max / (1024 * 1024))} MB`);
  }
}

export async function uploadFile(bucket, file, prefix = '') {
  assertFile(bucket, file);
  const extension = EXTENSIONS[file.mimetype] || file.originalname?.split('.').pop()?.toLowerCase() || 'bin';
  const id = crypto.randomUUID();
  const path = prefix ? `${prefix}/${id}.${extension}` : `${id}.${extension}`;
  const supabase = getSupabase();
  const { error } = await supabase.storage.from(bucket).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });
  if (error) {
    console.error('Supabase storage upload error:', error);
    throw new ApiError(500, error.message || 'Upload failed. Confirm the storage buckets exist.');
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function removeFile(bucket, path) {
  if (!path) return;
  const { error } = await getSupabase().storage.from(bucket).remove([path]);
  if (error) console.error(error);
}
