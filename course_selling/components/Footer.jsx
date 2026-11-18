"use client";

import { useState } from "react";
import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { Send, Heart, FileText, Code2 } from "lucide-react";
import { SOCIALS } from "@/data/socials";

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
