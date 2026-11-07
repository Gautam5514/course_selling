import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function cookieOptions() {
  const sameSite = config.cookieSameSite;
  return {
    httpOnly: true,
    // SameSite=None is rejected by browsers unless the cookie is also Secure.
    secure: config.cookieSecure || sameSite === 'none',
    sameSite,
    path: '/',
  };
}

export function setAuthCookie(res, token) {
  res.cookie(config.authCookieName, token, { ...cookieOptions(), maxAge: COOKIE_MAX_AGE_MS });
}

export function clearAuthCookie(res) {
  res.clearCookie(config.authCookieName, cookieOptions());
}
