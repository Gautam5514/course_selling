import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Code2, GitPullRequest, Star, Trophy } from "lucide-react";
import { SOCIALS } from "@/data/socials";

const stats = [
  { value: "2+", label: "Years in industry" },
  { value: "3", label: "Products shipped" },
  { value: "350+", label: "Active users" },
  { value: "1000+", label: "DSA problems solved" },
];

const products = [
  {
    name: "SplitEase",
    domain: "splitease.tech",
    href: "https://splitease.tech",
    metric: "200+ active users",
    text: "Group expense splitting with exact splits, the fewest settle-up payments and an AI agent that drafts the plan for you.",
  },
  {
    name: "FaceDeliver",
    domain: "facedeliver.shop",
    href: "https://facedeliver.shop",
    metric: "150+ active users",
    text: "Event photos delivered to every guest by face match, with an organiser console, billing and consent built in.",
  },
  {
    name: "EliteCrew",
    domain: "elitecrew.online",
    href: "https://elitecrew.online",
    metric: "Currently building",
    text: "The product I am working on right now. What I learn while building it goes straight into the courses.",
    inProgress: true,
  },
];

const profiles = [
  { platform: "LeetCode", detail: "Global rank under 2,000", icon: Trophy },
  { platform: "HackerRank", detail: "5 star", icon: Star },
  { platform: "CodeChef", detail: "2 star", icon: Star },
  { platform: "GeeksforGeeks", detail: "1,000+ problems solved", icon: Code2 },
  { platform: "Open source", detail: "Active contributor", icon: GitPullRequest },
];

export default function AboutTeam() {
  return (
    <section className="py-20 sm:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Intro: photo + bio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center max-w-6xl mx-auto">
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f3843f] to-[#093c33]" />
              <div className="absolute inset-[6px] rounded-full bg-white" />
              <div className="absolute inset-[12px] rounded-full overflow-hidden bg-stone-100">
                <Image
                  src="/images/gautam.webp"
                  alt="Gautam Pandit, software engineer and instructor"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 256px, 320px"
                />
              </div>
              <div className="absolute bottom-3 right-0 sm:bottom-5 sm:right-1 rounded-full bg-[#093c33] text-white text-xs font-semibold px-3.5 py-1.5 shadow-lg">
                2+ yrs in industry
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f3843f]/15 text-xs font-semibold text-[#f3843f] mb-3">
              Meet Your Instructor
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111827]">
              Hi, I&apos;m <span className="text-[#093c33]">Gautam Pandit</span>
            </h2>
            <p className="mt-2 text-sm font-semibold text-[#f3843f]">
              Software Engineer &middot; Builder &middot; Your only instructor here
            </p>
            <div className="mt-5 space-y-4 text-sm sm:text-base text-stone-600 leading-relaxed">
              <p>
                I am a software engineer with 2+ years of industry experience. I design, build and
                ship full applications end to end: frontend, backend, mobile, payments and
                deployment.
              </p>
              <p>
                There is no big team behind this platform. I write every course, every set of notes
                and every project myself, so what you learn here is exactly what I use to build
                products that real people rely on every day.
              </p>
            </div>
            <Link
              href="/projects"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#093c33] text-white text-sm font-semibold px-6 py-3 hover:bg-[#0c4d42] transition-colors"
            >
              See everything I&apos;ve built
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <span className="text-xs font-semibold text-stone-500">Connect with me</span>
              <ul className="flex items-center gap-2">
                {SOCIALS.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Gautam on ${item.label}`}
                      title={item.label}
                      className="w-10 h-10 rounded-full border border-stone-200 bg-[#fcf8f2] text-[#093c33] flex items-center justify-center hover:bg-[#093c33] hover:text-white hover:border-[#093c33] transition-colors"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                        <path d={item.path} />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Stats */}
        <dl className="mt-16 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl bg-[#fcf8f2] border border-stone-200/80 px-5 py-6 text-center"
            >
              <dd className="text-3xl sm:text-4xl font-bold text-[#093c33]">{stat.value}</dd>
              <dt className="mt-1 text-xs sm:text-sm font-medium text-stone-600">{stat.label}</dt>
            </div>
          ))}
        </dl>

        {/* Products */}
        <div className="mt-16 sm:mt-20 max-w-6xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
            What I&apos;ve <span className="text-[#f3843f]">built</span>
          </h3>
          <p className="mt-2 text-sm text-stone-600">
            Live applications, used by real people. Not tutorial projects.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <a
                key={product.name}
                href={product.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-3xl bg-[#fcf8f2] border border-stone-200/80 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      product.inProgress
                        ? "bg-[#f3843f]/15 text-[#c8621f]"
                        : "bg-[#093c33]/10 text-[#093c33]"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        product.inProgress ? "bg-[#f3843f]" : "bg-[#16a34a]"
                      }`}
                    />
                    {product.metric}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#093c33] transition-colors" />
                </div>
                <h4 className="mt-4 text-lg font-bold text-[#111827]">{product.name}</h4>
                <p className="text-xs font-semibold text-[#f3843f] mt-0.5">{product.domain}</p>
                <p className="mt-3 text-sm text-stone-600 leading-relaxed">{product.text}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Coding profiles */}
        <div className="mt-16 sm:mt-20 max-w-6xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
            Problem solving &amp; <span className="text-[#093c33]">open source</span>
          </h3>
          <p className="mt-2 text-sm text-stone-600">
            1,000+ problems solved across platforms, plus regular open source contributions.
          </p>

          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {profiles.map(({ platform, detail, icon: Icon }) => (
              <li
                key={platform}
                className="rounded-2xl border border-stone-200/80 bg-white p-5 flex lg:flex-col items-center lg:items-start gap-4 lg:gap-3"
              >
                <span className="shrink-0 w-10 h-10 rounded-xl bg-[#093c33] text-white flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#111827]">{platform}</p>
                  <p className="text-xs text-stone-600 mt-0.5">{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
