import { createSingleton } from './singleton.service.js';

const about = createSingleton({
  table: 'about',
  columns: {
    summary: 'summary',
    personalIntro: 'personal_intro',
    currentEducation: 'current_education',
    highlights: 'highlights',
  },
});

function present(record) {
  if (!record) return record;
  const { careerInterests, technologies, ...rest } = record;
  return rest;
}

export async function getAbout() {
  return present(await about.get());
}

export async function saveAbout(input) {
  return present(await about.save(input));
}
