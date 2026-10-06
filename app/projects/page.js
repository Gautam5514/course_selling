import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectsPageContent from "@/components/projects/ProjectsPageContent";

export const metadata = {
  title: "Open-Source Projects & Live Demos — helloS",
  description:
    "Explore 100% free real-world full-stack, AI, design system, and mobile capstone projects. Clone GitHub repositories, test live demos, and like your favorites.",
};

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <ProjectsPageContent />
      </main>
      <Footer />
    </div>
  );
}
