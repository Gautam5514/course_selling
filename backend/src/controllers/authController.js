import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData, ApiError } from '../utils/apiError.js';
import { User } from '../models/User.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../auth/jwt.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  const INVALID = 'That email and password do not match. Please try again.';
  if (!user) throw ApiError.unauthorized(INVALID);

  const ok = await user.verifyPassword(password);
  if (!ok) throw ApiError.unauthorized(INVALID);

  // Old cost-12 hashes make every login slow on a 0.1-CPU free instance.
  // Re-hash once with the configured cost; never block the response on it.
  if (user.needsRehash()) {
    user.setPassword(password).then(() => user.save()).catch(() => {});
  }

  const token = signToken(user);
  setAuthCookie(res, token);
  return sendData(res, { user: user.toSafeJSON(), token });
});

/** Student sign-up. Always creates a VIEWER; admins are only created by the seed. */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.exists({ email: email.toLowerCase() });
  if (exists) throw ApiError.conflict('An account with this email already exists');

  const user = new User({ name, email, role: 'VIEWER' });
  await user.setPassword(password);
  try {
    await user.save();
  } catch (err) {
    // Two sign-ups racing on the same email: the unique index wins.
    if (err?.code === 11000) throw ApiError.conflict('An account with this email already exists');
    throw err;
  }

  const token = signToken(user);
  setAuthCookie(res, token);
  return sendData(res, { user: user.toSafeJSON(), token }, 201);
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  return sendData(res, { ok: true });
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('You are not signed in.');
  return sendData(res, { user: req.user.toSafeJSON() });
});
