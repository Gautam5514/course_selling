import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../auth/middleware.js';
import { validate } from '../middleware/validate.js';
import {
  objectId,
  createSpaceSchema,
  updateSpaceSchema,
  createBlockSchema,
  updateBlockSchema,
  reorderSchema,
} from '../validation/schemas.js';
import {
  getPublicSpace,
  listSpaces,
  createSpace,
  getSpace,
  updateSpace,
  deleteSpace,
} from '../controllers/spaceController.js';
import {
  addBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks,
} from '../controllers/blockController.js';

const idParam = { params: z.object({ id: objectId }) };

// ─── Public ──────────────────────────────────────────────────────────────────
export const publicSpaceRoutes = Router();
publicSpaceRoutes.get('/:slug', getPublicSpace);

// ─── Admin: spaces ────────────────────────────────────────────────────────────
export const adminSpaceRoutes = Router();
adminSpaceRoutes.use(requireAdmin);
adminSpaceRoutes.get('/', listSpaces);
adminSpaceRoutes.post('/', validate({ body: createSpaceSchema }), createSpace);
adminSpaceRoutes.get('/:id', validate(idParam), getSpace);
adminSpaceRoutes.patch('/:id', validate({ ...idParam, body: updateSpaceSchema }), updateSpace);
adminSpaceRoutes.delete('/:id', validate(idParam), deleteSpace);
// Blocks nested under a space.
adminSpaceRoutes.post('/:id/blocks', validate({ ...idParam, body: createBlockSchema }), addBlock);
adminSpaceRoutes.patch('/:id/reorder', validate({ ...idParam, body: reorderSchema }), reorderBlocks);

// ─── Admin: blocks (by block id) ──────────────────────────────────────────────
export const adminBlockRoutes = Router();
adminBlockRoutes.use(requireAdmin);
adminBlockRoutes.patch('/:id', validate({ ...idParam, body: updateBlockSchema }), updateBlock);
adminBlockRoutes.delete('/:id', validate(idParam), deleteBlock);
