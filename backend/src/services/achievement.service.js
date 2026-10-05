import { removeFile } from './storage.service.js';
import { createCollection } from './collection.service.js';
import { clearMedia, replaceMedia } from './media.service.js';

const achievements = createCollection({
  table: 'achievements',
  columns: {
    title: 'title',
    organization: 'organization',
    achievedOn: 'achieved_on',
    description: 'description',
    verificationUrl: 'verification_url',
    type: 'type',
    isEnabled: 'is_enabled',
  },
  filterPublic: (builder) => builder.eq('is_enabled', true),
});

export const listAchievements = achievements.list;
export const createAchievement = achievements.create;
export const updateAchievement = achievements.update;
export const reorderAchievements = achievements.reorder;

export async function deleteAchievement(id) {
  const raw = await achievements.getRaw(id);
  await achievements.remove(id);
  await removeFile('achievements', raw.certificate_path);
}

export function uploadCertificate(id, file) {
  return replaceMedia({
    table: 'achievements',
    id,
    bucket: 'achievements',
    prefix: 'certificates',
    urlColumn: 'certificate_url',
    pathColumn: 'certificate_path',
    file,
  });
}

export function deleteCertificate(id) {
  return clearMedia({
    table: 'achievements',
    id,
    bucket: 'achievements',
    urlColumn: 'certificate_url',
    pathColumn: 'certificate_path',
  });
}
