"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export default function BlogNewsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <section className="py-16 sm:py-20 bg-[#faf7f2] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[36px] bg-[#093c33] p-8 sm:p-12 text-white text-center shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-[#f3843f]/20 border border-[#f3843f]/40 text-xs font-bold text-[#f3843f]">
              Weekly Digest
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Stay on the Cutting Edge
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/75 leading-relaxed">
              Get our best engineering breakdowns, design system tips, and free workshop invitations delivered straight to your inbox once a week.
            </p>

            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-950/80 border border-emerald-700 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>You&apos;re subscribed! Welcome to the publication.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="pt-4 max-w-md mx-auto">
                <div className="bg-white rounded-full p-1.5 pl-5 flex items-center justify-between shadow-lg">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="bg-transparent text-xs text-stone-800 placeholder-stone-400 focus:outline-none w-full pr-3"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-full bg-[#f3843f] hover:bg-[#e0732f] text-white font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
                  >
                    <span>Subscribe</span>
                    <Send className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
