import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const VISIBILITY = ['PRIVATE', 'UNLISTED', 'PUBLIC'];

/** Accent palette for the landing cards; the frontend maps these to Tailwind classes. */
export const ACCENTS = ['amber', 'emerald', 'indigo', 'purple', 'rose', 'sky', 'teal', 'orange'];

/** Lucide icon names the frontend knows how to render on a card. */
export const ICONS = ['Code', 'Layers', 'Server', 'Sparkles', 'Network', 'Cloud', 'BookOpen', 'Database', 'Cpu', 'Smartphone', 'Shield', 'Terminal'];

const noteAssetSchema = new Schema(
  {
    upload: { type: Schema.Types.ObjectId, ref: 'Upload', required: true },
    role: { type: String, default: 'attachment' }, // primary | attachment | cover
    position: { type: Number, default: 0 },
  },
  { _id: false }
);

export const NOTE_BLOCK_TYPES = ['RICH_TEXT', 'CODE', 'SQL', 'FILE', 'EMBED'];

/**
 * Embedded content block that lives directly on a Note (Option A).
 * `content` is validated per-type by Zod at the route boundary:
 *   RICH_TEXT : { html?, markdown? }
 *   CODE      : { language, code, filename? }   ← copy-to-clipboard on the frontend
 *   SQL       : { dialect, sql }
 *   FILE      : { uploadId }                     ← e.g. a PDF attachment
 *   EMBED     : { url, provider? }
 */
const noteBlockSchema = new Schema(
  {
    type: { type: String, enum: NOTE_BLOCK_TYPES, required: true },
    position: { type: Number, required: true },
    content: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

/** Table-of-contents entry shown in the reader page. */
const chapterSchema = new Schema(
  {
    number: { type: String, trim: true, default: '' },
    title: { type: String, required: true, trim: true },
    summary: { type: String, trim: true, default: '' },
    contentSnippet: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const instructorSchema = new Schema(
  {
    name: { type: String, trim: true, default: '' },
    role: { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '' },
    avatar: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const noteSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    videoUrl: { type: String, default: null }, // e.g. the DSA lesson video
    category: { type: String, index: true },
    tags: { type: [String], default: [] },
    visibility: { type: String, enum: VISIBILITY, default: 'PRIVATE', index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    primaryFile: { type: Schema.Types.ObjectId, ref: 'Upload', default: null },
    assets: { type: [noteAssetSchema], default: [] },
    blocks: { type: [noteBlockSchema], default: [] },
    pages: { type: Number, default: null }, // PDF page count (admin-set, or from primaryFile)

    // ── Card presentation (what the landing page shows) ──
    tagline: { type: String, trim: true, default: '' }, // one-line highlight under the title
    badge: { type: String, trim: true, default: '' }, // e.g. "Most Popular"
    level: { type: String, trim: true, default: 'All Levels' },
    accent: { type: String, enum: ACCENTS, default: 'emerald' },
    icon: { type: String, enum: ICONS, default: 'BookOpen' },
    featured: { type: Boolean, default: true, index: true }, // show on the home page
    order: { type: Number, default: 0 }, // manual sort on the home page (lower first)
    price: { type: Number, default: 0, min: 0 }, // 0 = free

    // ── Project / code that ships with the note ──
    projectBadge: { type: String, trim: true, default: '' }, // e.g. "Free SaaS Repo"
    projectTitle: { type: String, trim: true, default: '' },
    projectUrl: { type: String, trim: true, default: '' }, // GitHub repo
    demoUrl: { type: String, trim: true, default: '' },
    projectId: { type: String, trim: true, default: '' }, // legacy static project id (optional)

    instructor: { type: instructorSchema, default: () => ({}) },
    chapters: { type: [chapterSchema], default: [] },

    likes: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    // Aggregated star ratings (1-5). avg = ratingSum / ratingCount.
    ratingSum: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

noteSchema.index({ visibility: 1, publishedAt: -1 });
noteSchema.index({ featured: 1, order: 1, createdAt: -1 });
noteSchema.index({ title: 'text', tagline: 'text', description: 'text', tags: 'text' });

/** Average rating rounded to 2 decimals, or null when nobody has rated yet. */
noteSchema.methods.averageRating = function averageRating() {
  if (!this.ratingCount) return null;
  return Math.round((this.ratingSum / this.ratingCount) * 100) / 100;
};

/** True when the note is visible on the public site. */
noteSchema.methods.isLive = function isLive() {
  return this.visibility === 'PUBLIC' && Boolean(this.publishedAt) && !this.deletedAt;
};

noteSchema.methods.toJSON = function toJSON() {
  // primaryFile may be populated (admin/public detail) or a bare ObjectId.
  const pf = this.primaryFile;
  const pfPopulated = pf && typeof pf === 'object' && pf.key !== undefined;
  const file = pfPopulated
    ? {
        id: pf._id.toString(),
        originalName: pf.originalName,
        mimeType: pf.mimeType,
        byteSize: pf.byteSize,
        pageCount: pf.pageCount ?? null,
        createdAt: pf.createdAt,
      }
    : null;

  return {
    id: this._id.toString(),
    slug: this.slug,
    title: this.title,
    description: this.description ?? null,
    videoUrl: this.videoUrl ?? null,
    category: this.category ?? null,
    tags: this.tags,
    visibility: this.visibility,
    status: this.isLive() ? 'published' : 'draft',
    primaryFile: pf ? (pfPopulated ? pf._id.toString() : pf.toString()) : null,
    file,
    assets: this.assets.map((a) => ({
      upload: a.upload?._id ? a.upload._id.toString() : a.upload.toString(),
      role: a.role,
      position: a.position,
      ...(a.upload?.key !== undefined
        ? { originalName: a.upload.originalName, mimeType: a.upload.mimeType, byteSize: a.upload.byteSize }
        : {}),
    })),
    blocks: this.blocks
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((b) => ({
        id: b._id.toString(),
        type: b.type,
        position: b.position,
        content: b.content,
      })),
    pages: this.pages ?? (pfPopulated ? pf.pageCount ?? null : null),
    tagline: this.tagline ?? '',
    badge: this.badge ?? '',
    level: this.level ?? 'All Levels',
    accent: this.accent ?? 'emerald',
    icon: this.icon ?? 'BookOpen',
    featured: this.featured !== false,
    order: this.order ?? 0,
    price: this.price ?? 0,
    projectBadge: this.projectBadge ?? '',
    projectTitle: this.projectTitle ?? '',
    projectUrl: this.projectUrl ?? '',
    demoUrl: this.demoUrl ?? '',
    projectId: this.projectId ?? '',
    instructor: {
      name: this.instructor?.name ?? '',
      role: this.instructor?.role ?? '',
      company: this.instructor?.company ?? '',
      avatar: this.instructor?.avatar ?? '',
    },
    chapters: (this.chapters ?? []).map((c) => ({
      number: c.number ?? '',
      title: c.title,
      summary: c.summary ?? '',
      contentSnippet: c.contentSnippet ?? '',
    })),
    likes: this.likes,
    downloads: this.downloads,
    rating: this.averageRating(),
    ratingCount: this.ratingCount,
    publishedAt: this.publishedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Note = model('Note', noteSchema);
