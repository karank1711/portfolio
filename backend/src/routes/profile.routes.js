import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { aboutSchema, profileSchema } from '../validators/content.js';
import * as profile from '../controllers/profile.controller.js';

const router = Router();

router.get('/', profile.getProfile);
router.put('/', requireAuth, validate(profileSchema), profile.saveProfile);
router.post('/photo', requireAuth, upload.single('photo'), profile.uploadProfilePhoto);
router.delete('/photo', requireAuth, profile.deleteProfilePhoto);

export default router;

export const aboutRouter = Router();
aboutRouter.get('/', profile.getAbout);
aboutRouter.put('/', requireAuth, validate(aboutSchema), profile.saveAbout);
