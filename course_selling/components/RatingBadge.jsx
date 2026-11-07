"use client";

import { Star } from "lucide-react";

/**
 * Compact, read-only rating summary: "★ 4.5 (12)". Replaces the old row of
 * five empty stars. Rating itself happens in the review form on the reader page.
 *
 *   value   number|null   average (null = no ratings yet)
 *   count   number
 *   loading boolean
 *   tone    "light" (on dark headers) | "default"
 */
export default function RatingBadge({ value, count = 0, loading = false, unavailable = false, tone = "default", variant = "default", className = "" }) {
  const has = value != null && count > 0;

  // Compact: sits next to the like badge on cards – same pill, star + number only.
  if (variant === "compact") {
    const t = loading ? "Loading rating…" : unavailable ? "Ratings are temporarily unavailable" : has ? `${value} out of 5 from ${count} review${count === 1 ? "" : "s"}` : "No ratings yet";
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${has ? "bg-amber-50 text-amber-800 border-amber-200/70" : "bg-stone-100 text-stone-600 border-stone-200/80"} ${className}`}
        title={t}
        aria-label={t}
      >
        <Star className={`w-3.5 h-3.5 ${has ? "fill-amber-500 text-amber-500" : "text-stone-400"}`} />
        <span className="tabular-nums text-[11px]">{loading ? "…" : unavailable ? "–" : has ? value.toFixed(1) : "0"}</span>
      </span>
    );
  }
  const base = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border";
  const style = tone === "light" ? "bg-white/10 border-white/15 text-white" : has ? "bg-amber-50 border-amber-200/70 text-amber-900" : "bg-stone-100 border-stone-200/80 text-stone-500";
  const title = loading ? "Loading rating…" : unavailable ? "Ratings are temporarily unavailable" : has ? `${value} out of 5 from ${count} review${count === 1 ? "" : "s"}` : "No reviews yet";

  return (
    <span className={`${base} ${style} ${className}`} title={title} aria-label={title}>
      <Star className={`w-3.5 h-3.5 ${has ? "fill-amber-500 text-amber-500" : tone === "light" ? "text-white/60" : "text-stone-400"}`} />
      {loading ? (
        <span>…</span>
      ) : unavailable ? (
        <span>–</span>
      ) : has ? (
        <>
          <span className="tabular-nums">{value.toFixed(1)}</span>
          <span className={tone === "light" ? "text-white/60 font-semibold" : "text-amber-700/70 font-semibold"}>({count.toLocaleString()})</span>
        </>
      ) : (
        <span>No reviews yet</span>
      )}
    </span>
  );
}
