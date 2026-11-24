import { getSupabase } from '../config/supabase.js';
import { query } from '../utils/db.js';
import { toCamel } from '../utils/present.js';
import { invalidatePortfolioCache } from './portfolio.service.js';
import { removeFile } from './storage.service.js';

async function getRaw() {
  return query(getSupabase().from('resume').select('*').limit(1).maybeSingle());
}

export async function getResume() {
  const row = await getRaw();
  if (!row?.file_url) return null;
  return toCamel(row);
}

export async function saveResumeUrl(fileUrl) {
  const existing = await getRaw();
  const payload = {
    file_url: fileUrl,
    file_path: null,
    file_name: 'Google Drive',
    uploaded_at: new Date().toISOString(),
  };
  const saved = existing
    ? await query(getSupabase().from('resume').update(payload).eq('id', existing.id).select('*').single())
    : await query(getSupabase().from('resume').insert(payload).select('*').single());

  if (existing?.file_path) {
    await removeFile('resume', existing.file_path);
  }

  invalidatePortfolioCache();
  return toCamel(saved);
}

export async function deleteResume() {
  const existing = await getRaw();
  if (!existing) return null;
  await query(getSupabase().from('resume').delete().eq('id', existing.id));
  if (existing.file_path) {
    await removeFile('resume', existing.file_path);
  }
  invalidatePortfolioCache();
  return null;
}
