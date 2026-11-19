#!/usr/bin/env node
/**
 * Keeps the "PDF Notes" page cards honest: copies the real facts of every
 * built handbook (dist/manifest.json + the PDF's size) into
 * ../course_selling/data/pdfNotesData.js.
 *
 *   node sync-catalog.mjs
 *
 * Per card it rewrites: pages, fileSize, description, author and chapters.
 * Title, category, badge and tags of the card are left alone. Cards whose
 * handbook is not in the manifest are not touched. Run it after `npm run build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const DATA = path.resolve(ROOT, '../course_selling/data/pdfNotesData.js');
const AUTHOR = 'Gautam Pandit';

const manifest = JSON.parse(fs.readFileSync(path.join(DIST, 'manifest.json'), 'utf8'));
const { pdfCategories, pdfNotesList } = await import(`${pathToFileURL(DATA).href}?t=${Date.now()}`);

const mb = (bytes) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

let synced = 0;
const cards = pdfNotesList.map((card) => {
  const entry = manifest[card.id];
  const file = entry && path.join(DIST, entry.file);
  if (!entry || !fs.existsSync(file)) return card;
  synced += 1;
  // Fake counters are dropped: likes and downloads come from the API.
  const { downloads: _d, likes: _l, ...rest } = card;
  return {
    ...rest,
    pages: entry.pages,
    fileSize: mb(fs.statSync(file).size),
    author: AUTHOR,
    description: entry.description || card.description,
    chapters: entry.chapters.map((c) => ({
      number: String(c.number).padStart(2, '0'),
      title: c.title,
      summary: c.summary || '',
      contentSnippet: c.contentSnippet || '',
    })),
  };
});

const source = fs.readFileSync(DATA, 'utf8');
const tailAt = source.indexOf('/* ---- Precomputed lookups');
if (tailAt === -1) throw new Error('Could not find the lookups section in pdfNotesData.js');

const out = `// Catalog of the free handbooks on the PDF Notes page. The card id is the note
// slug in the backend, so /pdf/<id> opens the real PDF. pages, fileSize,
// description, author and chapters are written by notes-pdf/sync-catalog.mjs
// from the built PDFs: edit the Markdown in notes-pdf/content, not these.

export const pdfCategories = ${JSON.stringify(pdfCategories, null, 2)};

export const pdfNotesList = ${JSON.stringify(cards, null, 2)};

${source.slice(tailAt)}`;

fs.writeFileSync(DATA, out);
console.log(`Synced ${synced} of ${cards.length} cards into ${path.relative(ROOT, DATA)}`);
