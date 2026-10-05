const EMPLOYMENT = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  internship: 'Internship',
  contract: 'Contract',
  freelance: 'Freelance',
};

const ACHIEVEMENT_TYPES = {
  certification: 'Certification',
  award: 'Award',
  publication: 'Publication',
  competition: 'Competition',
  other: 'Other',
};

const PROJECT_STATUS = {
  planned: 'Planned',
  in_progress: 'In progress',
  completed: 'Completed',
  archived: 'Archived',
};

export function employmentLabel(value) {
  return EMPLOYMENT[value] || '';
}

export function achievementType(value) {
  return ACHIEVEMENT_TYPES[value] || 'Achievement';
}

export function projectStatus(value) {
  return PROJECT_STATUS[value] || '';
}

export function formatMonth(value) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatRange(start, end, current = false) {
  const from = formatMonth(start);
  if (current || (start && !end)) return from ? `${from} — Present` : 'Present';
  if (from && end) return `${from} — ${formatMonth(end)}`;
  return from || formatMonth(end);
}

export function formatYearRange(start, end) {
  if (!start && !end) return '';
  if (!end) return `${start} — Present`;
  return `${start} — ${end}`;
}

export function initials(name = '') {
  const letters = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('');
  return letters || '•';
}

export function isPdf(url = '') {
  return url.split('?')[0].toLowerCase().endsWith('.pdf');
}

export function joinList(items) {
  return (items || []).filter(Boolean).join(' · ');
}

export function textLines(value) {
  return String(value || '')
    .split(/\n+/)
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
}
