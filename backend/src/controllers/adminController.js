import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData, ApiError } from '../utils/apiError.js';
import { Note } from '../models/Note.js';
import { User } from '../models/User.js';
import { Upload } from '../models/Upload.js';

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── GET /api/admin/dashboard ────────────────────────────────────────────────
export const getDashboard = asyncHandler(async (_req, res) => {
  const live = { visibility: 'PUBLIC', publishedAt: { $ne: null }, deletedAt: null };

  const [notesTotal, notesPublished, notesTrash, usersByRole, totals, recent, top, storage] = await Promise.all([
    Note.countDocuments({ deletedAt: null }),
    Note.countDocuments(live),
    Note.countDocuments({ deletedAt: { $ne: null } }),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Note.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: null,
          likes: { $sum: '$likes' },
          downloads: { $sum: '$downloads' },
          ratings: { $sum: '$ratingCount' },
          ratingSum: { $sum: '$ratingSum' },
        },
      },
    ]),
    Note.find({ deletedAt: null }).sort({ updatedAt: -1 }).limit(6).populate({ path: 'primaryFile', match: { deletedAt: null } }),
    Note.find(live).sort({ likes: -1, downloads: -1 }).limit(5),
    Upload.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: null, files: { $sum: 1 }, bytes: { $sum: '$byteSize' } } },
    ]),
  ]);

  const roles = Object.fromEntries(usersByRole.map((r) => [r._id, r.count]));
  const t = totals[0] ?? { likes: 0, downloads: 0, ratings: 0, ratingSum: 0 };

  return sendData(res, {
    notes: { total: notesTotal, published: notesPublished, draft: notesTotal - notesPublished, trash: notesTrash },
    users: {
      total: Object.values(roles).reduce((a, b) => a + b, 0),
      admins: (roles.ADMIN ?? 0) + (roles.EDITOR ?? 0),
      students: roles.VIEWER ?? 0,
    },
    engagement: {
      likes: t.likes,
      downloads: t.downloads,
      ratings: t.ratings,
      averageRating: t.ratings ? Math.round((t.ratingSum / t.ratings) * 100) / 100 : null,
    },
    storage: { files: storage[0]?.files ?? 0, bytes: storage[0]?.bytes ?? 0 },
    recentNotes: recent.map((n) => n.toJSON()),
    topNotes: top.map((n) => ({
      id: n._id.toString(),
      slug: n.slug,
      title: n.title,
      likes: n.likes,
      downloads: n.downloads,
      rating: n.averageRating(),
      ratingCount: n.ratingCount,
    })),
  });
});

// ─── Users ───────────────────────────────────────────────────────────────────
export const listUsers = asyncHandler(async (req, res) => {
  const { q, role, page, limit } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (q) {
    const rx = { $regex: escapeRegex(q), $options: 'i' };
    filter.$or = [{ email: rx }, { name: rx }];
  }
  const [total, docs] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
  ]);
  return sendData(res, docs.map((u) => u.toSafeJSON()), 200, {
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (id === req.user._id.toString()) {
    throw ApiError.badRequest('You cannot change your own role. Ask another administrator.');
  }
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('We could not find that account.');

  if (user.role === 'ADMIN' && role !== 'ADMIN') {
    const admins = await User.countDocuments({ role: 'ADMIN' });
    if (admins <= 1) throw ApiError.badRequest('There must always be at least one administrator.');
  }

  user.role = role;
  await user.save();
  return sendData(res, user.toSafeJSON());
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (id === req.user._id.toString()) throw ApiError.badRequest('You cannot delete your own account.');

  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('We could not find that account.');
  if (user.role === 'ADMIN') {
    const admins = await User.countDocuments({ role: 'ADMIN' });
    if (admins <= 1) throw ApiError.badRequest('There must always be at least one administrator.');
  }
  await user.deleteOne();
  return sendData(res, { ok: true });
});
