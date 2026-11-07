"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Loader2, AlertTriangle, Inbox, ChevronLeft, ChevronRight, X } from "lucide-react";

/* Small, consistent building blocks for the admin area. */

export function Card({ title, description, action, children, className = "" }) {
  return (
    <section className={`bg-white rounded-2xl border border-stone-200/90 shadow-sm ${className}`}>
      {(title || action) && (
        <header className="px-5 sm:px-6 py-4 border-b border-stone-100 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-extrabold text-stone-900 tracking-tight">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-stone-500 leading-relaxed">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="px-5 sm:px-6 py-5">{children}</div>
    </section>
  );
}

export function Field({ label, hint, error, required, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-extrabold text-stone-600 uppercase tracking-wider">
          {label}
          {required && <span className="text-[#f3843f]"> *</span>}
        </span>
        {hint && <span className="text-[11px] text-stone-400">{hint}</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-[11px] font-semibold text-rose-600">{error}</span>}
    </label>
  );
}

export const inputClass = (invalid) =>
  `w-full px-3.5 py-2.5 rounded-xl text-sm bg-stone-50 border text-stone-900 placeholder:text-stone-400 transition-colors focus:outline-none focus:ring-1 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed ${
    invalid ? "border-rose-300 focus:border-rose-400 focus:ring-rose-300" : "border-stone-200 focus:border-[#f3843f] focus:ring-[#f3843f]"
  }`;

export function Input({ invalid, className = "", ...props }) {
  return <input {...props} aria-invalid={Boolean(invalid)} className={`${inputClass(invalid)} ${className}`} />;
}

export function Textarea({ invalid, className = "", rows = 3, ...props }) {
  return <textarea {...props} rows={rows} aria-invalid={Boolean(invalid)} className={`${inputClass(invalid)} resize-y ${className}`} />;
}

export function Select({ invalid, className = "", children, ...props }) {
  return (
    <select {...props} aria-invalid={Boolean(invalid)} className={`${inputClass(invalid)} ${className}`}>
      {children}
    </select>
  );
}

const BUTTON = {
  primary: "bg-[#093c33] hover:bg-[#072e27] text-white shadow-sm",
  accent: "bg-[#f3843f] hover:bg-[#d96e2b] text-white shadow-sm",
  secondary: "bg-white hover:bg-stone-50 text-stone-800 border border-stone-200",
  ghost: "bg-transparent hover:bg-stone-100 text-stone-700",
  danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm",
  dangerGhost: "bg-transparent hover:bg-rose-50 text-rose-700 border border-rose-200",
};

export function Button({ variant = "primary", size = "md", loading = false, icon: Icon, children, className = "", disabled, href, ...props }) {
  const sizes = { sm: "px-3 py-1.5 text-xs gap-1.5", md: "px-4 py-2.5 text-sm gap-2", lg: "px-6 py-3 text-sm gap-2" };
  const cls = `cursor-pointer inline-flex items-center justify-center font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 ${BUTTON[variant]} ${sizes[size]} ${className}`;
  const content = (
    <>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon ? <Icon className="w-4 h-4" /> : null}
      {children}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" disabled={disabled || loading} className={cls} {...props}>
      {content}
    </button>
  );
}

export function Badge({ tone = "neutral", children, className = "" }) {
  const tones = {
    neutral: "bg-stone-100 text-stone-700 border-stone-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-sky-50 text-sky-800 border-sky-200",
    brand: "bg-[#093c33] text-white border-[#093c33]",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`cursor-pointer relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? "bg-[#093c33]" : "bg-stone-300"}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

export function Spinner({ label = "Loading…" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-stone-500 text-sm">
      <Loader2 className="w-5 h-5 animate-spin text-[#093c33]" />
      {label}
    </div>
  );
}

export function Alert({ tone = "error", children, onRetry }) {
  const cls = tone === "error" ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-amber-50 border-amber-200 text-amber-900";
  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border text-sm ${cls}`} role="alert">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="cursor-pointer text-xs font-bold underline underline-offset-2">
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="text-center py-14 px-6">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center">
        <Icon className="w-6 h-6 text-stone-400" />
      </div>
      <h3 className="mt-4 text-base font-extrabold text-stone-800">{title}</h3>
      {message && <p className="mt-1 text-sm text-stone-500 max-w-sm mx-auto">{message}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function Pagination({ page, pages, total, onPage }) {
  if (!pages || pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 pt-4 text-xs text-stone-500">
      <span>
        Page {page} of {pages} · {total} total
      </span>
      <div className="flex items-center gap-1.5">
        <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Prev
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

/** Lightweight confirmation dialog for destructive actions. */
export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", tone = "danger", loading, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && !loading && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150" onClick={() => !loading && onCancel()}>
      <div role="dialog" aria-modal="true" className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 animate-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-extrabold text-stone-900">{title}</h3>
          <button type="button" onClick={onCancel} disabled={loading} className="cursor-pointer w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-2 text-sm text-stone-600 leading-relaxed">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function StatTile({ label, value, sub, icon: Icon, tone = "brand" }) {
  const tones = { brand: "bg-[#093c33] text-white", accent: "bg-[#f3843f] text-white", light: "bg-stone-100 text-[#093c33]" };
  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-sm flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>{Icon && <Icon className="w-5 h-5" />}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500">{label}</p>
        <p className="mt-0.5 text-2xl font-extrabold text-stone-900 tracking-tight leading-none">{value}</p>
        {sub && <p className="mt-1.5 text-xs text-stone-500 truncate">{sub}</p>}
      </div>
    </div>
  );
}
