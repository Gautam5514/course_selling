"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

export default function LikeButton({
  id,
  initialLikes = 0,
  variant = "badge",
  showCount = true,
  className = "",
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [count, setCount] = useState(initialLikes);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && id) {
      try {
        const storedLikes = JSON.parse(
          localStorage.getItem("hellobject_user_likes") || "{}"
        );
        if (storedLikes[id]) {
          setIsLiked(true);
          setCount(initialLikes + 1);
        }
      } catch {
        // Fallback gracefully if storage fails
      }
    }
  }, [id, initialLikes]);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !isLiked;
    const nextCount = nextState ? count + 1 : Math.max(initialLikes, count - 1);

    setIsLiked(nextState);
    setCount(nextCount);
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
        {showCount && <span>{count.toLocaleString()}</span>}
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
            {count.toLocaleString()}
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
        <span className="tabular-nums text-[11px]">{count.toLocaleString()}</span>
      )}
    </button>
  );
}
