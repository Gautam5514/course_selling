import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import { connectDB, disconnectDB } from '../db/connect.js';
import { User } from '../models/User.js';
import { Note } from '../models/Note.js';
import { Space } from '../models/Space.js';
import { Block } from '../models/Block.js';
import { upsertStarterNotes } from '../data/starterNotes.js';

async function seed() {
  await connectDB();

  // 1) Owner / admin account. The server also does this on boot; the seed
  //    additionally resets the password to the configured one.
  let owner = await User.findOne({ email: config.owner.email.toLowerCase() }).select('+passwordHash');
  if (!owner) {
    owner = new User({ email: config.owner.email, name: config.owner.name, role: 'ADMIN' });
    await owner.setPassword(config.owner.password);
    await owner.save();
    logger.info(`Created admin: ${owner.email}`);
  } else {
    owner.role = 'ADMIN';
    await owner.setPassword(config.owner.password);
    await owner.save();
    logger.info(`Admin already exists, password reset from env: ${owner.email}`);
  }

  // 2) Sample public note.
  const noteSlug = 'welcome-note';
  if (!(await Note.findOne({ slug: noteSlug }))) {
    await Note.create({
      slug: noteSlug,
      title: 'Welcome Note',
      description: 'Seeded example note.',
      category: 'general',
      tags: ['welcome'],
      visibility: 'PUBLIC',
      featured: false,
      author: owner._id,
      publishedAt: new Date(),
    });
    logger.info('Created sample note');
  }

  // 2b) Starter note cards (DSA, Frontend, Full Stack, Backend, ...). Counters
  //     start at zero: they are real. Existing cards get their text refreshed.
  const { created, updated } = await upsertStarterNotes({ ownerId: owner._id, refresh: true });
  logger.info({ created, updated }, 'Starter notes ready');

  // 2c) Notes created before the `featured` flag existed: show them on the
  //     home page, except the sample welcome note.
  await Note.updateMany({ featured: { $exists: false }, slug: { $ne: noteSlug } }, { $set: { featured: true } });
  await Note.updateMany({ slug: noteSlug }, { $set: { featured: false } });

  // 3) Sample space with one code + one SQL block.
  const spaceSlug = 'welcome-space';
  let space = await Space.findOne({ slug: spaceSlug });
  if (!space) {
    space = await Space.create({
      slug: spaceSlug,
      title: 'Welcome Space',
      description: 'Seeded example workspace.',
      visibility: 'PUBLIC',
      owner: owner._id,
    });
    await Block.create([
      {
        space: space._id,
        type: 'CODE',
        position: 0,
        content: { language: 'javascript', code: "console.log('hello world');", filename: 'hello.js' },
      },
      {
        space: space._id,
        type: 'SQL',
        position: 1,
        content: { dialect: 'postgres', sql: 'SELECT 1 AS answer;' },
      },
    ]);
    logger.info('Created sample space with blocks');
  }

  logger.info('Seed complete');
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  logger.error({ err }, 'Seed failed');
  process.exit(1);
});
