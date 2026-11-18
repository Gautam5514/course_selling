import { cache } from "react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NoteDetailContent from "@/components/notes/NoteDetailContent";
import { api, ApiError } from "@/lib/api";

// Anonymous server fetch, cached 60s (and de-duplicated between
// generateMetadata and the page) so a cold backend isn't hit per view.
const fetchNote = cache(async (slug) => {
  try {
    const { data } = await api.getNote(slug, { next: { revalidate: 60 } });
    return data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err; // real errors (backend down, 500) surface as an error page
  }
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const note = await fetchNote(slug);
  if (!note) {
    return { title: "Note Not Found — Gopo Workspace" };
  }
  return {
    title: `${note.title} — Gopo Workspace Notes`,
    description: note.description || undefined,
  };
}

export default async function NoteDetailPage({ params }) {
  const { slug } = await params;
  const note = await fetchNote(slug);

  if (!note) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <NoteDetailContent note={note} />
      </main>
      <Footer />
    </div>
  );
}
