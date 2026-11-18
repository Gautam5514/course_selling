import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectsPageContent from "@/components/projects/ProjectsPageContent";
import { projectsList } from "@/data/projectsData";
import { getStatsForProjects } from "@/lib/github";

export const metadata = {
  title: "Projects — Real apps, live demos and architecture — Gopo Workspace",
  description:
    "Production projects built and shipped by Gautam: SplitEase, FaceDeliver, EliteCrew, Novri and more. Open the live app, read the GitHub repository and study the architecture.",
};

export default async function ProjectsPage() {
  // Live stars / forks / last push from GitHub, cached for an hour.
  const stats = await getStatsForProjects(projectsList);

  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <ProjectsPageContent stats={stats} />
      </main>
      <Footer />
    </div>
  );
}
