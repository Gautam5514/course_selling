import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData, ApiError } from '../utils/apiError.js';
import { Space } from '../models/Space.js';
import { Block } from '../models/Block.js';

// ─── Public ──────────────────────────────────────────────────────────────────
export const getPublicSpace = asyncHandler(async (req, res) => {
  const space = await Space.findOne({
    slug: req.params.slug,
    visibility: { $in: ['PUBLIC', 'UNLISTED'] },
    deletedAt: null,
  });
  if (!space) throw ApiError.notFound('Space not found');

  const blocks = await Block.find({ space: space._id }).sort({ position: 1 });
  return sendData(res, { space: space.toJSON(), blocks: blocks.map((b) => b.toJSON()) });
});

// ─── Admin ───────────────────────────────────────────────────────────────────
export const listSpaces = asyncHandler(async (req, res) => {
  const docs = await Space.find({ owner: req.user._id, deletedAt: null }).sort({ updatedAt: -1 });
  return sendData(res, docs.map((d) => d.toJSON()));
});

export const createSpace = asyncHandler(async (req, res) => {
  const space = await Space.create({ ...req.body, owner: req.user._id });
  return sendData(res, space.toJSON(), 201);
});

export const getSpace = asyncHandler(async (req, res) => {
  const space = await Space.findOne({ _id: req.params.id, deletedAt: null });
  if (!space) throw ApiError.notFound('Space not found');
  const blocks = await Block.find({ space: space._id }).sort({ position: 1 });
  return sendData(res, { space: space.toJSON(), blocks: blocks.map((b) => b.toJSON()) });
});

export const updateSpace = asyncHandler(async (req, res) => {
  const space = await Space.findOne({ _id: req.params.id, deletedAt: null });
  if (!space) throw ApiError.notFound('Space not found');
  Object.assign(space, req.body);
  await space.save();
  return sendData(res, space.toJSON());
});

export const deleteSpace = asyncHandler(async (req, res) => {
  const space = await Space.findOne({ _id: req.params.id, deletedAt: null });
  if (!space) throw ApiError.notFound('Space not found');
  space.deletedAt = new Date();
  await space.save();
  return sendData(res, { ok: true });
});
