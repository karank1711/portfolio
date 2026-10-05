import { getSupabase } from '../config/supabase.js';
import { query } from '../utils/db.js';
import { toCamel } from '../utils/present.js';
import { removeFile, uploadFile } from './storage.service.js';

async function getRaw() {
  return query(getSupabase().from('resume').select('*').limit(1).maybeSingle());
}

export async function getResume() {
  const row = await getRaw();
  if (!row?.file_url) return null;
  return toCamel(row);
}

export async function uploadResume(file) {
  const existing = await getRaw();
  const uploaded = await uploadFile('resume', file);
  const payload = {
    file_url: uploaded.url,
    file_path: uploaded.path,
    file_name: file.originalname?.replace(/[^\w.\- ()]/g, '') || 'resume.pdf',
    uploaded_at: new Date().toISOString(),
  };
  const saved = existing
    ? await query(getSupabase().from('resume').update(payload).eq('id', existing.id).select('*').single())
    : await query(getSupabase().from('resume').insert(payload).select('*').single());
  if (existing?.file_path && existing.file_path !== uploaded.path) {
    await removeFile('resume', existing.file_path);
  }
  return toCamel(saved);
}

export async function deleteResume() {
  const existing = await getRaw();
  if (!existing) return null;
  await query(getSupabase().from('resume').delete().eq('id', existing.id));
  await removeFile('resume', existing.file_path);
  return null;
}
