import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import mongoose from 'mongoose';
import { config } from './config/index.js';
import { ApiError, rateLimitHandler } from './utils/apiError.js';
import { logger } from './config/logger.js';
import { attachUser } from './auth/middleware.js';
import { buildApiRouter } from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

/** Does `origin` match one of the configured origins (exact or `https://*.host`)? */
export function isAllowedOrigin(origin) {
  const o = String(origin).toLowerCase().replace(/\/+$/, '');
  return config.corsOrigins.some((allowed) => {
    if (!allowed.includes('*')) return allowed === o;
    const rx = new RegExp(`^${allowed.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[a-z0-9-]+')}$`);
    return rx.test(o);
  });
}

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin(origin, cb) {
        // Allow same-origin / server-to-server (no origin) and whitelisted origins.
        if (!origin || isAllowedOrigin(origin)) return cb(null, true);
        logger.warn({ origin, allowed: config.corsOrigins }, 'CORS: origin rejected. Add it to CORS_ORIGINS.');
        return cb(ApiError.forbidden(`This website (${origin}) is not allowed to access the API. Add it to CORS_ORIGINS on the server.`));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));

  // Global rate limit.
  app.use(
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      handler: rateLimitHandler,
    })
  );

  // If MongoDB has dropped, fail fast with a friendly 503 instead of letting
  // every request hang until the driver times out.
  app.use('/api', (req, _res, next) => {
    if (req.path === '/health') return next();
    if (mongoose.connection.readyState !== 1) return next(ApiError.unavailable());
    return next();
  });

  // Resolve req.user from cookie/Bearer for every request.
  app.use(attachUser);

  app.use('/api', buildApiRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
