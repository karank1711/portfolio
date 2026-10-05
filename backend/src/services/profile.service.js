import { getSupabase } from '../config/supabase.js';
import { query } from '../utils/db.js';
import { clearMedia, replaceMedia } from './media.service.js';
import { createSingleton } from './singleton.service.js';

const profile = createSingleton({
  table: 'profile',
  columns: {
    fullName: 'full_name',
    professionalTitle: 'professional_title',
    roles: 'roles',
    shortIntro: 'short_intro',
    location: 'location',
    email: 'email',
    phone: 'phone',
  },
});

export const getProfile = profile.get;
export const saveProfile = profile.save;

async function ensureProfile() {
  const existing = await profile.getRaw();
  if (existing) return existing;
  return query(getSupabase().from('profile').insert({}).select('*').single());
}

export async function uploadProfilePhoto(file) {
  const existing = await ensureProfile();
  return replaceMedia({
    table: 'profile',
    id: existing.id,
    bucket: 'profile',
    prefix: 'photos',
    urlColumn: 'profile_image_url',
    pathColumn: 'profile_image_path',
    file,
  });
}

export async function deleteProfilePhoto() {
  const existing = await profile.getRaw();
  if (!existing?.profile_image_path && !existing?.profile_image_url) return profile.get();
  return clearMedia({
    table: 'profile',
    id: existing.id,
    bucket: 'profile',
    urlColumn: 'profile_image_url',
    pathColumn: 'profile_image_path',
  });
}
