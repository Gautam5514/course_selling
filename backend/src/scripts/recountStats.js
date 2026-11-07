import { logger } from '../config/logger.js';
import { connectDB, disconnectDB } from '../db/connect.js';
import { Note } from '../models/Note.js';
import { NoteInteraction } from '../models/NoteInteraction.js';

/**
 * Rebuilds likes / ratingSum / ratingCount on every note from the
 * NoteInteraction rows (the source of truth). Safe to run any time:
 *   npm run recount
 */
async function recount() {
  await connectDB();
  const agg = await NoteInteraction.aggregate([
    {
      $group: {
        _id: '$note',
        likes: { $sum: { $cond: ['$liked', 1, 0] } },
        ratingSum: { $sum: { $ifNull: ['$rating', 0] } },
        ratingCount: { $sum: { $cond: [{ $gt: ['$rating', null] }, 1, 0] } },
      },
    },
  ]);
  const byNote = new Map(agg.map((a) => [a._id.toString(), a]));

  const notes = await Note.find({ deletedAt: null }).select('slug likes ratingSum ratingCount');
  let fixed = 0;
  for (const note of notes) {
    const a = byNote.get(note._id.toString()) ?? { likes: 0, ratingSum: 0, ratingCount: 0 };
    if (note.likes !== a.likes || note.ratingSum !== a.ratingSum || note.ratingCount !== a.ratingCount) {
      logger.warn({ slug: note.slug, before: { likes: note.likes, ratingSum: note.ratingSum, ratingCount: note.ratingCount }, after: a }, 'Counter drift fixed');
      await Note.updateOne({ _id: note._id }, { $set: { likes: a.likes, ratingSum: a.ratingSum, ratingCount: a.ratingCount } });
      fixed += 1;
    }
  }
  logger.info(`Recount complete: ${notes.length} notes checked, ${fixed} fixed`);
  await disconnectDB();
  process.exit(0);
}

recount().catch((err) => {
  logger.error({ err }, 'Recount failed');
  process.exit(1);
});
