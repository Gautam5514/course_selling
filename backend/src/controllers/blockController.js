import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData, ApiError } from '../utils/apiError.js';
import { Space } from '../models/Space.js';
import { Block } from '../models/Block.js';

async function ownedSpace(spaceId, userId) {
  const space = await Space.findOne({ _id: spaceId, owner: userId, deletedAt: null });
  if (!space) throw ApiError.notFound('Space not found');
  return space;
}

export const addBlock = asyncHandler(async (req, res) => {
  const space = await ownedSpace(req.params.id, req.user._id);

  let { position } = req.body;
  if (position === undefined) {
    const last = await Block.findOne({ space: space._id }).sort({ position: -1 });
    position = last ? last.position + 1 : 0;
  }

  const block = await Block.create({
    space: space._id,
    type: req.body.type,
    position,
    content: req.body.content,
  });
  return sendData(res, block.toJSON(), 201);
});

export const updateBlock = asyncHandler(async (req, res) => {
  const block = await Block.findById(req.params.id);
  if (!block) throw ApiError.notFound('Block not found');
  await ownedSpace(block.space, req.user._id);

  block.content = req.body.content;
  await block.save();
  return sendData(res, block.toJSON());
});

export const deleteBlock = asyncHandler(async (req, res) => {
  const block = await Block.findById(req.params.id);
  if (!block) throw ApiError.notFound('Block not found');
  await ownedSpace(block.space, req.user._id);
  await block.deleteOne();
  return sendData(res, { ok: true });
});

/**
 * Reorder blocks within a space. Uses a two-phase update to avoid colliding
 * with the unique (space, position) index: first move to negative temp slots,
 * then to final positions.
 */
export const reorderBlocks = asyncHandler(async (req, res) => {
  const space = await ownedSpace(req.params.id, req.user._id);
  const { order } = req.body;

  const ids = order.map((o) => o.blockId);
  const count = await Block.countDocuments({ _id: { $in: ids }, space: space._id });
  if (count !== ids.length) {
    throw ApiError.badRequest('One or more blocks do not belong to this space');
  }

  // Phase 1: park at unique negative positions.
  await Promise.all(
    order.map((o, i) =>
      Block.updateOne({ _id: o.blockId, space: space._id }, { position: -(i + 1) })
    )
  );
  // Phase 2: assign final positions.
  await Promise.all(
    order.map((o) =>
      Block.updateOne({ _id: o.blockId, space: space._id }, { position: o.position })
    )
  );

  const blocks = await Block.find({ space: space._id }).sort({ position: 1 });
  return sendData(res, blocks.map((b) => b.toJSON()));
});
