import mongoose from 'mongoose';
import multer from 'multer';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../config/logger.js';
import { config } from '../config/index.js';

export function notFoundHandler(_req, _res, next) {
  next(ApiError.notFound('We could not find what you were looking for.'));
}

/**
 * Translate any thrown error into the uniform envelope
 *   { error: { code, message, details? } }
 * with a message that is safe and readable for end users. Technical detail is
 * logged server-side, never sent to the client (except Zod field details,
 * which the frontend maps to friendly field hints).
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let apiError = err;

  if (err instanceof ApiError) {
    // already shaped
  } else if (err instanceof multer.MulterError) {
    apiError =
      err.code === 'LIMIT_FILE_SIZE'
        ? ApiError.tooLarge('That file is too large to upload.')
        : ApiError.badRequest('We could not process that upload. Please try again.');
  } else if (err?.type === 'entity.parse.failed') {
    // express.json() could not parse the body
    apiError = ApiError.badRequest('The request was not valid JSON.');
  } else if (err?.type === 'entity.too.large') {
    apiError = ApiError.tooLarge('The request was too large.');
  } else if (err?.name === 'ValidationError') {
    // Mongoose schema validation (admin writes)
    const details = Object.values(err.errors ?? {}).map((e) => ({ path: e.path, message: e.message }));
    apiError = ApiError.badRequest('Some of the information provided is not valid.', details.length ? details : undefined);
  } else if (err?.name === 'CastError') {
    apiError = ApiError.badRequest('That identifier is not valid.');
  } else if (err?.code === 11000) {
    apiError = ApiError.conflict('That already exists.');
  } else if (err?.name === 'MongoServerSelectionError' || err instanceof mongoose.mongo.MongoNetworkError) {
    logger.error({ err }, 'Database unreachable');
    apiError = ApiError.unavailable();
  } else if (err?.message?.startsWith('Origin not allowed by CORS')) {
    apiError = ApiError.forbidden('This website is not allowed to access the API.');
  } else {
    logger.error({ err, url: req.originalUrl, method: req.method }, 'Unhandled error');
    apiError = ApiError.internal();
  }

  if (apiError.status >= 500) {
    logger.error({ code: apiError.code, url: req.originalUrl }, apiError.message);
  }

  const body = { error: { code: apiError.code, message: apiError.message } };
  if (apiError.details) body.error.details = apiError.details;
  if (apiError.retryAfter) res.set('Retry-After', String(apiError.retryAfter));

  // Never leak stack traces, even in development responses.
  if (!config.isProd && apiError.status >= 500 && err?.stack) {
    logger.debug(err.stack);
  }

  res.status(apiError.status).json(body);
}
