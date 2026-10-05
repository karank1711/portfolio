import { removeFile } from './storage.service.js';
import { createCollection } from './collection.service.js';
import { clearMedia, replaceMedia } from './media.service.js';

const education = createCollection({
  table: 'education',
  columns: {
    institution: 'institution',
    degree: 'degree',
    specialization: 'specialization',
    startYear: 'start_year',
    endYear: 'end_year',
    grade: 'grade',
    description: 'description',
  },
});

export const listEducation = education.list;
export const createEducation = education.create;
export const updateEducation = education.update;
export const reorderEducation = education.reorder;

export async function deleteEducation(id) {
  const raw = await education.getRaw(id);
  await education.remove(id);
  await removeFile('profile', raw.logo_path);
}

export function uploadEducationLogo(id, file) {
  return replaceMedia({
    table: 'education',
    id,
    bucket: 'profile',
    prefix: 'logos',
    urlColumn: 'logo_url',
    pathColumn: 'logo_path',
    file,
  });
}

export function deleteEducationLogo(id) {
  return clearMedia({
    table: 'education',
    id,
    bucket: 'profile',
    urlColumn: 'logo_url',
    pathColumn: 'logo_path',
  });
}
