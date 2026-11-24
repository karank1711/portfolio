import { z } from 'zod';

function isGoogleDriveUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    return host === 'drive.google.com' || host === 'docs.google.com';
  } catch {
    return false;
  }
}

export const resumeUrlSchema = z.object({
  fileUrl: z
    .string({ required_error: 'Paste a Google Drive resume link.' })
    .trim()
    .min(1, 'Paste a Google Drive resume link.')
    .max(1000, 'Resume link is too long.')
    .url('Enter a valid URL.')
    .refine(isGoogleDriveUrl, {
      message: 'Enter a valid Google Drive sharing link (Anyone with the link).',
    }),
}).strict();
