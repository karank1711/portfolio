import { createCollection } from './collection.service.js';
import { clearMedia, replaceMedia } from './media.service.js';
import { removeFile } from './storage.service.js';

const experiences = createCollection({
  table: 'experiences',
  columns: {
    company: 'company',
    role: 'role',
    employmentType: 'employment_type',
    startDate: 'start_date',
    endDate: 'end_date',
    location: 'location',
    description: 'description',
    technologies: 'technologies',
    isCurrent: 'is_current',
  },
  normalize: (row) => {
    if (row.is_current) row.end_date = null;
    return row;
  },
});

export const listExperiences = experiences.list;
export const createExperience = experiences.create;
export const updateExperience = experiences.update;
export async function deleteExperience(id) {
  const raw = await experiences.getRaw(id);
  await experiences.remove(id);
  await removeFile('profile', raw.company_logo_path);
}

export const reorderExperiences = experiences.reorder;

export function uploadExperienceLogo(id, file) {
  return replaceMedia({
    table: 'experiences',
    id,
    bucket: 'profile',
    prefix: 'logos',
    urlColumn: 'company_logo_url',
    pathColumn: 'company_logo_path',
    file,
  });
}

export function deleteExperienceLogo(id) {
  return clearMedia({
    table: 'experiences',
    id,
    bucket: 'profile',
    urlColumn: 'company_logo_url',
    pathColumn: 'company_logo_path',
  });
}
