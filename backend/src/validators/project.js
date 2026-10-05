import { z } from 'zod';
import { optionalDate, optionalHttpUrl, stringList } from './common.js';

const statuses = ['planned', 'in_progress', 'completed', 'archived'];

const projectShape = {
  name: z.string().trim().min(1, 'Project name is required').max(140),
  slug: z.string().trim().max(80).optional(),
  shortDescription: z.string().trim().max(280).optional().default(''),
  detailedDescription: z.string().trim().max(5000).optional().default(''),
  features: stringList(20, 180).default([]),
  technologies: stringList(24, 40).default([]),
  githubUrl: optionalHttpUrl,
  liveUrl: optionalHttpUrl,
  category: z.string().trim().max(80).optional().default(''),
  isFeatured: z.boolean().optional().default(false),
  status: z.enum(statuses).optional().default('completed'),
  isPublished: z.boolean().optional().default(false),
  startDate: optionalDate,
  endDate: optionalDate,
  developmentDetails: z.string().trim().max(5000).optional().default(''),
};

function refineDates(value, ctx) {
  if (value.startDate && value.endDate && value.endDate < value.startDate) {
    ctx.addIssue({ code: 'custom', message: 'End date must be on or after the start date', path: ['endDate'] });
  }
}

export const projectSchema = z.object(projectShape).strict().superRefine(refineDates);

export const projectPatchSchema = z.object({
  name: z.string().trim().min(1).max(140).optional(),
  slug: z.string().trim().min(1).max(80).optional(),
  shortDescription: z.string().trim().max(280).optional(),
  detailedDescription: z.string().trim().max(5000).optional(),
  features: stringList(20, 180),
  technologies: stringList(24, 40),
  githubUrl: optionalHttpUrl,
  liveUrl: optionalHttpUrl,
  category: z.string().trim().max(80).optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(statuses).optional(),
  isPublished: z.boolean().optional(),
  startDate: optionalDate,
  endDate: optionalDate,
  developmentDetails: z.string().trim().max(5000).optional(),
}).strict().superRefine(refineDates);
