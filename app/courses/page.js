import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CoursesPageContent from "@/components/courses/CoursesPageContent";

export const metadata = {
  title: "Career Tracks & Cohorts — helloS",
  description:
    "Explore our 5 industry-vetted career tracks: Full-Stack Web Dev, Generative AI & LLMs, UI/UX Design Systems, Cloud & Kubernetes, and React Native Mobile.",
};

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <CoursesPageContent />
      </main>
      <Footer />
    </div>
  );
}
