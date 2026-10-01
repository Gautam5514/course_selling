import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrackDetailPageContent from "@/components/courses/TrackDetailPageContent";
import { popularTracksList } from "@/data/tracksData";

export async function generateStaticParams() {
  return popularTracksList.map((track) => ({
    slug: track.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const track = popularTracksList.find((t) => t.slug === slug);

  if (!track) {
    return {
      title: "Track Not Found — helloS",
    };
  }

  return {
    title: `${track.title} — helloS`,
    description: track.tagline,
  };
}

export default async function TrackDetailPage({ params }) {
  const { slug } = await params;
  const track = popularTracksList.find((t) => t.slug === slug);

  if (!track) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <TrackDetailPageContent track={track} allTracks={popularTracksList} />
      </main>
      <Footer />
    </div>
  );
}
