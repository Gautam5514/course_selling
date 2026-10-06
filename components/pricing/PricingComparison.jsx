"use client";

import { Check, Minus } from "lucide-react";

export default function PricingComparison() {
  const rows = [
    {
      feature: "100% Free Access (No Credit Card)",
      bootcamps: false,
      subscription: false,
      hellos: true,
    },
    {
      feature: "Downloadable Technical PDF Handbooks",
      bootcamps: false,
      subscription: true,
      hellos: true,
    },
    {
      feature: "Complete Production GitHub Repositories",
      bootcamps: true,
      subscription: false,
      hellos: true,
    },
    {
      feature: "Live Interactive Demos & Deployments",
      bootcamps: false,
      subscription: false,
      hellos: true,
    },
    {
      feature: "Modern 2025/2026 Tech (Next.js 16, React 19, LangGraph)",
      bootcamps: false,
      subscription: true,
      hellos: true,
    },
    {
      feature: "Permissive Open License for Personal Portfolio",
      bootcamps: true,
      subscription: false,
      hellos: true,
    },
    {
      feature: "Developer Community Like & Bookmark System",
      bootcamps: false,
      subscription: false,
      hellos: true,
    },
    {
      feature: "Zero Lock-in, No Hidden Fees, No Paywalls",
      bootcamps: false,
      subscription: false,
      hellos: true,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#093c33]/10 text-xs font-semibold text-[#093c33] mb-3">
            Open Comparison
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111827]">
            Why helloS Is Free &amp; Different
          </h2>
          <p className="mt-3 text-sm text-stone-600">
            See how our free PDF and project-first niche compares to traditional paid models.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="rounded-3xl border border-stone-200/90 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fcf8f2] border-b border-stone-200">
                  <th className="py-5 px-6 text-sm font-bold text-stone-900 w-2/5">
                    Platform Capability
                  </th>
                  <th className="py-5 px-4 text-center text-sm font-bold text-stone-600 w-1/5">
                    Bootcamps ($15k+)
                  </th>
                  <th className="py-5 px-4 text-center text-sm font-bold text-stone-600 w-1/5">
                    Course Subs ($39/mo)
                  </th>
                  <th className="py-5 px-4 text-center text-sm font-bold text-[#093c33] w-1/5 bg-emerald-50">
                    helloS ($0 Free)
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
                      {row.bootcamps ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <Minus className="w-4 h-4 text-stone-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.subscription ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <Minus className="w-4 h-4 text-stone-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center bg-emerald-50/60">
                      {row.hellos ? (
                        <Check className="w-5 h-5 text-emerald-600 font-bold mx-auto" />
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
