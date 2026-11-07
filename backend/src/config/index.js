import dotenv from 'dotenv';

dotenv.config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function int(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be an integer, got: ${raw}`);
  }
  return parsed;
}

function bool(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  return raw.toLowerCase() === 'true' || raw === '1';
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
// Render always sets RENDER=true. Treat it as production even if NODE_ENV was
// overridden by a pasted local .env (that gives non-Secure, SameSite=Lax cookies
// which browsers drop on a cross-site Vercel -> Render login).
const isProd = nodeEnv === 'production' || process.env.RENDER === 'true';

export const config = {
  nodeEnv,
  isProd,
  port: int('PORT', 5001),
  // Allowed browser origins. Accepts "https://site.com", "https://site.com/"
  // (slash and path dropped) and wildcards like "https://*.vercel.app".
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim().toLowerCase().replace(/\/+$/, ''))
    .map((o) => {
      try {
        if (o.includes('*')) return o; // keep wildcards verbatim
        const u = new URL(o);
        return `${u.protocol}//${u.host}`;
      } catch {
        return o;
      }
    })
    .filter(Boolean),

  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/course_lms'),

  jwtSecret: isProd
    ? required('JWT_SECRET')
    : process.env.JWT_SECRET || 'dev-insecure-secret-change-me',
  bcryptRounds: int('BCRYPT_ROUNDS', 10),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  authCookieName: process.env.AUTH_COOKIE_NAME ?? 'course_token',
  cookieSecure: bool('COOKIE_SECURE', isProd),
  // Frontend and API usually live on different domains in production
  // (e.g. vercel.app + onrender.com), so the auth cookie must be SameSite=None
  // (which browsers only accept together with Secure). Locally 'lax' is fine.
  cookieSameSite: (process.env.COOKIE_SAME_SITE || (isProd ? 'none' : 'lax')).toLowerCase(),

  // The site administrator. Created (or promoted) automatically on boot.
  owner: {
    email: process.env.OWNER_EMAIL ?? 'admin@example.com',
    // No default on purpose: without OWNER_PASSWORD the admin is never created.
    password: process.env.OWNER_PASSWORD ?? '',
    name: process.env.OWNER_NAME ?? 'Admin',
    // Outside production, keep the owner's password in sync with the env so a
    // changed .env never locks you out. Off in production by default.
    syncPassword: bool('OWNER_SYNC_PASSWORD', !isProd),
  },

  uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
  // File storage. When Cloudinary credentials are present, uploads go to
  // Cloudinary (private "authenticated" assets, proxied through this API);
  // otherwise they stay on local disk under uploadDir.
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
    folder: process.env.CLOUDINARY_FOLDER ?? 'hellos',
    get enabled() {
      return Boolean(this.cloudName && this.apiKey && this.apiSecret);
    },
  },
  maxUploadBytes: int('MAX_UPLOAD_BYTES', 2 * 1024 * 1024 * 1024),

  // Calendar timezone for date-keyed content such as "Today Code".
  timezone: process.env.APP_TIMEZONE || 'Asia/Kolkata',

  rateLimit: {
    windowMs: int('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    max: int('RATE_LIMIT_MAX', 300),
    authMax: int('AUTH_RATE_LIMIT_MAX', 20),
  },
};
