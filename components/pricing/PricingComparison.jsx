"use client";

import { Check, Minus } from "lucide-react";

export default function PricingComparison() {
  const rows = [
    { feature: "Access to Free Courses", starter: true, pro: true, career: true },
    { feature: "Unlimited Masterclasses (500+)", starter: false, pro: true, career: true },
    { feature: "Weekly Live Virtual Classrooms", starter: false, pro: true, career: true },
    { feature: "Downloadable Project Assets & Code", starter: false, pro: true, career: true },
    { feature: "Verifiable Digital Certificate", starter: false, pro: true, career: true },
    { feature: "Personal Code Reviews by Mentors", starter: false, pro: true, career: true },
    { feature: "Dedicated 1-on-1 Career Coach", starter: false, pro: false, career: true },
    { feature: "Resume & Portfolio Direct Overhaul", starter: false, pro: false, career: true },
    { feature: "Mock Interviews with Senior Leads", starter: false, pro: false, career: true },
    { feature: "Direct Referral to Hiring Partners", starter: false, pro: false, career: true },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#093c33]/10 text-xs font-semibold text-[#093c33] mb-3">
            Feature Breakdown
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111827]">
            Compare Plan Features
          </h2>
          <p className="mt-3 text-sm text-stone-600">
            Everything you get in each tier, transparently broken down.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="rounded-3xl border border-stone-200/90 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fcf8f2] border-b border-stone-200">
                  <th className="py-5 px-6 text-sm font-bold text-stone-900 w-2/5">
                    Plan Feature
                  </th>
                  <th className="py-5 px-4 text-center text-sm font-bold text-stone-800 w-1/5">
                    Starter
                  </th>
                  <th className="py-5 px-4 text-center text-sm font-bold text-[#f3843f] w-1/5 bg-[#f3843f]/10">
                    Pro Learner
                  </th>
                  <th className="py-5 px-4 text-center text-sm font-bold text-[#093c33] w-1/5">
                    Accelerator
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs sm:text-sm">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-4 px-6 font-medium text-stone-800">
                      {row.feature}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.starter ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[2.5]" />
                      ) : (
                        <Minus className="w-4 h-4 text-stone-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center bg-[#f3843f]/5">
                      {row.pro ? (
                        <Check className="w-4 h-4 text-[#f3843f] mx-auto stroke-[2.5]" />
                      ) : (
                        <Minus className="w-4 h-4 text-stone-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.career ? (
                        <Check className="w-4 h-4 text-[#093c33] mx-auto stroke-[2.5]" />
                      ) : (
                        <Minus className="w-4 h-4 text-stone-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
