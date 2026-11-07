import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * One row per (note, visitor). Visitors are anonymous: the frontend generates a
 * random id once, keeps it in localStorage and sends it as `X-Visitor-Id`.
 * This is what makes likes/ratings "real": one like and one rating per visitor,
 * toggleable / changeable, never double counted.
 */
const noteInteractionSchema = new Schema(
  {
    note: { type: Schema.Types.ObjectId, ref: 'Note', required: true },
    visitor: { type: String, required: true },
    liked: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5, default: null },
    review: { type: String, default: '', maxlength: 1000 }, // optional written review next to the rating
    reviewedAt: { type: Date, default: null },
    lastDownloadDay: { type: String, default: null }, // YYYY-MM-DD, dedupes download counting
  },
  { timestamps: true }
);

noteInteractionSchema.index({ note: 1, visitor: 1 }, { unique: true });
noteInteractionSchema.index({ note: 1, reviewedAt: -1 });

export const NoteInteraction = model('NoteInteraction', noteInteractionSchema);
