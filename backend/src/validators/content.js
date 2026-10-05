import { z } from 'zod';
import { optionalDate, optionalHttpUrl, optionalText, optionalYear, stringList } from './common.js';

const highlightSchema = z.object({
  label: z.string().trim().min(1).max(60),
  value: z.string().trim().min(1).max(200),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, 'Name is required').max(120),
  professionalTitle: z.string().trim().max(160).optional().default(''),
  roles: z.array(z.string().trim().min(1).max(80)).max(8).optional().default([]),
  shortIntro: z.string().trim().max(600).optional().default(''),
  location: z.string().trim().max(120).optional().default(''),
  email: z.union([z.string().trim().email('Enter a valid email').max(254), z.literal('')]).optional().default(''),
  phone: optionalText(40),
}).strict();

export const aboutSchema = z.object({
  summary: z.string().trim().max(1200).optional().default(''),
  personalIntro: z.string().trim().max(2000).optional().default(''),
  currentEducation: z.string().trim().max(240).optional().default(''),
  highlights: z.array(highlightSchema).max(8).optional().default([]),
}).strict();

export const skillSchema = z.object({
  name: z.string().trim().min(1, 'Skill name is required').max(80),
  category: z.string().trim().min(1, 'Category is required').max(80),
  isEnabled: z.boolean().optional(),
}).strict();

export const skillPatchSchema = skillSchema.partial().strict();

const employmentTypes = ['full_time', 'part_time', 'internship', 'contract', 'freelance'];

export const experienceSchema = z.object({
  company: z.string().trim().min(1, 'Company is required').max(140),
  role: z.string().trim().min(1, 'Role is required').max(140),
  employmentType: z.enum(employmentTypes).optional().default('full_time'),
  startDate: optionalDate,
  endDate: optionalDate,
  location: optionalText(120),
  description: z.string().trim().max(2000).optional().default(''),
  technologies: stringList(20, 40).default([]),
  isCurrent: z.boolean().optional().default(false),
}).strict().superRefine((value, ctx) => {
  if (!value.isCurrent && value.startDate && value.endDate && value.endDate < value.startDate) {
    ctx.addIssue({ code: 'custom', message: 'End date must be on or after the start date', path: ['endDate'] });
  }
});

export const experiencePatchSchema = z.object({
  company: z.string().trim().min(1).max(140).optional(),
  role: z.string().trim().min(1).max(140).optional(),
  employmentType: z.enum(employmentTypes).optional(),
  startDate: optionalDate,
  endDate: optionalDate,
  location: optionalText(120),
  description: z.string().trim().max(2000).optional(),
  technologies: stringList(20, 40),
  isCurrent: z.boolean().optional(),
}).strict();

export const educationSchema = z.object({
  institution: z.string().trim().min(1, 'Institution is required').max(180),
  degree: z.string().trim().min(1, 'Degree is required').max(180),
  specialization: optionalText(180),
  startYear: z.preprocess((value) => Number(value), z.number().int().min(1950).max(2100)),
  endYear: optionalYear,
  grade: optionalText(40),
  description: z.string().trim().max(2000).optional().default(''),
}).strict().superRefine((value, ctx) => {
  if (value.endYear && value.startYear && value.endYear < value.startYear) {
    ctx.addIssue({ code: 'custom', message: 'End year must be on or after the start year', path: ['endYear'] });
  }
});

export const educationPatchSchema = z.object({
  institution: z.string().trim().min(1).max(180).optional(),
  degree: z.string().trim().min(1).max(180).optional(),
  specialization: optionalText(180),
  startYear: z.preprocess((value) => (value === undefined ? undefined : Number(value)), z.number().int().min(1950).max(2100).optional()),
  endYear: optionalYear,
  grade: optionalText(40),
  description: z.string().trim().max(2000).optional(),
}).strict();

const achievementTypes = ['certification', 'award', 'publication', 'competition', 'other'];

export const achievementSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(180),
  organization: z.string().trim().max(180).optional().default(''),
  achievedOn: optionalDate,
  description: z.string().trim().max(2000).optional().default(''),
  verificationUrl: optionalHttpUrl,
  type: z.enum(achievementTypes).optional().default('certification'),
  isEnabled: z.boolean().optional().default(true),
}).strict();

export const achievementPatchSchema = z.object({
  title: z.string().trim().min(1).max(180).optional(),
  organization: z.string().trim().max(180).optional(),
  achievedOn: optionalDate,
  description: z.string().trim().max(2000).optional(),
  verificationUrl: optionalHttpUrl,
  type: z.enum(achievementTypes).optional(),
  isEnabled: z.boolean().optional(),
}).strict();

const platforms = ['github', 'linkedin', 'email', 'x', 'website', 'leetcode', 'medium', 'dribbble', 'behance', 'other'];

export const socialSchema = z.object({
  platform: z.enum(platforms),
  label: z.string().trim().max(80).optional().default(''),
  url: z.string().trim().min(1, 'Link is required').max(500),
  isEnabled: z.boolean().optional().default(true),
}).strict().superRefine((value, ctx) => {
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.url) || /^mailto:/i.test(value.url);
  const httpOk = /^https?:\/\/\S+$/i.test(value.url);
  if (value.platform === 'email' ? !emailOk : !httpOk) {
    ctx.addIssue({
      code: 'custom',
      message: value.platform === 'email' ? 'Enter a valid email address' : 'Enter a valid http(s) URL',
      path: ['url'],
    });
  }
});

export const socialPatchSchema = z.object({
  platform: z.enum(platforms).optional(),
  label: z.string().trim().max(80).optional(),
  url: z.string().trim().min(1).max(500).optional(),
  isEnabled: z.boolean().optional(),
}).strict();

export { optionalHttpUrl };
