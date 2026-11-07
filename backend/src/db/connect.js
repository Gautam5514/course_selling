import { setMaxListeners } from 'node:events';
import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';

mongoose.set('strictQuery', true);

// Register connection lifecycle listeners exactly once (module scope), not on
// every connectDB() call — otherwise repeated calls stack duplicate listeners
// and trigger MaxListenersExceededWarning on the connection emitter.
let listenersBound = false;
function bindConnectionEvents() {
  if (listenersBound) return;
  listenersBound = true;
  mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
  mongoose.connection.on('error', (err) => logger.error({ err }, 'MongoDB error'));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
}

export async function connectDB(uri = config.mongoUri) {
  bindConnectionEvents();

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: !config.isProd, // build indexes in dev; manage explicitly in prod
    // Node 20+ adds per-attempt close/end listeners to pooled TLS sockets when
    // Happy-Eyeballs (autoSelectFamily) is on, producing a false-positive
    // "MaxListenersExceededWarning: 11 end listeners added to [TLSSocket]"
    // against TLS clusters (e.g. MongoDB Atlas, mongodb+srv). Disabling it on
    // the driver's sockets removes the churn without affecting connectivity.
    // Ref: https://github.com/nodejs/node/pull/50136
    autoSelectFamily: false,
  });

  // A MongoDB connection pool legitimately holds several sockets; give the
  // connection emitter modest headroom above Node's default of 10 so normal
  // pooling doesn't look like a leak. This is scoped headroom, not an
  // unbounded bump that would hide a real leak.
  try {
    setMaxListeners(20, mongoose.connection);
  } catch {
    /* non-fatal */
  }

  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
