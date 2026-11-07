import crypto from 'node:crypto';
import { config } from '../config/index.js';

/**
 * Short-lived signed links for raw files. They let the reader page embed a
 * PDF in an <iframe> (which cannot always carry the auth cookie across
 * origins) without making uploads world-readable.
 */
function hmac(uploadId, exp) {
  return crypto.createHmac('sha256', config.jwtSecret).update(`${uploadId}.${exp}`).digest('hex');
}

export function signFileUrl(uploadId, { ttlSeconds = 60 * 60, download = false } = {}) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = hmac(uploadId, exp);
  return `/api/uploads/${uploadId}/raw?exp=${exp}&sig=${sig}${download ? '&dl=1' : ''}`;
}

export function verifyFileSignature(uploadId, exp, sig) {
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || expNum < Math.floor(Date.now() / 1000)) return false;
  if (typeof sig !== 'string' || sig.length !== 64) return false;
  const expected = hmac(uploadId, expNum);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(sig, 'hex'));
  } catch {
    return false;
  }
}
