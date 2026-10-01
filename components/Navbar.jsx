"use client";

import { useState } from "react";
import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { navLinks } from "../data/landingData";
import { Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0b3329]/95 backdrop-blur-md border-b border-emerald-900/40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <BrandLogo size="md" />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
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
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="#login"
              className="text-sm font-medium text-emerald-100/90 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="#signup"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold bg-[#eb793e] hover:bg-[#da6c32] text-white shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              Sign up
            </Link>
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
              href="#login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-medium text-emerald-100 hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="#signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold bg-[#eb793e] hover:bg-[#da6c32] text-white"
            >
              Sign up <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
