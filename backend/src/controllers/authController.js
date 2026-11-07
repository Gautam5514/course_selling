import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData, ApiError } from '../utils/apiError.js';
import { User } from '../models/User.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../auth/jwt.js';
import { verifyGoogleIdToken } from '../auth/firebase.js';
import { config } from '../config/index.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  const INVALID = 'That email and password do not match. Please try again.';
  if (!user) throw ApiError.unauthorized(INVALID);
  if (user.isGoogleOnly()) throw ApiError.unauthorized('This account signs in with Google. Please use "Continue with Google".');

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

/**
 * Google sign-in / sign-up in one step. The browser signs in with Firebase
 * (Google popup) and sends us the ID token; we verify it with Firebase Admin,
 * then find the account by email or create a VIEWER. Existing accounts (even
 * the admin) simply get Google linked, so one email is always one account.
 */
export const googleLogin = asyncHandler(async (req, res) => {
  const g = await verifyGoogleIdToken(req.body.idToken);
  if (!g.email) throw ApiError.badRequest('Your Google account did not share an email address, which we need to create your account.');
  if (!g.emailVerified) throw ApiError.unauthorized('Please verify the email on your Google account first.');

  let user = await User.findOne({ email: g.email }).select('+passwordHash');
  let created = false;
  if (!user) {
    user = new User({ email: g.email, name: g.name || g.email.split('@')[0], role: 'VIEWER', provider: 'google', googleUid: g.uid, avatar: g.picture });
    try {
      await user.save();
      created = true;
    } catch (err) {
      if (err?.code !== 11000) throw err;
      user = await User.findOne({ email: g.email }).select('+passwordHash'); // lost a sign-up race; reuse that row
    }
  }
  const patch = {};
  if (!user.googleUid) patch.googleUid = g.uid;
  if (!user.name && g.name) patch.name = g.name;
  if (!user.avatar && g.picture) patch.avatar = g.picture;
  if (Object.keys(patch).length) {
    Object.assign(user, patch);
    await user.save();
  }

  const token = signToken(user);
  setAuthCookie(res, token);
  return sendData(res, { user: user.toSafeJSON(), token, created }, created ? 201 : 200);
});

/** Which sign-in methods this server supports (the UI hides what is off). */
export const providers = asyncHandler(async (_req, res) => sendData(res, { password: true, google: config.firebase.enabled }));

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  return sendData(res, { ok: true });
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized('You are not signed in.');
  return sendData(res, { user: req.user.toSafeJSON() });
});
