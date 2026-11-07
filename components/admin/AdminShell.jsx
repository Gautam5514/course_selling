"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, Users, ExternalLink, LogOut, Menu, X, ShieldCheck, Loader2, ShieldAlert, Terminal } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import ErrorState from "@/components/ui/ErrorState";
import { useAuth, loginHref } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { isStaff } from "@/lib/api";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/notes", label: "Notes & PDFs", icon: FileText },
  { href: "/admin/daily-code", label: "Today Code", icon: Terminal },
  { href: "/admin/users", label: "Accounts", icon: Users, adminOnly: true },
];

/**
 * Layout + access guard for everything under /admin.
 *  - not signed in      → /login?next=<current admin page>
 *  - signed in, student → friendly "admins only" screen
 *  - ADMIN / EDITOR     → sidebar shell
 */
export default function AdminShell({ children }) {
  const { user, loading, logout, backendReachable } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && backendReachable) router.replace(loginHref(pathname || "/admin"));
  }, [loading, user, backendReachable, router, pathname]);

  if (loading || (!user && backendReachable)) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center gap-3 text-stone-500">
        <Loader2 className="w-6 h-6 animate-spin text-[#093c33]" />
        <p className="text-sm">{loading ? "Checking your access…" : "Taking you to sign in…"}</p>
      </div>
    );
  }

  if (!user && !backendReachable) {
    return (
      <div className="min-h-screen bg-[#faf7f2]">
        <ErrorState
          eyebrow="Connection"
          title="We can't reach the server"
          message="The admin area needs a live connection. Please check that the backend is running and try again."
          icon={ShieldAlert}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!isStaff(user)) {
    return (
      <div className="min-h-screen bg-[#faf7f2]">
        <ErrorState
          eyebrow="Admins only"
          title="This area is for administrators"
          message={`You're signed in as ${user.email}, which is a student account. If you should have access, ask an administrator to update your role.`}
          icon={ShieldCheck}
        />
      </div>
    );
  }

  const items = NAV.filter((n) => !n.adminOnly || user.role === "ADMIN");
  const isActive = (n) => (n.exact ? pathname === n.href : pathname === n.href || pathname.startsWith(`${n.href}/`));

  const handleLogout = async () => {
    await logout();
    toast.info("You've been signed out.", { duration: 2500 });
    router.replace("/");
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 h-20 flex items-center justify-between border-b border-white/10">
        <BrandLogo size="md" />
        <button type="button" className="lg:hidden cursor-pointer text-emerald-100 p-2" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="px-5 pt-5 pb-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#f3843f]">
          <ShieldCheck className="w-3.5 h-3.5" />
          Admin panel
        </span>
      </div>
      <nav className="px-3 space-y-1 flex-1">
        {items.map((n) => {
          const Icon = n.icon;
          const active = isActive(n);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                active ? "bg-white/10 text-white shadow-inner" : "text-emerald-100/75 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-[#f3843f]" : ""}`} />
              {n.label}
            </Link>
          );
        })}
        <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-emerald-100/75 hover:text-white hover:bg-white/5">
          <ExternalLink className="w-4 h-4" />
          View website
        </Link>
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#f3843f] text-white font-extrabold flex items-center justify-center shrink-0">
            {(user.name || user.email).slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">{user.name || "Admin"}</p>
            <p className="text-[11px] text-emerald-100/60 truncate">{user.email}</p>
          </div>
          <button type="button" onClick={handleLogout} className="cursor-pointer p-2 rounded-lg text-emerald-100/70 hover:text-white hover:bg-white/10" aria-label="Sign out" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#0f2820] font-sans antialiased lg:flex">
      <aside className="hidden lg:block w-64 shrink-0 bg-[#0b3329] text-white sticky top-0 h-screen">{sidebar}</aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 max-w-[85%] bg-[#0b3329] text-white h-full animate-in slide-in-from-left duration-200">{sidebar}</div>
          <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-40 h-16 bg-[#0b3329] text-white flex items-center justify-between px-4">
          <button type="button" className="cursor-pointer p-2 -ml-2" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-sm font-extrabold tracking-wide">Admin panel</span>
          <span className="w-8" />
        </header>
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
