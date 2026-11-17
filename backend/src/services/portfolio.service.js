import { getAbout } from './about.service.js';
import { listAchievements } from './achievement.service.js';
import { listEducation } from './education.service.js';
import { listExperiences } from './experience.service.js';
import { getProfile } from './profile.service.js';
import { listProjects } from './project.service.js';
import { getResume } from './resume.service.js';
import { listSkills } from './skill.service.js';
import { listSocialLinks } from './social.service.js';

let cachedPortfolio = null;
let cachedPortfolioTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export function invalidatePortfolioCache() {
  cachedPortfolio = null;
  cachedPortfolioTime = 0;
}

export async function getPublicPortfolio() {
  const now = Date.now();
  if (cachedPortfolio && now - cachedPortfolioTime < CACHE_TTL_MS) {
    return cachedPortfolio;
  }

  const [profile, about, skills, experiences, education, projects, achievements, socialLinks, resume] = await Promise.all([
    getProfile(),
    getAbout(),
    listSkills({ all: false }),
    listExperiences({ all: false }),
    listEducation({ all: false }),
    listProjects({ all: false }),
    listAchievements({ all: false }),
    listSocialLinks({ all: false }),
    getResume(),
  ]);

  const result = { profile, about, skills, experiences, education, projects, achievements, socialLinks, resume };
  cachedPortfolio = result;
  cachedPortfolioTime = now;
  return result;
}
