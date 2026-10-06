"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function PricingFaq() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "Why is helloS 100% free without charging money?",
      a: "Our core vision and niche is to provide high-quality developer resources: in-depth technical PDF notes, cheatsheets, and production-grade GitHub projects. We believe foundational engineering knowledge should be open and accessible to all developers without predatory subscription walls.",
    },
    {
      q: "Will you ask for my credit card or bank details?",
      a: "No! There are zero checkout forms, no credit card requirements, and no payment gateways. You can browse, read, like, and download our handbooks and code repositories immediately.",
    },
    {
      q: "Can I download the PDF handbooks and keep them forever?",
      a: "Yes! Every handbook is downloadable with 1 click. You can keep them on your laptop, iPad, or e-reader for offline reading and revision anytime.",
    },
    {
      q: "Can I use the projects in my personal portfolio or at work?",
      a: "Yes. All capstone project repositories are open source. You can clone them, inspect the architectures, customize them, and showcase them in your GitHub portfolio and job applications.",
    },
    {
      q: "How does the 'Like' feature work?",
      a: "Clicking the heart Like button on any project or PDF handbook saves it to your local browser favorites, increments the global community appreciation score, and helps highlight the best resources.",
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
            Learn more about our free open access model and resource catalog.
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
