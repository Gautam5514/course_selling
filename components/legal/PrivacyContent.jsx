"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Eye,
  Lock,
  Database,
  UserCheck,
  Cookie,
  Mail,
  ChevronRight,
  Calendar,
} from "lucide-react";

export default function PrivacyContent() {
  const [activeSection, setActiveSection] = useState("collect");

  const sections = [
    { id: "collect", label: "1. Information We Collect", icon: Database },
    { id: "usage", label: "2. How We Use Data", icon: Eye },
    { id: "security", label: "3. Encryption & Storage", icon: Lock },
    { id: "cookies", label: "4. Cookies & Trackers", icon: Cookie },
    { id: "rights", label: "5. Your Privacy Rights", icon: UserCheck },
    { id: "contact", label: "6. Data Officer Contact", icon: Mail },
  ];

  return (
    <div className="py-12 sm:py-16 md:py-20">
      {/* Hero Header */}
      <div className="relative bg-[#093c33] text-white py-16 sm:py-20 rounded-3xl mx-4 sm:mx-6 lg:mx-8 px-6 sm:px-12 overflow-hidden shadow-xl mb-12 sm:mb-16">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-amber-300 mb-5">
            <Calendar className="w-3.5 h-3.5" />
            <span>GDPR &amp; CCPA COMPLIANT • HELLOBJECT.COM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Privacy <span className="text-[#f3843f]">Policy</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
            At <strong className="text-white">hellobject.com</strong>, protecting your personal data, privacy, and intellectual learning records is fundamental to everything we build.
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Sticky Navigation Sidebar */}
          <aside className="lg:col-span-4 sticky top-28 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4">
              Privacy Outline
            </h3>
            <nav className="space-y-1">
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={() => setActiveSection(sec.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#093c33] text-white font-semibold shadow-sm"
                        : "text-stone-600 hover:bg-stone-50 hover:text-black"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#f3843f]" : "text-stone-400"}`} />
                      <span className="truncate">{sec.label}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-stone-300"}`} />
                  </a>
                );
              })}
            </nav>

            <div className="mt-8 pt-6 border-t border-stone-100 text-xs text-stone-500 space-y-3">
              <p>
                Want to request data export or deletion?
              </p>
              <a
                href="mailto:privacy@hellobject.com"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#093c33] hover:text-[#f3843f] transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                privacy@hellobject.com
              </a>
            </div>
          </aside>

          {/* Legal Content Document */}
          <article className="lg:col-span-8 bg-white p-6 sm:p-10 md:p-12 rounded-3xl border border-stone-200/90 shadow-sm space-y-12 text-stone-700 leading-relaxed text-sm sm:text-base">
            {/* Section 1 */}
            <section id="collect" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#093c33]/10 text-[#093c33] flex items-center justify-center text-sm font-bold">1</span>
                Information We Collect
              </h2>
              <p>
                When you visit or register with <strong className="text-stone-900">hellobject.com</strong>, we collect only the necessary data needed to deliver a seamless classroom and certification experience:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-stone-600">
                <li><strong>Account Identifiers:</strong> Name, verified email address, portfolio links, and cryptographic authentication tokens.</li>
                <li><strong>Transaction Data:</strong> Billed amount, currency, and payment confirmation IDs. <em>We never store raw credit card numbers</em>; payment data is securely tokenized through Stripe.</li>
                <li><strong>Academic Progress:</strong> Quiz submissions, homework repos, project milestone statuses, and attendance logs for verifiable certificate generation.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section id="usage" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#093c33]/10 text-[#093c33] flex items-center justify-center text-sm font-bold">2</span>
                How We Use Your Data
              </h2>
              <p>
                We do not sell, rent, or trade student data to third-party advertisers. Data is exclusively utilized to:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-stone-600">
                <li>Grant classroom access, live video streaming, and mentor review queues.</li>
                <li>Verify accredited certificate serial numbers through our public lookup registry.</li>
                <li>Send transactional course updates, schedule reminders, and cohort notifications.</li>
                <li>Continuously optimize curriculum effectiveness based on aggregate anonymized engagement metrics.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="security" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#093c33]/10 text-[#093c33] flex items-center justify-center text-sm font-bold">3</span>
                Encryption &amp; Storage Architecture
              </h2>
              <p>
                All data transmission between your browser and <strong className="text-stone-900">hellobject.com</strong> is strictly encrypted using TLS 1.3 cryptographic protocols with HSTS preloading.
              </p>
              <p>
                Student databases are stored in SOC 2 Type II compliant cloud regions with multi-tier encryption at rest (AES-256). Periodic automated penetration tests ensure institutional-grade resilience.
              </p>
            </section>

            {/* Section 4 */}
            <section id="cookies" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#093c33]/10 text-[#093c33] flex items-center justify-center text-sm font-bold">4</span>
                Cookies &amp; Local Storage
              </h2>
              <p>
                We use strictly essential cookies and local session tokens to keep you logged in and preserve your video playback timestamp. You can disable non-essential cookies via your browser settings at any time without impacting course access.
              </p>
            </section>

            {/* Section 5 */}
            <section id="rights" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#093c33]/10 text-[#093c33] flex items-center justify-center text-sm font-bold">5</span>
                Your Privacy Rights (GDPR &amp; CCPA)
              </h2>
              <p>
                Regardless of your geographic location, <strong className="text-stone-900">hellobject.com</strong> extends universal data sovereignty rights:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-stone-600">
                <li><strong>Right to Access:</strong> Request a complete JSON archive of all records linked to your email.</li>
                <li><strong>Right to Erasure (&ldquo;Be Forgotten&rdquo;):</strong> Request permanent deletion of your profile, discussions, and personal records.</li>
                <li><strong>Right to Rectification:</strong> Instantly update your name, avatar, and contact details from your student settings.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="contact" className="scroll-mt-32 space-y-4 bg-emerald-50/70 p-6 rounded-2xl border border-emerald-200/80">
              <h2 className="text-xl sm:text-2xl font-bold text-[#093c33] border-b border-emerald-200 pb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#093c33] text-white flex items-center justify-center text-sm font-bold">6</span>
                Data Protection Officer
              </h2>
              <p>
                To exercise any of your data rights or report a privacy concern, submit a request to our dedicated privacy office:
              </p>
              <div className="text-xs sm:text-sm space-y-1 font-mono text-stone-700 pt-2">
                <p><strong>Entity:</strong> hellobject.com Inc. (Data Privacy Office)</p>
                <p><strong>Domain:</strong> <a href="https://hellobject.com" className="text-[#093c33] underline">https://hellobject.com</a></p>
                <p><strong>Privacy Contact:</strong> <a href="mailto:privacy@hellobject.com" className="text-[#093c33] underline">privacy@hellobject.com</a></p>
                <p><strong>Response SLA:</strong> Within 48 business hours</p>
              </div>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}
