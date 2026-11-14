import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { nanoid } from 'nanoid';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import { connectDB, disconnectDB } from '../db/connect.js';
import { User } from '../models/User.js';
import { Note } from '../models/Note.js';
import { Upload } from '../models/Upload.js';
import { registerUpload, discardUpload } from '../controllers/uploadController.js';
import { uploadRoot } from '../storage/index.js';

/**
 * Publish the notes PDFs built by ../notes-pdf (`npm run build` there).
 *
 *   npm run publish:notes                 every note in the manifest
 *   npm run publish:notes -- dsa-notes    only the given slugs
 *   npm run publish:notes -- --force      re-upload even when the PDF is unchanged
 *
 * For each note it uploads the PDF to the configured storage (Cloudinary when
 * credentials are set), makes it the note's main PDF and updates the fields
 * that describe the document: page count, chapters, tagline, description and
 * tags. Likes, ratings, downloads, projects and attachments are never touched.
 * A PDF whose checksum matches the one already attached is skipped.
 */
const DIST = path.resolve(process.cwd(), process.env.NOTES_PDF_DIR || '../notes-pdf/dist');

async function publishOne(entry, owner, { force }) {
  const note = await Note.findOne({ slug: entry.slug, deletedAt: null });
  if (!note) {
    logger.warn(`${entry.slug}: no such note in the database, skipped (add the starter notes first)`);
    return 'missing';
  }
  const source = path.join(DIST, entry.file);
  if (!fs.existsSync(source)) {
    logger.warn(`${entry.slug}: ${entry.file} not found in ${DIST}, skipped`);
    return 'missing';
  }

  // registerUpload consumes a multer-style temp file, so hand it a copy.
  const filename = `${Date.now()}-${nanoid(12)}.pdf`;
  const tmp = path.join(uploadRoot, filename);
  fs.copyFileSync(source, tmp);
  const file = { path: tmp, filename, originalname: `${entry.slug}.pdf`, mimetype: 'application/pdf', size: fs.statSync(tmp).size };

  const previous = note.primaryFile ? await Upload.findOne({ _id: note.primaryFile, deletedAt: null }) : null;
  let upload = null;
  if (previous && !force) {
    const checksum = crypto.createHash('sha256').update(fs.readFileSync(tmp)).digest('hex');
    if (previous.checksum === checksum) upload = previous;
  }
  const unchanged = Boolean(upload);
  if (unchanged) fs.rmSync(tmp, { force: true });
  else upload = await registerUpload(file, owner._id);

  note.primaryFile = upload._id;
  note.assets = note.assets.filter((a) => a.role !== 'primary');
  note.assets.push({ upload: upload._id, role: 'primary', position: 0 });
  note.pages = entry.pages ?? upload.pageCount ?? note.pages;
  note.chapters = entry.chapters;
  note.tagline = entry.tagline || note.tagline;
  note.description = entry.description || note.description;
  note.level = entry.level || note.level;
  if (entry.tags?.length) note.tags = entry.tags;
  await note.save();

  if (!unchanged && previous) await discardUpload(previous._id);
  logger.info(`${entry.slug}: ${unchanged ? 'PDF unchanged, details refreshed' : `uploaded to ${upload.provider}`} (${note.pages} pages, ${entry.chapters.length} chapters)`);
  return unchanged ? 'refreshed' : 'uploaded';
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const only = args.filter((a) => !a.startsWith('--'));

  const manifestFile = path.join(DIST, 'manifest.json');
  if (!fs.existsSync(manifestFile)) throw new Error(`No manifest at ${manifestFile}. Run "npm run build" in notes-pdf first.`);
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  const entries = Object.values(manifest).filter((e) => !e.slug.startsWith('_') && (!only.length || only.includes(e.slug)));
  if (!entries.length) throw new Error('Nothing to publish: no matching notes in the manifest.');

  await connectDB();
  const owner = await User.findOne({ email: config.owner.email.toLowerCase() });
  if (!owner) throw new Error('Owner account not found. Start the server once (or run the seed) to create it.');
  if (!config.cloudinary.enabled) logger.warn('Cloudinary is not configured: PDFs will be stored on local disk.');

  const results = {};
  for (const entry of entries) {
    try {
      results[entry.slug] = await publishOne(entry, owner, { force });
    } catch (err) {
      results[entry.slug] = 'failed';
      logger.error({ err: err?.message }, `${entry.slug}: publish failed`);
    }
  }
  logger.info({ results }, 'Notes publish finished');
  await disconnectDB();
  process.exit(Object.values(results).includes('failed') ? 1 : 0);
}

main().catch(async (err) => {
  logger.error({ err: err?.message }, 'Notes publish failed');
  await disconnectDB().catch(() => {});
  process.exit(1);
});
