"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, UserPlus, Mail, Lock, User, FileText, Loader2, AlertCircle, Eye, EyeOff, WifiOff, Terminal } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { ApiError, friendlyMessage, fieldErrors, isStaff } from "@/lib/api";

/** Only allow same-site relative paths as a return target. */
function safeNext(raw) {
  if (!raw || typeof raw !== "string") return "/";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/";
  if (raw.startsWith("/login")) return "/"; // never bounce back to ourselves
  return raw;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const { user, loading, login, register, backendReachable } = useAuth();
  const toast = useToast();

  const [mode, setMode] = useState(searchParams.get("mode") === "register" ? "register" : "login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Already signed in → go straight to where they wanted to be.
  useEffect(() => {
    if (!loading && user) router.replace(next === "/" && isStaff(user) ? "/admin" : next);
  }, [loading, user, next, router]);

  const isRegister = mode === "register";

  // Friendly hint when we were sent here from a PDF card.
  const pdfMatch = next.match(/^\/pdf\/([^/?#]+)/);
  const pendingPdf = pdfMatch ? { title: decodeURIComponent(pdfMatch[1]).replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) } : null;
  const pendingTodayCode = next.startsWith("/today-code");

  // Client-side checks first so most mistakes never need a round trip.
  const validate = () => {
    const errs = {};
    if (isRegister && name.trim().length < 2) errs.name = "Please tell us your name (at least 2 characters).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Please enter a valid email address.";
    if (isRegister && password.length < 8) errs.password = "Use at least 8 characters for your password.";
    if (!isRegister && password.length === 0) errs.password = "Please enter your password.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    const errs = validate();
    setFieldError(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      const who = isRegister
        ? await register(name.trim(), email.trim().toLowerCase(), password)
        : await login(email.trim().toLowerCase(), password);
      toast.success(isRegister ? `Welcome aboard, ${who.name || "friend"}!` : `Welcome back${who.name ? `, ${who.name}` : ""}!`);
      router.replace(next === "/" && isStaff(who) ? "/admin" : next);
    } catch (err) {
      const fe = fieldErrors(err);
      if (Object.keys(fe).length) {
        setFieldError(fe);
        setError("Please check the highlighted fields.");
      } else if (err instanceof ApiError && err.status === 409) {
        setError("An account with this email already exists. Try signing in instead.");
        setMode("login");
      } else {
        setError(friendlyMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (key) =>
    `w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-stone-50 border focus:outline-none focus:ring-1 text-stone-900 placeholder:text-stone-400 transition-colors ${
      fieldError[key]
        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-300"
        : "border-stone-200 focus:border-[#f3843f] focus:ring-[#f3843f]"
    }`;

  const clearField = (key) => setFieldError((f) => (f[key] ? { ...f, [key]: undefined } : f));

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-[28px] border border-stone-200/90 shadow-xl shadow-emerald-950/5 overflow-hidden">
        <div className="px-7 py-6 bg-[#093c33] text-white">
          <h1 className="text-2xl font-extrabold tracking-tight">
            {isRegister ? "Create your free account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-emerald-100/80">
            {isRegister
              ? "One account unlocks every PDF handbook. No credit card."
              : "Sign in to read PDF notes and track what you like."}
          </p>
        </div>

        {!backendReachable && (
          <div className="mx-7 mt-6 flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/70 text-xs text-amber-900">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>We&apos;re having trouble reaching the server. You can still try, but it may not go through right now.</span>
          </div>
        )}

        {pendingTodayCode && (
          <div className="mx-7 mt-6 flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-xs text-emerald-900">
            <Terminal className="w-4 h-4 text-[#093c33] shrink-0 mt-0.5" />
            <span>
              <strong className="font-bold">Today Code</strong> is for members. Sign in (or create a free account) and you&apos;ll land on today&apos;s solution right away.
            </span>
          </div>
        )}

        {pendingPdf && (
          <div className="mx-7 mt-6 flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/70 text-xs text-amber-900">
            <FileText className="w-4 h-4 text-[#f3843f] shrink-0 mt-0.5" />
            <span>
              Sign in to open <strong className="font-bold">{pendingPdf.title}</strong>. You&apos;ll be taken there right after.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">
          {isRegister && (
            <label className="block">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Name</span>
              <div className="mt-1.5 relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  minLength={2}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearField("name");
                  }}
                  placeholder="Your name"
                  aria-invalid={Boolean(fieldError.name)}
                  className={inputClass("name")}
                />
              </div>
              {fieldError.name && <span className="mt-1 block text-[11px] font-semibold text-rose-600">{fieldError.name}</span>}
            </label>
          )}

          <label className="block">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Email</span>
            <div className="mt-1.5 relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearField("email");
                }}
                placeholder="you@example.com"
                aria-invalid={Boolean(fieldError.email)}
                className={inputClass("email")}
              />
            </div>
            {fieldError.email && <span className="mt-1 block text-[11px] font-semibold text-rose-600">{fieldError.email}</span>}
          </label>

          <label className="block">
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">Password</span>
            <div className="mt-1.5 relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete={isRegister ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearField("password");
                }}
                placeholder={isRegister ? "At least 8 characters" : "Your password"}
                aria-invalid={Boolean(fieldError.password)}
                className={`${inputClass("password")} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldError.password && <span className="mt-1 block text-[11px] font-semibold text-rose-600">{fieldError.password}</span>}
          </label>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-[#093c33] hover:bg-[#f3843f] shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRegister ? (
              <UserPlus className="w-4 h-4" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>{isRegister ? "Create account" : "Sign in"}</span>
          </button>

          <p className="text-center text-xs text-stone-500 pt-1">
            {isRegister ? "Already have an account?" : "New here?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(isRegister ? "login" : "register");
                setError("");
                setFieldError({});
              }}
              className="cursor-pointer font-bold text-[#093c33] hover:text-[#f3843f] underline-offset-2 hover:underline"
            >
              {isRegister ? "Sign in" : "Create a free account"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
