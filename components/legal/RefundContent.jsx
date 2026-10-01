"use client";

import Link from "next/link";
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  CreditCard,
  HelpCircle,
  Mail,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function RefundContent() {
  const steps = [
    {
      step: "01",
      title: "Submit a Request",
      desc: "Go to your Account Dashboard or email refunds@hellobject.com with your enrolled email & order reference ID.",
    },
    {
      step: "02",
      title: "Instant Verification",
      desc: "Our automated billing system verifies your purchase date was within the 30-day window. No tedious questions asked.",
    },
    {
      step: "03",
      title: "100% Refund Issued",
      desc: "Funds are released immediately and appear on your original credit card or bank balance within 3–5 business days.",
    },
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
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>RISK-FREE LEARNING • HELLOBJECT.COM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
            30-Day Money-Back <span className="text-[#f3843f]">Guarantee</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
            We are confident in our industry-vetted curriculums. If a course isn’t right for your trajectory, get a full, 100% refund without friction.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Step-by-Step Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.step}
              className="bg-white p-7 rounded-2xl border border-stone-200/90 shadow-sm relative overflow-hidden"
            >
              <span className="text-4xl font-extrabold text-[#093c33]/15 block mb-3 font-sans">
                {s.step}
              </span>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                {s.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Detailed Policy Breakdown */}
        <article className="bg-white p-6 sm:p-10 md:p-12 rounded-3xl border border-stone-200/90 shadow-sm space-y-8 text-stone-700 leading-relaxed text-sm sm:text-base">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-3">
              Eligibility &amp; Coverage
            </h2>
            <p>
              Every cohort track, masterclass, and curriculum purchased on <strong className="text-stone-900">hellobject.com</strong> is covered under our 30-Day Money-Back Guarantee from the date of initial payment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-stone-800 text-xs sm:text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Eligible for 100% Refund:</strong> Any purchase made within the last 30 calendar days, regardless of progress percentage.
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm">
              <Clock className="w-5 h-5 text-[#f3843f] shrink-0 mt-0.5" />
              <div>
                <strong>Processing Timeline:</strong> Funds are refunded directly to the payment method (Credit Card/PayPal) within 3–5 business days.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100">
            <h3 className="text-lg font-bold text-stone-900 mb-2">
              Subscription &amp; Team Seats Cancellation
            </h3>
            <p className="text-xs sm:text-sm text-stone-600">
              For annual or monthly subscriptions, you may turn off auto-renewal at any time with one click from your billing settings. You will continue to have full access until the end of your prepaid billing period.
            </p>
          </div>

          <div className="bg-[#093c33] text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h4 className="text-lg font-bold text-white mb-1">
                Need help with a refund or billing question?
              </h4>
              <p className="text-xs sm:text-sm text-emerald-100/75">
                Our support team at hellobject.com responds within 4 business hours.
              </p>
            </div>
            <a
              href="mailto:refunds@hellobject.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f3843f] hover:bg-[#da6c32] text-white font-bold text-xs sm:text-sm transition-transform active:scale-95 shrink-0"
            >
              <Mail className="w-4 h-4" />
              <span>Contact refunds@hellobject.com</span>
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
