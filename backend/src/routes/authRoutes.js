import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema, googleLoginSchema } from '../validation/schemas.js';
import { login, register, logout, me, googleLogin, providers } from '../controllers/authController.js';

// The limiter guards only the credential endpoints. /me runs on every page load
// and must not burn the login budget (20 per 15 min would lock people out).
export default function authRoutes(limiter) {
  const router = Router();
  router.post('/login', limiter, validate({ body: loginSchema }), login);
  router.post('/register', limiter, validate({ body: registerSchema }), register);
  router.post('/google', limiter, validate({ body: googleLoginSchema }), googleLogin);
  router.get('/providers', providers);
  router.post('/logout', logout);
  router.get('/me', me);
  return router;
}
