import { ApiError } from '../utils/apiError.js';

const VISITOR_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

/**
 * Identity for likes / ratings:
 *   - signed-in account  → `user:<id>`  (follows the person across devices)
 *   - anonymous browser  → the `X-Visitor-Id` header the frontend generates
 * Sets req.visitorId (string | null). Never throws. Must run after attachUser.
 */
export function attachVisitor(req, _res, next) {
  if (req.user) {
    req.visitorId = `user:${req.user._id.toString()}`;
    return next();
  }
  const raw = req.get('x-visitor-id');
  req.visitorId = typeof raw === 'string' && VISITOR_ID_RE.test(raw) ? raw : null;
  return next();
}

/** For write interactions an identity (account or browser id) is mandatory. */
export function requireVisitor(req, _res, next) {
  if (!req.visitorId) {
    return next(new ApiError(400, 'VISITOR_REQUIRED', 'We could not identify your browser. Please enable site storage and try again.'));
  }
  return next();
}
