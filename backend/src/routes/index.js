import { Router } from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { storage } from '../storage/index.js';
import { rateLimitHandler } from '../utils/apiError.js';
import authRoutes from './authRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import adminRoutes from './adminRoutes.js';
import { publicNoteRoutes, adminNoteRoutes } from './noteRoutes.js';
import { publicDailyCodeRoutes, adminDailyCodeRoutes } from './dailyCodeRoutes.js';
import {
  publicSpaceRoutes,
  adminSpaceRoutes,
  adminBlockRoutes,
} from './spaceRoutes.js';

const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

export function buildApiRouter() {
  const api = Router();

  api.get('/health', (_req, res) => {
    const dbUp = mongoose.connection.readyState === 1;
    res.status(dbUp ? 200 : 503).json({
      data: { status: dbUp ? 'ok' : 'degraded', database: dbUp ? 'connected' : 'disconnected', storage: storage.name, uptime: process.uptime() },
    });
  });

  api.use('/auth', authLimiter, authRoutes);
  api.use('/uploads', uploadRoutes);

  // Public (read) namespaces.
  api.use('/public/notes', publicNoteRoutes);
  api.use('/public/spaces', publicSpaceRoutes);
  api.use('/public/daily-code', publicDailyCodeRoutes);

  // Admin (write) namespaces.
  api.use('/admin', adminRoutes); // dashboard + users
  api.use('/admin/notes', adminNoteRoutes);
  api.use('/admin/daily-code', adminDailyCodeRoutes);
  api.use('/admin/spaces', adminSpaceRoutes);
  api.use('/admin/blocks', adminBlockRoutes);

  return api;
}
