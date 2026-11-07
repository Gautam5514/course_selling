import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import { User } from '../models/User.js';

/**
 * Guarantee the configured owner account exists and is an ADMIN. Runs on every
 * boot so the admin panel is reachable even on a fresh database.
 */
export async function ensureOwner() {
  const email = config.owner.email.toLowerCase();
  let user = await User.findOne({ email }).select('+passwordHash');

  if (!config.owner.password) {
    logger.warn(`OWNER_PASSWORD is not set, so the admin account (${email}) is ${user ? 'left as is' : 'not created'}. Add it to backend/.env.`);
    return user;
  }

  if (!user) {
    user = new User({ email, name: config.owner.name, role: 'ADMIN' });
    await user.setPassword(config.owner.password);
    await user.save();
    logger.info(`Admin account created: ${email}`);
    return user;
  }

  let changed = false;
  if (user.role !== 'ADMIN') {
    user.role = 'ADMIN';
    changed = true;
    logger.info(`Promoted ${email} to ADMIN`);
  }
  if (config.owner.syncPassword && !(await user.verifyPassword(config.owner.password))) {
    await user.setPassword(config.owner.password);
    changed = true;
    logger.info(`Admin password synced from environment for ${email}`);
  }
  if (changed) await user.save();
  return user;
}
