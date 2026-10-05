export const inputClass = 'w-full rounded-sm border border-line bg-bg px-3 py-2 text-sm text-ink outline-none transition placeholder:text-faint focus:border-accent';

export const EMPLOYMENT = [
  ['full_time', 'Full-time'],
  ['part_time', 'Part-time'],
  ['internship', 'Internship'],
  ['contract', 'Contract'],
  ['freelance', 'Freelance'],
];

export const PROJECT_STATUS = [
  ['planned', 'Planned'],
  ['in_progress', 'In progress'],
  ['completed', 'Completed'],
  ['archived', 'Archived'],
];

export const ACHIEVEMENT_TYPES = [
  ['certification', 'Certification'],
  ['award', 'Award'],
  ['publication', 'Publication'],
  ['competition', 'Competition'],
  ['other', 'Other'],
];

export const PLATFORMS = [
  ['github', 'GitHub'],
  ['linkedin', 'LinkedIn'],
  ['email', 'Email'],
  ['x', 'X'],
  ['website', 'Website'],
  ['leetcode', 'LeetCode'],
  ['medium', 'Medium'],
  ['dribbble', 'Dribbble'],
  ['behance', 'Behance'],
  ['other', 'Other'],
];

export function labelFor(options, value) {
  return options.find(([key]) => key === value)?.[1] || value || '';
}

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
