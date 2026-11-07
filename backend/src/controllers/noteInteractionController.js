import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData, ApiError } from '../utils/apiError.js';
import { Note } from '../models/Note.js';
import { NoteInteraction } from '../models/NoteInteraction.js';
import { User } from '../models/User.js';

/**
 * Engagement for public notes: likes, 1-5 star ratings, downloads.
 * Writes are member-only (routes use `requireAuth`), so `req.visitorId` is
 * always `user:<id>` there; stats reads work for anyone and only attach
 * `liked` / `myRating` when we know who is asking.
 *
 * Design notes
 *  - One NoteInteraction row per (note, visitor), enforced by a unique index.
 *  - Every write is a compare-and-set on that row (`liked`/`rating` must still
 *    equal what we read), so two concurrent requests from the same visitor can
 *    never double-count. If the CAS misses, the request is a no-op and simply
 *    returns the current numbers.
 *  - Counters on the Note are only touched when the CAS succeeded.
 */

const PUBLIC_FILTER = { visibility: 'PUBLIC', publishedAt: { $ne: null }, deletedAt: null };
const DUPLICATE_KEY = 11000;

function statsFor(note, interaction) {
  return {
    slug: note.slug,
    likes: note.likes,
    downloads: note.downloads,
    pages: note.pages ?? null,
    rating: note.averageRating(),
    ratingCount: note.ratingCount,
    liked: Boolean(interaction?.liked),
    myRating: interaction?.rating ?? null,
    myReview: interaction?.review ?? '',
  };
}

async function findPublicNote(slug) {
  const note = await Note.findOne({ slug, ...PUBLIC_FILTER });
  if (!note) throw ApiError.notFound('Note not found');
  return note;
}

async function respondWithFresh(res, noteId, visitorId) {
  const [note, interaction] = await Promise.all([
    Note.findById(noteId),
    visitorId ? NoteInteraction.findOne({ note: noteId, visitor: visitorId }) : null,
  ]);
  if (!note) throw ApiError.notFound('Note not found');
  return sendData(res, statsFor(note, interaction));
}

/** Ignore "already exists" races on upserts; rethrow anything else. */
function isDuplicate(err) {
  return err?.code === DUPLICATE_KEY;
}

// ─── GET /api/public/notes/stats?slugs=a,b,c ─────────────────────────────────
export const getNoteStats = asyncHandler(async (req, res) => {
  const { slugs } = req.query;
  const notes = await Note.find({ slug: { $in: slugs }, ...PUBLIC_FILTER });

  let mine = new Map();
  if (req.visitorId && notes.length) {
    const rows = await NoteInteraction.find({
      visitor: req.visitorId,
      note: { $in: notes.map((n) => n._id) },
    });
    mine = new Map(rows.map((r) => [r.note.toString(), r]));
  }

  const out = {};
  for (const note of notes) out[note.slug] = statsFor(note, mine.get(note._id.toString()));
  return sendData(res, out);
});

// ─── POST /api/public/notes/:slug/like ───────────────────────────────────────
// Body (optional): { liked: boolean } — omit to toggle.
export const toggleLike = asyncHandler(async (req, res) => {
  const note = await findPublicNote(req.params.slug);
  const key = { note: note._id, visitor: req.visitorId };

  const existing = await NoteInteraction.findOne(key);
  const currentlyLiked = Boolean(existing?.liked);
  const wantLiked = typeof req.body?.liked === 'boolean' ? req.body.liked : !currentlyLiked;

  if (wantLiked !== currentlyLiked) {
    let changed = false;
    if (wantLiked) {
      // CAS: only succeeds if the row is missing or still un-liked.
      try {
        const r = await NoteInteraction.updateOne(
          { ...key, liked: { $ne: true } },
          { $set: { liked: true }, $setOnInsert: { rating: null } },
          { upsert: true }
        );
        changed = r.modifiedCount > 0 || Boolean(r.upsertedCount);
      } catch (err) {
        if (!isDuplicate(err)) throw err; // someone liked concurrently → no-op
      }
      if (changed) await Note.updateOne({ _id: note._id }, { $inc: { likes: 1 } });
    } else {
      const r = await NoteInteraction.updateOne({ ...key, liked: true }, { $set: { liked: false } });
      changed = r.modifiedCount > 0;
      // Never let the counter go negative, even if it was edited by hand.
      if (changed) await Note.updateOne({ _id: note._id, likes: { $gt: 0 } }, { $inc: { likes: -1 } });
    }
  }

  return respondWithFresh(res, note._id, req.visitorId);
});

// ─── POST /api/public/notes/:slug/rate { value: 1..5, review? } ──────────────
export const rateNote = asyncHandler(async (req, res) => {
  const note = await findPublicNote(req.params.slug);
  const { value, review } = req.body;
  const key = { note: note._id, visitor: req.visitorId };

  // One retry covers the "row inserted concurrently" race.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const existing = await NoteInteraction.findOne(key);
    const previous = existing?.rating ?? null;
    if (previous === value) break; // nothing to do

    let changed = false;
    try {
      const r = await NoteInteraction.updateOne(
        { ...key, rating: previous }, // CAS on the rating we read
        { $set: { rating: value }, $setOnInsert: { liked: false } },
        { upsert: !existing }
      );
      changed = r.modifiedCount > 0 || Boolean(r.upsertedCount);
    } catch (err) {
      if (!isDuplicate(err)) throw err;
      continue; // row appeared under us → re-read and retry once
    }

    if (changed) {
      await Note.updateOne(
        { _id: note._id },
        { $inc: { ratingSum: value - (previous ?? 0), ratingCount: previous === null ? 1 : 0 } }
      );
    }
    break;
  }

  // The written review rides along with the rating (the row exists by now).
  if (typeof review === 'string') {
    await NoteInteraction.updateOne(key, { $set: { review, reviewedAt: review ? new Date() : null } });
  }

  return respondWithFresh(res, note._id, req.visitorId);
});

// ─── GET /api/public/notes/reviews ───────────────────────────────────────────
// Latest written reviews across all live notes (home page testimonials). Public.
export const listLatestReviews = asyncHandler(async (req, res) => {
  const notes = await Note.find(PUBLIC_FILTER).select('title slug category');
  const byId = new Map(notes.map((n) => [n._id.toString(), n]));
  const rows = await NoteInteraction.find({ note: { $in: notes.map((n) => n._id) }, rating: { $ne: null }, review: { $nin: [null, ''] } })
    .sort({ reviewedAt: -1, updatedAt: -1 })
    .limit(req.query.limit);
  const ids = rows.map((r) => (r.visitor.startsWith('user:') ? r.visitor.slice(5) : null)).filter(Boolean);
  const users = ids.length ? await User.find({ _id: { $in: ids } }).select('name') : [];
  const names = new Map(users.map((u) => [u._id.toString(), u.name]));
  return sendData(
    res,
    rows.map((r) => {
      const n = byId.get(r.note.toString());
      return {
        id: r._id.toString(),
        name: names.get(r.visitor.slice(5)) || 'A member',
        rating: r.rating,
        review: r.review,
        at: r.reviewedAt || r.updatedAt,
        note: n ? { slug: n.slug, title: n.title, category: n.category ?? null } : null,
      };
    }),
    200,
    { total: rows.length }
  );
});

// ─── GET /api/public/notes/:slug/reviews ─────────────────────────────────────
// Written reviews (rating + text) from members, newest first. Public.
export const listNoteReviews = asyncHandler(async (req, res) => {
  const note = await findPublicNote(req.params.slug);
  const filter = { note: note._id, rating: { $ne: null }, review: { $nin: [null, ''] } };
  const [total, rows] = await Promise.all([
    NoteInteraction.countDocuments(filter),
    NoteInteraction.find(filter).sort({ reviewedAt: -1, updatedAt: -1 }).limit(req.query.limit),
  ]);
  const ids = rows.map((r) => r.visitor.startsWith('user:') ? r.visitor.slice(5) : null).filter(Boolean);
  const users = ids.length ? await User.find({ _id: { $in: ids } }).select('name') : [];
  const names = new Map(users.map((u) => [u._id.toString(), u.name]));
  const reviews = rows.map((r) => ({
    id: r._id.toString(),
    name: names.get(r.visitor.slice(5)) || 'A member',
    rating: r.rating,
    review: r.review,
    at: r.reviewedAt || r.updatedAt,
    mine: r.visitor === req.visitorId,
  }));
  return sendData(res, reviews, 200, { total, rating: note.averageRating(), ratingCount: note.ratingCount });
});

// ─── POST /api/public/notes/:slug/download ───────────────────────────────────
// Counts a download. Counted once per visitor per day so refresh-spam does
// not inflate it, but repeated genuine downloads over time still count.
export const recordDownload = asyncHandler(async (req, res) => {
  const note = await findPublicNote(req.params.slug);
  const key = { note: note._id, visitor: req.visitorId };
  const today = new Date().toISOString().slice(0, 10);

  let counted = false;
  try {
    const r = await NoteInteraction.updateOne(
      { ...key, lastDownloadDay: { $ne: today } },
      { $set: { lastDownloadDay: today }, $setOnInsert: { liked: false, rating: null } },
      { upsert: true }
    );
    counted = r.modifiedCount > 0 || Boolean(r.upsertedCount);
  } catch (err) {
    if (!isDuplicate(err)) throw err;
  }
  if (counted) await Note.updateOne({ _id: note._id }, { $inc: { downloads: 1 } });

  return respondWithFresh(res, note._id, req.visitorId);
});
