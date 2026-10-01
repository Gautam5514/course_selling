import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CoursesPageContent from "@/components/courses/CoursesPageContent";

export const metadata = {
  title: "Explore Courses & Career Tracks — helloS",
  description:
    "Master in-demand tech skills from top industry practitioners. Browse our curated full-stack, AI, design, and DevOps courses.",
};

export default function CoursePage() {
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
