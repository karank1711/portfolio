import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate, validateId } from '../middleware/validate.js';
import { reorderSchema } from '../validators/common.js';
import {
  achievementPatchSchema,
  achievementSchema,
  educationPatchSchema,
  educationSchema,
  experiencePatchSchema,
  experienceSchema,
  skillPatchSchema,
  skillSchema,
  socialPatchSchema,
  socialSchema,
} from '../validators/content.js';
import * as content from '../controllers/content.controller.js';

function orderedRoutes({
  list, create, update, remove, reorder, schema, patchSchema, extra,
}) {
  const router = Router();
  router.get('/', optionalAuth, list);
  router.post('/', requireAuth, validate(schema), create);
  router.patch('/reorder', requireAuth, validate(reorderSchema), reorder);
  if (extra) extra(router);
  router.put('/:id', requireAuth, validateId, validate(schema), update);
  router.patch('/:id', requireAuth, validateId, validate(patchSchema), update);
  router.delete('/:id', requireAuth, validateId, remove);
  return router;
}

export const skillRouter = orderedRoutes({
  list: content.listSkills,
  create: content.createSkill,
  update: content.updateSkill,
  remove: content.deleteSkill,
  reorder: content.reorderSkills,
  schema: skillSchema,
  patchSchema: skillPatchSchema,
});

export const experienceRouter = orderedRoutes({
  list: content.listExperiences,
  create: content.createExperience,
  update: content.updateExperience,
  remove: content.deleteExperience,
  reorder: content.reorderExperiences,
  schema: experienceSchema,
  patchSchema: experiencePatchSchema,
  extra(router) {
    router.post('/:id/logo', requireAuth, validateId, upload.single('logo'), content.uploadExperienceLogo);
    router.delete('/:id/logo', requireAuth, validateId, content.deleteExperienceLogo);
  },
});

export const educationRouter = orderedRoutes({
  list: content.listEducation,
  create: content.createEducation,
  update: content.updateEducation,
  remove: content.deleteEducation,
  reorder: content.reorderEducation,
  schema: educationSchema,
  patchSchema: educationPatchSchema,
  extra(router) {
    router.post('/:id/logo', requireAuth, validateId, upload.single('logo'), content.uploadEducationLogo);
    router.delete('/:id/logo', requireAuth, validateId, content.deleteEducationLogo);
  },
});

export const achievementRouter = orderedRoutes({
  list: content.listAchievements,
  create: content.createAchievement,
  update: content.updateAchievement,
  remove: content.deleteAchievement,
  reorder: content.reorderAchievements,
  schema: achievementSchema,
  patchSchema: achievementPatchSchema,
  extra(router) {
    router.post('/:id/certificate', requireAuth, validateId, upload.single('certificate'), content.uploadCertificate);
    router.delete('/:id/certificate', requireAuth, validateId, content.deleteCertificate);
  },
});

export const socialRouter = orderedRoutes({
  list: content.listSocial,
  create: content.createSocial,
  update: content.updateSocial,
  remove: content.deleteSocial,
  reorder: content.reorderSocial,
  schema: socialSchema,
  patchSchema: socialPatchSchema,
});

export const resumeRouter = Router();
resumeRouter.get('/', content.getResume);
resumeRouter.post('/', requireAuth, upload.single('resume'), content.uploadResume);
resumeRouter.delete('/', requireAuth, content.deleteResume);
