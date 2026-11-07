"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { navLinks } from "../data/landingData";
import { Menu, X, Code2, FileText, LogIn, LogOut, ShieldCheck, Terminal, ChevronDown } from "lucide-react";
import { isStaff } from "../lib/api";
import { useAuth, loginHref } from "./AuthProvider";
import { useToast } from "./ui/ToastProvider";

function initialsOf(user) {
  const src = (user?.name || user?.email || "?").trim();
  const parts = src.split(/\s+/).filter(Boolean);
  const text = parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : src.slice(0, 2);
  return text.toUpperCase();
}

function roleLabel(user) {
  if (user?.role === "ADMIN") return "Administrator";
  return "Editor";
}

function Avatar({ user, size = "sm" }) {
  const cls = size === "lg" ? "w-11 h-11 text-sm" : "w-8 h-8 text-[11px]";
  return (
    <span className={`${cls} shrink-0 rounded-full bg-gradient-to-br from-[#f3843f] to-[#d96e2b] text-white font-extrabold tracking-wide flex items-center justify-center ring-2 ring-white/20 shadow-sm`}>
      {initialsOf(user)}
    </span>
  );
}

/** Signed-in avatar with a dropdown (desktop). */
function UserMenu({ user, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const firstName = (user.name || "").trim().split(/\s+/)[0] || "Account";
  const staff = isStaff(user);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-100 hover:text-[#093c33] transition-colors";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`cursor-pointer inline-flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border transition-all active:scale-95 ${
          open ? "bg-white/15 border-white/30" : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/25"
        }`}
      >
        <Avatar user={user} />
        <span className="text-sm font-bold text-white max-w-[110px] truncate">{firstName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-emerald-100/70 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-stone-200 shadow-2xl shadow-emerald-950/20 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right"
        >
          <div className="px-4 py-4 bg-[#faf7f2] border-b border-stone-200 flex items-center gap-3">
            <Avatar user={user} size="lg" />
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-stone-900 truncate">{user.name || "Your account"}</p>
              <p className="text-xs text-stone-500 truncate">{user.email}</p>
              {staff && (
                <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#093c33] text-white">
                  <ShieldCheck className="w-3 h-3" />
                  {roleLabel(user)}
                </span>
              )}
            </div>
          </div>
          <div className="p-2 space-y-0.5">
            <Link href="/today-code" role="menuitem" onClick={() => setOpen(false)} className={item}>
              <Terminal className="w-4 h-4 text-[#f3843f]" />
              Today Code
            </Link>
            <Link href="/pdf-notes" role="menuitem" onClick={() => setOpen(false)} className={item}>
              <FileText className="w-4 h-4 text-[#f3843f]" />
              PDF Notes
            </Link>
            {staff && (
              <Link href="/admin" role="menuitem" onClick={() => setOpen(false)} className={item}>
                <ShieldCheck className="w-4 h-4 text-[#f3843f]" />
                Admin panel
              </Link>
            )}
          </div>
          <div className="p-2 border-t border-stone-100">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthControl({ user, loading, logout, onNavigate, mobile = false }) {
  if (loading) {
    // Reserve the space so the header doesn't jump once the session resolves.
    return <span aria-hidden className={`inline-block rounded-full bg-white/10 animate-pulse ${mobile ? "w-full h-16 rounded-2xl" : "w-28 h-10"}`} />;
  }
  if (user) {
    if (!mobile) return <UserMenu user={user} logout={logout} />;
    const staff = isStaff(user);
    return (
      <div className="rounded-2xl bg-white/5 border border-white/10 p-3 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar user={user} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-white truncate">{user.name || "Your account"}</p>
            <p className="text-xs text-emerald-100/60 truncate">{user.email}</p>
          </div>
          {staff && <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/10 text-emerald-100">{roleLabel(user)}</span>}
        </div>
        <div className="flex gap-2">
          {staff && (
            <Link href="/admin" onClick={() => onNavigate()} className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15">
              <ShieldCheck className="w-4 h-4 text-[#f3843f]" />
              Admin
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              onNavigate();
              logout();
            }}
            className="cursor-pointer flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-300/20"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    );
  }
  return (
    <Link
      href="/login"
      onClick={() => onNavigate()}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-emerald-100/90 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 ${
        mobile ? "w-full justify-center py-2.5" : ""
      }`}
    >
      <LogIn className="w-4 h-4 text-[#f3843f]" />
      <span>Login</span>
    </Link>
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, logout: doLogout } = useAuth();
  const toast = useToast();
  const logout = async () => {
    await doLogout(); // never throws: local session is cleared even if the server is unreachable
    toast.info("You've been signed out.", { duration: 2500 });
  };
  // "Today Code" is for members: signed-in people go straight to today's
  // solution, everyone else signs in first and lands there right after.
  const todayCodeHref = user ? "/today-code" : loginHref("/today-code");


  return (
    <header className="sticky top-0 z-50 w-full bg-[#0b3329]/95 backdrop-blur-md border-b border-emerald-900/40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <BrandLogo size="md" />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-emerald-100/80 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href={todayCodeHref}
              title="Today's problem-of-the-day solution"
              className="group inline-flex items-center gap-2 pl-2.5 pr-3.5 py-1.5 rounded-full text-sm font-bold text-white bg-white/10 hover:bg-white/15 border border-emerald-300/30 hover:border-[#f3843f]/70 transition-all active:scale-95"
            >
              <span className="relative flex w-6 h-6 items-center justify-center rounded-full bg-[#f3843f] text-white shadow-sm">
                <Terminal className="w-3.5 h-3.5" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-300 ring-2 ring-[#0b3329] animate-pulse" />
              </span>
              <span>Today Code</span>
            </Link>
            <Link
              href="/pdf-notes"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-100/90 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <FileText className="w-4 h-4 text-[#f3843f]" />
              <span>PDF Notes</span>
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold bg-[#eb793e] hover:bg-[#da6c32] text-white shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <Code2 className="w-4 h-4" />
              <span>Explore Projects</span>
            </Link>
            <AuthControl user={user} loading={loading} logout={logout} onNavigate={() => setMobileMenuOpen(false)} />
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-900/50 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a2c23] border-b border-emerald-900/60 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-emerald-100 hover:bg-emerald-800/40 hover:text-white"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-emerald-900/50 flex flex-col gap-3">
            <Link
              href={todayCodeHref}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-white/10 border border-emerald-300/30"
            >
              <Terminal className="w-4 h-4 text-[#f3843f]" />
              <span>Today Code</span>
            </Link>
            <Link
              href="/pdf-notes"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-emerald-100 hover:bg-white/5"
            >
              <FileText className="w-4 h-4 text-[#f3843f]" />
              <span>Browse PDF Notes</span>
            </Link>
            <AuthControl user={user} loading={loading} logout={logout} onNavigate={() => setMobileMenuOpen(false)} mobile />
            <Link
              href="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold bg-[#eb793e] hover:bg-[#da6c32] text-white"
            >
              <Code2 className="w-4 h-4" />
              <span>Explore Projects</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
