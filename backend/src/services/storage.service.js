import { ApiError } from '../utils/ApiError.js';
import { getSupabase } from '../config/supabase.js';

const RULES = {
  profile: {
    mime: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    max: 5 * 1024 * 1024,
    label: 'Use a JPEG, PNG, WebP, or AVIF image under 5 MB',
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
  'application/pdf': 'pdf',
};

export function assertFile(bucket, file) {
  if (!file) throw new ApiError(400, 'Choose a file to upload');
  const rule = RULES[bucket];
  if (!rule.mime.includes(file.mimetype)) throw new ApiError(400, rule.label);
  if (file.size > rule.max) throw new ApiError(400, rule.label);
}

export async function uploadFile(bucket, file, prefix = '') {
  assertFile(bucket, file);
  const extension = EXTENSIONS[file.mimetype];
  const id = crypto.randomUUID();
  const path = prefix ? `${prefix}/${id}.${extension}` : `${id}.${extension}`;
  const supabase = getSupabase();
  const { error } = await supabase.storage.from(bucket).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });
  if (error) {
    console.error(error);
    throw new ApiError(500, 'Upload failed. Confirm the storage buckets exist.');
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function removeFile(bucket, path) {
  if (!path) return;
  const { error } = await getSupabase().storage.from(bucket).remove([path]);
  if (error) console.error(error);
}
