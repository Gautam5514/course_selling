import net from 'node:net';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './config/logger.js';
import { connectDB, disconnectDB } from './db/connect.js';
import { ensureOwner } from './auth/bootstrap.js';

// Node 20+ Happy-Eyeballs (autoSelectFamily) adds per-attempt close/end
// listeners to pooled TLS sockets, producing a false-positive
// "MaxListenersExceededWarning: 11 end listeners added to [TLSSocket]" against
// TLS clusters such as MongoDB Atlas (mongodb+srv). Disable it process-wide
// before any socket is created. Ref: https://github.com/nodejs/node/pull/50136
if (typeof net.setDefaultAutoSelectFamily === 'function') {
  net.setDefaultAutoSelectFamily(false);
}

async function start() {
  await connectDB();
  await ensureOwner();

  const app = createApp();
  const server = app.listen(config.port, () => {
    logger.info(`API listening on http://localhost:${config.port} (${config.nodeEnv})`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    // Force-exit if close hangs.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
