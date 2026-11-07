/**
 * Uniform error envelope: { error: { code, message, details? } }
 * Uniform success envelope: { data, meta? }
 */
export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message = 'Some of the information provided is not valid.', details) {
    return new ApiError(400, 'VALIDATION', message, details);
  }

  static unauthorized(message = 'Please sign in to continue.') {
    return new ApiError(401, 'AUTH_REQUIRED', message);
  }

  static forbidden(message = 'You do not have permission to do that.') {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'We could not find what you were looking for.') {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(message = 'Conflict', details) {
    return new ApiError(409, 'CONFLICT', message, details);
  }

  static tooLarge(message = 'Upload too large') {
    return new ApiError(413, 'UPLOAD_TOO_LARGE', message);
  }

  static rateLimited(message = 'You are doing that a little too fast. Please wait a moment and try again.', retryAfter) {
    const e = new ApiError(429, 'RATE_LIMITED', message);
    if (retryAfter) e.retryAfter = retryAfter;
    return e;
  }

  static internal(message = 'Something went wrong on our side. Please try again in a moment.') {
    return new ApiError(500, 'INTERNAL', message);
  }

  static unavailable(message = 'The service is temporarily unavailable. Please try again shortly.') {
    return new ApiError(503, 'SERVICE_UNAVAILABLE', message);
  }
}

/**
 * express-rate-limit handler that answers with our JSON envelope instead of
 * the library's plain-text default.
 */
export function rateLimitHandler(req, res, _next, options) {
  const retryAfter = Math.ceil(options.windowMs / 1000);
  const err = ApiError.rateLimited(undefined, retryAfter);
  res.set('Retry-After', String(retryAfter));
  res.status(err.status).json({ error: { code: err.code, message: err.message } });
}

export function sendData(res, data, status = 200, meta) {
  const body = { data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}
