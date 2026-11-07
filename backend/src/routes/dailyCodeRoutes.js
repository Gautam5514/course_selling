import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireAuth } from '../auth/middleware.js';
import { validate } from '../middleware/validate.js';
import { objectId, dailyCodeListQuery, dailyCodeDateParams, adminDailyCodeQuery, createDailyCodeSchema, updateDailyCodeSchema } from '../validation/schemas.js';
import {
  listDailyCode,
  getTodayCode,
  getDailyCodeByDate,
  adminListDailyCode,
  adminGetDailyCode,
  adminCreateDailyCode,
  adminUpdateDailyCode,
  adminDeleteDailyCode,
} from '../controllers/dailyCodeController.js';

const idParam = { params: z.object({ id: objectId }) };

// ─── Public ──────────────────────────────────────────────────────────────────
// The archive (dates + titles) is visible to everyone; the code itself is for
// signed-in members, which is what the navbar "Today Code" button promises.
export const publicDailyCodeRoutes = Router();
publicDailyCodeRoutes.get('/', validate({ query: dailyCodeListQuery }), listDailyCode);
publicDailyCodeRoutes.get('/today', requireAuth, getTodayCode);
publicDailyCodeRoutes.get('/:date', requireAuth, validate({ params: dailyCodeDateParams }), getDailyCodeByDate);

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminDailyCodeRoutes = Router();
adminDailyCodeRoutes.use(requireAdmin);
adminDailyCodeRoutes.get('/', validate({ query: adminDailyCodeQuery }), adminListDailyCode);
adminDailyCodeRoutes.post('/', validate({ body: createDailyCodeSchema }), adminCreateDailyCode);
adminDailyCodeRoutes.get('/:id', validate(idParam), adminGetDailyCode);
adminDailyCodeRoutes.patch('/:id', validate({ ...idParam, body: updateDailyCodeSchema }), adminUpdateDailyCode);
adminDailyCodeRoutes.delete('/:id', validate(idParam), adminDeleteDailyCode);
