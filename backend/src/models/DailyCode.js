import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const PLATFORMS = ['LeetCode', 'GeeksforGeeks', 'Codeforces', 'CodeChef', 'HackerRank', 'InterviewBit', 'Other'];
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

/** One solution in one language. A day may carry several (C++, Java, Python…). */
const solutionSchema = new Schema(
  {
    language: { type: String, required: true, trim: true, lowercase: true },
    label: { type: String, trim: true, default: '' }, // e.g. "Optimal O(n)" or "Brute force"
    filename: { type: String, trim: true, default: '' }, // e.g. solution.cpp
    code: { type: String, required: true },
  },
  { _id: true }
);

/**
 * "Today Code": the problem-of-the-day solution the admin posts each day.
 * One document per calendar date (`date` = YYYY-MM-DD, unique). Members read
 * it from the navbar's "Today Code" button; visitors only see that it exists.
 */
const dailyCodeSchema = new Schema(
  {
    date: { type: String, required: true, unique: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    title: { type: String, required: true, trim: true },
    problemNumber: { type: String, trim: true, default: '' }, // e.g. "1456"
    platform: { type: String, enum: PLATFORMS, default: 'LeetCode' },
    problemUrl: { type: String, trim: true, default: '' },
    difficulty: { type: String, enum: DIFFICULTIES, default: 'Medium' },
    topics: { type: [String], default: [] }, // e.g. ["Sliding Window", "Hash Map"]
    statement: { type: String, default: '' }, // short problem summary in the admin's words
    approach: { type: String, default: '' }, // intuition / steps, plain text (newlines kept)
    solutions: { type: [solutionSchema], default: [] },
    complexity: {
      time: { type: String, trim: true, default: '' },
      space: { type: String, trim: true, default: '' },
    },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

dailyCodeSchema.index({ publishedAt: 1, date: -1 });

dailyCodeSchema.methods.isLive = function isLive() {
  return Boolean(this.publishedAt);
};

/** Public card: what anyone (even signed-out) may see about a day. */
dailyCodeSchema.methods.toSummary = function toSummary() {
  return {
    id: this._id.toString(),
    date: this.date,
    title: this.title,
    problemNumber: this.problemNumber,
    platform: this.platform,
    difficulty: this.difficulty,
    topics: this.topics,
    languages: [...new Set(this.solutions.map((s) => s.language))],
    status: this.isLive() ? 'published' : 'draft',
    publishedAt: this.publishedAt,
    updatedAt: this.updatedAt,
  };
};

/** Full document: members and admins. */
dailyCodeSchema.methods.toJSON = function toJSON() {
  return {
    ...this.toSummary(),
    problemUrl: this.problemUrl,
    statement: this.statement,
    approach: this.approach,
    solutions: this.solutions.map((s) => ({
      id: s._id.toString(),
      language: s.language,
      label: s.label,
      filename: s.filename,
      code: s.code,
    })),
    complexity: { time: this.complexity?.time ?? '', space: this.complexity?.space ?? '' },
    createdAt: this.createdAt,
  };
};

export const DailyCode = model('DailyCode', dailyCodeSchema);
