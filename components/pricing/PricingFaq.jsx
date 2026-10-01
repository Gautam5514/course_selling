"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function PricingFaq() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "Can I switch between monthly and annual plans?",
      a: "Yes, you can upgrade, downgrade, or switch billing intervals at any time from your student account settings. Upgrades take effect immediately with prorated billing.",
    },
    {
      q: "Is there a free trial for the Pro Learner plan?",
      a: "Absolutely! We offer a full 14-day free trial on the Pro Learner tier so you can attend live virtual classrooms, test assignments, and experience mentorship risk-free.",
    },
    {
      q: "What is your refund policy?",
      a: "We offer a 30-day money-back guarantee. If you are not completely satisfied with your learning experience or the course curriculum, contact our support team for a full refund.",
    },
    {
      q: "Can my employer sponsor my subscription?",
      a: "Yes! Many of our students have their helloS subscriptions covered through corporate learning and development stipends. We provide official invoices and receipts upon checkout.",
    },
    {
      q: "Are the course certificates verified and shareable?",
      a: "Every certificate earned through helloS comes with a unique verification URL and cryptographic ID that can be embedded on LinkedIn profiles, resumes, and personal websites.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#faf7f2] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f3843f]/15 text-xs font-semibold text-[#f3843f] mb-3">
            Got Questions?
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111827]">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm text-stone-600">
            Have questions about our plans? We have answers.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                className="rounded-2xl bg-white border border-stone-200/80 overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : i)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base text-[#111827] hover:text-[#f3843f] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[#f3843f]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-4">
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
