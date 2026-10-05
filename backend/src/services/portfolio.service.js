import { getAbout } from './about.service.js';
import { listAchievements } from './achievement.service.js';
import { listEducation } from './education.service.js';
import { listExperiences } from './experience.service.js';
import { getProfile } from './profile.service.js';
import { listProjects } from './project.service.js';
import { getResume } from './resume.service.js';
import { listSkills } from './skill.service.js';
import { listSocialLinks } from './social.service.js';

export async function getPublicPortfolio() {
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

  return { profile, about, skills, experiences, education, projects, achievements, socialLinks, resume };
}
