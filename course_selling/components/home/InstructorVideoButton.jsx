"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Play, X } from "lucide-react";

/* Instructor video: the photo stays as the cover; play opens the YouTube video in a lightbox. */
const VIDEO_ID = "-G83C4Dm3Do";
const VIDEO_EMBED = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1`;

function VideoLightbox({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} role="dialog" aria-modal="true" aria-label="Live class video">
      <button type="button" onClick={onClose} aria-label="Close video" className="cursor-pointer absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
        <X className="w-5 h-5" />
      </button>
      <div className="w-full max-w-5xl aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <iframe
          src={VIDEO_EMBED}
          title="Live class video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    </div>,
    document.body
  );
}

/** Play button over the instructor photo + its YouTube lightbox (the only client state on that section). */
export default function InstructorVideoButton() {
  const [playing, setPlaying] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className="cursor-pointer absolute inset-0 m-auto w-14 h-14 rounded-full bg-white text-rose-600 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
        aria-label="Play live class video"
      >
        <Play className="w-6 h-6 fill-current ml-0.5 text-rose-600" />
      </button>
      <VideoLightbox open={playing} onClose={() => setPlaying(false)} />
    </>
  );
}
