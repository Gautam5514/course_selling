import { z } from 'zod';
import { BLOCK_TYPES } from '../models/Block.js';
import { ACCENTS, ICONS } from '../models/Note.js';
import { PLATFORMS, DIFFICULTIES } from '../models/DailyCode.js';
import { ROLES } from '../models/User.js';

export const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const visibility = z.enum(['PRIVATE', 'UNLISTED', 'PUBLIC']);

const slug = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case');

export const paginationQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(200).optional(),
  category: z.string().trim().max(100).optional(),
  tag: z.string().trim().max(100).optional(),
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

// ─── Auth ──────────────────────────────────────────────────────────────────
export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .strict();

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.string().email().max(200),
    password: z.string().min(8).max(128),
  })
  .strict();

// ─── Notes ───────────────────────────────────────────────────────────────────
const httpUrl = z.string().trim().url('Please enter a valid link (https://…)').max(2000);
/** A URL field that may also be cleared with an empty string. */
const optionalUrl = z.union([httpUrl, z.literal('')]).optional();
const shortText = (max) => z.string().trim().max(max);

export const chapterSchema = z
  .object({
    number: shortText(10).default(''),
    title: z.string().trim().min(1, 'Chapter title is required').max(200),
    summary: shortText(1000).default(''),
    contentSnippet: shortText(3000).default(''),
  })
  .strict();

export const instructorSchema = z
  .object({
    name: shortText(80).default(''),
    role: shortText(80).default(''),
    company: shortText(80).default(''),
    avatar: optionalUrl.default(''),
  })
  .strict();

export const createNoteSchema = z
  .object({
    slug: slug.optional(), // generated from the title when omitted
    title: z.string().trim().min(1, 'Title is required').max(200),
    description: shortText(5000).optional(),
    videoUrl: optionalUrl.nullable(),
    category: shortText(100).optional(),
    tags: z.array(z.string().trim().min(1).max(60)).max(50).optional(),
    visibility: visibility.optional(),
    primaryFile: objectId.nullable().optional(),
    pages: z.number().int().min(1).max(10000).nullable().optional(),

    tagline: shortText(200).optional(),
    badge: shortText(40).optional(),
    level: shortText(40).optional(),
    accent: z.enum(ACCENTS).optional(),
    icon: z.enum(ICONS).optional(),
    featured: z.boolean().optional(),
    order: z.number().int().min(-1000).max(100000).optional(),
    price: z.number().min(0).max(1000000).optional(),

    projectBadge: shortText(60).optional(),
    projectTitle: shortText(200).optional(),
    projectUrl: optionalUrl,
    demoUrl: optionalUrl,
    projectId: shortText(100).optional(),

    instructor: instructorSchema.optional(),
    chapters: z.array(chapterSchema).max(100).optional(),
  })
  .strict();

export const adminNotesQuery = z.object({
  q: z.string().trim().max(200).optional(),
  status: z.enum(['all', 'published', 'draft', 'trash']).default('all'),
  category: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const noteOrderSchema = z
  .object({
    order: z.array(z.object({ id: objectId, order: z.number().int() })).min(1).max(500),
  })
  .strict();

export const noteFileQuery = z.object({
  role: z.enum(['primary', 'attachment', 'cover']).default('primary'),
});

export const noteFileParams = z.object({ id: objectId, uploadId: objectId });

// ─── Users (admin) ───────────────────────────────────────────────────────────
export const adminUsersQuery = z.object({
  q: z.string().trim().max(200).optional(),
  role: z.enum(ROLES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateUserRoleSchema = z.object({ role: z.enum(ROLES) }).strict();

// Public interactions (anonymous visitors).
export const noteStatsQuery = z.object({
  slugs: z
    .string()
    .min(1)
    .max(2000)
    .transform((v) => [...new Set(v.split(',').map((s) => s.trim()).filter(Boolean))])
    .refine((arr) => arr.length > 0 && arr.length <= 50, 'Provide 1-50 slugs'),
});

export const rateNoteSchema = z
  .object({
    value: z.number().int().min(1).max(5),
    review: z.string().trim().max(1000, 'Keep your review under 1000 characters').optional(),
  })
  .strict();

export const noteReviewsQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const likeNoteSchema = z
  .object({
    liked: z.boolean().optional(),
  })
  .strict();

export const slugParams = z.object({ slug });

// ─── Today Code (problem of the day) ─────────────────────────────────────────
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must look like 2026-11-07')
  .refine((d) => !Number.isNaN(Date.parse(`${d}T00:00:00Z`)) && new Date(`${d}T00:00:00Z`).toISOString().startsWith(d), 'That is not a real calendar date');

const solutionSchema = z
  .object({
    language: z.string().trim().min(1, 'Pick a language').max(40),
    label: shortText(80).optional().default(''),
    filename: shortText(200).optional().default(''),
    code: z.string().min(1, 'Paste the code').max(200_000, 'Code is too long (200 KB max)'),
  })
  .strict();

/**
 * Shared field definitions. `create` fills defaults; `update` must NOT, or a
 * PATCH with one key would silently reset every other field to its default.
 */
function dailyCodeFields(withDefaults) {
  const d = (schema, value) => (withDefaults ? schema.optional().default(value) : schema.optional());
  return {
    date: isoDate,
    title: z.string().trim().min(1, 'Give the problem a title').max(200),
    problemNumber: d(shortText(20), ''),
    platform: d(z.enum(PLATFORMS), 'LeetCode'),
    problemUrl: d(z.union([httpUrl, z.literal('')]), ''),
    difficulty: d(z.enum(DIFFICULTIES), 'Medium'),
    topics: d(z.array(shortText(60)).max(20), []),
    statement: d(z.string().max(5000), ''),
    approach: d(z.string().max(20_000), ''),
    solutions: d(z.array(solutionSchema).max(10), []),
    complexity: d(z.object({ time: shortText(60).optional().default(''), space: shortText(60).optional().default('') }).strict(), { time: '', space: '' }),
    publish: z.boolean().optional(),
  };
}

export const createDailyCodeSchema = z.object(dailyCodeFields(true)).strict();

export const updateDailyCodeSchema = z.object(dailyCodeFields(false)).partial().strict();

export const dailyCodeDateParams = z.object({ date: isoDate });

export const dailyCodeListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export const adminDailyCodeQuery = z.object({
  q: z.string().trim().max(200).optional(),
  status: z.enum(['all', 'published', 'draft']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateNoteSchema = createNoteSchema.partial().extend({
  publish: z.boolean().optional(),
});

export const noteAssetsSchema = z
  .object({
    assets: z
      .array(
        z.object({
          upload: objectId,
          role: z.enum(['primary', 'attachment', 'cover']).default('attachment'),
          position: z.number().int().min(0).default(0),
        })
      )
      .min(1),
  })
  .strict();

// ─── Spaces ──────────────────────────────────────────────────────────────────
export const createSpaceSchema = z
  .object({
    slug,
    title: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    visibility: visibility.optional(),
  })
  .strict();

export const updateSpaceSchema = createSpaceSchema.partial();

// ─── Blocks (shared content shapes for Spaces and Notes) ─────────────────────
const blockContentByType = {
  RICH_TEXT: z
    .object({ html: z.string().optional(), markdown: z.string().optional() })
    .refine((c) => c.html || c.markdown, 'RICH_TEXT needs html or markdown'),
  CODE: z.object({
    language: z.string().min(1).max(40),
    code: z.string(),
    filename: z.string().max(200).optional(),
  }),
  SQL: z.object({
    dialect: z.string().min(1).max(40).default('postgres'),
    sql: z.string(),
  }),
  FILE: z.object({ uploadId: objectId }),
  EMBED: z.object({ url: z.string().url(), provider: z.string().max(60).optional() }),
};

/**
 * Builds a "create block" schema that validates `content` per `type` and writes
 * the parsed content back so per-type defaults (e.g. SQL dialect) are applied.
 * Reused by both Space blocks and Note blocks.
 */
function makeCreateBlockSchema() {
  return z
    .object({
      type: z.enum(BLOCK_TYPES),
      position: z.number().int().min(0).optional(),
      content: z.record(z.string(), z.any()),
    })
    .strict()
    .transform((val, ctx) => {
      const schema = blockContentByType[val.type];
      const result = schema.safeParse(val.content);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({
            code: 'custom',
            path: ['content', ...issue.path],
            message: issue.message,
          });
        }
        return z.NEVER;
      }
      return { ...val, content: result.data };
    });
}

export const createBlockSchema = makeCreateBlockSchema();

export const updateBlockSchema = z
  .object({
    content: z.record(z.string(), z.any()),
  })
  .strict();

export const reorderSchema = z
  .object({
    order: z
      .array(z.object({ blockId: objectId, position: z.number().int().min(0) }))
      .min(1),
  })
  .strict();

// ─── Note blocks (Option A: blocks embedded on a Note) ───────────────────────
export const createNoteBlockSchema = makeCreateBlockSchema();

export const updateNoteBlockSchema = updateBlockSchema;

// Reorder embedded note blocks by their subdocument ids.
export const reorderNoteBlocksSchema = z
  .object({
    order: z
      .array(z.object({ blockId: objectId, position: z.number().int().min(0) }))
      .min(1),
  })
  .strict();
