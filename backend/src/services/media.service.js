import { getSupabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { query } from '../utils/db.js';
import { toCamel } from '../utils/present.js';
import { removeFile, uploadFile } from './storage.service.js';

export async function replaceMedia({ table, id, bucket, prefix, urlColumn, pathColumn, file }) {
  const existing = await query(getSupabase().from(table).select('*').eq('id', id).maybeSingle());
  if (!existing) throw new ApiError(404, 'Record not found');
  const uploaded = await uploadFile(bucket, file, prefix);
  const updated = await query(
    getSupabase().from(table).update({
      [urlColumn]: uploaded.url,
      [pathColumn]: uploaded.path,
    }).eq('id', id).select('*').single(),
  );
  if (existing[pathColumn] && existing[pathColumn] !== uploaded.path) {
    await removeFile(bucket, existing[pathColumn]);
  }
  return toCamel(updated);
}

export async function clearMedia({ table, id, bucket, urlColumn, pathColumn }) {
  const existing = await query(getSupabase().from(table).select('*').eq('id', id).maybeSingle());
  if (!existing) throw new ApiError(404, 'Record not found');
  const updated = await query(
    getSupabase().from(table).update({
      [urlColumn]: null,
      [pathColumn]: null,
    }).eq('id', id).select('*').single(),
  );
  await removeFile(bucket, existing[pathColumn]);
  return toCamel(updated);
}
