import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData, ApiError } from '../utils/apiError.js';
import { config } from '../config/index.js';
import { DailyCode } from '../models/DailyCode.js';

const LIVE = { publishedAt: { $ne: null } };
const DUPLICATE_KEY = 11000;

/** Today's calendar date (YYYY-MM-DD) in the site's timezone, not the server's. */
export function todayKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: config.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Dates of the live entries just before / after `date`, for prev/next links. */
async function neighbours(date) {
  const [prev, next] = await Promise.all([
    DailyCode.findOne({ ...LIVE, date: { $lt: date } }).sort({ date: -1 }).select('date title'),
    DailyCode.findOne({ ...LIVE, date: { $gt: date, $lte: todayKey() } }).sort({ date: 1 }).select('date title'),
  ]);
  const pick = (d) => (d ? { date: d.date, title: d.title } : null);
  return { prev: pick(prev), next: pick(next) };
}

// ─── Public (members) ────────────────────────────────────────────────────────

/** GET /api/public/daily-code — archive list. Anyone may see titles/dates. */
export const listDailyCode = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const filter = { ...LIVE, date: { $lte: todayKey() } };
  const [total, docs] = await Promise.all([
    DailyCode.countDocuments(filter),
    DailyCode.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);
  return sendData(res, docs.map((d) => d.toSummary()), 200, {
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
    today: todayKey(),
  });
});

/**
 * GET /api/public/daily-code/today — the latest live entry on or before today.
 * `meta.isToday` tells the UI whether it really is today's or the most recent one.
 */
export const getTodayCode = asyncHandler(async (_req, res) => {
  const today = todayKey();
  const doc = await DailyCode.findOne({ ...LIVE, date: { $lte: today } }).sort({ date: -1 });
  if (!doc) return sendData(res, null, 200, { today, isToday: false, prev: null, next: null });
  const nav = await neighbours(doc.date);
  return sendData(res, doc.toJSON(), 200, { today, isToday: doc.date === today, ...nav });
});

/** GET /api/public/daily-code/:date — one past day. */
export const getDailyCodeByDate = asyncHandler(async (req, res) => {
  const { date } = req.params;
  const today = todayKey();
  if (date > today) throw ApiError.notFound("That day hasn't arrived yet. Check back on the day.");
  const doc = await DailyCode.findOne({ ...LIVE, date });
  if (!doc) throw ApiError.notFound('No code was posted for that day.');
  const nav = await neighbours(doc.date);
  return sendData(res, doc.toJSON(), 200, { today, isToday: doc.date === today, ...nav });
});

// ─── Admin ───────────────────────────────────────────────────────────────────

export const adminListDailyCode = asyncHandler(async (req, res) => {
  const { q, status, page, limit } = req.query;
  const filter = {};
  if (status === 'published') filter.publishedAt = { $ne: null };
  if (status === 'draft') filter.publishedAt = null;
  if (q) {
    const rx = { $regex: escapeRegex(q), $options: 'i' };
    filter.$or = [{ title: rx }, { date: rx }, { problemNumber: rx }, { topics: rx }, { platform: rx }];
  }
  const [total, docs, todayDoc] = await Promise.all([
    DailyCode.countDocuments(filter),
    DailyCode.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    DailyCode.findOne({ date: todayKey() }).select('publishedAt'),
  ]);
  return sendData(res, docs.map((d) => d.toSummary()), 200, {
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
    today: todayKey(),
    todayStatus: todayDoc ? (todayDoc.publishedAt ? 'published' : 'draft') : 'missing',
  });
});

export const adminGetDailyCode = asyncHandler(async (req, res) => {
  const doc = await DailyCode.findById(req.params.id);
  if (!doc) throw ApiError.notFound("We couldn't find that day's code.");
  return sendData(res, doc.toJSON());
});

function applyPublish(doc, publish) {
  if (publish === true && !doc.publishedAt) doc.publishedAt = new Date();
  if (publish === false) doc.publishedAt = null;
}

function dateTaken(err) {
  return err?.code === DUPLICATE_KEY && err?.keyPattern?.date;
}

export const adminCreateDailyCode = asyncHandler(async (req, res) => {
  const { publish, ...body } = req.body;
  if (publish && !body.solutions?.length) throw ApiError.badRequest('Add at least one solution before publishing.', [{ path: 'solutions', message: 'Add at least one solution before publishing.' }]);
  const doc = new DailyCode({ ...body, author: req.user._id });
  applyPublish(doc, publish);
  try {
    await doc.save();
  } catch (err) {
    if (dateTaken(err)) throw ApiError.conflict(`You already added code for ${body.date}. Edit that entry instead.`, [{ path: 'date', message: 'This date already has an entry.' }]);
    throw err;
  }
  return sendData(res, doc.toJSON(), 201);
});

export const adminUpdateDailyCode = asyncHandler(async (req, res) => {
  const doc = await DailyCode.findById(req.params.id);
  if (!doc) throw ApiError.notFound("We couldn't find that day's code.");
  const { publish, ...body } = req.body;
  Object.assign(doc, body);
  const willBeLive = publish === true || (publish === undefined && doc.publishedAt);
  if (willBeLive && !doc.solutions?.length) throw ApiError.badRequest('A live entry needs at least one solution.', [{ path: 'solutions', message: 'Add at least one solution, or unpublish.' }]);
  applyPublish(doc, publish);
  try {
    await doc.save();
  } catch (err) {
    if (dateTaken(err)) throw ApiError.conflict(`Another entry already uses ${doc.date}.`, [{ path: 'date', message: 'This date already has an entry.' }]);
    throw err;
  }
  return sendData(res, doc.toJSON());
});

export const adminDeleteDailyCode = asyncHandler(async (req, res) => {
  const doc = await DailyCode.findByIdAndDelete(req.params.id);
  if (!doc) throw ApiError.notFound("We couldn't find that day's code.");
  return sendData(res, { id: doc._id.toString(), deleted: true });
});
