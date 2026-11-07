"use client";

import { useState } from "react";
import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { Send, Heart, FileText, Code2 } from "lucide-react";

/* Gautam's profiles (footer icons). */
const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/gautam-pandit-4b185224b/",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/Gautamp5514",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/gautam.einstein.3/",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/gautamp5514/",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "GitHub",
    href: "https://github.com/Gautam5514",
    path: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z",
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="relative bg-[#07241d] text-white pt-16 sm:pt-20 pb-12 overflow-hidden border-t border-emerald-950">
      {/* Background Decorative Tint Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {/* Main Footer Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 sm:gap-12">
            {/* Col 1: Brand Info (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <BrandLogo size="md" />

              <p className="text-xs sm:text-[13px] text-emerald-100/75 leading-relaxed max-w-sm">
                Gopo Workspace is a 100% free open-access platform delivering comprehensive tech PDF notes,
                study handbooks, and real-world production capstone projects for ambitious developers worldwide.
              </p>

              {/* Social Media Icons */}
              <div className="flex items-center gap-2 pt-2 text-white">
                {SOCIALS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.label}
                    aria-label={item.label}
                    className="w-7 h-7 rounded-md bg-white/10 hover:bg-[#f3843f] flex items-center justify-center transition-colors"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d={item.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Col 2: Popular Tracks (2 cols) */}
            <div className="lg:col-span-2 space-y-3.5">
              <h4 className="text-sm font-bold text-[#f3843f] tracking-wide">
                Tracks &amp; Guides
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-[13px] text-emerald-100/70 font-normal">
                <li>
                  <Link href="/courses/full-stack-web-dev" className="hover:text-white transition-colors">
                    Full-Stack Web Dev
                  </Link>
                </li>
                <li>
                  <Link href="/courses/generative-ai-llms" className="hover:text-white transition-colors">
                    Generative AI &amp; LLMs
                  </Link>
                </li>
                <li>
                  <Link href="/courses/ui-ux-design-systems" className="hover:text-white transition-colors">
                    UI/UX Design Systems
                  </Link>
                </li>
                <li>
                  <Link href="/courses/cloud-kubernetes" className="hover:text-white transition-colors">
                    Cloud &amp; Kubernetes
                  </Link>
                </li>
                <li>
                  <Link href="/courses/react-native-mobile" className="hover:text-white transition-colors">
                    React Native Mobile
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Resources & Support (2 cols) */}
            <div className="lg:col-span-2 space-y-3.5">
              <h4 className="text-sm font-bold text-[#f3843f] tracking-wide">
                Free Resources
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-[13px] text-emerald-100/70 font-normal">
                <li>
                  <Link href="/pdf-notes" className="hover:text-white transition-colors">
                    Free PDF Notes
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="hover:text-white transition-colors">
                    Open Projects Hub
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Free Access Pledge
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Gopo Workspace
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">
                    Engineering Articles
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@hellobject.com" className="hover:text-white transition-colors">
                    support@hellobject.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Newsletter (3 cols) */}
            <div className="lg:col-span-3 space-y-3.5">
              <h4 className="text-sm font-bold text-[#f3843f] tracking-wide">
                Get New Notes &amp; Projects
              </h4>
              <p className="text-xs text-emerald-100/70">
                Receive weekly drops of new PDF handbooks, cheatsheets, and open-source project starters.
              </p>

              {subscribed ? (
                <div className="text-xs text-emerald-300 bg-emerald-950/80 p-3 rounded-full border border-emerald-700/60">
                  ✓ You are subscribed to free resource alerts!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="relative">
                  <div className="bg-white rounded-full p-1 pl-4 flex items-center justify-between shadow-sm">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="bg-transparent text-xs text-stone-800 placeholder-stone-400 focus:outline-none w-full pr-2"
                    />
                    <button
                      type="submit"
                      aria-label="Subscribe"
                      className="w-8 h-8 rounded-full bg-[#f3843f] hover:bg-[#e0732f] text-white flex items-center justify-center shrink-0 transition-colors shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5 ml-0.5 fill-current" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Bottom Row: Copyright + Legal Links */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-100/70 border-t border-emerald-900/40">
            <p>
              Copyright &copy; 2025{" "}
              <a
                href="https://hellobject.com"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-white hover:text-amber-300 transition-colors underline underline-offset-2"
              >
                hellobject.com
              </a>
              . 100% Free Open Educational Platform.
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Use
              </Link>
              <span className="text-emerald-800">•</span>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="text-emerald-800">•</span>
              <Link href="/pricing" className="hover:text-white transition-colors">
                Open Access Pledge
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
