"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  BookOpen,
  Scale,
  Mail,
  ChevronRight,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { SparkleStar } from "@/components/DecorativeShapes";

export default function TermsContent() {
  const [activeSection, setActiveSection] = useState("acceptance");

  const sections = [
    { id: "acceptance", label: "1. Acceptance of Terms", icon: CheckCircle2 },
    { id: "services", label: "2. Services & Platform Access", icon: BookOpen },
    { id: "account", label: "3. User Accounts & Security", icon: ShieldCheck },
    { id: "payments", label: "4. 100% Free Open-Access Model", icon: CheckCircle2 },
    { id: "refunds", label: "5. Projects & PDF Licensing", icon: FileText },
    { id: "conduct", label: "6. Code of Conduct & IP", icon: FileText },
    { id: "liability", label: "7. Limitations of Liability", icon: Scale },
    { id: "contact", label: "8. Contact & Legal Notices", icon: Mail },
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
            <span>LAST UPDATED: OCTOBER 2025 • HELLOBJECT.COM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Terms &amp; <span className="text-[#f3843f]">Conditions</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully before enrolling in courses, joining live classrooms, or utilizing any services provided by <strong className="text-white">hellobject.com</strong>.
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Sticky Navigation Sidebar */}
          <aside className="lg:col-span-4 sticky top-28 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4">
              Table of Contents
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
                Questions regarding our terms?
              </p>
              <a
                href="mailto:legal@hellobject.com"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#093c33] hover:text-[#f3843f] transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                legal@hellobject.com
              </a>
            </div>
          </aside>

          {/* Legal Content Document */}
          <article className="lg:col-span-8 bg-white p-6 sm:p-10 md:p-12 rounded-3xl border border-stone-200/90 shadow-sm space-y-12 text-stone-700 leading-relaxed text-sm sm:text-base">
            {/* Section 1 */}
            <section id="acceptance" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#093c33]/10 text-[#093c33] flex items-center justify-center text-sm font-bold">1</span>
                Acceptance of Terms
              </h2>
              <p>
                By creating an account, browsing <strong className="text-stone-900">hellobject.com</strong> (&ldquo;the Site&rdquo;), enrolling in any curriculum, bootcamp, or interactive workshop, you agree to be bound by these Terms and Conditions. These terms constitute a legally binding agreement between you (&ldquo;Student&rdquo;, &ldquo;User&rdquo;) and <strong className="text-stone-900">hellobject.com</strong> (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;).
              </p>
              <p>
                If you do not agree with any part of these terms, you must discontinue platform use immediately. Continued access affirms your unconditional agreement to these terms as updated periodically.
              </p>
            </section>

            {/* Section 2 */}
            <section id="services" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#093c33]/10 text-[#093c33] flex items-center justify-center text-sm font-bold">2</span>
                Services &amp; Platform Access
              </h2>
              <p>
                <strong className="text-stone-900">hellobject.com</strong> provides technical education programs including live virtual classrooms, pre-recorded masterclasses, 1-on-1 mentor code reviews, capstone evaluations, and verifiable completion credentials.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-stone-600">
                <li><strong>Lifetime Access:</strong> Enrolling in standard tracks grants lifetime access to curriculum updates and discussion archives for that specific edition.</li>
                <li><strong>Cohort Scheduling:</strong> Live cohorts follow announced schedules. Live recordings are uploaded within 24 hours of session completion.</li>
                <li><strong>System Availability:</strong> While we target 99.9% platform uptime, temporary maintenance windows will be communicated in advance via your dashboard.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="account" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#093c33]/10 text-[#093c33] flex items-center justify-center text-sm font-bold">3</span>
                User Accounts &amp; Security
              </h2>
              <p>
                To participate in courses and obtain certificates, you must create a verified account with accurate credentials. You are solely responsible for:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-stone-600">
                <li>Safeguarding your password and multi-factor authentication devices.</li>
                <li>Ensuring your account is not shared with or transferred to any third party. Single-seat licenses are strictly non-transferable.</li>
                <li>Notifying <a href="mailto:support@hellobject.com" className="text-[#093c33] font-bold underline">support@hellobject.com</a> immediately upon noticing unauthorized access.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="payments" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#093c33]/10 text-[#093c33] flex items-center justify-center text-sm font-bold">4</span>
                100% Free Open-Access Model
              </h2>
              <p>
                helloS is provided as a free educational resource hub. Users are not charged tuition fees, monthly subscriptions, or hidden maintenance costs. No credit card or banking information is collected by helloS.
              </p>
              <p>
                All technical PDF notes, study handbooks, and GitHub repository starter files are accessible without financial consideration.
              </p>
            </section>

            {/* Section 5 */}
            <section id="refunds" className="scroll-mt-32 space-y-4 bg-emerald-50/60 p-6 rounded-2xl border border-emerald-200/80">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 border-b border-emerald-200 pb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#093c33] text-white flex items-center justify-center text-sm font-bold">5</span>
                Projects &amp; PDF Educational Licensing
              </h2>
              <p className="font-medium text-stone-800">
                All open-source project codebases made available on <strong className="text-stone-900">hellobject.com</strong> may be cloned, modified, and used in your personal portfolios, learning projects, and job interview showcases.
              </p>
              <p className="text-xs sm:text-sm text-stone-600">
                Because all materials are offered 100% free of charge, there are no fee refunds or financial disputes applicable. You are welcome to share and like our resources freely.
              </p>
              <div className="pt-2">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#093c33] hover:underline"
                >
                  <span>Explore Open-Source Capstone Projects</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </section>

            {/* Section 6 */}
            <section id="conduct" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#093c33]/10 text-[#093c33] flex items-center justify-center text-sm font-bold">6</span>
                Code of Conduct &amp; Intellectual Property
              </h2>
              <p>
                All course lectures, proprietary architectural blueprints, starter repos, slide decks, and project prompts published on <strong className="text-stone-900">hellobject.com</strong> are copyrighted assets of hellobject.com and its respective lead instructors.
              </p>
              <p>
                You may build commercial products and portfolio software using skills learned. However, screen recording, distributing, reselling, or public redistribution of our proprietary video lessons and classroom materials without express written authorization is strictly prohibited and subject to legal remedies.
              </p>
            </section>

            {/* Section 7 */}
            <section id="liability" className="scroll-mt-32 space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#093c33]/10 text-[#093c33] flex items-center justify-center text-sm font-bold">7</span>
                Limitations of Liability
              </h2>
              <p>
                While our career tracks are authored by principal leads from top technology firms to maximize hiring efficacy, <strong className="text-stone-900">hellobject.com</strong> does not guarantee employment offers, compensation thresholds, or specific career promotions.
              </p>
              <p className="text-xs sm:text-sm text-stone-500 italic">
                In no event shall hellobject.com or its affiliates be liable for indirect, incidental, punitive, or consequential damages resulting from technical access disruptions or third-party service provider outages.
              </p>
            </section>

            {/* Section 8 */}
            <section id="contact" className="scroll-mt-32 space-y-4 bg-emerald-50/70 p-6 rounded-2xl border border-emerald-200/80">
              <h2 className="text-xl sm:text-2xl font-bold text-[#093c33] border-b border-emerald-200 pb-3 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#093c33] text-white flex items-center justify-center text-sm font-bold">8</span>
                Contact &amp; Legal Notices
              </h2>
              <p>
                If you have questions, inquiries, or formal legal notices concerning these Terms and Conditions, please contact our legal operations team:
              </p>
              <div className="text-xs sm:text-sm space-y-1 font-mono text-stone-700 pt-2">
                <p><strong>Entity:</strong> hellobject.com Inc.</p>
                <p><strong>Website:</strong> <a href="https://hellobject.com" className="text-[#093c33] underline">https://hellobject.com</a></p>
                <p><strong>Legal Inquiries:</strong> <a href="mailto:legal@hellobject.com" className="text-[#093c33] underline">legal@hellobject.com</a></p>
                <p><strong>General Support:</strong> <a href="mailto:support@hellobject.com" className="text-[#093c33] underline">support@hellobject.com</a></p>
              </div>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}
