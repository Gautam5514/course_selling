"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin, Briefcase } from "lucide-react";

export default function CareerOpenings() {
  const [filter, setFilter] = useState("All");

  const jobs = [
    {
      title: "Senior Full-Stack Engineer (Next.js & WebRTC)",
      dept: "Engineering",
      location: "Remote (Global)",
      type: "Full-Time",
      salary: "$140K – $180K • 0.25% Equity",
    },
    {
      title: "Lead Product Designer (UI/UX Systems)",
      dept: "Design",
      location: "Remote (Europe / US Timezones)",
      type: "Full-Time",
      salary: "$130K – $165K • 0.20% Equity",
    },
    {
      title: "Lead Frontend Instructor (React & Design Systems)",
      dept: "Curriculum",
      location: "Remote (Global)",
      type: "Full-Time",
      salary: "$120K – $150K • 0.15% Equity",
    },
    {
      title: "Backend Platform Engineer (Go & PostgreSQL)",
      dept: "Engineering",
      location: "Remote (Global)",
      type: "Full-Time",
      salary: "$135K – $175K • 0.20% Equity",
    },
    {
      title: "Senior Technical Writer & Course Producer",
      dept: "Curriculum",
      location: "Remote (Global)",
      type: "Full-Time",
      salary: "$95K – $125K • 0.10% Equity",
    },
    {
      title: "Growth & Product Marketing Manager",
      dept: "Marketing",
      location: "Remote (US / Europe)",
      type: "Full-Time",
      salary: "$110K – $140K • 0.15% Equity",
    },
  ];

  const categories = ["All", "Engineering", "Design", "Curriculum", "Marketing"];

  const filteredJobs =
    filter === "All" ? jobs : jobs.filter((j) => j.dept === filter);

  return (
    <section id="openings" className="py-20 sm:py-28 bg-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f3843f]/15 text-xs font-semibold text-[#f3843f] mb-3">
              Open Positions
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111827]">
              Current Opportunities
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Find your next high-impact challenge and help shape education.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  filter === cat
                    ? "bg-[#093c33] text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.map((job, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-stone-200/90 p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg hover:border-emerald-700/40 transition-all duration-300 group bg-[#fdfaf5]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#f3843f]/15 text-[#f3843f]">
                    {job.dept}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                    <MapPin className="w-3 h-3" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                    <Briefcase className="w-3 h-3" />
                    {job.type}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#111827] group-hover:text-[#f3843f] transition-colors">
                  {job.title}
                </h3>
                <p className="text-xs text-stone-500 mt-1 font-medium">
                  {job.salary}
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  href="#apply"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold bg-[#093c33] hover:bg-[#f3843f] text-white transition-all shadow-sm group-hover:shadow-md active:scale-95"
                >
                  <span>Apply Now</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
