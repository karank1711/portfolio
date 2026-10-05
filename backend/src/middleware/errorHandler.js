import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : 'Upload failed';
    return res.status(400).json({ success: false, message });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON' });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);

  const message = status >= 500 && env.nodeEnv === 'production'
    ? 'Something went wrong'
    : err.message || 'Something went wrong';

  return res.status(status).json({ success: false, message });
}

export function assertConfigured(req, res, next) {
  if (!env.jwtSecret || !env.supabaseUrl || !env.supabaseServiceKey) {
    return next(new ApiError(503, 'Server environment is incomplete. Check backend/.env.'));
  }
  return next();
}
