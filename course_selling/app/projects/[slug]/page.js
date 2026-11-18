import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectDetailContent from "@/components/projects/ProjectDetailContent";
import { projectsList, getProjectBySlug } from "@/data/projectsData";
import { getRepoStats } from "@/lib/github";

// One static page per project; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return projectsList.map((p) => ({ slug: p.slug }));
}

async function loadReadme(project) {
  if (!project.readmeFile) return null;
  try {
    return await readFile(path.join(process.cwd(), "content", "projects", project.readmeFile), "utf8");
  } catch {
    return null; // the page still works without the document
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found — Gopo Workspace" };
  return {
    title: `${project.title} — Gopo Workspace Projects`,
    description: project.tagline,
  };
}

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const [readme, stats] = await Promise.all([
    loadReadme(project),
    project.repoPrivate ? null : getRepoStats(project.repo),
  ]);
  const related = project.related ? getProjectBySlug(project.related) : null;

  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <ProjectDetailContent project={project} stats={stats} readme={readme} related={related} />
      </main>
      <Footer />
    </div>
  );
}
