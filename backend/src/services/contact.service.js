import { getSupabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { query } from '../utils/db.js';
import { toCamel } from '../utils/present.js';
import { notifyContactMessage } from './mail.service.js';

function cleanSearch(value) {
  return String(value || '').replace(/[^a-zA-Z0-9@.\- ]/g, '').trim();
}

export async function createMessage({ name, email, message, company }) {
  if (company) return { delivered: true };
  const row = await query(
    getSupabase().from('contact_messages').insert({ name, email, message }).select('id').single(),
  );
  try {
    await notifyContactMessage({ name, email, message });
  } catch (error) {
    console.error('Contact email notification failed');
    if (error instanceof ApiError) throw error;
    throw new ApiError(422, 'Message could not be sent. Try again later.');
  }
  return { delivered: true, id: row.id };
}

export async function listMessages({ search, unread } = {}) {
  let builder = getSupabase().from('contact_messages').select('*').order('created_at', { ascending: false });
  if (unread === 'true' || unread === true) builder = builder.eq('is_read', false);
  const term = cleanSearch(search);
  if (term) builder = builder.or(`name.ilike.%${term}%,email.ilike.%${term}%`);
  const rows = await query(builder);
  return (rows || []).map((row) => toCamel(row));
}

export async function updateMessage(id, { isRead }) {
  const row = await query(
    getSupabase().from('contact_messages').update({ is_read: isRead }).eq('id', id).select('*').maybeSingle(),
  );
  if (!row) throw new ApiError(404, 'Message not found');
  return toCamel(row);
}

export async function deleteMessage(id) {
  const existing = await query(getSupabase().from('contact_messages').select('id').eq('id', id).maybeSingle());
  if (!existing) throw new ApiError(404, 'Message not found');
  await query(getSupabase().from('contact_messages').delete().eq('id', id));
}

export async function markAllRead() {
  await query(getSupabase().from('contact_messages').update({ is_read: true }).eq('is_read', false));
  return listMessages();
}
