import { config } from '../config/index.js';
import { ApiError } from '../utils/apiError.js';
import { verifyToken } from './jwt.js';
import { User } from '../models/User.js';

function extractToken(req) {
  const cookieToken = req.cookies?.[config.authCookieName];
  if (cookieToken) return cookieToken;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

/** Populates req.user if a valid token is present; never throws. */
export async function attachUser(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (user) req.user = user;
  } catch {
    // invalid/expired token → treat as anonymous
  }
  return next();
}

/** Requires any signed-in account (students included). */
export function requireAuth(req, _res, next) {
  if (!req.user) return next(ApiError.unauthorized('Please sign in to continue.'));
  return next();
}

/** Requires one of the given roles. */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized('Please sign in to continue.'));
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('This area is for administrators only.'));
    }
    return next();
  };
}

/** Requires an authenticated ADMIN or EDITOR (content management). */
export const requireAdmin = requireRole('ADMIN', 'EDITOR');

/** Requires a full ADMIN (user management, destructive actions). */
export const requireSuperAdmin = requireRole('ADMIN');
