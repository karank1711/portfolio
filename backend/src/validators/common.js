import { z } from 'zod';

export const reorderSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
}).strict();

export const optionalText = (max) => z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().trim().max(max).nullable().optional(),
);

export const optionalHttpUrl = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().trim().max(500).regex(/^https?:\/\/\S+$/i, 'Enter a valid http(s) URL').nullable().optional(),
);

export const optionalDate = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a date in YYYY-MM-DD format').nullable().optional(),
);

export const stringList = (maxItems, maxLength = 48) => z.array(
  z.string().trim().min(1).max(maxLength),
).max(maxItems).optional();

export const optionalYear = z.preprocess((value) => {
  if (value === undefined) return undefined;
  if (value === '' || value === null) return null;
  return Number(value);
}, z.number().int().min(1950).max(2100).nullable().optional());
