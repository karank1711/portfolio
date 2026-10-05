import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email').max(254),
  password: z.string().min(1, 'Password is required').max(200),
}).strict();

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(200),
  newPassword: z.string()
    .min(8, 'Use at least 8 characters')
    .max(200)
    .regex(/[A-Za-z]/, 'Include a letter')
    .regex(/[0-9]/, 'Include a number'),
}).strict();

export const adminNameSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
}).strict();
