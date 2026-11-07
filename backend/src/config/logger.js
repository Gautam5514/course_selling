import pino from 'pino';
import { config } from '../config/index.js';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (config.isProd ? 'info' : 'debug'),
  base: undefined, // omit pid/hostname noise
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      '*.password',
      'JWT_SECRET',
    ],
    remove: true,
  },
  transport: config.isProd
    ? undefined
    : { target: 'pino/file', options: { destination: 1 } }, // stdout, no extra dep
});
