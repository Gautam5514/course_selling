"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function CoursesFaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "Is helloS really 100% free with no hidden charges or subscriptions?",
      a: "Yes! helloS is entirely free. All PDF handbooks, architectural cheatsheets, study notes, and GitHub project repositories are open and accessible to all developers without fees, paywalls, or credit cards.",
    },
    {
      q: "Can I download the technical PDF notes and study offline?",
      a: "Absolutely. Every track and module provides comprehensive multi-page PDF guides, architecture diagrams, and concept summaries that you can download with 1 click or read online in your browser.",
    },
    {
      q: "Are the projects real-world production codebases?",
      a: "Yes! Every capstone project includes complete open-source code on GitHub, pre-seeded database migrations, live deployment demo links, and modular deliverables mirroring real enterprise software standards.",
    },
    {
      q: "Can I use the project source code in my personal portfolio?",
      a: "Yes. You have full permission to fork, customize, build upon, and showcase these applications in your GitHub portfolio and resumes to impress tech recruiters and hiring teams.",
    },
    {
      q: "How does the 'Like' and bookmark system work?",
      a: "You can click the heart Like button on any project or PDF note to save it to your local browser favorites and help the community discover the highest-quality developer resources.",
    },
    {
      q: "Are new PDF notes and project templates added regularly?",
      a: "Yes! We continually add and update handbooks for the latest frameworks (Next.js 16, React 19, LangGraph, Terraform, Tailwind) and publish new capstone project starters.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f3843f]/10 text-xs font-bold text-[#f3843f] mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>COMMONLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-stone-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Everything you need to know about our free PDF notes, open projects, and tracks.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-stone-200 bg-[#faf7f2] overflow-hidden transition-all duration-200 shadow-sm"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-stone-100/60 transition-colors"
                >
                  <h3 className="text-sm sm:text-base font-bold text-stone-900">
                    {faq.q}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-stone-500 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-[#f3843f]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-200/60 mt-1 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
