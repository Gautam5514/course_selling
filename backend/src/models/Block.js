import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const BLOCK_TYPES = ['RICH_TEXT', 'CODE', 'SQL', 'FILE', 'EMBED'];

/**
 * `content` is a flexible payload validated per-type by Zod at the route boundary:
 *   RICH_TEXT : { html?, markdown? }
 *   CODE      : { language, code, filename? }
 *   SQL       : { dialect, sql }
 *   FILE      : { uploadId }
 *   EMBED     : { url, provider? }
 */
const blockSchema = new Schema(
  {
    space: { type: Schema.Types.ObjectId, ref: 'Space', required: true, index: true },
    type: { type: String, enum: BLOCK_TYPES, required: true },
    position: { type: Number, required: true },
    content: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

// Unique ordering within a space.
blockSchema.index({ space: 1, position: 1 }, { unique: true });

blockSchema.methods.toJSON = function toJSON() {
  return {
    id: this._id.toString(),
    space: this.space.toString(),
    type: this.type,
    position: this.position,
    content: this.content,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Block = model('Block', blockSchema);
