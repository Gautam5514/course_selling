"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Star,
  Clock,
  BookOpen,
  Award,
  Users,
  Search,
  CheckCircle,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { popularCourses, courseCategories } from "@/data/landingData";
import { RightEdgeConcentricRings, SparkleStar } from "@/components/DecorativeShapes";

export default function FeaturedCourses() {
  const [activeCategory, setActiveCategory] = useState("All Tracks");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(null);
  const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState(null);
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  // Filter courses
  const filteredCourses = popularCourses.filter((course) => {
    const matchesCategory =
      activeCategory === "All Tracks" || course.category === activeCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleEnrollClick = (course) => {
    setSelectedCourseForEnroll(course);
    setEnrollSuccess(false);
  };

  const handleCompleteEnroll = () => {
    setEnrollSuccess(true);
    setTimeout(() => {
      setSelectedCourseForEnroll(null);
      setEnrollSuccess(false);
    }, 2400);
  };

  return (
    <section id="courses" className="py-20 sm:py-28 bg-[#faf7f2] relative overflow-hidden">
      {/* Decorative concentric rings top right */}
      <div className="absolute top-14 sm:top-20 right-0 opacity-80 pointer-events-none hidden lg:block">
        <RightEdgeConcentricRings className="w-24 h-44 sm:w-28 sm:h-52 text-[#ea8a42]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#093c33]/10 border border-[#093c33]/20 text-xs font-bold text-[#093c33] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#ea8a42]" />
            <span>INDUSTRY-VETTED CATALOG</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111827] leading-tight">
            Explore In-Demand <span className="text-[#f3843f]">Courses</span> &
            <br className="hidden sm:block" /> Masterclass Tracks
          </h2>

          <p className="mt-4 text-xs sm:text-sm md:text-base text-stone-600 leading-relaxed max-w-2xl mx-auto">
            Practical, project-centric engineering and design curriculums co-designed with leads from Stripe, Microsoft, and Figma.
          </p>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {courseCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeCategory === category
                    ? "bg-[#093c33] text-white shadow-md shadow-emerald-950/20"
                    : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses or mentors..."
              className="w-full pl-10 pr-4 py-2 rounded-full text-xs sm:text-sm bg-white border border-stone-200 focus:outline-none focus:border-[#f3843f] focus:ring-1 focus:ring-[#f3843f] text-stone-900 placeholder:text-stone-400 shadow-sm"
            />
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-[28px] border border-stone-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Top: Header & Badges */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    {course.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${course.badgeColor}`}
                  >
                    {course.tag}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#111827] group-hover:text-[#f3843f] transition-colors leading-snug line-clamp-2">
                  {course.title}
                </h3>

                <p className="mt-2 text-xs sm:text-[13px] text-stone-600 line-clamp-2 leading-relaxed">
                  {course.summary}
                </p>

                {/* Rating & Students Meta */}
                <div className="mt-4 flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="font-bold text-stone-900">{course.rating}</span>
                    <span className="text-stone-400">({course.reviewsCount})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    <span>{course.studentsCount} students</span>
                  </div>
                </div>

                {/* Duration & Level */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-stone-400" />
                    <span>{course.level}</span>
                  </div>
                </div>

                {/* Instructor Row */}
                <div className="mt-4 flex items-center gap-3 p-2.5 rounded-xl bg-[#faf7f2] border border-stone-100">
                  <Image
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    width={36}
                    height={36}
                    unoptimized
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-stone-300"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 leading-tight">
                      {course.instructor.name}
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      {course.instructor.role} • <span className="font-semibold text-emerald-800">{course.instructor.company}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Bottom: Price & CTAs */}
              <div className="p-6 pt-3 bg-[#fdfbf7] border-t border-stone-100">
                <div className="flex items-baseline justify-between mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#111827]">
                      ${course.price}
                    </span>
                    <span className="text-xs text-stone-400 line-through">
                      ${course.originalPrice}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                    {course.discountPercent}% OFF
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedCourseForSyllabus(course)}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 transition-colors"
                  >
                    View Syllabus
                  </button>
                  <button
                    onClick={() => handleEnrollClick(course)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#093c33] hover:bg-[#072e27] shadow-sm hover:shadow-md transition-all active:scale-95"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty Search State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 max-w-xl mx-auto">
            <BookOpen className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-800">No courses found</h3>
            <p className="text-xs text-stone-500 mt-1">
              Try adjusting your search terms or select another category filter.
            </p>
            <button
              onClick={() => {
                setActiveCategory("All Tracks");
                setSearchQuery("");
              }}
              className="mt-4 px-5 py-2 rounded-full text-xs font-semibold bg-[#f3843f] text-white"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* QUICK ENROLLMENT MODAL */}
      {selectedCourseForEnroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedCourseForEnroll(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {!enrollSuccess ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    INSTANT LIFETIME ACCESS
                  </span>
                </div>

                <h3 className="text-xl font-bold text-stone-900 leading-tight">
                  Enroll in {selectedCourseForEnroll.title}
                </h3>

                <p className="text-xs text-stone-500 mt-1.5">
                  Instructor: {selectedCourseForEnroll.instructor.name} ({selectedCourseForEnroll.instructor.company})
                </p>

                <div className="my-5 p-4 rounded-2xl bg-[#faf7f2] border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-stone-500">Total Tuition</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#093c33]">
                        ${selectedCourseForEnroll.price}
                      </span>
                      <span className="text-xs text-stone-400 line-through">
                        ${selectedCourseForEnroll.originalPrice}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">
                    Save {selectedCourseForEnroll.discountPercent}%
                  </span>
                </div>

                <div className="space-y-2 mb-6 text-xs text-stone-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Lifetime access to all {selectedCourseForEnroll.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Private Discord lounge & GitHub repository access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Verifiable cryptographic certificate upon completion</span>
                  </div>
                </div>

                <button
                  onClick={handleCompleteEnroll}
                  className="w-full py-3.5 rounded-xl text-sm font-bold bg-[#f3843f] hover:bg-[#e0732f] text-white shadow-lg shadow-orange-950/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Complete Enrollment (${selectedCourseForEnroll.price})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-stone-900">
                  Welcome to the Cohort!
                </h3>
                <p className="text-xs text-stone-600 mt-2 max-w-xs mx-auto">
                  Your enrollment for <strong>{selectedCourseForEnroll.title}</strong> is confirmed. Check your email for GitHub and Discord invites.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SYLLABUS DETAILS MODAL */}
      {selectedCourseForSyllabus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCourseForSyllabus(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              {selectedCourseForSyllabus.category}
            </span>

            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mt-2 leading-tight">
              {selectedCourseForSyllabus.title}
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              {selectedCourseForSyllabus.summary}
            </p>

            <div className="my-5 border-t border-b border-stone-100 py-3 flex items-center justify-between text-xs text-stone-600">
              <div>
                <strong>Duration:</strong> {selectedCourseForSyllabus.duration}
              </div>
              <div>
                <strong>Level:</strong> {selectedCourseForSyllabus.level}
              </div>
              <div>
                <strong>Instructor:</strong> {selectedCourseForSyllabus.instructor.name}
              </div>
            </div>

            <h4 className="text-sm font-bold text-stone-900 mb-3">
              Curriculum Core Milestones
            </h4>

            <div className="space-y-3">
              {selectedCourseForSyllabus.highlights.map((milestone, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[#faf7f2] border border-stone-200/80"
                >
                  <span className="w-6 h-6 rounded-full bg-[#093c33] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-stone-900">Module {i + 1}</h5>
                    <p className="text-xs text-stone-600 mt-0.5">{milestone}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-stone-100">
              <div>
                <span className="text-xs text-stone-400 line-through">
                  ${selectedCourseForSyllabus.originalPrice}
                </span>
                <div className="text-2xl font-black text-stone-900">
                  ${selectedCourseForSyllabus.price}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCourseForSyllabus(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const c = selectedCourseForSyllabus;
                    setSelectedCourseForSyllabus(null);
                    handleEnrollClick(c);
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#f3843f] hover:bg-[#e0732f] text-white shadow-md"
                >
                  Enroll Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
