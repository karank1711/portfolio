import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

function readToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

export function requireAuth(req, res, next) {
  if (!env.jwtSecret) return next(new ApiError(503, 'Authentication is not configured'));
  const token = readToken(req);
  if (!token) return next(new ApiError(401, 'Authentication required'));
  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired session'));
  }
}

export function optionalAuth(req, res, next) {
  if (!env.jwtSecret) return next();
  const token = readToken(req);
  if (!token) return next();
  try {
    req.user = jwt.verify(token, env.jwtSecret);
  } catch {
    req.user = null;
  }
  return next();
}
