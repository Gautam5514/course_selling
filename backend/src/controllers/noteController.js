import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData, ApiError } from '../utils/apiError.js';
import { signFileUrl } from '../utils/signedUrl.js';
import { Note } from '../models/Note.js';
import { Upload } from '../models/Upload.js';
import { registerUpload, discardUpload } from './uploadController.js';
import { upsertStarterNotes, STARTER_NOTES } from '../data/starterNotes.js';

const PUBLIC_FILTER = { visibility: 'PUBLIC', publishedAt: { $ne: null }, deletedAt: null };
const POPULATE_FILES = [
  { path: 'primaryFile', match: { deletedAt: null } },
  { path: 'assets.upload', match: { deletedAt: null } },
];

/** Turn a title into a URL-safe kebab-case slug. */
export function slugify(input) {
  return String(input ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

/** Pick a slug that is not taken yet (appends -2, -3, …). */
async function uniqueSlug(base, excludeId) {
  const root = slugify(base) || 'note';
  let candidate = root;
  for (let i = 2; i < 1000; i += 1) {
    const clash = await Note.exists(excludeId ? { slug: candidate, _id: { $ne: excludeId } } : { slug: candidate });
    if (!clash) return candidate;
    candidate = `${root}-${i}`;
  }
  throw ApiError.conflict('Could not find a free link for this note. Please set one manually.');
}

/** Escape user input before using it inside a regex. */
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Rethrow Mongo duplicate-key errors as a friendly conflict. */
function friendlyDuplicate(err) {
  if (err?.code === 11000) {
    return ApiError.conflict('A note with this link (slug) already exists. Please choose another.');
  }
  return err;
}

// ─── Public ──────────────────────────────────────────────────────────────────
export const listPublicNotes = asyncHandler(async (req, res) => {
  const { limit, cursor, category, tag, q, featured } = req.query;

  const filter = { ...PUBLIC_FILTER };
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (q) filter.title = { $regex: escapeRegex(q), $options: 'i' };
  if (featured !== undefined) filter.featured = featured;

  // Featured (home page) listing is small and manually ordered; everything
  // else pages newest-first by id.
  if (featured === true) {
    const docs = await Note.find(filter).sort({ order: 1, createdAt: 1 }).limit(100).populate(POPULATE_FILES);
    return sendData(res, docs.map(cardView), 200, { nextCursor: null });
  }

  if (cursor) filter._id = { $lt: cursor };
  const docs = await Note.find(filter).sort({ _id: -1 }).limit(limit + 1).populate(POPULATE_FILES);

  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;
  const nextCursor = hasMore ? page[page.length - 1]._id.toString() : null;

  return sendData(res, page.map(cardView), 200, { nextCursor });
});

export const getPublicNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ slug: req.params.slug, ...PUBLIC_FILTER }).populate(POPULATE_FILES);
  if (!note) throw ApiError.notFound('We could not find that note.');
  return sendData(res, enrichNote(note, { member: Boolean(req.user) }));
});

/**
 * Signed, short-lived links to the note's main PDF and attachments. Requires a
 * signed-in account (reading is login-gated on the site).
 */
export const getPublicNoteFile = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ slug: req.params.slug, ...PUBLIC_FILTER }).populate(POPULATE_FILES);
  if (!note) throw ApiError.notFound('We could not find that note.');

  const pf = note.primaryFile;
  const primary = pf
    ? {
        id: pf._id.toString(),
        originalName: pf.originalName,
        mimeType: pf.mimeType,
        byteSize: pf.byteSize,
        pages: note.pages ?? pf.pageCount ?? null,
        viewUrl: signFileUrl(pf._id.toString()),
        downloadUrl: signFileUrl(pf._id.toString(), { download: true }),
      }
    : null;

  const attachments = note.assets
    .filter((a) => a.upload && a.upload.key !== undefined && a.role !== 'primary')
    .sort((a, b) => a.position - b.position)
    .map((a) => ({
      id: a.upload._id.toString(),
      role: a.role,
      originalName: a.upload.originalName,
      mimeType: a.upload.mimeType,
      byteSize: a.upload.byteSize,
      downloadUrl: signFileUrl(a.upload._id.toString(), { download: true }),
    }));

  return sendData(res, { primary, attachments, expiresInSeconds: 3600 });
});

/**
 * Shape a note for the public reader page.
 *
 * Access policy (enforced here, not just in the UI):
 *   - everyone      : title, category, description, instructor, tags, stats,
 *                     chapter *titles*, and how much content exists
 *   - signed-in     : chapter summaries/snippets, code blocks, attachment links
 *   - PDF bytes     : always via /:slug/file (signed-in) → signed raw links
 */
function enrichNote(note, { member = false } = {}) {
  const data = note.toJSON();
  const codeBlocks = data.blocks.filter((b) => b.type === 'CODE');
  const attachments = data.assets.filter((a) => a.role !== 'primary');

  data.access = { member, locked: !member };
  data.chapterCount = data.chapters.length;
  data.codeCount = codeBlocks.length;
  data.attachmentCount = attachments.length;
  data.hasFile = Boolean(data.file);

  if (!member) {
    data.chapters = data.chapters.map((c) => ({ number: c.number, title: c.title }));
    data.blocks = [];
    data.assets = [];
    delete data.primaryFile;
    delete data.file;
    data.file = null;
    return data;
  }

  data.blocks = data.blocks.map((b) =>
    b.type === 'FILE' && b.content?.uploadId
      ? { ...b, content: { ...b.content, downloadUrl: `/api/uploads/${b.content.uploadId}/raw` } }
      : b
  );
  data.assets = data.assets.map((a) => ({ ...a, downloadUrl: `/api/uploads/${a.upload}/raw` }));
  if (data.primaryFile) data.primaryFileUrl = `/api/uploads/${data.primaryFile}/raw`;
  return data;
}

/** Card listing never needs chapter bodies or code. */
function cardView(note) {
  const data = note.toJSON();
  data.chapterCount = data.chapters.length;
  data.codeCount = data.blocks.filter((b) => b.type === 'CODE').length;
  data.hasFile = Boolean(data.file);
  data.chapters = data.chapters.map((c) => ({ number: c.number, title: c.title }));
  data.blocks = [];
  data.assets = [];
  return data;
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export const listNotes = asyncHandler(async (req, res) => {
  const { q, status, category, page, limit } = req.query;

  const filter = {};
  if (status === 'trash') filter.deletedAt = { $ne: null };
  else filter.deletedAt = null;
  if (status === 'published') Object.assign(filter, { visibility: 'PUBLIC', publishedAt: { $ne: null } });
  if (status === 'draft') filter.$or = [{ visibility: { $ne: 'PUBLIC' } }, { publishedAt: null }];
  if (category) filter.category = category;
  if (q) {
    const rx = { $regex: escapeRegex(q), $options: 'i' };
    filter.$and = [{ $or: [{ title: rx }, { slug: rx }, { tagline: rx }, { category: rx }, { tags: rx }] }];
  }

  const [total, docs, categories] = await Promise.all([
    Note.countDocuments(filter),
    Note.find(filter)
      .sort({ order: 1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(POPULATE_FILES),
    Note.distinct('category', { deletedAt: null, category: { $nin: [null, ''] } }),
  ]);

  return sendData(res, docs.map((d) => d.toJSON()), 200, {
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
    categories: categories.sort(),
  });
});

// POST /api/admin/notes/starter — add the built-in starter cards that are missing.
export const addStarterNotes = asyncHandler(async (req, res) => {
  const { created } = await upsertStarterNotes({ ownerId: req.user._id });
  return sendData(res, { created, total: STARTER_NOTES.length });
});

export const getNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id }).populate(POPULATE_FILES);
  if (!note) throw ApiError.notFound('We could not find that note.');
  return sendData(res, note.toJSON());
});

export const createNote = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.slug) {
    // An explicit slug must be free; a generated one gets a numeric suffix.
    if (await Note.exists({ slug: body.slug })) {
      throw ApiError.conflict('A note with this link (slug) already exists. Please choose another.');
    }
  } else {
    body.slug = await uniqueSlug(body.title);
  }
  if (body.visibility === 'PUBLIC') body.publishedAt = new Date();

  let note;
  try {
    note = await Note.create({ ...body, author: req.user._id });
  } catch (err) {
    throw friendlyDuplicate(err);
  }
  await note.populate(POPULATE_FILES);
  return sendData(res, note.toJSON(), 201);
});

export const updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, deletedAt: null });
  if (!note) throw ApiError.notFound('We could not find that note.');

  const { publish, slug, ...fields } = req.body;
  if (slug !== undefined && slug !== note.slug) {
    const taken = await Note.exists({ slug, _id: { $ne: note._id } });
    if (taken) throw ApiError.conflict('A note with this link (slug) already exists. Please choose another.');
    note.slug = slug;
  }
  Object.assign(note, fields);

  if (publish === true) {
    note.visibility = 'PUBLIC';
    note.publishedAt = note.publishedAt ?? new Date();
  } else if (publish === false) {
    note.publishedAt = null;
  } else if (fields.visibility === 'PUBLIC' && !note.publishedAt) {
    note.publishedAt = new Date();
  }

  try {
    await note.save();
  } catch (err) {
    throw friendlyDuplicate(err);
  }
  await note.populate(POPULATE_FILES);
  return sendData(res, note.toJSON());
});

/** Manual ordering of the home-page cards. */
export const reorderNotes = asyncHandler(async (req, res) => {
  const ops = req.body.order.map(({ id, order }) => ({
    updateOne: { filter: { _id: id, deletedAt: null }, update: { $set: { order } } },
  }));
  await Note.bulkWrite(ops, { ordered: false });
  return sendData(res, { ok: true, updated: ops.length });
});

/** Upload a file straight onto a note (main PDF, attachment or cover). */
export const attachNoteFile = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, deletedAt: null });
  if (!note) throw ApiError.notFound('We could not find that note.');
  if (!req.file) throw ApiError.badRequest('Please choose a file to upload.');

  const { role } = req.query;
  const upload = await registerUpload(req.file, req.user._id);

  if (role === 'primary') {
    const previous = note.primaryFile;
    note.primaryFile = upload._id;
    note.assets = note.assets.filter((a) => a.role !== 'primary');
    note.assets.push({ upload: upload._id, role: 'primary', position: 0 });
    if (upload.pageCount) note.pages = upload.pageCount;
    if (previous) await discardUpload(previous);
  } else {
    if (role === 'cover') {
      const old = note.assets.filter((a) => a.role === 'cover');
      note.assets = note.assets.filter((a) => a.role !== 'cover');
      for (const a of old) await discardUpload(a.upload);
    }
    const position = note.assets.length ? Math.max(...note.assets.map((a) => a.position)) + 1 : 0;
    note.assets.push({ upload: upload._id, role, position });
  }

  await note.save();
  await note.populate(POPULATE_FILES);
  return sendData(res, note.toJSON(), 201);
});

export const removeNoteFile = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, deletedAt: null });
  if (!note) throw ApiError.notFound('We could not find that note.');

  const { uploadId } = req.params;
  const owned = note.assets.some((a) => a.upload.toString() === uploadId) || note.primaryFile?.toString() === uploadId;
  if (!owned) throw ApiError.notFound('That file is not attached to this note.');

  note.assets = note.assets.filter((a) => a.upload.toString() !== uploadId);
  if (note.primaryFile?.toString() === uploadId) note.primaryFile = null;
  await note.save();
  await discardUpload(uploadId);
  await note.populate(POPULATE_FILES);
  return sendData(res, note.toJSON());
});

export const addNoteAssets = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, deletedAt: null });
  if (!note) throw ApiError.notFound('We could not find that note.');
  for (const a of req.body.assets) {
    const exists = await Upload.exists({ _id: a.upload, deletedAt: null });
    if (!exists) throw ApiError.badRequest('One of the files no longer exists.');
    note.assets.push(a);
    if (a.role === 'primary') note.primaryFile = a.upload;
  }
  await note.save();
  await note.populate(POPULATE_FILES);
  return sendData(res, note.toJSON());
});

export const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, deletedAt: null });
  if (!note) throw ApiError.notFound('We could not find that note.');
  note.deletedAt = new Date();
  await note.save();
  return sendData(res, { ok: true });
});

export const restoreNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, deletedAt: { $ne: null } });
  if (!note) throw ApiError.notFound('That note is not in the trash.');
  note.deletedAt = null;
  await note.save();
  await note.populate(POPULATE_FILES);
  return sendData(res, note.toJSON());
});

// ─── Note blocks (Option A: blocks embedded on a Note) ───────────────────────
async function findOwnedNote(id) {
  const note = await Note.findOne({ _id: id, deletedAt: null });
  if (!note) throw ApiError.notFound('We could not find that note.');
  return note;
}

export const addNoteBlock = asyncHandler(async (req, res) => {
  const note = await findOwnedNote(req.params.id);

  let { position } = req.body;
  if (position === undefined) {
    position = note.blocks.length ? Math.max(...note.blocks.map((b) => b.position)) + 1 : 0;
  }
  note.blocks.push({ type: req.body.type, position, content: req.body.content });
  await note.save();
  await note.populate(POPULATE_FILES);
  return sendData(res, note.toJSON(), 201);
});

export const updateNoteBlock = asyncHandler(async (req, res) => {
  const note = await findOwnedNote(req.params.id);
  const block = note.blocks.id(req.params.blockId);
  if (!block) throw ApiError.notFound('That snippet no longer exists.');
  block.content = req.body.content;
  await note.save();
  await note.populate(POPULATE_FILES);
  return sendData(res, note.toJSON());
});

export const deleteNoteBlock = asyncHandler(async (req, res) => {
  const note = await findOwnedNote(req.params.id);
  const block = note.blocks.id(req.params.blockId);
  if (!block) throw ApiError.notFound('That snippet no longer exists.');
  block.deleteOne();
  await note.save();
  await note.populate(POPULATE_FILES);
  return sendData(res, note.toJSON());
});

export const reorderNoteBlocks = asyncHandler(async (req, res) => {
  const note = await findOwnedNote(req.params.id);
  const posById = new Map(req.body.order.map((o) => [o.blockId, o.position]));

  for (const blockId of posById.keys()) {
    if (!note.blocks.id(blockId)) {
      throw ApiError.badRequest('One or more snippets do not belong to this note.');
    }
  }
  for (const block of note.blocks) {
    const next = posById.get(block._id.toString());
    if (next !== undefined) block.position = next;
  }
  await note.save();
  await note.populate(POPULATE_FILES);
  return sendData(res, note.toJSON());
});
