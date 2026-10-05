import * as skillService from '../services/skill.service.js';
import * as experienceService from '../services/experience.service.js';
import * as educationService from '../services/education.service.js';
import * as achievementService from '../services/achievement.service.js';
import * as socialService from '../services/social.service.js';
import * as resumeService from '../services/resume.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';

function listHandler(list) {
  return asyncHandler(async (req, res) => {
    ok(res, await list({ all: Boolean(req.user) }));
  });
}

export const listSkills = listHandler(skillService.listSkills);
export const createSkill = asyncHandler(async (req, res) => ok(res, await skillService.createSkill(req.body), 201));
export const updateSkill = asyncHandler(async (req, res) => ok(res, await skillService.updateSkill(req.params.id, req.body)));
export const deleteSkill = asyncHandler(async (req, res) => {
  await skillService.deleteSkill(req.params.id);
  ok(res, { deleted: true });
});
export const reorderSkills = asyncHandler(async (req, res) => ok(res, await skillService.reorderSkills(req.body.ids)));

export const listExperiences = listHandler(experienceService.listExperiences);
export const createExperience = asyncHandler(async (req, res) => ok(res, await experienceService.createExperience(req.body), 201));
export const updateExperience = asyncHandler(async (req, res) => ok(res, await experienceService.updateExperience(req.params.id, req.body)));
export const deleteExperience = asyncHandler(async (req, res) => {
  await experienceService.deleteExperience(req.params.id);
  ok(res, { deleted: true });
});
export const reorderExperiences = asyncHandler(async (req, res) => ok(res, await experienceService.reorderExperiences(req.body.ids)));
export const uploadExperienceLogo = asyncHandler(async (req, res) => ok(res, await experienceService.uploadExperienceLogo(req.params.id, req.file)));
export const deleteExperienceLogo = asyncHandler(async (req, res) => ok(res, await experienceService.deleteExperienceLogo(req.params.id)));

export const listEducation = listHandler(educationService.listEducation);
export const createEducation = asyncHandler(async (req, res) => ok(res, await educationService.createEducation(req.body), 201));
export const updateEducation = asyncHandler(async (req, res) => ok(res, await educationService.updateEducation(req.params.id, req.body)));
export const deleteEducation = asyncHandler(async (req, res) => {
  await educationService.deleteEducation(req.params.id);
  ok(res, { deleted: true });
});
export const reorderEducation = asyncHandler(async (req, res) => ok(res, await educationService.reorderEducation(req.body.ids)));
export const uploadEducationLogo = asyncHandler(async (req, res) => ok(res, await educationService.uploadEducationLogo(req.params.id, req.file)));
export const deleteEducationLogo = asyncHandler(async (req, res) => ok(res, await educationService.deleteEducationLogo(req.params.id)));

export const listAchievements = listHandler(achievementService.listAchievements);
export const createAchievement = asyncHandler(async (req, res) => ok(res, await achievementService.createAchievement(req.body), 201));
export const updateAchievement = asyncHandler(async (req, res) => ok(res, await achievementService.updateAchievement(req.params.id, req.body)));
export const deleteAchievement = asyncHandler(async (req, res) => {
  await achievementService.deleteAchievement(req.params.id);
  ok(res, { deleted: true });
});
export const reorderAchievements = asyncHandler(async (req, res) => ok(res, await achievementService.reorderAchievements(req.body.ids)));
export const uploadCertificate = asyncHandler(async (req, res) => ok(res, await achievementService.uploadCertificate(req.params.id, req.file)));
export const deleteCertificate = asyncHandler(async (req, res) => ok(res, await achievementService.deleteCertificate(req.params.id)));

export const listSocial = listHandler(socialService.listSocialLinks);
export const createSocial = asyncHandler(async (req, res) => ok(res, await socialService.createSocialLink(req.body), 201));
export const updateSocial = asyncHandler(async (req, res) => ok(res, await socialService.updateSocialLink(req.params.id, req.body)));
export const deleteSocial = asyncHandler(async (req, res) => {
  await socialService.deleteSocialLink(req.params.id);
  ok(res, { deleted: true });
});
export const reorderSocial = asyncHandler(async (req, res) => ok(res, await socialService.reorderSocialLinks(req.body.ids)));

export const getResume = asyncHandler(async (req, res) => ok(res, await resumeService.getResume()));
export const uploadResume = asyncHandler(async (req, res) => ok(res, await resumeService.uploadResume(req.file)));
export const deleteResume = asyncHandler(async (req, res) => {
  await resumeService.deleteResume();
  ok(res, { deleted: true });
});
