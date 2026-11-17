import { getSupabase } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import { query } from '../utils/db.js';
import { toCamel } from '../utils/present.js';
import { removeFile, uploadFile } from './storage.service.js';
import { createSingleton } from './singleton.service.js';
import { invalidatePortfolioCache } from './portfolio.service.js';

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
    profileMediaType: 'profile_media_type',
  },
});

export const getProfile = profile.get;
export async function saveProfile(input) {
  const result = await profile.save(input);
  invalidatePortfolioCache();
  return result;
}

async function ensureProfile() {
  const existing = await profile.getRaw();
  if (existing) return existing;
  return query(getSupabase().from('profile').insert({}).select('*').single());
}

export async function uploadProfileMedia(file) {
  if (!file) throw new ApiError(400, 'Choose a file to upload');
  const existing = await ensureProfile();
  const isVideo = file.mimetype.startsWith('video/');
  const mediaType = isVideo ? 'video' : 'image';
  const prefix = isVideo ? 'videos' : 'photos';

  const uploaded = await uploadFile('profile', file, prefix);

  const updatePayload = {
    profile_media_type: mediaType,
    profile_media_url: uploaded.url,
    profile_media_path: uploaded.path,
  };

  if (!isVideo) {
    updatePayload.profile_image_url = uploaded.url;
    updatePayload.profile_image_path = uploaded.path;
  }

  const updated = await query(
    getSupabase().from('profile').update(updatePayload).eq('id', existing.id).select('*').single(),
  );

  // Clean up previous storage file if it changed
  if (existing.profile_media_path && existing.profile_media_path !== uploaded.path) {
    await removeFile('profile', existing.profile_media_path);
  }
  if (!isVideo && existing.profile_image_path && existing.profile_image_path !== uploaded.path && existing.profile_image_path !== existing.profile_media_path) {
    await removeFile('profile', existing.profile_image_path);
  }

  invalidatePortfolioCache();
  return toCamel(updated);
}

export async function deleteProfileMedia() {
  const existing = await profile.getRaw();
  if (!existing) return profile.get();

  const updatePayload = {
    profile_media_type: 'image',
    profile_media_url: null,
    profile_media_path: null,
    profile_image_url: null,
    profile_image_path: null,
  };

  const updated = await query(
    getSupabase().from('profile').update(updatePayload).eq('id', existing.id).select('*').single(),
  );

  if (existing.profile_media_path) {
    await removeFile('profile', existing.profile_media_path);
  }
  if (existing.profile_image_path && existing.profile_image_path !== existing.profile_media_path) {
    await removeFile('profile', existing.profile_image_path);
  }

  invalidatePortfolioCache();
  return toCamel(updated);
}

export const uploadProfilePhoto = uploadProfileMedia;
export const deleteProfilePhoto = deleteProfileMedia;
