"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function CoursesFaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "Do I get lifetime access to the courses and future updates?",
      a: "Yes! When you enroll in any helloS course or track, you get permanent, unrestricted lifetime access to all video lessons, code repositories, assignments, and future curriculum updates at no additional cost.",
    },
    {
      q: "What if I miss a live cohort session or code review?",
      a: "All live cohort sessions and mentor code reviews are recorded in HD and published to your student dashboard within 2 hours with timestamped transcripts, lecture notes, and linked GitHub commits.",
    },
    {
      q: "How do 1-on-1 code reviews and mentorship work?",
      a: "Every week, you can submit your GitHub repository or Figma file. Senior staff engineers and mentors review your pull requests, annotate your code, and provide detailed video teardowns on architecture, performance, and best practices.",
    },
    {
      q: "Is there a refund policy if the course is not for me?",
      a: "Yes, we offer an unconditional 30-day money-back guarantee. If you are not 100% satisfied with the course for any reason, email us at support@hellobject.com for a full, immediate refund.",
    },
    {
      q: "Are the certificates accredited and shareable on LinkedIn?",
      a: "Yes. Upon completing your capstone project and code reviews, you receive a cryptographically verified digital certificate with a unique verification URL that can be embedded on LinkedIn, GitHub, and resumes.",
    },
    {
      q: "Can my company or employer reimburse my tuition?",
      a: "Most tech companies offer annual learning and development budgets. We provide automated formal itemized invoices with VAT / GST details, syllabus PDFs, and completion verification for employer reimbursement.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f3843f]/10 text-xs font-bold text-[#f3843f] mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>GOT QUESTIONS?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-stone-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Everything you need to know about our courses, cohorts, and certification.
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
