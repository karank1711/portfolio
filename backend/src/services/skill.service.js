import { createCollection } from './collection.service.js';

const skills = createCollection({
  table: 'skills',
  columns: {
    name: 'name',
    category: 'category',
    isEnabled: 'is_enabled',
  },
  filterPublic: (builder) => builder.eq('is_enabled', true),
  defaults: { is_enabled: true },
});

export const listSkills = skills.list;
export const createSkill = skills.create;
export const updateSkill = skills.update;
export const deleteSkill = skills.remove;
export const reorderSkills = skills.reorder;
