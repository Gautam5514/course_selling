import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin, requireSuperAdmin } from '../auth/middleware.js';
import { validate } from '../middleware/validate.js';
import { objectId, adminUsersQuery, updateUserRoleSchema } from '../validation/schemas.js';
import { getDashboard, listUsers, updateUserRole, deleteUser } from '../controllers/adminController.js';

const router = Router();
const idParam = { params: z.object({ id: objectId }) };

router.get('/dashboard', requireAdmin, getDashboard);

// Account management is reserved for full administrators.
router.get('/users', requireSuperAdmin, validate({ query: adminUsersQuery }), listUsers);
router.patch('/users/:id/role', requireSuperAdmin, validate({ ...idParam, body: updateUserRoleSchema }), updateUserRole);
router.delete('/users/:id', requireSuperAdmin, validate(idParam), deleteUser);

export default router;
