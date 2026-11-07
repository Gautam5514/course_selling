"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, WifiOff, X } from "lucide-react";

const ToastContext = createContext(null);

const STYLES = {
  success: { icon: CheckCircle2, ring: "border-emerald-200", iconColor: "text-emerald-600", bar: "bg-emerald-500" },
  error: { icon: AlertTriangle, ring: "border-rose-200", iconColor: "text-rose-600", bar: "bg-rose-500" },
  info: { icon: Info, ring: "border-sky-200", iconColor: "text-sky-600", bar: "bg-sky-500" },
  offline: { icon: WifiOff, ring: "border-amber-200", iconColor: "text-amber-600", bar: "bg-amber-500" },
};

let nextId = 1;

/**
 * App-wide toasts. Usage:
 *   const toast = useToast();
 *   toast.success("Saved!"); toast.error("Could not save."); toast.info("…")
 * Also announces offline / back-online automatically.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (variant, message, { title, duration = 4200, key } = {}) => {
      if (!message) return null;
      const id = key || nextId++;
      setToasts((list) => {
        // De-dupe: same key or same message replaces instead of stacking.
        const rest = list.filter((t) => t.id !== id && t.message !== message);
        return [...rest.slice(-3), { id, variant, message, title }];
      });
      if (duration > 0) {
        const old = timers.current.get(id);
        if (old) clearTimeout(old);
        timers.current.set(id, setTimeout(() => dismiss(id), duration));
      }
      return id;
    },
    [dismiss]
  );

  // Offline / online awareness (browser events → callbacks, not effect-body setState).
  useEffect(() => {
    const onOffline = () => push("offline", "You're offline. Some things won't work until you reconnect.", { duration: 0, key: "net" });
    const onOnline = () => {
      dismiss("net");
      push("success", "You're back online.", { duration: 2500 });
    };
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [push, dismiss]);

  const api = useMemo(
    () => ({
      success: (m, o) => push("success", m, o),
      error: (m, o) => push("error", m, o),
      info: (m, o) => push("info", m, o),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed z-[100] bottom-4 right-4 left-4 sm:left-auto sm:w-[380px] flex flex-col gap-2.5 pointer-events-none"
      >
        {toasts.map((t) => {
          const style = STYLES[t.variant] || STYLES.info;
          const Icon = style.icon;
          return (
            <div
              key={t.id}
              role={t.variant === "error" ? "alert" : "status"}
              className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-4 pr-10 rounded-2xl bg-white/95 backdrop-blur border ${style.ring} shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)] animate-in slide-in-from-bottom-3 fade-in duration-300`}
            >
              <span className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar}`} />
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.iconColor}`} />
              <div className="min-w-0">
                {t.title && <p className="text-sm font-extrabold text-stone-900 leading-tight">{t.title}</p>}
                <p className="text-[13px] text-stone-700 leading-snug">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="cursor-pointer absolute top-3 right-3 w-6 h-6 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
