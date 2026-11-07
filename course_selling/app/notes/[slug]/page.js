import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NoteDetailContent from "@/components/notes/NoteDetailContent";
import { api, ApiError } from "@/lib/api";

// Always fetch fresh from the backend (content is authored dynamically).
export const dynamic = "force-dynamic";

async function fetchNote(slug) {
  try {
    const { data } = await api.getNote(slug, { cache: "no-store" });
    return data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err; // real errors (backend down, 500) surface as an error page
  }
}

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
