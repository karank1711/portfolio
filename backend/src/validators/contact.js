import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Enter a valid email').max(254),
  message: z.string().trim().min(1, 'Message is required').max(5000),
  company: z.string().max(200).optional().default(''),
}).strict();

export const messagePatchSchema = z.object({
  isRead: z.boolean(),
}).strict();
