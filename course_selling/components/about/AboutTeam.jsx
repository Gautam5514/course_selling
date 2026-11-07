"use client";

import Image from "next/image";

export default function AboutTeam() {
  const leaders = [
    {
      name: "Natasha Sunny",
      role: "Head of Learning & Pedagogy",
      prev: "Ex-Lead Instructor, Stanford D.School",
      image: "/images/classroom-tutor-natasha.jpg",
    },
    {
      name: "Jayesh Patil",
      role: "Founder & Chief Executive Officer",
      prev: "Ex-VP Product, Tech Innovations",
      image: "/images/jayesh-patil.jpg",
    },
    {
      name: "Sunny Marwah",
      role: "Lead Full-Stack Curriculum Architect",
      prev: "Ex-Senior Staff Engineer, CloudTech",
      image: "/images/classroom-sunny.jpg",
    },
    {
      name: "Helen Mentari",
      role: "Director of Student Success & Placement",
      prev: "Ex-Head of Talent Acquisition, Stripe",
      image: "/images/classroom-helen.jpg",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f3843f]/15 text-xs font-semibold text-[#f3843f] mb-3">
            The Team
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111827]">
            Led by Experienced <span className="text-[#093c33]">Educators</span>
          </h2>
          <p className="mt-3 text-sm text-stone-600 leading-relaxed">
            Seasoned practitioners, engineering directors, and educators dedicated to student transformation.
          </p>
        </div>

        {/* 4 Team Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {leaders.map((person, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-[#fcf8f2] border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-square w-full bg-stone-200 overflow-hidden">
                <Image
                  src={person.image}
                  alt={person.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">
                    {person.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#f3843f] mt-0.5">
                    {person.role}
                  </p>
                </div>
                <p className="text-[11px] text-stone-500 mt-3 pt-3 border-t border-stone-200/60 font-medium">
                  {person.prev}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
