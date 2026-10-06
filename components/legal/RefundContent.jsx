"use client";

import Link from "next/link";
import {
  CheckCircle2,
  HelpCircle,
  Mail,
  ShieldCheck,
  ArrowRight,
  FileText,
  Code2,
} from "lucide-react";

export default function RefundContent() {
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
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% FREE OPEN-ACCESS POLICY • HELLOBJECT.COM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
            No Fees. No Charges.{" "}
            <span className="text-[#f3843f]">No Refunds Needed</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
            helloS is an entirely free open-access platform. We do not charge tuition fees, subscriptions, or membership costs.
            All technical PDF handbooks and production projects are free for all developers.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-stone-700 leading-relaxed text-sm sm:text-base">
        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              Free Technical PDF Handbooks
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Download and read complete architectural handbooks, system design cheatsheets, and concept notes without entering payment information.
            </p>
            <Link
              href="/pdf-notes"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#093c33] hover:underline pt-2"
            >
              <span>Browse PDF Notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              Open-Source Project Repositories
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Clone real-world capstone applications from GitHub, inspect architectures, and test live demos with zero monetary commitment.
            </p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f3843f] hover:underline pt-2"
            >
              <span>Explore Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Policy Details */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm space-y-5">
          <h3 className="text-xl font-bold text-stone-900">
            Payment &amp; Billing Policy Summary
          </h3>
          <ul className="space-y-3 text-xs sm:text-sm text-stone-600">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Financial Transactions:</strong> helloS currently processes no credit cards, debit cards, PayPal, or bank transfers.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>No Automatic Renewals:</strong> Because there are no subscriptions, you will never be billed automatically.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Community Powered:</strong> Support the project by giving likes (❤️) to your favorite handbooks and sharing them with fellow developers.
              </span>
            </li>
          </ul>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Questions or suggestions?</span>
            <a
              href="mailto:support@hellobject.com"
              className="font-bold text-[#093c33] hover:underline"
            >
              support@hellobject.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
