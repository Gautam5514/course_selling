import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ErrorState from "@/components/ui/ErrorState";

export const metadata = { title: "Page not found — Gopo Workspace" };

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ErrorState
          eyebrow="404"
          title="This page wandered off"
          message="The link may be old, or the page may have moved. Let's get you back to the good stuff."
          homeLabel="Back to home"
        />
      </main>
      <Footer />
    </div>
  );
}
