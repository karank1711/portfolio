import { Router } from 'express';
import { loginLimiter } from '../middleware/rateLimits.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { adminNameSchema, loginSchema, passwordSchema } from '../validators/auth.js';
import * as auth from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), auth.login);
router.post('/logout', auth.logout);
router.get('/me', requireAuth, auth.me);
router.patch('/me', requireAuth, validate(adminNameSchema), auth.updateName);
router.post('/password', requireAuth, validate(passwordSchema), auth.changePassword);

export default router;
