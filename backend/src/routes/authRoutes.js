import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../validation/schemas.js';
import { login, register, logout, me } from '../controllers/authController.js';

const router = Router();

router.post('/login', validate({ body: loginSchema }), login);
router.post('/register', validate({ body: registerSchema }), register);
router.post('/logout', logout);
router.get('/me', me);

export default router;
