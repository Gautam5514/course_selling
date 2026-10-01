"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  Clock,
  ArrowRight,
  Sparkles,
  Users,
  Search,
  CheckCircle,
  Briefcase,
  ShieldCheck,
  Award,
  BookOpen,
  Filter,
  X,
} from "lucide-react";
import CoursesHero from "./CoursesHero";
import CoursesFaqSection from "./CoursesFaqSection";
import { popularTracksList } from "@/data/tracksData";
import { popularCourses, courseCategories } from "@/data/landingData";

export default function CoursesPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'tracks', 'modular'
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(null);
  const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState(null);
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  // Filter Modular Courses
  const filteredCourses = popularCourses.filter((course) => {
    const matchesCat =
      selectedCategory === "All" || course.category === selectedCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filter Tracks
  const filteredTracks = popularTracksList.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.tools.some((tool) =>
        tool.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesSearch;
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
    <div className="bg-[#faf7f2] relative overflow-hidden">
      {/* 1. HERO SECTION */}
      <CoursesHero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* 2. CATALOG CONTROLS & FILTERS */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-stone-200 pb-8">
          {/* View Mode Switcher Pills */}
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-stone-200/80 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === "all"
                  ? "bg-[#093c33] text-white shadow-md"
                  : "text-stone-700 hover:text-stone-900"
              }`}
            >
              All Curriculum ({popularCourses.length + popularTracksList.length})
            </button>
            <button
              onClick={() => setActiveTab("tracks")}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === "tracks"
                  ? "bg-[#093c33] text-white shadow-md"
                  : "text-stone-700 hover:text-stone-900"
              }`}
            >
              Career Tracks (5)
            </button>
            <button
              onClick={() => setActiveTab("modular")}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === "modular"
                  ? "bg-[#093c33] text-white shadow-md"
                  : "text-stone-700 hover:text-stone-900"
              }`}
            >
              Masterclasses ({popularCourses.length})
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-stone-500 mr-1 hidden lg:inline">
              Filter:
            </span>
            {["All", ...courseCategories.filter((c) => c !== "All Tracks")].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-[#f3843f] text-white shadow-sm"
                      : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        {/* 3. SECTION A: 5 CAREER ACCELERATOR TRACKS */}
        {(activeTab === "all" || activeTab === "tracks") && (
          <div className="mt-12 space-y-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  LONG-FORM COHORTS
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mt-2">
                  5 Popular Career Tracks
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  12–16 week rigorous programs with live mentorship, weekly code reviews, and job guarantees.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {filteredTracks.map((track) => (
                <div
                  key={track.slug}
                  className="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 group"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-0.5 rounded-full text-[11px] font-bold ${track.badgeColor}`}
                      >
                        {track.badge}
                      </span>
                      <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full">
                        {track.level}
                      </span>
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        Cohort starts {track.cohortStartDate}
                      </span>
                    </div>

                    <Link href={`/courses/${track.slug}`}>
                      <h3 className="text-xl sm:text-2xl font-bold text-stone-900 group-hover:text-[#f3843f] transition-colors leading-snug">
                        {track.title}
                      </h3>
                    </Link>

                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
                      {track.tagline}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {track.tools.slice(0, 5).map((tool, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#faf7f2] border border-stone-200 text-stone-700"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-stone-500">
                      <div className="flex items-center gap-2">
                        <Image
                          src={track.mentor.avatar}
                          alt={track.mentor.name}
                          width={26}
                          height={26}
                          unoptimized
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-stone-200"
                        />
                        <span className="font-semibold text-stone-800">
                          {track.mentor.name} ({track.mentor.company})
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{track.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-stone-400" />
                        <span>Avg Salary: <strong className="text-emerald-800">{track.avgSalary}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-56 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-stone-200/80 lg:pl-6 flex flex-col justify-between shrink-0 space-y-4">
                    <div>
                      <span className="text-[11px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                        {track.discountPercent}% OFF
                      </span>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-stone-900">
                          ${track.price}
                        </span>
                        <span className="text-xs text-stone-400 line-through">
                          ${track.originalPrice}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/courses/${track.slug}`}
                      className="w-full py-3 rounded-xl text-xs font-bold bg-[#093c33] hover:bg-[#072e27] text-white shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Explore Track</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SECTION B: MASTERCLASS COURSES */}
        {(activeTab === "all" || activeTab === "modular") && (
          <div className="mt-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  DEEP-DIVE MASTERCLASSES
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mt-2">
                  Individual Masterclass Courses
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Focused 6–10 week curriculums designed to master specific frameworks and architectures.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-[28px] border border-stone-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
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
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-[#093c33] hover:bg-[#072e27] shadow-sm transition-all"
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 5. FAQ SECTION */}
      <CoursesFaqSection />

      {/* MODAL: QUICK ENROLLMENT */}
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
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  INSTANT LIFETIME ACCESS
                </span>

                <h3 className="text-xl font-bold text-stone-900 mt-2 leading-tight">
                  Enroll in {selectedCourseForEnroll.title}
                </h3>

                <p className="text-xs text-stone-500 mt-1">
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

      {/* MODAL: SYLLABUS DETAILS */}
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
    </div>
  );
}
