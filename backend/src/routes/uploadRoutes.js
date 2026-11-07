import { Router } from 'express';
import { requireAdmin, requireAuth } from '../auth/middleware.js';
import { validate } from '../middleware/validate.js';
import { paginationQuery, objectId } from '../validation/schemas.js';
import { z } from 'zod';
import {
  uploadMiddleware,
  createUpload,
  getUpload,
  downloadUpload,
  listUploads,
  deleteUpload,
} from '../controllers/uploadController.js';

const router = Router();
const idParam = { params: z.object({ id: objectId }) };

// Metadata for signed-in accounts; raw bytes for signed links or signed-in accounts.
router.get('/:id', requireAuth, validate(idParam), getUpload);
router.get('/:id/raw', validate(idParam), downloadUpload);

// Admin-only writes.
router.get('/', requireAdmin, validate({ query: paginationQuery }), listUploads);
router.post('/', requireAdmin, uploadMiddleware, createUpload);
router.delete('/:id', requireAdmin, validate(idParam), deleteUpload);

export default router;
