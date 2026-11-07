import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { config } from '../config/index.js';
import { ApiError } from '../utils/apiError.js';

let app = null;

function firebaseApp() {
  if (!config.firebase.enabled) return null;
  if (!app) app = getApps()[0] ?? initializeApp({ credential: cert(config.firebase.serviceAccount) });
  return app;
}

/**
 * Verify a Firebase ID token from the browser (Google sign-in) and return the
 * identity we trust: uid, email, name, picture, emailVerified.
 */
export async function verifyGoogleIdToken(idToken) {
  const fb = firebaseApp();
  if (!fb) throw ApiError.unavailable('Google sign-in is not set up on this server yet.');
  let decoded;
  try {
    decoded = await getAuth(fb).verifyIdToken(idToken, true);
  } catch (err) {
    const code = err?.code || '';
    if (code.includes('expired')) throw ApiError.unauthorized('Your Google sign-in expired. Please try again.');
    if (code.includes('revoked')) throw ApiError.unauthorized('Your Google session was revoked. Please sign in again.');
    throw ApiError.unauthorized('We could not verify your Google sign-in. Please try again.');
  }
  return {
    uid: decoded.uid,
    email: decoded.email ? String(decoded.email).toLowerCase() : null,
    emailVerified: Boolean(decoded.email_verified),
    name: decoded.name || '',
    picture: decoded.picture || '',
    provider: decoded.firebase?.sign_in_provider || 'google.com',
  };
}
