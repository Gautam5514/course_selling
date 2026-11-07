"use client";

import { useState, useEffect } from "react";
import { Heart, Lock } from "lucide-react";

/**
 * Two modes:
 *  - legacy/local: `id` + `initialLikes`, remembered in localStorage only.
 *  - real/controlled: pass `likes`, `liked` and an async `onToggle(nextLiked)`
 *    that talks to the backend. The button updates optimistically and reverts
 *    if the request fails. `likes === null` renders as loading.
 *  - `readOnly`: show the count only (visitors who are not signed in). Nothing
 *    is clickable and the hover/active styles are gone.
 */
export default function LikeButton({
  id,
  initialLikes = 0,
  likes,
  liked,
  onToggle,
  variant = "badge",
  showCount = true,
  readOnly = false,
  className = "",
}) {
  const controlled = typeof onToggle === "function";
  const [localLiked, setLocalLiked] = useState(false);
  const [localCount, setLocalCount] = useState(initialLikes);
  // Controlled mode: props are the truth; `optimistic` briefly overrides them
  // while the backend request is in flight.
  const [optimistic, setOptimistic] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pending, setPending] = useState(false);

  const isLiked = controlled ? optimistic?.liked ?? Boolean(liked) : localLiked;
  const count = controlled ? optimistic?.count ?? likes ?? null : localCount;
  const countLabel = count === null ? "–" : count.toLocaleString();

  // Legacy mode only: restore the remembered like after hydration.
  useEffect(() => {
    if (controlled || !id || typeof window === "undefined") return undefined;
    const timer = setTimeout(() => {
      try {
        const storedLikes = JSON.parse(localStorage.getItem("hellobject_user_likes") || "{}");
        if (storedLikes[id]) {
          setLocalLiked(true);
          setLocalCount(initialLikes + 1);
        }
      } catch {
        // Fallback gracefully if storage fails
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [controlled, id, initialLikes]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (controlled) {
      if (pending || count === null) return;
      const nextState = !isLiked;
      setOptimistic({ liked: nextState, count: Math.max(0, count + (nextState ? 1 : -1)) });
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 450);
      setPending(true);
      try {
        await onToggle(nextState); // parent updates `likes` / `liked` props
      } catch {
        // drop the optimistic value → falls back to the last server state
      } finally {
        setOptimistic(null);
        setPending(false);
      }
      return;
    }

    const nextState = !isLiked;
    const nextCount = nextState ? count + 1 : Math.max(initialLikes, count - 1);

    setLocalLiked(nextState);
    setLocalCount(nextCount);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 450);

    if (typeof window !== "undefined" && id) {
      try {
        const storedLikes = JSON.parse(
          localStorage.getItem("hellobject_user_likes") || "{}"
        );
        if (nextState) {
          storedLikes[id] = true;
        } else {
          delete storedLikes[id];
        }
        localStorage.setItem(
          "hellobject_user_likes",
          JSON.stringify(storedLikes)
        );
      } catch {
        // Ignore storage errors
      }
    }
  };

  // Signed-out: a plain counter. Same footprint as the button so cards don't jump.
  if (readOnly) {
    const title = `${countLabel} like${count === 1 ? "" : "s"} · Sign in to like`;
    if (variant === "minimal") {
      return (
        <span title={title} aria-label={title} className={`inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 ${className}`}>
          <Heart className="w-4 h-4" />
          {showCount && <span>{countLabel}</span>}
        </span>
      );
    }
    if (variant === "button") {
      return (
        <span title={title} aria-label={title} className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-stone-500 border border-stone-200 ${className}`}>
          <Heart className="w-4 h-4 text-stone-400" />
          <span>Likes</span>
          {showCount && <span className="px-1.5 py-0.5 rounded-md text-[11px] bg-stone-100 text-stone-600">{countLabel}</span>}
          <Lock className="w-3 h-3 text-stone-400" />
        </span>
      );
    }
    return (
      <span title={title} aria-label={title} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-500 border border-stone-200/80 ${className}`}>
        <Heart className="w-3.5 h-3.5 text-stone-400" />
        {showCount && <span className="tabular-nums text-[11px]">{countLabel}</span>}
      </span>
    );
  }

  if (variant === "minimal") {
    return (
      <button
        onClick={handleToggle}
        aria-label={isLiked ? "Unlike" : "Like"}
        className={`cursor-pointer inline-flex items-center gap-1.5 transition-all text-xs font-semibold ${
          isLiked
            ? "text-rose-600 font-bold"
            : "text-stone-500 hover:text-rose-500"
        } ${className}`}
      >
        <Heart
          className={`w-4 h-4 transition-transform duration-300 ${
            isLiked ? "fill-rose-500 text-rose-500" : ""
          } ${isAnimating ? "scale-135 -rotate-12" : ""}`}
        />
        {showCount && <span>{count === null ? "–" : count.toLocaleString()}</span>}
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        onClick={handleToggle}
        aria-label={isLiked ? "Unlike this project" : "Like this project"}
        className={`cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
          isLiked
            ? "bg-rose-50 text-rose-700 border border-rose-200 shadow-sm"
            : "bg-white hover:bg-stone-50 text-stone-700 border border-stone-200"
        } ${className}`}
      >
        <Heart
          className={`w-4 h-4 transition-transform duration-300 ${
            isLiked ? "fill-rose-500 text-rose-500" : "text-stone-400"
          } ${isAnimating ? "scale-140 rotate-12" : ""}`}
        />
        <span>{isLiked ? "Liked" : "Like"}</span>
        {showCount && (
          <span
            className={`px-1.5 py-0.5 rounded-md text-[11px] ${
              isLiked ? "bg-rose-100 text-rose-800" : "bg-stone-100 text-stone-600"
            }`}
          >
            {count === null ? "–" : count.toLocaleString()}
          </span>
        )}
      </button>
    );
  }

  // Default "badge" variant
  return (
    <button
      onClick={handleToggle}
      aria-label={isLiked ? "Unlike" : "Like"}
      className={`cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
        isLiked
          ? "bg-rose-500/10 text-rose-600 border border-rose-300/60 shadow-xs"
          : "bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-600 border border-stone-200/80"
      } ${className}`}
    >
      <Heart
        className={`w-3.5 h-3.5 transition-transform duration-300 ${
          isLiked ? "fill-rose-500 text-rose-500" : "text-stone-400"
        } ${isAnimating ? "scale-135" : ""}`}
      />
      {showCount && (
        <span className="tabular-nums text-[11px]">{count === null ? "–" : count.toLocaleString()}</span>
      )}
    </button>
  );
}
