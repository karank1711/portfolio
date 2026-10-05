import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { contactLimiter } from '../middleware/rateLimits.js';
import { validate, validateId } from '../middleware/validate.js';
import { contactSchema, messagePatchSchema } from '../validators/contact.js';
import * as system from '../controllers/system.controller.js';
import authRoutes from './auth.routes.js';
import profileRoutes, { aboutRouter } from './profile.routes.js';
import {
  achievementRouter,
  educationRouter,
  experienceRouter,
  resumeRouter,
  skillRouter,
  socialRouter,
} from './content.routes.js';
import projectRoutes from './project.routes.js';

const router = Router();

router.get('/health', system.health);
router.get('/portfolio', system.portfolio);
router.get('/dashboard', requireAuth, system.dashboard);

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/about', aboutRouter);
router.use('/skills', skillRouter);
router.use('/experience', experienceRouter);
router.use('/education', educationRouter);
router.use('/projects', projectRoutes);
router.use('/achievements', achievementRouter);
router.use('/resume', resumeRouter);
router.use('/social-links', socialRouter);

router.post('/contact', contactLimiter, validate(contactSchema), system.createContact);
router.get('/messages', requireAuth, system.listMessages);
router.patch('/messages/read-all', requireAuth, system.markAllRead);
router.patch('/messages/:id', requireAuth, validateId, validate(messagePatchSchema), system.updateMessage);
router.delete('/messages/:id', requireAuth, validateId, system.deleteMessage);

export default router;
