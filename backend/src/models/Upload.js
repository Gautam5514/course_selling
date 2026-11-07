import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const UPLOAD_STATUS = ['PENDING', 'UPLOADED', 'READY', 'FAILED', 'QUARANTINED'];

const uploadSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    key: { type: String, required: true, unique: true }, // local filename or Cloudinary public_id
    provider: { type: String, enum: ['local', 'cloudinary'], default: 'local', index: true },
    resourceType: { type: String, default: null }, // cloudinary: image | raw | video
    format: { type: String, default: null }, // cloudinary format / extension
    url: { type: String, default: null }, // cloudinary secure_url (not public: assets are authenticated)
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    byteSize: { type: Number, required: true },
    checksum: { type: String }, // sha256 hex
    status: { type: String, enum: UPLOAD_STATUS, default: 'READY', index: true },
    width: Number,
    height: Number,
    pageCount: Number,
    metadata: { type: Schema.Types.Mixed },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

uploadSchema.index({ owner: 1, createdAt: -1 });

uploadSchema.methods.toJSON = function toJSON() {
  return {
    id: this._id.toString(),
    key: this.key,
    provider: this.provider ?? 'local',
    originalName: this.originalName,
    mimeType: this.mimeType,
    byteSize: this.byteSize,
    checksum: this.checksum ?? null,
    status: this.status,
    width: this.width ?? null,
    height: this.height ?? null,
    pageCount: this.pageCount ?? null,
    metadata: this.metadata ?? null,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Upload = model('Upload', uploadSchema);
