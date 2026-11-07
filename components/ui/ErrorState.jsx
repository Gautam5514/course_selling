"use client";

import Link from "next/link";
import { RefreshCw, Home, Compass } from "lucide-react";

/**
 * Premium full-width error / empty state used by error.js and not-found.js.
 * Everything here is written for end users: no codes, no stack traces.
 */
export default function ErrorState({
  eyebrow = "Oops",
  title,
  message,
  icon: Icon = Compass,
  onRetry,
  retryLabel = "Try again",
  homeHref = "/",
  homeLabel = "Back to home",
  children,
}) {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-lg text-center">
        <div className="absolute -inset-x-10 -top-10 h-56 bg-[radial-gradient(ellipse_at_center,rgba(243,132,63,0.18),transparent_60%)] pointer-events-none" />
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-white border border-stone-200 shadow-lg shadow-emerald-950/5 flex items-center justify-center">
          <Icon className="w-9 h-9 text-[#093c33]" />
        </div>
        <p className="relative mt-6 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#f3843f]">{eyebrow}</p>
        <h1 className="relative mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111827]">{title}</h1>
        <p className="relative mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">{message}</p>
        {children}
        <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white bg-[#093c33] hover:bg-[#f3843f] shadow-md transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              {retryLabel}
            </button>
          )}
          <Link
            href={homeHref}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 transition-all active:scale-95"
          >
            <Home className="w-4 h-4 text-[#f3843f]" />
            {homeLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
