import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const SPACE_VISIBILITY = ['PRIVATE', 'UNLISTED', 'PUBLIC'];

const spaceSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    visibility: {
      type: String,
      enum: SPACE_VISIBILITY,
      default: 'PRIVATE',
      index: true,
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

spaceSchema.index({ visibility: 1, updatedAt: -1 });

spaceSchema.methods.toJSON = function toJSON() {
  return {
    id: this._id.toString(),
    slug: this.slug,
    title: this.title,
    description: this.description ?? null,
    visibility: this.visibility,
    owner: this.owner.toString(),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Space = model('Space', spaceSchema);
