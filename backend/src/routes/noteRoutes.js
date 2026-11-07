import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { requireAdmin, requireAuth } from '../auth/middleware.js';
import { validate } from '../middleware/validate.js';
import { rateLimitHandler } from '../utils/apiError.js';
import { attachVisitor } from '../middleware/visitor.js';
import { uploadMiddleware } from '../controllers/uploadController.js';
import {
  paginationQuery,
  objectId,
  createNoteSchema,
  updateNoteSchema,
  noteAssetsSchema,
  createNoteBlockSchema,
  updateNoteBlockSchema,
  reorderNoteBlocksSchema,
  noteStatsQuery,
  rateNoteSchema,
  likeNoteSchema,
  noteReviewsQuery,
  slugParams,
  adminNotesQuery,
  noteOrderSchema,
  noteFileQuery,
  noteFileParams,
} from '../validation/schemas.js';
import {
  getNoteStats,
  toggleLike,
  rateNote,
  recordDownload,
  listNoteReviews,
  listLatestReviews,
} from '../controllers/noteInteractionController.js';
import {
  listPublicNotes,
  getPublicNote,
  getPublicNoteFile,
  listNotes,
  getNote,
  createNote,
  updateNote,
  reorderNotes,
  attachNoteFile,
  removeNoteFile,
  addNoteAssets,
  deleteNote,
  restoreNote,
  addNoteBlock,
  updateNoteBlock,
  deleteNoteBlock,
  reorderNoteBlocks,
} from '../controllers/noteController.js';

const idParam = { params: z.object({ id: objectId }) };
const blockParams = { params: z.object({ id: objectId, blockId: objectId }) };

// ─── Public ──────────────────────────────────────────────────────────────────
export const publicNoteRoutes = Router();
publicNoteRoutes.use(attachVisitor);

// Likes / ratings are cheap writes: keep them throttled.
const interactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  // Throttle per visitor when we know them, per IP otherwise.
  keyGenerator: (req) => req.visitorId || req.ip,
  handler: rateLimitHandler,
});

// Liking, rating and downloading are member actions: visitors only see the
// counters. Reading the PDF / chapters / code is gated in the controller and
// the file routes.
const memberInteract = [interactionLimiter, requireAuth, validate({ params: slugParams })];

publicNoteRoutes.get('/', validate({ query: paginationQuery }), listPublicNotes);
// NOTE: must be registered before '/:slug'.
publicNoteRoutes.get('/stats', validate({ query: noteStatsQuery }), getNoteStats);
publicNoteRoutes.get('/reviews', validate({ query: noteReviewsQuery }), listLatestReviews);
publicNoteRoutes.get('/:slug', validate({ params: slugParams }), getPublicNote);
// Signed links to the PDF / attachments; reading is for signed-in accounts.
publicNoteRoutes.get('/:slug/file', requireAuth, validate({ params: slugParams }), getPublicNoteFile);
publicNoteRoutes.post('/:slug/like', ...memberInteract, validate({ body: likeNoteSchema }), toggleLike);
publicNoteRoutes.post('/:slug/rate', ...memberInteract, validate({ body: rateNoteSchema }), rateNote);
publicNoteRoutes.get('/:slug/reviews', validate({ params: slugParams, query: noteReviewsQuery }), listNoteReviews);
publicNoteRoutes.post('/:slug/download', ...memberInteract, recordDownload);

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminNoteRoutes = Router();
adminNoteRoutes.use(requireAdmin);
adminNoteRoutes.get('/', validate({ query: adminNotesQuery }), listNotes);
adminNoteRoutes.post('/', validate({ body: createNoteSchema }), createNote);
// NOTE: must be registered before '/:id'.
adminNoteRoutes.patch('/order', validate({ body: noteOrderSchema }), reorderNotes);
adminNoteRoutes.get('/:id', validate(idParam), getNote);
adminNoteRoutes.patch('/:id', validate({ ...idParam, body: updateNoteSchema }), updateNote);
adminNoteRoutes.delete('/:id', validate(idParam), deleteNote);
adminNoteRoutes.post('/:id/restore', validate(idParam), restoreNote);

// Files: main PDF (?role=primary), extra downloads (?role=attachment), cover image.
adminNoteRoutes.post('/:id/files', validate({ ...idParam, query: noteFileQuery }), uploadMiddleware, attachNoteFile);
adminNoteRoutes.delete('/:id/files/:uploadId', validate({ params: noteFileParams }), removeNoteFile);
adminNoteRoutes.post('/:id/assets', validate({ ...idParam, body: noteAssetsSchema }), addNoteAssets);

// Note content blocks (code snippets / embeds shown on the reader page).
adminNoteRoutes.post('/:id/blocks', validate({ ...idParam, body: createNoteBlockSchema }), addNoteBlock);
adminNoteRoutes.patch('/:id/reorder', validate({ ...idParam, body: reorderNoteBlocksSchema }), reorderNoteBlocks);
adminNoteRoutes.patch('/:id/blocks/:blockId', validate({ ...blockParams, body: updateNoteBlockSchema }), updateNoteBlock);
adminNoteRoutes.delete('/:id/blocks/:blockId', validate(blockParams), deleteNoteBlock);
