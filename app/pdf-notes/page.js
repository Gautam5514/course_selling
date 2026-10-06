import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PdfNotesPageContent from "@/components/pdf/PdfNotesPageContent";

export const metadata = {
  title: "Free Tech PDF Notes & Study Handbooks — helloS",
  description:
    "Download free comprehensive engineering handbooks, React 19 cheatsheets, system design study notes, and AI architecture blueprints. 100% free with no paywall.",
};

export default function PdfNotesPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased text-[#0f2820] flex flex-col selection:bg-[#f3843f] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <PdfNotesPageContent />
      </main>
      <Footer />
    </div>
  );
}
