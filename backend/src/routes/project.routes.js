import { Router } from 'express';
import { z } from 'zod';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate, validateId } from '../middleware/validate.js';
import { ApiError } from '../utils/ApiError.js';
import { reorderSchema } from '../validators/common.js';
import { projectPatchSchema, projectSchema } from '../validators/project.js';
import * as project from '../controllers/project.controller.js';

const router = Router();

function validateImageId(req, res, next) {
  if (!z.string().uuid().safeParse(req.params.imageId).success) {
    return next(new ApiError(400, 'Invalid id'));
  }
  return next();
}

function validateSlug(req, res, next) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(req.params.slug || '')) {
    return next(new ApiError(400, 'Invalid project URL'));
  }
  return next();
}

router.get('/', optionalAuth, project.listProjects);
router.post('/', requireAuth, validate(projectSchema), project.createProject);
router.patch('/reorder', requireAuth, validate(reorderSchema), project.reorderProjects);
router.get('/slug/:slug', validateSlug, project.getProjectBySlug);
router.get('/id/:id', requireAuth, validateId, project.getProject);
router.post('/:id/cover', requireAuth, validateId, upload.single('cover'), project.uploadCover);
router.delete('/:id/cover', requireAuth, validateId, project.deleteCover);
router.post('/:id/images', requireAuth, validateId, upload.array('images', 8), project.addImages);
router.patch('/:id/images/reorder', requireAuth, validateId, validate(reorderSchema), project.reorderImages);
router.delete('/:id/images/:imageId', requireAuth, validateId, validateImageId, project.deleteImage);
router.post('/:id/preview-token', requireAuth, validateId, project.previewToken);
router.put('/:id', requireAuth, validateId, validate(projectSchema), project.updateProject);
router.patch('/:id', requireAuth, validateId, validate(projectPatchSchema), project.updateProject);
router.delete('/:id', requireAuth, validateId, project.deleteProject);

export default router;
