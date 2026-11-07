"use client";

import { useEffect, useState } from "react";
import { Star, X, Loader2, MessageSquareHeart, Send } from "lucide-react";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
const MAX = 1000;

/**
 * The review form: pick 1-5 stars, optionally write a few lines, submit.
 * Opened from the "Review" button on the reader, and once automatically after
 * a member has spent a few minutes reading.
 *
 *   open         boolean
 *   title        note title (for the heading)
 *   initial      { rating, review } — the member's existing review, if any
 *   auto         true when the prompt opened by itself (softer copy + "Maybe later")
 *   onSubmit     async (rating, review) => void   (throws → error shown)
 *   onClose      () => void
 */
export default function ReviewDialog({ open, title, initial, auto = false, onSubmit, onClose }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Reset the form each time it opens with whatever the member already said.
  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => {
      setRating(initial?.rating ?? 0);
      setReview(initial?.review ?? "");
      setHover(0);
      setError("");
    }, 0);
    return () => clearTimeout(t);
  }, [open, initial?.rating, initial?.review]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  const editing = Boolean(initial?.rating);
  const shown = hover || rating;

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!rating) {
      setError("Tap a star to rate first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSubmit(rating, review.trim());
    } catch (err) {
      setError(err?.message || "We couldn't save your review. Please try again.");
      setBusy(false);
      return;
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150" onClick={() => !busy && onClose()}>
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
      >
        <div className="px-6 pt-6 pb-4 bg-[#093c33] text-white relative">
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="cursor-pointer absolute right-4 top-4 w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-emerald-100/80">
            <X className="w-4 h-4" />
          </button>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#f3843f]">
            <MessageSquareHeart className="w-3.5 h-3.5" />
            {editing ? "Update your review" : auto ? "Quick question" : "Write a review"}
          </span>
          <h2 id="review-title" className="mt-1 text-xl font-extrabold tracking-tight">
            {auto ? "How are these notes so far?" : editing ? "Change what you think" : `Rate ${title}`}
          </h2>
          <p className="mt-1 text-xs text-emerald-100/75">{auto ? `You've been reading ${title} for a few minutes. A quick rating helps other students.` : "Your rating and review are shown to other students with your first name."}</p>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <div className="flex items-center justify-center gap-1.5" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} star${n === 1 ? "" : "s"} – ${LABELS[n]}`}
                  onMouseEnter={() => setHover(n)}
                  onFocus={() => setHover(n)}
                  onBlur={() => setHover(0)}
                  onClick={() => {
                    setRating(n);
                    setError("");
                  }}
                  className="cursor-pointer p-1 rounded-lg transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f3843f]"
                >
                  <Star className={`w-9 h-9 transition-colors ${n <= shown ? "fill-amber-400 text-amber-400" : "text-stone-300"}`} />
                </button>
              ))}
            </div>
            <p className={`mt-2 text-center text-sm font-bold h-5 ${shown ? "text-amber-700" : "text-stone-400"}`}>{shown ? LABELS[shown] : "Tap a star"}</p>
          </div>

          <label className="block">
            <span className="flex items-baseline justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-600">Your review</span>
              <span className="text-[11px] text-stone-400">
                optional · {review.length}/{MAX}
              </span>
            </span>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value.slice(0, MAX))}
              rows={4}
              placeholder="What was most useful? What would you improve?"
              className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl text-sm bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:border-[#f3843f] focus:ring-1 focus:ring-[#f3843f] text-stone-900 placeholder:text-stone-400 resize-y"
            />
          </label>

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

          <div className="flex items-center justify-between gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={busy} className="cursor-pointer text-sm font-bold text-stone-500 hover:text-stone-800 px-2 py-2">
              {auto ? "Maybe later" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-[#093c33] hover:bg-[#f3843f] shadow-md transition-all active:scale-95 disabled:opacity-70"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {editing ? "Update review" : "Share review"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
