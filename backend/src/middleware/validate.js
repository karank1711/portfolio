import { ZodError } from 'zod';
import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return next(formatZod(result.error));
    req.body = result.data;
    return next();
  };
}

export function validateId(req, res, next) {
  const result = z.string().uuid().safeParse(req.params.id);
  if (!result.success) return next(new ApiError(400, 'Invalid id'));
  return next();
}

function formatZod(error) {
  if (!(error instanceof ZodError)) return new ApiError(400, 'Invalid input');
  const message = error.issues.map((issue) => issue.message).join(' ');
  return new ApiError(400, message || 'Invalid input');
}
