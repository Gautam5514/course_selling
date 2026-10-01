"use client";

import { useState } from "react";
import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { ArrowUpRight, Send } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="w-full bg-[#faf7f2] pt-4">
      {/* Dark Forest Green Footer Container */}
      <div className="w-full bg-[#062c23] rounded-t-[36px] sm:rounded-t-[48px] text-white pt-12 sm:pt-16 pb-10 px-6 sm:px-10 lg:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Top Row: "Start Your Learning Journey Today" + "Explore 150+ Courses" button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-10 sm:pb-12 border-b border-emerald-900/60">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-white leading-tight">
                Ready to level up your career?
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/80 mt-1">
                Join 48,000+ ambitious developers &amp; designers learning in real-time.
              </p>
            </div>

            <Link
              href="/#courses"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#f3843f] hover:bg-[#e0732f] text-white font-bold text-base shadow-lg shadow-orange-950/20 hover:scale-105 active:scale-95 transition-all"
            >
              <span>Explore 150+ Courses</span>
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </Link>
          </div>

          {/* Middle Columns: Brand, Popular Tracks, Support, Newsletter */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 py-12 sm:py-14 border-b border-emerald-900/60">
            {/* Col 1: Brand Info & Socials (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <BrandLogo size="lg" />

              <p className="text-xs sm:text-[13px] text-emerald-100/75 leading-relaxed max-w-sm font-normal">
                helloS by hellobject.com is a premier online learning ecosystem empowering over 48,000 developers &amp; designers to master high-impact AI, engineering, and product design with industry leads.
              </p>

              {/* Social Icons Row */}
              <div className="flex items-center gap-3 pt-2 text-white">
                {/* Facebook */}
                <Link
                  href="#facebook"
                  className="w-7 h-7 rounded-md bg-white/10 hover:bg-[#f3843f] flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </Link>

                {/* YouTube */}
                <Link
                  href="#youtube"
                  className="w-7 h-7 rounded-md bg-white/10 hover:bg-[#f3843f] flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </Link>

                {/* WhatsApp */}
                <Link
                  href="#whatsapp"
                  className="w-7 h-7 rounded-md bg-white/10 hover:bg-[#f3843f] flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.301-.15-1.78-.877-2.056-.977-.275-.101-.476-.15-.676.15-.201.3-.777.977-.952 1.178-.175.201-.35.226-.652.075-.301-.15-1.272-.469-2.424-1.496-.895-.798-1.5-1.784-1.676-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.35.452-.526.15-.175.201-.301.301-.502.101-.201.05-.376-.025-.526-.075-.15-.676-1.63-.927-2.233-.244-.588-.492-.508-.676-.517l-.577-.01c-.2 0-.527.075-.802.376s-1.054 1.029-1.054 2.511c0 1.482 1.079 2.91 1.23 3.111.15.201 2.123 3.242 5.143 4.547.719.31 1.28.496 1.718.636.722.23 1.378.197 1.897.12.578-.087 1.78-.727 2.03-1.43.251-.703.251-1.305.176-1.43-.075-.126-.276-.201-.577-.351zM12.04 2C6.517 2 2.028 6.489 2.028 12.012c0 1.94.555 3.754 1.517 5.29L2 22l4.832-1.503a9.98 9.98 0 0 0 5.208 1.47c5.523 0 10.012-4.489 10.012-10.012C22.052 6.489 17.563 2 12.04 2z" />
                  </svg>
                </Link>

                {/* Instagram */}
                <Link
                  href="#instagram"
                  className="w-7 h-7 rounded-md bg-white/10 hover:bg-[#f3843f] flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </Link>

                {/* Twitter / X */}
                <Link
                  href="#twitter"
                  className="w-7 h-7 rounded-md bg-white/10 hover:bg-[#f3843f] flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Col 2: Popular Tracks (2 cols) */}
            <div className="lg:col-span-2 space-y-3.5">
              <h4 className="text-sm font-bold text-[#f3843f] tracking-wide">
                Popular Tracks
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-[13px] text-emerald-100/70 font-normal">
                <li>
                  <Link href="/courses/full-stack-web-dev" className="hover:text-white transition-colors">
                    Full-Stack Web Dev
                  </Link>
                </li>
                <li>
                  <Link href="/courses/generative-ai-llms" className="hover:text-white transition-colors">
                    Generative AI & LLMs
                  </Link>
                </li>
                <li>
                  <Link href="/courses/ui-ux-design-systems" className="hover:text-white transition-colors">
                    UI/UX Design Systems
                  </Link>
                </li>
                <li>
                  <Link href="/courses/cloud-kubernetes" className="hover:text-white transition-colors">
                    Cloud & Kubernetes
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
                Resources
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-[13px] text-emerald-100/70 font-normal">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About helloS
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Tuition & Plans
                  </Link>
                </li>
                <li>
                  <Link href="/career" className="hover:text-white transition-colors">
                    Teach With Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">
                    Tech Career Guides
                  </Link>
                </li>
                <li>
                  <Link href="/refunds" className="hover:text-white transition-colors">
                    30-Day Guarantee
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@hellobject.com" className="hover:text-white transition-colors">
                    support@hellobject.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Get the latest information (3 cols) */}
            <div className="lg:col-span-3 space-y-3.5">
              <h4 className="text-sm font-bold text-[#f3843f] tracking-wide">
                Get Course Updates &amp; Syllabi
              </h4>

              {subscribed ? (
                <div className="text-xs text-emerald-300 bg-emerald-950/80 p-3 rounded-full border border-emerald-700/60">
                  ✓ Thank you for subscribing!
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
              . All Rights Reserved.
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms &amp; Conditions
              </Link>
              <span className="text-emerald-800">•</span>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="text-emerald-800">•</span>
              <Link href="/refunds" className="hover:text-white transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
